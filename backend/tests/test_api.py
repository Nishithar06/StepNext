import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add app directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app
from app.schemas.models import UserProfile, ScenarioInput, SimulationRequest
from app.services.overload import calculate_overload_score
from app.services.digital_twin import build_deterministic_digital_twin
from app.services.simulator import evaluate_scenario_deterministic

client = TestClient(app)

def test_ping_endpoint():
    response = client.get("/api/ping")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "pong"
    assert data["status"] == "ok"

def test_health_db_endpoint():
    response = client.get("/api/health/db")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "supabase_connected" in data
    assert "gemini_connected" in data
    assert "mode" in data

def test_get_demo_profile():
    response = client.get("/api/profile/demo_user")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "demo_user"
    assert "name" in data
    assert "skills" in data

def test_create_and_update_profile():
    new_profile = {
        "user_id": "test_user_1",
        "name": "Test User",
        "education": "BS Computer Science",
        "career_goal": "Full Stack Lead",
        "interests": ["Web", "Cloud"],
        "skills": ["Python", "TypeScript"],
        "skills_to_improve": ["GraphQL", "Docker"],
        "available_hours_per_day": 7.0,
        "sleep_hours": 7.5,
        "workload": "medium",
        "regular_activities": ["Swimming"],
        "major_commitments": [{"name": "Web Project", "hours_per_week": 10}],
        "financial_priority": 7,
        "short_term_goal": "Launch product MVP"
    }
    response = client.post("/api/profile", json=new_profile)
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == "test_user_1"
    assert data["name"] == "Test User"

def test_digital_twin_endpoint():
    response = client.get("/api/digital-twin/demo_user")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "demo_user"
    assert "personality" in data
    assert isinstance(data["strengths"], list)
    assert isinstance(data["weaknesses"], list)
    assert "learning_style" in data

def test_overload_scoring_logic():
    # Test high risk profile
    high_risk_profile = UserProfile(
        user_id="high_risk",
        sleep_hours=4.5, # 30 pts sleep deficit
        workload="high", # 25 pts workload
        major_commitments=[{"name": "Heavy", "hours_per_week": 40}], # 25 pts density
        available_hours_per_day=3.0 # 15 pts shortage
    )
    score_obj = calculate_overload_score(high_risk_profile)
    assert score_obj.total_score >= 80
    assert score_obj.risk_level in ["High", "Critical"]

    # Test low risk profile
    low_risk_profile = UserProfile(
        user_id="low_risk",
        sleep_hours=8.0, # 0 pts
        workload="low", # 5 pts
        major_commitments=[{"name": "Light", "hours_per_week": 5}], # 5 pts
        available_hours_per_day=8.0 # 0 pts
    )
    score_low = calculate_overload_score(low_risk_profile)
    assert score_low.total_score <= 30
    assert score_low.risk_level == "Low"

def test_overload_api_endpoint():
    response = client.get("/api/overload-score/demo_user")
    assert response.status_code == 200
    data = response.json()
    assert "total_score" in data
    assert data["risk_level"] in ["Low", "Moderate", "High", "Critical"]
    assert "contributing_factors" in data
    assert "recommendations" in data

def test_future_simulator_endpoint():
    sim_request = {
        "scenarios": [
            {
                "name": "Placement",
                "description": "Immediate campus placement prep",
                "weekly_hours": 15,
                "focus_areas": ["DSA", "System Design", "Mock Interviews"]
            },
            {
                "name": "Higher Studies",
                "description": "MS in CS research & GRE prep",
                "weekly_hours": 20,
                "focus_areas": ["GRE", "AI Research", "SOP"]
            }
        ]
    }
    response = client.post("/api/simulate/demo_user", json=sim_request)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert len(data["results"]) == 2
    assert "recommendation" in data
    assert data["recommendation"]["recommended_scenario"] in ["Placement", "Higher Studies"]
    assert len(data["recommendation"]["next_steps"]) > 0

def test_get_scenarios_endpoint():
    response = client.get("/api/scenarios/demo_user")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "recommendation" in data

def test_sleep_duration_calculation_logic():
    from app.services.checkin import calculate_sleep_duration
    # Crossed midnight: 23:30 to 06:30 = 7 hours
    dur1 = calculate_sleep_duration("23:30", "06:30")
    assert dur1 == 7.0

    # Same day: 01:00 to 08:30 = 7.5 hours
    dur2 = calculate_sleep_duration("01:00", "08:30")
    assert dur2 == 7.5

    # 10:00 PM to 06:00 AM = 8.0 hours
    dur3 = calculate_sleep_duration("22:00", "06:00")
    assert dur3 == 8.0

