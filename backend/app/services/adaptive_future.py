from datetime import datetime
from typing import Optional, List
from app.schemas.models import (
    AdaptiveFutureFeedback,
    SimulationResponse,
    ActionRoadmap,
    ProgressSummary
)
from app.store import (
    SIMULATIONS_STORE,
    ROADMAPS_STORE,
    WEEKLY_CHECKINS_STORE,
    ADAPTIVE_FUTURE_STORE,
    save_adaptive_future_to_disk
)
from app.services.progress import analyze_user_progress

def evaluate_future_feedback(user_id: str) -> AdaptiveFutureFeedback:
    print(f"[AdaptiveFuture] ANALYSIS_STARTED: user_id={user_id}")

    sim: Optional[SimulationResponse] = SIMULATIONS_STORE.get(user_id)
    roadmap: Optional[ActionRoadmap] = ROADMAPS_STORE.get(user_id)
    progress: ProgressSummary = analyze_user_progress(user_id)
    from app.services.checkin import get_checkin_summary
    from app.store import PROFILES_STORE

    daily_summary = get_checkin_summary(user_id)
    weekly_checkins = WEEKLY_CHECKINS_STORE.get(user_id, [])
    checkin_count = max(len(weekly_checkins), daily_summary.total_checkins)

    profile = PROFILES_STORE.get(user_id)
    career_goal = (profile.career_goal or "").strip() if profile else ""
    if not career_goal and roadmap and roadmap.goal_context:
        career_goal = roadmap.goal_context.strip()
    current_scenario = career_goal or (sim.recommendation.recommended_scenario if sim else (roadmap.scenario if roadmap else "Career Target"))

    # Find winning result object & alternative scenarios
    current_score = 85
    close_alt_name = None
    close_alt_score = None
    min_gap = 999

    if sim and sim.results:
        winner_res = next((r for r in sim.results if r.name.lower() in current_scenario.lower() or current_scenario.lower() in r.name.lower()), sim.results[0])
        current_score = winner_res.overall_score

        for res in sim.results:
            if res.name != winner_res.name and res.name.lower() not in current_scenario.lower():
                gap = current_score - res.overall_score
                if 0 <= gap <= 5 and gap < min_gap:
                    min_gap = gap
                    close_alt_name = res.name
                    close_alt_score = res.overall_score

    print(f"[AdaptiveFuture] CURRENT_SCENARIO: name={current_scenario} score={current_score}")

    completion_pct = progress.latest_week_completion_percentage
    trend = progress.completion_trend
    velocity = progress.execution_velocity
    workload = progress.workload_signal

    print(f"[AdaptiveFuture] EXECUTION_SIGNAL: completion={completion_pct}% trend={trend} velocity={velocity}%")
    print(f"[AdaptiveFuture] WORKLOAD_SIGNAL: level={workload}")

    # Compute deterministic Future Confidence score (0 to 100)
    conf = 75
    if completion_pct >= 75:
        conf += 10
    elif completion_pct < 50:
        conf -= 15

    if trend == "improving":
        conf += 5
    elif trend == "declining":
        conf -= 10

    if progress.current_execution_streak >= 2:
        conf += 5

    if workload.lower() in ["heavy", "overwhelming"]:
        conf -= 10

    if len(progress.repeatedly_missed_actions) > 0:
        conf -= 10

    confidence = max(20, min(98, conf))
    print(f"[AdaptiveFuture] FUTURE_CONFIDENCE: value={confidence}")

    # Evaluate Re-evaluation eligibility (requires persistent low execution across check-ins)
    persistent_low_execution = (
        progress.overall_execution_percentage < 60 and completion_pct < 60
    )
    eligible_re_eval = (
        checkin_count >= 3 and
        persistent_low_execution and
        len(progress.repeatedly_missed_actions) > 0 and
        workload.lower() in ["easy", "manageable", "low", "unknown"] and
        close_alt_name is not None
    )

    print(f"[AdaptiveFuture] RE_EVALUATION_CHECK: eligible={eligible_re_eval}")

    # Decision Matrix
    if eligible_re_eval and close_alt_name is not None and close_alt_score is not None:
        status = "re_evaluate"
        recommendation = "re_run_future_simulator"
        should_re_eval = True
        trigger_reason = f"Persistent low execution in {current_scenario} with competitive alternative {close_alt_name} ({close_alt_score}/100)."
        evidence = [
            f"Persistent low completion ({completion_pct}%) across {checkin_count} check-ins despite manageable workload.",
            f"Repeatedly missed actions in key {current_scenario} priority areas.",
            f"Alternative path '{close_alt_name}' is within {min_gap} points ({close_alt_score} vs {current_score})."
        ]
        next_action = f"Re-run Future Simulator to compare {current_scenario} vs {close_alt_name} with your actual execution capacity."

    elif completion_pct < 75 and workload.lower() in ["heavy", "overwhelming"]:
        status = "needs_adjustment"
        recommendation = "reduce_workload"
        should_re_eval = False
        trigger_reason = "Execution dip is driven by workload overload rather than path mismatch."
        evidence = [
            f"Completion rate is {completion_pct}%, but workload feels {workload}.",
            f"Workload overload is the primary blocker, not long-term career trajectory mismatch.",
            f"Current path '{current_scenario}' ({current_score}/100) remains mathematically optimal."
        ]
        next_action = "Reduce weekly hours in investment sliders before considering long-term path changes."

    elif trend == "declining" or velocity <= -10.0:
        status = "stabilize"
        recommendation = "stabilize_execution"
        should_re_eval = False
        trigger_reason = "Execution velocity dip requires stabilization before re-evaluating long-term path."
        evidence = [
            f"Execution velocity dropped by {abs(velocity)}% recently.",
            f"Temporary execution dips should be stabilized before questioning long-term goals.",
            f"Focus execution on top 2 high-impact priorities."
        ]
        next_action = "Focus exclusively on top 2 priority actions this week to rebuild velocity."

    else: # On Track or default
        status = "on_track"
        recommendation = "continue_current_path"
        should_re_eval = False
        trigger_reason = "Execution pattern is healthy and consistent with recommended path."
        evidence = [
            f"Weekly execution ({completion_pct}%) is aligned with {current_scenario} milestone requirements.",
            f"Workload level ({workload}) is sustainable.",
            f"Confidence score of {confidence}% indicates strong trajectory alignment."
        ]
        next_action = "Continue executing weekly roadmap actions consistently."

    print(f"[AdaptiveFuture] DECISION: status={status} recommendation={recommendation}")

    feedback = AdaptiveFutureFeedback(
        user_id=user_id,
        status=status,
        current_scenario=current_scenario,
        current_score=current_score,
        execution_health=f"Execution {completion_pct}% ({trend})",
        workload_health=workload,
        future_confidence=confidence,
        trigger_reason=trigger_reason,
        recommendation=recommendation,
        evidence=evidence,
        next_action=next_action,
        should_re_evaluate=should_re_eval,
        alternative_scenario=close_alt_name if eligible_re_eval else None,
        alternative_score=close_alt_score if eligible_re_eval else None,
        created_at=datetime.utcnow().isoformat()
    )

    ADAPTIVE_FUTURE_STORE[user_id] = feedback
    save_adaptive_future_to_disk()
    print(f"[AdaptiveFuture] SAVE_SUCCESS: user_id={user_id}")

    return feedback
