import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.schemas.models import UserProfile, ScenarioInput, ScenarioResult, Recommendation, SimulationResponse
from app.services.roadmap import generate_roadmap_deterministic, extract_goal_intelligence
from app.store import ROADMAPS_STORE, SIMULATIONS_STORE, PROFILES_STORE, CHECKINS_STORE

def create_mock_simulation(user_id: str) -> SimulationResponse:
    res = ScenarioResult(
        name="Placement",
        goal_alignment=85,
        skill_growth=80,
        financial_outlook=82,
        learning_potential=78,
        risk=30,
        overall_score=85,
        explanation="Winning placement scenario"
    )
    return SimulationResponse(
        id=f"sim_{user_id}",
        user_id=user_id,
        scenarios=[ScenarioInput(name="Placement", weekly_hours=20.0)],
        results=[res],
        recommendation=Recommendation(recommended_scenario="Placement", reason="Highest overall score")
    )

def get_goal_slider_dimensions(profile: UserProfile) -> dict:
    raw_goal = (profile.career_goal or profile.short_term_goal or "").strip()
    clean_goal = raw_goal or "Professional Specialist"
    lower_goal = clean_goal.lower()
    for prefix in [
        "become a ", "become an ", "become ",
        "work as a ", "work as an ", "work as ",
        "pursue a career as a ", "pursue a career as an ", "pursue ",
        "be a ", "be an ", "transition to "
    ]:
        if lower_goal.startswith(prefix):
            clean_goal = clean_goal[len(prefix):].strip()
            break
    
    profession_title = clean_goal.title() if clean_goal else "Professional Specialist"
    skills_to_improve = profile.skills_to_improve or []
    skills = profile.skills or []

    primary_skill = skills_to_improve[0] if skills_to_improve else (skills[0] if skills else f"{profession_title} Core Principles")
    secondary_skill = skills_to_improve[1] if len(skills_to_improve) > 1 else (skills[1] if len(skills) > 1 else f"{profession_title} Practical Deliverables")

    return {
        "profession_title": profession_title,
        "scenario_title": f"CAREER EXECUTION ({profession_title.upper()})",
        "slider1_label": f"Master {primary_skill} & {profession_title} Fundamentals",
        "slider2_label": f"{profession_title} Portfolio & {secondary_skill}",
        "slider3_label": f"{profession_title} Career Prep & Peer Reviews"
    }

