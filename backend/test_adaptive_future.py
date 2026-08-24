import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.schemas.models import (
    UserProfile,
    SimulationResponse,
    ScenarioInput,
    ScenarioResult,
    Recommendation,
    WeeklyCheckInResult,
    ActionRoadmap,
    RoadmapItem
)
from app.store import (
    SIMULATIONS_STORE,
    ROADMAPS_STORE,
    WEEKLY_CHECKINS_STORE,
    ADAPTIVE_FUTURE_STORE
)
from app.services.adaptive_future import evaluate_future_feedback

def run_adaptive_future_tests():
    print("==================================================")
    print("RUNNING PHASE 3 STEP 4 ADAPTIVE FUTURE TESTS")
    print("==================================================\n")

    test_uid = "test_user_adaptive"

    # Setup Simulation Data with competitive alternative (Placement 82 vs Higher Studies 80, gap = 2)
    SIMULATIONS_STORE[test_uid] = SimulationResponse(
        id="sim_456",
        user_id=test_uid,
        scenarios=[
            ScenarioInput(name="Placement", description="Corporate path", weekly_hours=20.0, focus_areas=["DSA"]),
            ScenarioInput(name="Higher Studies", description="Academic path", weekly_hours=20.0, focus_areas=["Exams"])
        ],
        results=[
            ScenarioResult(name="Placement", goal_alignment=82, skill_growth=80, financial_outlook=75, learning_potential=80, risk=30, overall_score=82, explanation="Leading path"),
            ScenarioResult(name="Higher Studies", goal_alignment=80, skill_growth=82, financial_outlook=70, learning_potential=85, risk=25, overall_score=80, explanation="Competitive alternative")
        ],
        recommendation=Recommendation(recommended_scenario="Placement", reason="Highest overall score")
    )

    ROADMAPS_STORE[test_uid] = ActionRoadmap(
        id="rm_456",
        user_id=test_uid,
        scenario="Placement",
        overall_score=82,
        reason="Highest overall score",
        workload_risk=30,
        risk_level="30% risk",
        weekly_actions=[
            RoadmapItem(id="act_dsa", title="Solve DSA Problems", description="10h/wk", category="SKILL", target="10h/wk", status="not_started", priority="High"),
            RoadmapItem(id="act_proj", title="Build Portfolio", description="6h/wk", category="PROJECT", target="6h/wk", status="not_started", priority="High")
        ]
    )

    # TEST A: Healthy Execution
    print("--- TEST A: Healthy Execution ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_3", user_id=test_uid, completion_percentage=85, completion_level="All", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=80, completion_level="All", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=75, completion_level="Most", workload_feeling="Easy")
    ]
    fb_a = evaluate_future_feedback(test_uid)
    assert fb_a.status == "on_track"
    assert fb_a.recommendation == "continue_current_path"
    assert fb_a.should_re_evaluate == False
    print("✓ TEST A PASSED: status = on_track, recommendation = continue_current_path, should_re_evaluate = False\n")

    # TEST B: Heavy Workload
    print("--- TEST B: Heavy Workload ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_3", user_id=test_uid, completion_percentage=50, completion_level="Some", workload_feeling="Overwhelming"),
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=45, completion_level="Some", workload_feeling="Heavy"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=40, completion_level="Almost none", workload_feeling="Heavy")
    ]
    fb_b = evaluate_future_feedback(test_uid)
    assert fb_b.status == "needs_adjustment"
    assert fb_b.recommendation == "reduce_workload"
    assert fb_b.should_re_evaluate == False
    print("✓ TEST B PASSED: status = needs_adjustment, recommendation = reduce_workload, should_re_evaluate = False\n")

    # TEST C: Declining Execution
    print("--- TEST C: Declining Execution ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_3", user_id=test_uid, completion_percentage=50, completion_level="Some", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=70, completion_level="Most", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=85, completion_level="All", workload_feeling="Easy")
    ]
    fb_c = evaluate_future_feedback(test_uid)
    assert fb_c.status == "stabilize"
    assert fb_c.recommendation == "stabilize_execution"
    assert fb_c.should_re_evaluate == False
    print("✓ TEST C PASSED: status = stabilize, recommendation = stabilize_execution, should_re_evaluate = False\n")

    # TEST D: Genuine Future Re-evaluation
    print("--- TEST D: Genuine Future Re-evaluation ---")
    WEEKLY_CHECKINS_STORE[test_uid] = [
        WeeklyCheckInResult(id="chk_3", user_id=test_uid, completion_percentage=45, completion_level="Some", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_2", user_id=test_uid, completion_percentage=50, completion_level="Some", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="chk_1", user_id=test_uid, completion_percentage=55, completion_level="Some", workload_feeling="Manageable")
    ]
    fb_d = evaluate_future_feedback(test_uid)
    assert fb_d.status == "re_evaluate"
    assert fb_d.recommendation == "re_run_future_simulator"
    assert fb_d.should_re_evaluate == True
    assert fb_d.alternative_scenario == "Higher Studies"
    assert fb_d.alternative_score == 80
    print("✓ TEST D PASSED: status = re_evaluate, alternative = Higher Studies (80), should_re_evaluate = True\n")

    # TEST E: Strong Alternative Gap (Placement 90 vs Startup 65, gap = 25 > 5)
    print("--- TEST E: Strong Alternative Gap ---")
    test_gap_uid = "test_user_gap"
    SIMULATIONS_STORE[test_gap_uid] = SimulationResponse(
        id="sim_gap",
        user_id=test_gap_uid,
        scenarios=[
            ScenarioInput(name="Placement", description="Path", weekly_hours=20.0),
            ScenarioInput(name="Startup", description="Path", weekly_hours=20.0)
        ],
        results=[
            ScenarioResult(name="Placement", goal_alignment=90, skill_growth=90, financial_outlook=90, learning_potential=90, risk=20, overall_score=90, explanation="Winner"),
            ScenarioResult(name="Startup", goal_alignment=65, skill_growth=65, financial_outlook=65, learning_potential=65, risk=50, overall_score=65, explanation="Distant")
        ],
        recommendation=Recommendation(recommended_scenario="Placement", reason="Score 90")
    )
    ROADMAPS_STORE[test_gap_uid] = ActionRoadmap(id="rm_gap", user_id=test_gap_uid, scenario="Placement", overall_score=90, reason="Top score", workload_risk=20, risk_level="Low", weekly_actions=[RoadmapItem(id="a1", title="A1", description="D", category="S", target="T", status="not_started", priority="High")])
    WEEKLY_CHECKINS_STORE[test_gap_uid] = [
        WeeklyCheckInResult(id="c3", user_id=test_gap_uid, completion_percentage=40, completion_level="Some", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="c2", user_id=test_gap_uid, completion_percentage=45, completion_level="Some", workload_feeling="Manageable"),
        WeeklyCheckInResult(id="c1", user_id=test_gap_uid, completion_percentage=50, completion_level="Some", workload_feeling="Manageable")
    ]
    fb_e = evaluate_future_feedback(test_gap_uid)
    assert fb_e.should_re_evaluate == False
    assert fb_e.status != "re_evaluate"
    print("✓ TEST E PASSED: Large score gap (25 pts) correctly prevents path re-evaluation despite low execution\n")

    # TEST F: Insufficient History (1 check-in)
    print("--- TEST F: Insufficient History ---")
    test_1chk_uid = "test_user_1chk"
    SIMULATIONS_STORE[test_1chk_uid] = SIMULATIONS_STORE[test_uid]
    ROADMAPS_STORE[test_1chk_uid] = ROADMAPS_STORE[test_uid]
    WEEKLY_CHECKINS_STORE[test_1chk_uid] = [
        WeeklyCheckInResult(id="chk_1", user_id=test_1chk_uid, completion_percentage=35, completion_level="Some", workload_feeling="Manageable")
    ]
    fb_f = evaluate_future_feedback(test_1chk_uid)
    assert fb_f.should_re_evaluate == False
    print("✓ TEST F PASSED: 1 check-in is insufficient to trigger re-evaluation (should_re_evaluate = False)\n")

    # TEST G: User Isolation
    print("--- TEST G: User Isolation ---")
    fb_g = evaluate_future_feedback("user_isolated_adaptive")
    assert fb_g.user_id == "user_isolated_adaptive"
    print("✓ TEST G PASSED: User isolation verified\n")

    # TEST H: Persistence
    print("--- TEST H: Persistence ---")
    assert test_uid in ADAPTIVE_FUTURE_STORE
    assert ADAPTIVE_FUTURE_STORE[test_uid].status == fb_d.status
    print("✓ TEST H PASSED: Feedback persisted in ADAPTIVE_FUTURE_STORE\n")

    print("==================================================")
    print("ALL 8 BACKEND ADAPTIVE FUTURE TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_adaptive_future_tests()
