from fastapi import APIRouter, Depends
from typing import Optional
from app.auth import verify_jwt_token, verify_user_ownership
from app.schemas.models import OverloadScore
from app.routes.profile import fetch_profile_from_db_or_fixture
from app.services.overload import get_overload_score, calculate_and_save_overload

router = APIRouter(prefix="/api", tags=["Overload Risk"])

@router.get("/overload-score/{user_id}", response_model=OverloadScore)
def get_overload_score_endpoint(user_id: str = "demo_user", auth_uid: Optional[str] = Depends(verify_jwt_token)):
    user_id = verify_user_ownership(user_id, auth_uid)
    return get_overload_score(user_id)

@router.post("/overload-score/{user_id}", response_model=OverloadScore)
def calculate_overload_score_endpoint(user_id: str = "demo_user", auth_uid: Optional[str] = Depends(verify_jwt_token)):
    user_id = verify_user_ownership(user_id, auth_uid)
    profile = fetch_profile_from_db_or_fixture(user_id)
    return calculate_and_save_overload(profile)
