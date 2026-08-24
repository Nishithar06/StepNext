from fastapi import APIRouter, HTTPException, status
from app.schemas.models import SimulationRequest, SimulationResponse
from app.routes.profile import fetch_profile_from_db_or_fixture
from app.services.simulator import run_simulation, get_latest_scenarios, get_scenario_by_id

router = APIRouter(prefix="/api", tags=["Future Simulator"])

@router.post("/simulate/{user_id}", response_model=SimulationResponse)
def run_simulation_endpoint(user_id: str, request: SimulationRequest):
    if not request.scenarios or len(request.scenarios) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one scenario must be provided for simulation."
        )
    profile = fetch_profile_from_db_or_fixture(user_id)
    if not profile:
        print(f"[Simulator] PROFILE_LOOKUP_FAILED: user_id={user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user_id: {user_id}"
        )
    return run_simulation(user_id, profile, request)

@router.get("/scenarios/{user_id}", response_model=SimulationResponse)
def get_user_scenarios_endpoint(user_id: str = "demo_user"):
    sc = get_latest_scenarios(user_id)
    if not sc:
        profile = fetch_profile_from_db_or_fixture(user_id)
        if profile:
            from app.services.simulator import build_default_personalized_simulation
            return build_default_personalized_simulation(user_id, profile)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No scenario comparisons found for user '{user_id}'."
        )
    return sc

@router.get("/scenarios/{user_id}/{comparison_id}", response_model=SimulationResponse)
def get_single_scenario_endpoint(user_id: str, comparison_id: str):
    sc = get_scenario_by_id(user_id, comparison_id)
    if not sc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario comparison '{comparison_id}' not found for user '{user_id}'."
        )
    return sc