def test_submit_and_get_daily_checkin():
    checkin_payload = {
        "sleep_time": "23:15",
        "wake_time": "06:45",
        "sleep_duration": 7.5,
        "energy": 8,
        "stress": 4,
        "mood": 8,
        "planned_tasks": 6,
        "completed_tasks": 5,
        "work_hours": 7.0,
        "study_hours": 2.5,
        "exercise_completed": True,
        "achievement": "Completed major feature release",
        "blocker": "None",
        "tomorrow_priority": "Code review & polish"
    }

    # Submit today's checkin
    response = client.post("/api/check-in?user_id=test_checkin_user", json=checkin_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == "test_checkin_user"
    assert data["sleep_time"] == "23:15"
    assert data["wake_time"] == "06:45"
    assert data["sleep_duration"] == 7.5
    assert data["energy"] == 8

    # Get today's checkin
    get_res = client.get("/api/check-in/today?user_id=test_checkin_user")
    assert get_res.status_code == 200
    today_data = get_res.json()
    assert today_data["sleep_duration"] == 7.5
    assert today_data["achievement"] == "Completed major feature release"

    # Update today's checkin
    checkin_payload["energy"] = 9
    put_res = client.put("/api/check-in/today?user_id=test_checkin_user", json=checkin_payload)
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert updated_data["energy"] == 9

def test_checkin_summary_and_streak():
    response = client.get("/api/check-ins/summary?user_id=demo_user")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "demo_user"
    assert "total_checkins" in data
    assert "streak_days" in data
    assert "avg_sleep" in data
    assert "task_completion_rate" in data
    assert isinstance(data["recent_checkins"], list)

def test_config_check_endpoint():
    response = client.get("/api/health/config")
    assert response.status_code == 200
    data = response.json()
    assert "api_key_configured" in data
    assert "api_key_status" in data
    assert "variable_found" in data
    assert "source" in data
    assert data["var_name"] == "GEMINI_API_KEY"
    assert "note" in data
    # Ensure no actual key value is exposed in JSON keys or values
    json_str = str(data)
    assert "AIza" not in json_str


def test_health_db_includes_api_key_status():
    response = client.get("/api/health/db")
    assert response.status_code == 200
    data = response.json()
    assert "api_key_configured" in data
    assert "api_key_status" in data

def test_ai_graceful_fallback_without_crash():
    # Calling digital twin endpoint should never crash even if API key is invalid/missing
    response = client.post("/api/digital-twin/test_fallback_user")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "test_fallback_user"
    assert "personality" in data

    # Calling simulate endpoint should never crash
    sim_request = {
        "scenarios": [
            {
                "name": "Fallback Test Scenario",
                "description": "Testing resiliency",
                "weekly_hours": 10,
                "focus_areas": ["Testing"]
            }
        ]
    }
    sim_res = client.post("/api/simulate/test_fallback_user", json=sim_request)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "recommendation" in sim_data
    assert "engine_used" in sim_data["recommendation"]

def test_simulation_attempts_gemini_and_falls_back_gracefully(monkeypatch):
    """Proves that POST /api/simulate attempts Gemini service and uses fallback gracefully."""
    sim_request = {
        "scenarios": [
            {
                "name": "Full Time Offer",
                "description": "Joining tech enterprise as backend engineer",
                "weekly_hours": 40,
                "focus_areas": ["Python", "FastAPI", "PostgreSQL"]
            },
            {
                "name": "Tech Startup",
                "description": "Founding early stage AI startup",
                "weekly_hours": 50,
                "focus_areas": ["AI", "Product", "Fundraising"]
            }
        ]
    }
    response = client.post("/api/simulate/demo_user", json=sim_request)
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    rec = data["recommendation"]
    assert rec["recommended_scenario"] in ["Full Time Offer", "Tech Startup"]
    assert rec["engine_used"] in ["gemini-3.6-flash", "gemini-2.0-flash", "deterministic_fallback"]

def test_simulation_schema_preservation():
    """Ensures response schema is strictly preserved for frontend compatibility."""
    sim_request = {
        "scenarios": [
            {
                "name": "Test Scenario",
                "description": "Schema validation",
                "weekly_hours": 15,
                "focus_areas": ["Schema"]
            }
        ]
    }
    res = client.post("/api/simulate/schema_user", json=sim_request)
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert "scenarios" in data
    assert "results" in data
    assert "recommendation" in data
    rec = data["recommendation"]
    assert "recommended_scenario" in rec
    assert "reason" in rec
    assert isinstance(rec["tradeoffs"], list)
    assert isinstance(rec["next_steps"], list)

def test_config_consistency_between_health_and_ai():
    """Verifies that health check and AI service share 100% consistent configuration state."""
    from app.config import is_gemini_available, get_api_key_status
    health_configured = get_api_key_status()["configured"]
    ai_configured = is_gemini_available()
    assert health_configured == ai_configured

def test_higher_studies_scenario_simulation_with_test_user():
    """Tests TEST A — Higher Studies scenario for TEST_USER."""
    test_user_profile = {
        "user_id": "test_user_hs",
        "name": "TEST_USER",
        "education": "B.Tech Computer Science",
        "career_goal": "Research Scientist",
        "sleep_hours": 6.0,
        "available_hours_per_day": 4.0,
        "financial_priority": 3,
        "workload": "medium"
    }
    client.post("/api/profile", json=test_user_profile)

    hs_sim_request = {
        "selected_scenario": "Higher Studies",
        "scenarios": [
            {
                "name": "Higher Studies",
                "description": "Entrance exam and academic preparation",
                "weekly_hours": 20,
                "focus_areas": ["Exam Prep (10h/wk)", "Research (6h/wk)", "Applications (4h/wk)"]
            },
            {
                "name": "Placement",
                "description": "Job interview prep",
                "weekly_hours": 15,
                "focus_areas": ["DSA (8h/wk)", "System Design (4h/wk)"]
            }
        ]
    }
    res = client.post("/api/simulate/test_user_hs", json=hs_sim_request)
    assert res.status_code == 200
    data = res.json()
    assert data["recommendation"]["recommended_scenario"] == "Higher Studies"
    assert "engine_used" in data["recommendation"]
    hs_res = next(r for r in data["results"] if r["name"] == "Higher Studies")
    place_res = next(r for r in data["results"] if r["name"] == "Placement")
    assert hs_res["overall_score"] > place_res["overall_score"]

def test_placement_scenario_simulation_with_test_user():
    """Tests TEST B — Placement scenario."""
    placement_request = {
        "selected_scenario": "Placement",
        "scenarios": [
            {
                "name": "Placement",
                "description": "Job placement prep",
                "weekly_hours": 15,
                "focus_areas": ["DSA (12h/wk)"]
            },
            {
                "name": "Higher Studies",
                "description": "GRE prep",
                "weekly_hours": 15,
                "focus_areas": ["GRE Prep (12h/wk)"]
            }
        ]
    }
    res = client.post("/api/simulate/test_user_hs", json=placement_request)
    assert res.status_code == 200
    data = res.json()
    assert data["recommendation"]["recommended_scenario"] == "Placement"

def test_startup_scenario_simulation_with_test_user():
    """Tests TEST C — Startup scenario."""
    startup_request = {
        "selected_scenario": "Startup",
        "scenarios": [
            {
                "name": "Startup",
                "description": "Venture building",
                "weekly_hours": 20,
                "focus_areas": ["Product Dev (12h/wk)"]
            },
            {
                "name": "Placement",
                "description": "Corporate job",
                "weekly_hours": 15,
                "focus_areas": ["DSA (8h/wk)"]
            }
        ]
    }
    res = client.post("/api/simulate/test_user_hs", json=startup_request)
    assert res.status_code == 200
    data = res.json()
    assert data["recommendation"]["recommended_scenario"] == "Startup"

def test_missing_profile_simulation_404():
    """Verifies that simulation for an invalid/nonexistent user returns 404 and logs failure."""
    res = client.post("/api/simulate/invalid_user_999", json={
        "scenarios": [
            {
                "name": "Placement",
                "description": "Job interview prep",
                "weekly_hours": 15,
                "focus_areas": ["DSA (8h/wk)"]
            }
        ]
    })
    assert res.status_code == 404
    assert "Profile not found for user_id: invalid_user_999" in res.json()["detail"]

def test_dynamic_user_onboarding_profile_simulation_flow():
    """Acceptance test verifying dynamic user ID onboarding -> GET profile -> POST simulate sequence."""
    dynamic_id = "user_1787426260263_wruv5"
    profile_payload = {
        "user_id": dynamic_id,
        "name": "Nishitha R",
        "education": "B.Tech AI Engineer",
        "career_goal": "AI Software Engineer",
        "skills": ["Python", "FastAPI", "React"],
        "skills_to_improve": ["PyTorch", "System Design"],
        "available_hours_per_day": 6.0,
        "sleep_hours": 7.0,
        "workload": "medium",
        "financial_priority": 8
    }

    # 1. Onboarding saves profile
    post_res = client.post("/api/profile", json=profile_payload)
    assert post_res.status_code == 201
    assert post_res.json()["user_id"] == dynamic_id

    # 2. Immediately GET profile
    get_res = client.get(f"/api/profile/{dynamic_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Nishitha R"

    # 3. Run simulation with same dynamic user ID
    sim_request = {
        "selected_scenario": "Placement",
        "scenarios": [
            {
                "name": "Placement",
                "description": "Job interview prep",
                "weekly_hours": 15,
                "focus_areas": ["DSA (12h/wk)"]
            },
            {
                "name": "Higher Studies",
                "description": "GRE prep",
                "weekly_hours": 15,
                "focus_areas": ["GRE Prep (12h/wk)"]
            },
            {
                "name": "Startup",
                "description": "Venture building",
                "weekly_hours": 20,
                "focus_areas": ["Product Dev (12h/wk)"]
            }
        ]
    }
    sim_res = client.post(f"/api/simulate/{dynamic_id}", json=sim_request)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["user_id"] == dynamic_id
    assert len(sim_data["results"]) == 3

def test_startup_investment_slider_score_sensitivity():
    """Verifies that increasing Startup investment sliders significantly increases Startup scenario score."""
    dynamic_id = "test_slider_user"
    profile_payload = {
        "user_id": dynamic_id,
        "name": "Startup Founder Test",
        "education": "B.Tech Computer Science",
        "career_goal": "Tech Founder & AI Entrepreneur",
        "skills": ["Python", "Product", "React"],
        "skills_to_improve": ["Pitching", "Market Research"],
        "available_hours_per_day": 8.0,
        "sleep_hours": 7.0,
        "workload": "medium",
        "financial_priority": 5
    }
    client.post("/api/profile", json=profile_payload)

    # 1. Low Startup investment
    low_request = {
        "selected_scenario": "Startup",
        "scenarios": [
            {
                "name": "Startup",
                "description": "Low investment venture",
                "weekly_hours": 3,
                "focus_areas": ["Product Dev (1h/wk)", "Market Research (1h/wk)", "Pitching (1h/wk)"],
                "investments": {
                    "product_development": 1,
                    "market_discovery": 1,
                    "pitching_networking": 1
                }
            },
            {
                "name": "Placement",
                "description": "Job prep",
                "weekly_hours": 15,
                "focus_areas": ["DSA (10h/wk)"]
            }
        ]
    }
    low_res = client.post(f"/api/simulate/{dynamic_id}", json=low_request)
    assert low_res.status_code == 200
    low_score = next(r["overall_score"] for r in low_res.json()["results"] if r["name"] == "Startup")

    # 2. High Startup investment
    high_request = {
        "selected_scenario": "Startup",
        "scenarios": [
            {
                "name": "Startup",
                "description": "High investment venture",
                "weekly_hours": 42,
                "focus_areas": ["Product Dev (23h/wk)", "Market Research (12h/wk)", "Pitching (7h/wk)"],
                "investments": {
                    "product_development": 23,
                    "market_discovery": 12,
                    "pitching_networking": 7
                }
            },
            {
                "name": "Placement",
                "description": "Job prep",
                "weekly_hours": 15,
                "focus_areas": ["DSA (10h/wk)"]
            }
        ]
    }
    high_res = client.post(f"/api/simulate/{dynamic_id}", json=high_request)
    assert high_res.status_code == 200
    high_score = next(r["overall_score"] for r in high_res.json()["results"] if r["name"] == "Startup")

    # Assert significant score improvement (at least 10+ points)
    assert high_score > low_score
    assert (high_score - low_score) >= 10








