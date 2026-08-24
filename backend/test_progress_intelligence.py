import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.schemas.models import (
    UserProfile,
    SimulationResponse,
    ScenarioInput,
    ScenarioResult,
    Recommendation,
    WeeklyCheckInResult
)
from app.store import ROADMAPS_STORE, WEEKLY_CHECKINS_STORE, PROGRESS_STORE
from app.services.roadmap import generate_roadmap_deterministic
from app.services.progress import analyze_user_progress

def run_all_tests():
    print("==================================================")
    print("RUNNING PHASE 3 STEP 3 PROGRESS INTELLIGENCE TESTS")
    print("==================================================\n")

    # TEST A: No Roadmap
    print("--- TEST A: No Roadmap ---")
    summary_a = analyze_user_progress("test_user_no_roadmap")
    assert summary_a.scenario == "None"
    assert summary_a.completion_trend == "insufficient_data"
    assert summary_a.adaptive_recommendation.recommendation_type == "observe"
    print("✓ TEST A PASSED: Graceful empty state returned\n")

    # Setup dummy simulation data for test user
    test_uid = "test_user_progress"
    sim_data = SimulationResponse(
        id="sim_123",
        user_id=test_uid,
        scenarios=[
            ScenarioInput(
                name="Placement",
                description="Corporate placement path",
                weekly_hours=20.0,
                focus_areas=["DSA", "Portfolio"],
                investments={"dsa_prep": 10.0, "portfolio_projects": 6.0, "system_design": 4.0}
            )
        ],
        results=[
            ScenarioResult(
                name="Placement",
                goal_alignment=85,
                skill_growth=80,
                financial_outlook=75,
                learning_potential=80,
                risk=30,
                overall_score=85,
                explanation="Strong alignment"
            )
        ],
        recommendation=Recommendation(
            recommended_scenario="Placement",
            reason="Highest overall score"
        )
    )

    # Generate roadmap for test user
    generate_roadmap_deterministic(test_uid, UserProfile(user_id=test_uid), sim_data)

    # TEST B: No Check-ins
    print("--- TEST B: No Check-ins ---")
    WEEKLY_CHECKINS_STORE[test_uid] = []
    summary_b = analyze_user_progress(test_uid)
    assert summary_b.scenario == "Placement"
    assert summary_b.completion_trend == "insufficient_data"
    assert summary_b.latest_week_completion_percentage == 0
    print("✓ TEST B PASSED: Insufficient data returned for 0 check-ins\n")

    # TEST C: Single Check-in
    print("--- TEST C: Single Check-in ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(
            id="chk_1",
            user_id=test_uid,
            roadmap_id="roadmap_1",
            completed_actions_count=2,
            total_actions_count=3,
            completion_percentage=66,
            completion_level="Most",
            workload_feeling="Manageable",
            guidance_message="Good pace"
        )
    ]
    summary_c = analyze_user_progress(test_uid)
    assert summary_c.latest_week_completion_percentage == 66
    assert summary_c.completion_trend == "insufficient_data"
    assert summary_c.current_execution_streak == 1
    print("✓ TEST C PASSED: Single check-in parsed, trend = insufficient_data, streak = 1\n")

    # TEST D: Improving Trend
    print("--- TEST D: Improving Trend ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_3", user_id=test_uid, completion_percentage=80, completion_level="All", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=65, completion_level="Most", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=50, completion_level="Some", workload_feeling="Manageable")
    ]
    summary_d = analyze_user_progress(test_uid)
    assert summary_d.completion_trend == "improving"
    assert summary_d.execution_velocity == 15.0
    print(f"✓ TEST D PASSED: trend = improving, velocity = +15.0%\n")

    # TEST E: Declining Trend
    print("--- TEST E: Declining Trend ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_3", user_id=test_uid, completion_percentage=50, completion_level="Some", workload_feeling="Heavy"),
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=70, completion_level="Most", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=85, completion_level="All", workload_feeling="Easy")
    ]
    summary_e = analyze_user_progress(test_uid)
    assert summary_e.completion_trend == "declining"
    assert summary_e.execution_velocity == -20.0
    assert summary_e.adaptive_recommendation.recommendation_type == "stabilize"
    print(f"✓ TEST E PASSED: trend = declining, velocity = -20.0%, strategy = stabilize\n")

    # TEST F: Stable Trend
    print("--- TEST F: Stable Trend ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=62, completion_level="Most", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=60, completion_level="Most", workload_feeling="Manageable")
    ]
    summary_f = analyze_user_progress(test_uid)
    assert summary_f.completion_trend == "stable"
    print("✓ TEST F PASSED: trend = stable\n")

    # TEST G: Streak Calculation
    print("--- TEST G: Streak Calculation ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_3", user_id=test_uid, completion_percentage=80, completion_level="All", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=70, completion_level="Most", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=60, completion_level="Most", workload_feeling="Manageable")
    ]
    summary_g = analyze_user_progress(test_uid)
    assert summary_g.current_execution_streak == 3
    print("✓ TEST G PASSED: streak = 3 consecutive qualifying weeks\n")

    # TEST H: Repeatedly Missed Actions
    print("--- TEST H: Repeatedly Missed Action Analysis ---")
    summary_h = analyze_user_progress(test_uid)
    assert len(summary_h.missed_actions) > 0
    assert len(summary_h.repeatedly_missed_actions) > 0
    print("✓ TEST H PASSED: Repeatedly missed actions correctly identified\n")

    # TEST I: Heavy Workload + Low Completion
    print("--- TEST I: Heavy Workload + Low Completion ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=35, completion_level="Almost none", workload_feeling="Overwhelming"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=40, completion_level="Some", workload_feeling="Heavy")
    ]
    summary_i = analyze_user_progress(test_uid)
    assert summary_i.adaptive_recommendation.recommendation_type == "reduce_workload"
    print("✓ TEST I PASSED: Workload rule triggered recommendation_type = reduce_workload\n")

    # TEST J: High Completion + Manageable Workload
    print("--- TEST J: High Completion + Manageable Workload ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=85, completion_level="All", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=80, completion_level="All", workload_feeling="Easy")
    ]
    summary_j = analyze_user_progress(test_uid)
    assert summary_j.adaptive_recommendation.recommendation_type == "increase_depth"
    print("✓ TEST J PASSED: Workload rule triggered recommendation_type = increase_depth\n")

    # TEST K: User Isolation
    print("--- TEST K: User Isolation ---")
    summary_k = analyze_user_progress("user_isolated_test")
    assert summary_k.user_id == "user_isolated_test"
    assert summary_k.scenario == "None"
    print("✓ TEST K PASSED: Strict user isolation verified\n")

    # TEST L: Persistence
    print("--- TEST L: Persistence ---")
    assert test_uid in PROGRESS_STORE
    assert PROGRESS_STORE[test_uid].overall_execution_percentage == summary_j.overall_execution_percentage
    print("✓ TEST L PASSED: Progress summary persisted in PROGRESS_STORE\n")

    print("==================================================")
    print("ALL 12 BACKEND PROGRESS INTELLIGENCE TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
