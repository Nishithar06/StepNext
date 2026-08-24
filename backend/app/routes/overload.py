from fastapi import APIRouter
from app.schemas.models import OverloadScore
from app.routes.profile import fetch_profile_from_db_or_fixture
from app.services.overload import get_overload_score, calculate_and_save_overload

router = APIRouter(prefix="/api", tags=["Overload Risk"])

@router.get("/overload-score/{user_id}", response_model=OverloadScore)
def get_overload_score_endpoint(user_id: str = "demo_user"):
    return get_overload_score(user_id)

@router.post("/overload-score/{user_id}", response_model=OverloadScore)
def calculate_overload_score_endpoint(user_id: str = "demo_user"):
    profile = fetch_profile_from_db_or_fixture(user_id)
    return calculate_and_save_overload(profile)
