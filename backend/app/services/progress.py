from typing import List, Optional
from app.schemas.models import (
    ProgressSummary,
    AdaptiveRecommendation,
    ActionProgressInsight,
    ActionRoadmap,
    WeeklyCheckInResult
)
from app.store import ROADMAPS_STORE, WEEKLY_CHECKINS_STORE, PROGRESS_STORE, save_progress_to_disk
from app.services.digital_twin import update_digital_twin_execution_signal

def analyze_user_progress(user_id: str) -> ProgressSummary:
    print(f"[Progress] ANALYSIS_STARTED: user_id={user_id}")

    roadmap: Optional[ActionRoadmap] = ROADMAPS_STORE.get(user_id)
    if not roadmap:
        print(f"[Progress] NO_ROADMAP: user_id={user_id}")
        summary = ProgressSummary(
            user_id=user_id,
            roadmap_id=None,
            scenario="None",
            overall_execution_percentage=0,
            latest_week_completion_percentage=0,
            previous_week_completion_percentage=0,
            completion_trend="insufficient_data",
            execution_velocity=0.0,
            current_execution_streak=0,
            total_actions_planned=0,
            total_actions_completed=0,
            missed_actions=[],
            repeatedly_missed_actions=[],
            weekly_history_trend=[],
            workload_signal="Unknown",
            adaptive_recommendation=AdaptiveRecommendation(
                recommendation_type="observe",
                title="No Active Roadmap",
                message="Complete a Future Simulation to create your first roadmap.",
                priority_actions=[]
            )
        )
        PROGRESS_STORE[user_id] = summary
        return summary

    print(f"[Progress] ROADMAP_LOADED: user_id={user_id} scenario={roadmap.scenario}")

    weekly_checkins: List[WeeklyCheckInResult] = WEEKLY_CHECKINS_STORE.get(user_id, [])
    
    from app.services.checkin import get_checkin_summary
    daily_summary = get_checkin_summary(user_id)

    completed_actions_count = len([a for a in roadmap.weekly_actions if a.status == "completed"])
    total_actions_count = len(roadmap.weekly_actions)

    effective_checkin_count = max(len(weekly_checkins), daily_summary.total_checkins)

    if effective_checkin_count == 0 and completed_actions_count == 0:
        print(f"[Progress] NO_CHECKINS: user_id={user_id}")
        summary = ProgressSummary(
            user_id=user_id,
            roadmap_id=roadmap.id,
            scenario=roadmap.scenario,
            overall_execution_percentage=0,
            latest_week_completion_percentage=0,
            previous_week_completion_percentage=0,
            completion_trend="insufficient_data",
            execution_velocity=0.0,
            current_execution_streak=0,
            total_actions_planned=total_actions_count,
            total_actions_completed=0,
            missed_actions=[
                ActionProgressInsight(
                    action_id=a.id,
                    title=a.title,
                    category=a.category,
                    status="carry_forward",
                    missed_count=0,
                    insight_type="carry_forward"
                ) for a in roadmap.weekly_actions if a.status != "completed"
            ],
            repeatedly_missed_actions=[],
            weekly_history_trend=[],
            workload_signal="Unknown",
            adaptive_recommendation=AdaptiveRecommendation(
                recommendation_type="observe",
                title="Awaiting Check-in Data",
                message="Complete your first check-in to start building your execution profile.",
                priority_actions=[a.title for a in roadmap.weekly_actions[:2]]
            )
        )
        PROGRESS_STORE[user_id] = summary
        return summary

    print(f"[Progress] CHECKINS_LOADED: user_id={user_id} count={effective_checkin_count}")

    # Calculate execution metrics across available checkin sources
    roadmap_pct = int(round(completed_actions_count / total_actions_count * 100)) if total_actions_count > 0 else 0

    if len(weekly_checkins) > 0:
        latest_pct = max(weekly_checkins[0].completion_percentage, roadmap_pct)
        prev_pct = weekly_checkins[1].completion_percentage if len(weekly_checkins) > 1 else 0
        history_pcts = [c.completion_percentage for c in weekly_checkins[:5]]
    elif total_actions_count > 0:
        latest_pct = roadmap_pct
        prev_pct = 0
        history_pcts = [latest_pct]
    else:
        latest_pct = int(round(daily_summary.task_completion_rate)) if daily_summary.task_completion_rate > 0 else 75
        prev_pct = 0
        history_pcts = [latest_pct]

    velocity = float(latest_pct - prev_pct) if effective_checkin_count > 1 else 0.0
    streak = max(1, daily_summary.streak_days) if daily_summary.total_checkins > 0 else (len(weekly_checkins) if len(weekly_checkins) > 0 else 1)

    if effective_checkin_count < 2:
        trend = "insufficient_data"
    elif latest_pct > prev_pct + 5:
        trend = "improving"
    elif latest_pct < prev_pct - 5:
        trend = "declining"
    else:
        trend = "stable"

    overall_avg = latest_pct if len(weekly_checkins) == 0 else int(round(sum(c.completion_percentage for c in weekly_checkins) / len(weekly_checkins)))

    print(f"[Progress] EXECUTION_CALCULATED: user_id={user_id} completion={latest_pct}% trend={trend} velocity={velocity} streak={streak}")

    # Missed Action Analysis
    checkin_count = effective_checkin_count
    missed_insights: List[ActionProgressInsight] = []
    repeated_insights: List[ActionProgressInsight] = []

    for act in roadmap.weekly_actions:
        if act.status != "completed":
            missed_count = checkin_count if checkin_count > 1 else 1
            insight_type = "needs_review" if checkin_count >= 2 else "carry_forward"

            insight = ActionProgressInsight(
                action_id=act.id,
                title=act.title,
                category=act.category,
                status=act.status,
                missed_count=missed_count,
                insight_type=insight_type
            )
            missed_insights.append(insight)
            if checkin_count >= 2:
                repeated_insights.append(insight)

    print(f"[Progress] MISSED_ACTIONS_ANALYZED: user_id={user_id} missed={len(missed_insights)} repeated={len(repeated_insights)}")

    # Workload Signal & Adaptive Recommendation Rules
    latest_workload = weekly_checkins[0].workload_feeling if len(weekly_checkins) > 0 else "Manageable"
    comp_lvl = weekly_checkins[0].completion_level if len(weekly_checkins) > 0 else "Most"

    if latest_pct < 50 and latest_workload.lower() in ["heavy", "overwhelming"]:
        rec_type = "reduce_workload"
        rec_title = "Reduce Workload & Prioritize Core Actions"
        rec_msg = "Your execution is falling behind while workload feels heavy. Reduce or defer lower-impact actions before adding new commitments."
    elif latest_pct >= 75 and latest_workload.lower() in ["easy", "manageable"]:
        rec_type = "increase_depth"
        rec_title = "Increase Activity Depth"
        rec_msg = "You're consistently executing at a sustainable pace. Consider increasing depth in your highest-impact activity rather than adding many new commitments."
    elif trend == "declining":
        rec_type = "stabilize"
        rec_title = "Stabilize Execution Velocity"
        rec_msg = "Execution has declined recently. Stabilize your weekly plan before increasing commitments."
    elif trend == "improving":
        rec_type = "continue"
        rec_title = "Continue Current Plan Momentum"
        rec_msg = "Your execution velocity is improving. Continue the current plan and protect the activities driving the strongest progress."
    else:
        rec_type = "observe"
        rec_title = "Observe Execution Pattern"
        rec_msg = "Keep checking in for another week so StepNext can identify a reliable execution pattern."

    print(f"[Progress] ADAPTATION_DECISION: user_id={user_id} recommendation_type={rec_type}")

    top_priority_titles = [a.title for a in roadmap.weekly_actions if a.status != "completed"][:2]

    adaptive_rec = AdaptiveRecommendation(
        recommendation_type=rec_type,
        title=rec_title,
        message=rec_msg,
        priority_actions=top_priority_titles
    )

    summary = ProgressSummary(
        user_id=user_id,
        roadmap_id=roadmap.id,
        scenario=roadmap.scenario,
        overall_execution_percentage=overall_avg,
        latest_week_completion_percentage=latest_pct,
        previous_week_completion_percentage=prev_pct,
        completion_trend=trend,
        execution_velocity=velocity,
        current_execution_streak=streak,
        total_actions_planned=len(roadmap.weekly_actions),
        total_actions_completed=len([a for a in roadmap.weekly_actions if a.status == "completed"]),
        missed_actions=missed_insights,
        repeatedly_missed_actions=repeated_insights,
        weekly_history_trend=history_pcts,
        workload_signal=latest_workload,
        adaptive_recommendation=adaptive_rec
    )

    PROGRESS_STORE[user_id] = summary
    save_progress_to_disk()

    # Digital Twin Signal Integration
    try:
        update_digital_twin_execution_signal(user_id, latest_pct, latest_workload)
        print(f"[Progress] DIGITAL_TWIN_UPDATED: user_id={user_id}")
    except Exception as e:
        print(f"[Progress] Digital twin update notice: {e}")

    print(f"[Progress] ANALYSIS_SUCCESS: user_id={user_id}")
    return summary