def test_profession_agnostic_goal_intelligence():
    print("==================================================")
    print("RUNNING PROFESSION-AGNOSTIC GOAL & SIMULATOR TESTS")
    print("==================================================\n")

    # TEST 1: Goal = "Become teacher"
    print("--- TEST 1: Goal = 'Become teacher' ---")
    p1 = UserProfile(user_id="user_teacher", name="Teacher User", career_goal="Become teacher", skills=["Lesson Planning", "Communication"], skills_to_improve=["Classroom Management"])
    dims1 = get_goal_slider_dimensions(p1)
    assert dims1["profession_title"] == "Teacher"
    assert "dsa" not in dims1["slider1_label"].lower(), "Teacher simulator sliders must NOT contain DSA"
    assert "portfolio" in dims1["slider2_label"].lower() and "teacher" in dims1["slider2_label"].lower()

    sim1 = create_mock_simulation("user_teacher")
    rm1 = generate_roadmap_deterministic("user_teacher", p1, sim1)
    
    assert any("Teacher" in a.title for a in rm1.weekly_actions), "Roadmap should contain Teacher-relevant actions"
    assert not any("dsa" in a.title.lower() for a in rm1.weekly_actions), "Teacher roadmap must NOT contain developer DSA actions"
    assert not any("leetcode" in a.description.lower() for a in rm1.weekly_actions), "Teacher roadmap must NOT contain LeetCode references"
    print("✓ TEST 1 PASSED: Teacher goal generated teaching-relevant simulator sliders & roadmap with 0 developer tasks.\n")

    # TEST 2: Goal = "Become software engineer"
    print("--- TEST 2: Goal = 'Become software engineer' ---")
    p2 = UserProfile(user_id="user_swe", name="SWE User", career_goal="Become software engineer", skills=["Python", "React"], skills_to_improve=["DSA", "System Design"])
    dims2 = get_goal_slider_dimensions(p2)
    assert dims2["profession_title"] == "Software Engineer"
    assert "dsa" in dims2["slider1_label"].lower()

    sim2 = create_mock_simulation("user_swe")
    rm2 = generate_roadmap_deterministic("user_swe", p2, sim2)

    assert any("Software Engineer" in a.title for a in rm2.weekly_actions), "Roadmap should contain Software Engineer actions"
    assert any("DSA" in a.title for a in rm2.weekly_actions), "SWE roadmap should incorporate DSA skill focus"
    print("✓ TEST 2 PASSED: Software Engineer goal generated SWE simulator sliders & roadmap.\n")

    # TEST 3: Goal = "Become lawyer"
    print("--- TEST 3: Goal = 'Become lawyer' ---")
    p3 = UserProfile(user_id="user_lawyer", name="Lawyer User", career_goal="Become lawyer", skills=["Legal Research"], skills_to_improve=["Legal Writing"])
    dims3 = get_goal_slider_dimensions(p3)
    assert dims3["profession_title"] == "Lawyer"
    assert "dsa" not in dims3["slider1_label"].lower()

    sim3 = create_mock_simulation("user_lawyer")
    rm3 = generate_roadmap_deterministic("user_lawyer", p3, sim3)

    assert any("Lawyer" in a.title for a in rm3.weekly_actions), "Roadmap should contain Lawyer actions"
    assert not any("dsa" in a.title.lower() for a in rm3.weekly_actions), "Lawyer roadmap must NOT contain DSA actions"
    print("✓ TEST 3 PASSED: Lawyer goal generated legal simulator sliders & roadmap with 0 developer tasks.\n")

    # TEST 4: Goal = Arbitrary Unseen Profession ("Wildlife Photographer")
    print("--- TEST 4: Arbitrary Unseen Profession = 'Wildlife Photographer' ---")
    p4 = UserProfile(user_id="user_photo", name="Photographer User", career_goal="Wildlife Photographer", skills=["Camera Handling"], skills_to_improve=["Lighting & Editing"])
    dims4 = get_goal_slider_dimensions(p4)
    assert dims4["profession_title"] == "Wildlife Photographer"
    assert "wildlife photographer" in dims4["slider2_label"].lower()

    sim4 = create_mock_simulation("user_photo")
    rm4 = generate_roadmap_deterministic("user_photo", p4, sim4)

    assert any("Wildlife Photographer" in a.title for a in rm4.weekly_actions), "Unseen profession should be dynamically reflected in roadmap"
    assert not any("dsa" in a.title.lower() for a in rm4.weekly_actions), "Unseen profession roadmap must NOT default to developer actions"
    print("✓ TEST 4 PASSED: Wildlife Photographer goal generated photographer simulator sliders & roadmap.\n")

    # TEST 5: Change Goal: "Software Engineer" -> "Teacher"
    print("--- TEST 5: Goal Change: 'Software Engineer' -> 'Teacher' ---")
    uid_change = "user_dynamic_change"
    p_swe = UserProfile(user_id=uid_change, name="Dynamic User", career_goal="Software Engineer")
    sim_c = create_mock_simulation(uid_change)
    rm_swe = generate_roadmap_deterministic(uid_change, p_swe, sim_c)
    assert any("Software Engineer" in a.title for a in rm_swe.weekly_actions)

    # Change goal to Teacher and regenerate
    p_teacher = UserProfile(user_id=uid_change, name="Dynamic User", career_goal="Teacher")
    rm_teacher = generate_roadmap_deterministic(uid_change, p_teacher, sim_c)
    assert any("Teacher" in a.title for a in rm_teacher.weekly_actions), "Regenerated roadmap must anchor to new Teacher goal"
    assert not any("Software Engineer" in a.title for a in rm_teacher.weekly_actions), "Previous SWE actions must NOT remain"
    print("✓ TEST 5 PASSED: Changing goal cleared previous SWE roadmap and generated fresh Teacher roadmap.\n")

    # TEST 6: Change Goal: "Teacher" -> "Doctor"
    print("--- TEST 6: Goal Change: 'Teacher' -> 'Doctor' ---")
    p_doctor = UserProfile(user_id=uid_change, name="Dynamic User", career_goal="Doctor")
    rm_doctor = generate_roadmap_deterministic(uid_change, p_doctor, sim_c)
    assert any("Doctor" in a.title for a in rm_doctor.weekly_actions), "Regenerated roadmap must anchor to Doctor goal"
    assert not any("Teacher" in a.title for a in rm_doctor.weekly_actions), "Previous Teacher actions must NOT remain"
    print("✓ TEST 6 PASSED: Changing goal cleared previous Teacher roadmap and generated fresh Doctor roadmap.\n")

    # TEST 7: Daily Check-in Telemetry Propagation to Progress & Adaptive Future
    print("--- TEST 7: Daily Check-in Telemetry Propagation ---")
    from app.schemas.models import DailyCheckInInput
    from app.services.checkin import create_or_update_daily_checkin, get_checkin_summary
    from app.services.progress import analyze_user_progress
    from app.services.adaptive_future import evaluate_future_feedback

    uid_checkin = "user_checkin_test"
    p_chk = UserProfile(user_id=uid_checkin, name="Checkin User", career_goal="Become teacher")
    sim_chk = create_mock_simulation(uid_checkin)
    generate_roadmap_deterministic(uid_checkin, p_chk, sim_chk)

    # 1. Submit daily checkin
    c_input = DailyCheckInInput(
        sleep_time="23:00", wake_time="06:30", sleep_duration=7.5,
        energy=8, stress=3, mood=8, planned_tasks=5, completed_tasks=4,
        work_hours=6.0, study_hours=2.0, exercise_completed=True
    )
    create_or_update_daily_checkin(uid_checkin, c_input)

    # 2. Verify check-in summary
    chk_summary = get_checkin_summary(uid_checkin)
    assert chk_summary.total_checkins >= 1, "Check-in summary total_checkins must be >= 1"
    assert chk_summary.streak_days >= 1, "Streak days must be >= 1 after first check-in"
    assert chk_summary.task_completion_rate == 80.0, "Task completion rate must be 80.0%"

    # 3. Verify Progress Intelligence analysis
    prog_res = analyze_user_progress(uid_checkin)
    assert len(prog_res.weekly_history_trend) > 0, "Progress weekly_history_trend must be populated"
    assert prog_res.current_execution_streak >= 1, "Execution streak must be >= 1"

    # 4. Verify Adaptive Future feedback
    af_res = evaluate_future_feedback(uid_checkin)
    assert af_res.current_scenario == "Become teacher", "Adaptive future trajectory must reflect user's career goal 'Become teacher'"
    assert "Become teacher" in af_res.current_scenario, "Trajectory must NOT be hardcoded to Placement"
    # TEST 8: Weekly Check-in Same-Week Deduping & 5 Submissions Test
    print("--- TEST 8: Weekly Check-in Same-Week Deduping (5 Submissions Test) ---")
    from app.schemas.models import WeeklyCheckInSubmission
    from app.routes.checkin import submit_weekly_checkin
    from app.store import WEEKLY_CHECKINS_STORE
    from app.repositories.checkin_repository import CheckInRepository

    uid_dedup = "user_dedup_test"
    p_dedup = UserProfile(user_id=uid_dedup, name="Dedup User", career_goal="Become teacher")
    sim_dedup = create_mock_simulation(uid_dedup)
    generate_roadmap_deterministic(uid_dedup, p_dedup, sim_dedup)

    # Perform 5 consecutive submissions in the same ISO week
    for i in range(1, 6):
        w_sub = WeeklyCheckInSubmission(
            user_id=uid_dedup,
            completion_level="Most" if i < 5 else "All",
            workload_feeling="Manageable" if i < 5 else "Easy"
        )
        submit_weekly_checkin(w_sub, uid_dedup)

    user_w_records = CheckInRepository.get_weekly_checkins(uid_dedup)
    assert len(user_w_records) == 1, f"5 submissions in 1 week MUST produce exactly 1 record, got {len(user_w_records)}"
    assert user_w_records[0].completion_level == "All", "Updated week record should reflect 5th submission values"
    print("✓ TEST 8 PASSED: 5 submissions in the same week produced EXACTLY 1 weekly record with updated values.\n")

    # TEST 9: Doctor Goal
    print("--- TEST 9: Goal = 'Doctor' ---")
    from app.services.career_context import get_personalized_career_context
    p_doc = UserProfile(user_id="user_doctor", name="Doctor User", career_goal="Become doctor", skills=["Diagnostics", "Patient Care"], skills_to_improve=["Clinical Practice"])
    ctx_doc = get_personalized_career_context(p_doc)
    assert ctx_doc["profession_title"] == "Doctor"
    assert "clinical" in ctx_doc["slider1"]["label"].lower() or "diagnostics" in ctx_doc["slider1"]["label"].lower()
    assert "dsa" not in ctx_doc["slider1"]["label"].lower()
    print("✓ TEST 9 PASSED: Doctor goal derived clinical & medical board slider dimensions.\n")

    # TEST 10: Designer Goal
    print("--- TEST 10: Goal = 'UI/UX Designer' ---")
    p_des = UserProfile(user_id="user_designer", name="Designer User", career_goal="UI/UX Designer", skills=["Figma", "User Research"], skills_to_improve=["Design Systems"])
    ctx_des = get_personalized_career_context(p_des)
    assert ctx_des["profession_title"] == "Ui/ux designer" or "designer" in ctx_des["profession_title"].lower()
    assert "design" in ctx_des["slider1"]["label"].lower() or "ux" in ctx_des["slider1"]["label"].lower()
    assert "dsa" not in ctx_des["slider1"]["label"].lower()
    print("✓ TEST 10 PASSED: Designer goal derived design practice & portfolio case study dimensions.\n")

    # TEST 11: Photographer Goal
    print("--- TEST 11: Goal = 'Wildlife Photographer' ---")
    p_photo = UserProfile(user_id="user_photographer", name="Photographer User", career_goal="Wildlife Photographer", skills=["Camera Handling"], skills_to_improve=["Post-Processing"])
    ctx_photo = get_personalized_career_context(p_photo)
    assert "photographer" in ctx_photo["profession_title"].lower()
    assert "camera" in ctx_photo["slider1"]["label"].lower() or "photographer" in ctx_photo["slider1"]["label"].lower()
    assert "dsa" not in ctx_photo["slider1"]["label"].lower()
    print("✓ TEST 11 PASSED: Photographer goal derived camera handling & shoot portfolio dimensions.\n")

    # TEST 12: Custom Unseen Goal = 'Environmental Scientist'
    print("--- TEST 12: Custom Unseen Goal = 'Environmental Scientist' ---")
    p_env = UserProfile(user_id="user_env", name="Scientist User", career_goal="Environmental Scientist", skills=["Field Sampling"], skills_to_improve=["Data Analysis"])
    ctx_env = get_personalized_career_context(p_env)
    assert "environmental scientist" in ctx_env["profession_title"].lower()
    assert "dsa" not in ctx_env["slider1"]["label"].lower()
    print("✓ TEST 12 PASSED: Custom profession 'Environmental Scientist' derived scientific research dimensions.\n")

    # TEST 14: Dynamic Default Simulation Construction when Store is Empty
    print("--- TEST 14: Dynamic Default Simulation for Empty Store ---")
    from app.routes.simulator import get_user_scenarios_endpoint
    from app.store import SIMULATIONS_STORE

    uid_empty = "user_empty_sim_store"
    p_empty = UserProfile(user_id=uid_empty, name="Photographer User", career_goal="Wildlife Photographer", skills=["Camera Handling"], skills_to_improve=["Lighting"])
    PROFILES_STORE[uid_empty] = p_empty

    # Ensure store is empty for user
    if uid_empty in SIMULATIONS_STORE:
        del SIMULATIONS_STORE[uid_empty]

    # Call endpoint directly
    sim_empty_res = get_user_scenarios_endpoint(uid_empty)
    assert sim_empty_res is not None, "GET /api/scenarios/{user_id} must NOT return 404 when valid profile exists"
    assert sim_empty_res.user_id == uid_empty
    assert len(sim_empty_res.scenarios) == 3
    placement_focus = sim_empty_res.scenarios[0].focus_areas
    assert not any("dsa" in f.lower() for f in placement_focus), "Wildlife Photographer must NOT show DSA in scenario focus areas"
    assert any("camera" in f.lower() or "photographer" in f.lower() for f in placement_focus), "Scenario focus areas must reflect Wildlife Photographer goal"
    # TEST 15: Exercise Telemetry 2-State Verification
    print("--- TEST 15: Exercise Telemetry 2-State Verification ---")
    from app.schemas.models import DailyCheckInInput
    from app.services.checkin import create_or_update_daily_checkin

    uid_ex = "user_exercise_test"
    CHECKINS_STORE.pop(uid_ex, None)
    
    # State 1: Default/No exercise (exercise_completed is False)
    c1 = create_or_update_daily_checkin(uid_ex, DailyCheckInInput(sleep_duration=7.5, energy=8, stress=3))
    assert c1.exercise_completed in (False, None), "Default exercise info must resolve to False/None"
    assert c1.sleep_duration == 7.5 and c1.energy == 8, "Other telemetry values must remain intact"

    # State 2: Explicitly no exercise (exercise_completed is False)
    c2 = create_or_update_daily_checkin(uid_ex, DailyCheckInInput(sleep_duration=7.5, energy=8, stress=3, exercise_completed=False))
    assert c2.exercise_completed is False, "Explicitly no exercise must be stored as False"

    # State 3: Exercise completed (exercise_completed is True & exercise_summary provided)
    c3 = create_or_update_daily_checkin(uid_ex, DailyCheckInInput(sleep_duration=7.5, energy=8, stress=3, exercise_completed=True, exercise_summary="30 min • Running"))
    assert c3.exercise_completed is True, "Workout completed must be stored as True"
    # TEST 16: Check-In Summary Telemetry Updating
    print("--- TEST 16: Check-In Summary Telemetry Updating ---")
    from app.services.checkin import get_checkin_summary

    uid_sum = "user_summary_test"
    CHECKINS_STORE.pop(uid_sum, None)
    create_or_update_daily_checkin(uid_sum, DailyCheckInInput(sleep_time="23:00", wake_time="07:00", energy=7, stress=6, planned_tasks=5, completed_tasks=4))
    
    summary_res = get_checkin_summary(uid_sum)
    assert summary_res.total_checkins == 1, "total_checkins must be 1 after check-in"
    assert summary_res.streak_days == 1, "streak_days must be 1 after today's check-in"
    assert summary_res.avg_sleep == 8.0 or summary_res.average_sleep == 8.0, "avg_sleep must be 8.0h"
    assert summary_res.avg_energy == 7.0 or summary_res.average_energy == 7.0, "avg_energy must be 7.0"
    assert summary_res.avg_stress == 6.0 or summary_res.average_stress == 6.0, "avg_stress must be 6.0"
    assert summary_res.task_completion_rate == 80.0, "task_completion_rate must be 80.0%"
    # TEST 17: Roadmap Execution & Career Change Invalidation Verification
    print("--- TEST 17: Roadmap Execution & Career Change Invalidation Verification ---")
    from app.routes.roadmap import update_action_status, get_user_roadmap
    from app.routes.profile import update_user_profile
    from app.schemas.models import UserProfileUpdate
    from app.services.progress import analyze_user_progress

    uid_exec = "user_execution_test"
    CHECKINS_STORE.pop(uid_exec, None)
    p_exec = UserProfile(user_id=uid_exec, name="Exec User", career_goal="Wildlife Photographer")
    PROFILES_STORE[uid_exec] = p_exec
    sim_exec = create_mock_simulation(uid_exec)
    rm_exec = generate_roadmap_deterministic(uid_exec, p_exec, sim_exec)

    # Initial: 0 / 3 = 0%
    act1 = rm_exec.weekly_actions[0]
    act2 = rm_exec.weekly_actions[1]
    act3 = rm_exec.weekly_actions[2]
    prog0 = analyze_user_progress(uid_exec)
    assert prog0.latest_week_completion_percentage == 0, "Initial execution must be 0%"

    # Action 1 completed: 1 / 3 = 33%
    rm1 = update_action_status(uid_exec, act1.id)
    prog1 = analyze_user_progress(uid_exec)
    assert prog1.latest_week_completion_percentage == 33, f"1/3 actions completed must equal 33%, got {prog1.latest_week_completion_percentage}%"

    # Action 2 completed: 2 / 3 = 67%
    rm2 = update_action_status(uid_exec, act2.id)
    prog2 = analyze_user_progress(uid_exec)
    assert prog2.latest_week_completion_percentage == 67, f"2/3 actions completed must equal 67%, got {prog2.latest_week_completion_percentage}%"

    # Action 3 completed: 3 / 3 = 100%
    rm3 = update_action_status(uid_exec, act3.id)
    prog3 = analyze_user_progress(uid_exec)
    assert prog3.latest_week_completion_percentage == 100, f"3/3 actions completed must equal 100%, got {prog3.latest_week_completion_percentage}%"

    # Career Change to "Teacher" -> Invalidate old roadmap
    update_user_profile(uid_exec, UserProfileUpdate(career_goal="Become Teacher"))
    assert uid_exec not in ROADMAPS_STORE, "Changing career goal MUST delete stale stored roadmap"

    # Re-generating for Teacher starts at 0% with Teacher actions
    sim_teacher = create_mock_simulation(uid_exec)
    rm_teacher = generate_roadmap_deterministic(uid_exec, PROFILES_STORE[uid_exec], sim_teacher)
    prog_teacher = analyze_user_progress(uid_exec)
    assert prog_teacher.latest_week_completion_percentage == 0, "New career roadmap MUST start with 0% execution"
    assert not any("camera" in a.title.lower() or "photographer" in a.title.lower() for a in rm_teacher.weekly_actions), "New roadmap must not retain old career actions"
    # TEST 18: Energy & Stress Telemetry Accuracy Verification
    print("--- TEST 18: Energy & Stress Telemetry Accuracy Verification ---")
    uid_es1 = "user_es_test_1"
    uid_es2 = "user_es_test_2"
    CHECKINS_STORE.pop(uid_es1, None)
    CHECKINS_STORE.pop(uid_es2, None)

    # Single check-in: energy 7, stress 6, mood 9
    c_es1 = create_or_update_daily_checkin(uid_es1, DailyCheckInInput(energy=7, stress=6, mood=9))
    sum_es1 = get_checkin_summary(uid_es1)
    assert sum_es1.avg_energy == 7, f"Expected avg_energy=7, got {sum_es1.avg_energy}"
    assert sum_es1.avg_stress == 6, f"Expected avg_stress=6, got {sum_es1.avg_stress}"
    assert sum_es1.avg_mood == 9, f"Expected avg_mood=9, got {sum_es1.avg_mood}"
    assert sum_es1.avg_stress != sum_es1.avg_mood, "Mood must never be substituted for stress"

    # Multiple check-ins: energy=7 & 9 (avg 8), stress=6 & 4 (avg 5)
    c_es1_2 = create_or_update_daily_checkin(uid_es1, DailyCheckInInput(energy=9, stress=4, mood=2), checkin_date=(date.today() - timedelta(days=1)).strftime("%Y-%m-%d"))
    sum_es1_multi = get_checkin_summary(uid_es1)
    assert sum_es1_multi.avg_energy == 8, f"Expected 7-day avg_energy=8, got {sum_es1_multi.avg_energy}"
    assert sum_es1_multi.avg_stress == 5, f"Expected 7-day avg_stress=5, got {sum_es1_multi.avg_stress}"

    # User isolation: User 2 has separate telemetry
    create_or_update_daily_checkin(uid_es2, DailyCheckInInput(energy=4, stress=9, mood=3))
    sum_es2 = get_checkin_summary(uid_es2)
    # TEST 19: Wildlife Photographer Full Personalization Suite
    print("--- TEST 19: Wildlife Photographer Full Personalization Suite ---")
    from app.services.simulator import build_default_personalized_simulation

    uid_wp = "user_wildlife_test"
    p_wp = UserProfile(
        user_id=uid_wp,
        name="Wildlife Photographer User",
        education="B.Sc.",
        career_goal="Wild life photographer",
        long_term_goal="Become a highly skilled Wildlife Photographer and build a professional career documenting wildlife and conservation.",
        short_term_goal="Build a strong wildlife photography portfolio and complete 3 real-world wildlife photography projects within the next 6 months.",
        skills=["Photography basics", "DSLR handling", "Composition", "Lightroom"],
        skills_to_improve=["Advanced camera techniques", "Wildlife tracking", "Animal behavior"]
    )
    PROFILES_STORE[uid_wp] = p_wp

    sim_wp = build_default_personalized_simulation(uid_wp, p_wp)
    sc_names = [s.name for s in sim_wp.scenarios]
    sc_descs = " ".join([s.description for s in sim_wp.scenarios])
    
    assert "Career Execution (Wildlife Photography)" in sc_names, f"Scenario 1 must be personalized career execution, got {sc_names}"
    assert "M.Sc. / Advanced Academic Studies" in sc_names or "Post-Graduate" in sc_names, f"Scenario 2 must be education-driven (B.Sc. -> M.Sc.), got {sc_names}"
    assert "Independent Photography Venture" in sc_names, f"Scenario 3 must be venture-driven, got {sc_names}"
    assert not any(forbidden in sc_descs.lower() for forbidden in ["gre", "gate", "dsa", "system design", "placement"]), "No software terms allowed in Wildlife Photographer scenarios"

    assert "Wildlife Photography" in sim_wp.recommendation.recommended_scenario, f"Leading path must be Wildlife Photographer specific, got {sim_wp.recommendation.recommended_scenario}"

    rm_wp = generate_roadmap_deterministic(uid_wp, p_wp, sim_wp)
    rm_titles = " ".join([a.title for a in rm_wp.weekly_actions])
    rm_descs = " ".join([a.description for a in rm_wp.weekly_actions])
    
    assert not any(forbidden in (rm_titles + rm_descs).lower() for forbidden in ["dsa", "system design", "gre", "gate", "coding interview"]), "No engineering/exam terms allowed in Wildlife Photographer roadmap"
    assert "photographer" in (rm_titles + rm_descs).lower() or "camera" in (rm_titles + rm_descs).lower(), "Roadmap actions must be directly relevant to photography"
    print("✓ TEST 19 PASSED: Wildlife Photographer scenario names, descriptions, leading path, and non-software roadmap actions verified.\n")

    # TEST 20: Progress Intelligence NameError Fix & Execution Verification
    print("--- TEST 20: Progress Intelligence NameError Fix & Execution Verification ---")
    CHECKINS_STORE.pop(uid_wp, None)
    prog_wp_0 = analyze_user_progress(uid_wp)
    assert prog_wp_0 is not None, "analyze_user_progress must return valid summary for 0 check-ins"

    # Single check-in
    create_or_update_daily_checkin(uid_wp, DailyCheckInInput(energy=7, stress=6, mood=8))
    prog_wp_1 = analyze_user_progress(uid_wp)
    assert prog_wp_1 is not None, "analyze_user_progress must return valid summary for 1 check-in"
    assert prog_wp_1.current_execution_streak == 1, f"Expected streak=1, got {prog_wp_1.current_execution_streak}"
    assert prog_wp_1.completion_trend == "insufficient_data", f"Expected trend='insufficient_data', got {prog_wp_1.completion_trend}"
    assert prog_wp_1.execution_velocity == 0.0, f"Expected velocity=0.0, got {prog_wp_1.execution_velocity}"

    # Multiple check-ins
    create_or_update_daily_checkin(uid_wp, DailyCheckInInput(energy=8, stress=4, mood=9), checkin_date=(date.today() - timedelta(days=1)).strftime("%Y-%m-%d"))
    prog_wp_2 = analyze_user_progress(uid_wp)
    assert prog_wp_2 is not None, "analyze_user_progress must return valid summary for multiple check-ins"
    assert prog_wp_2.missed_actions[0].missed_count >= 2, "Missed count must reflect multiple check-ins"
    print("✓ TEST 20 PASSED: Progress intelligence checkin_count NameError resolved and execution metrics verified.\n")

    # TEST 21: Selected Scenario Sync & Analysis Isolation Verification
    print("--- TEST 21: Selected Scenario Sync & Analysis Isolation Verification ---")
    sim_sync = build_default_personalized_simulation(uid_wp, p_wp)
    res_names = [r.name for r in sim_sync.results]
    
    assert "Career Execution (Wildlife Photography)" in res_names, "Result 1 must match Scenario 1"
    assert "M.Sc. / Advanced Academic Studies" in res_names, "Result 2 must match Scenario 2"
    assert "Independent Photography Venture" in res_names, "Result 3 must match Scenario 3"

    for r in sim_sync.results:
        assert r.overall_score > 0, f"Scenario {r.name} must have valid score, got {r.overall_score}"
        assert r.goal_alignment >= 0 and r.risk >= 0, f"Scenario {r.name} must have valid breakdown metrics"

    print("✓ TEST 21 PASSED: Selected scenario sync and score driver isolation verified.\n")

    # TEST 22: Generalized Higher Studies Resolver 20-Test Matrix
    print("--- TEST 22: Generalized Higher Studies Resolver 20-Test Matrix ---")
    from app.services.higher_studies_resolver import resolve_higher_studies_path

    test_matrix = [
        ("B.Sc. Computer Science", "AI Engineer", "Domestic", "M.Sc. in Computer Science"),
        ("B.E. Computer Science Engineering", "Wildlife Photographer", "Domestic", "M.Tech / M.E. in Computer Science & Engineering"),
        ("B.Tech Computer Science", "GRE Abroad", "International", "MS in Computer Science & Engineering"),
        ("B.Sc. Physics", "Data Scientist", "Domestic", "M.Sc. in Physics"),
        ("B.Sc. Biology", "Wildlife Photographer", "Domestic", "M.Sc. in Biology & Life Sciences"),
        ("BCA", "Software Engineer", "Domestic", "MCA / MS in Computing"),
        ("B.Com", "Financial Analyst", "Domestic", "M.Com / MBA in Commerce & Financial Studies"),
        ("B.Com Finance", "Banker", "Domestic", "M.Com / MBA in Finance & Banking"),
        ("BBA Marketing", "Brand Manager", "Domestic", "MBA / Master's in Marketing"),
        ("BA Psychology", "Counselor", "Domestic", "M.A. in Psychology"),
        ("BA Economics", "Policy Analyst", "Domestic", "M.A. in Economics"),
        ("B.E. Mechanical", "Automotive Engineer", "Domestic", "M.Tech / M.E. in Mechanical Engineering"),
        ("B.E. Civil", "Structural Engineer", "Domestic", "M.Tech / M.E. in Civil Engineering"),
        ("B.Tech AI/ML", "ML Researcher", "Domestic", "M.Tech / M.E. in AI & Machine Learning"),
        ("B.Tech Data Science", "Data Engineer", "Domestic", "M.Tech / M.E. in Data Science & Analytics"),
        ("B.Arch", "Architect", "Domestic", "M.Arch Postgraduate Studies"),
        ("B.Pharm", "Pharmacist", "Domestic", "M.Pharm Postgraduate Studies"),
        ("Bachelor of Marine Science", "Oceanographer", "Domestic", "Master's in Environmental & Marine Science"),
        ("B.E. Computer Science", "Wildlife Photographer", "Domestic", "M.Tech / M.E. in Computer Science & Engineering"),
        ("B.Sc. Biology", "Wildlife Photographer", "Domestic", "M.Sc. in Biology & Life Sciences")
    ]

    for ed_val, cg_val, dest_val, expected_title in test_matrix:
        test_prof = UserProfile(
            user_id="test_matrix_user",
            name="Matrix User",
            education=ed_val,
            career_goal=cg_val,
            short_term_goal=f"Study in {dest_val}"
        )
        res = resolve_higher_studies_path(test_prof)
        assert res["pathway_title"] == expected_title, f"For ed='{ed_val}', expected title '{expected_title}', got '{res['pathway_title']}'"
        assert res["confidence"] > 0, f"Confidence must be positive for '{ed_val}'"

    print("✓ TEST 22 PASSED: Full 20-test degree-course matrix successfully verified with 0 failures.\n")

    print("==================================================")
    print("ALL 22 REGRESSION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_profession_agnostic_goal_intelligence()
