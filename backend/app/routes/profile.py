from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from app.config import get_supabase_client
from app.auth import verify_jwt_token, verify_user_ownership
from app.store import PROFILES_STORE, save_profiles_to_disk
from app.schemas.models import UserProfile, UserProfileUpdate, DerivedProfile
from app.services.digital_twin import get_digital_twin, generate_and_save_digital_twin
from app.services.overload import calculate_and_save_overload

router = APIRouter(prefix="/api", tags=["Profile & Digital Twin"])

def fetch_profile_from_db_or_fixture(user_id: str) -> Optional[UserProfile]:
    print(f"[Profile] LOOKUP: user_id={user_id}")
    client = get_supabase_client()
    if client:
        try:
            res = client.table("user_profiles").select("*").eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                data = res.data[0]
                # Sanitize NULL list fields from Supabase to prevent Pydantic validation errors
                for list_field in ["interests", "skills", "skills_to_improve", "regular_activities", "major_commitments"]:
                    if list_field in data and data[list_field] is None:
                        data[list_field] = []
                prof = UserProfile(**data)
                PROFILES_STORE[user_id] = prof
                save_profiles_to_disk()
                print(f"[Profile] LOOKUP_SUCCESS: user_id={user_id}")
                return prof
        except Exception as e:
            print(f"[Profile Route] Supabase read profile error: {e}")

    # Return in-memory profile if available
    if user_id in PROFILES_STORE:
        print(f"[Profile] LOOKUP_SUCCESS: user_id={user_id}")
        return PROFILES_STORE[user_id]

    if user_id == "demo_user":
        print(f"[Profile] LOOKUP_SUCCESS: user_id={user_id}")
        return UserProfile(user_id="demo_user", name="Demo User")

    print(f"[Profile] LOOKUP_FAILED: user_id={user_id}")
    print(f"[Profile] AVAILABLE_USER_IDS: {list(PROFILES_STORE.keys())}")
    return None

@router.get("/profile/{user_id}", response_model=UserProfile)
def get_user_profile(user_id: str, auth_uid: Optional[str] = Depends(verify_jwt_token)):
    user_id = verify_user_ownership(user_id, auth_uid)
    prof = fetch_profile_from_db_or_fixture(user_id)
    if not prof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User profile '{user_id}' not found."
        )
    return prof


@router.post("/profile", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def create_user_profile(profile: UserProfile, auth_uid: Optional[str] = Depends(verify_jwt_token)):
    if auth_uid:
        profile.user_id = auth_uid
    
    print(f"[Profile] CREATE: user_id={profile.user_id}")
    # Save to in-memory store & disk
    PROFILES_STORE[profile.user_id] = profile
    save_profiles_to_disk()

    # Upsert into Supabase if available
    client = get_supabase_client()
    if client:
        try:
            data = profile.model_dump()
            client.table("user_profiles").upsert(data).execute()
        except Exception as e:
            print(f"[Profile Route] Supabase upsert error: {e}")

    # Automatically generate twin and overload score upon profile creation
    try:
        generate_and_save_digital_twin(profile)
        calculate_and_save_overload(profile)
    except Exception as e:
        print(f"[Profile Route] Error generating twin/overload on profile create: {e}")

    print(f"[Profile] CREATE_SUCCESS: user_id={profile.user_id}")
    return profile

@router.put("/profile/{user_id}", response_model=UserProfile)
def update_user_profile(user_id: str, updates: UserProfileUpdate, auth_uid: Optional[str] = Depends(verify_jwt_token)):
    user_id = verify_user_ownership(user_id, auth_uid)
    print(f"[Profile] UPDATE: user_id={user_id}")
    current = fetch_profile_from_db_or_fixture(user_id)
    if not current:
        current = UserProfile(user_id=user_id)
    update_data = updates.model_dump(exclude_unset=True)
    
    updated_dict = current.model_dump()
    updated_dict.update(update_data)
    updated_profile = UserProfile(**updated_dict)

    # Detect if career goal changed and clear stale simulation/roadmap/progress stores
    old_goal = (current.career_goal or "").strip().lower()
    new_goal = (updated_profile.career_goal or "").strip().lower()
    if old_goal != new_goal:
        from app.store import (
            SIMULATIONS_STORE,
            ROADMAPS_STORE,
            PROGRESS_STORE,
            ADAPTIVE_FUTURE_STORE,
            save_roadmaps_to_disk,
            save_progress_to_disk,
            save_adaptive_future_to_disk
        )
        if user_id in SIMULATIONS_STORE:
            del SIMULATIONS_STORE[user_id]
        if user_id in ROADMAPS_STORE:
            del ROADMAPS_STORE[user_id]
            save_roadmaps_to_disk()
        if user_id in PROGRESS_STORE:
            del PROGRESS_STORE[user_id]
            save_progress_to_disk()
        if user_id in ADAPTIVE_FUTURE_STORE:
            del ADAPTIVE_FUTURE_STORE[user_id]
            save_adaptive_future_to_disk()
        print(f"[Profile] STALE_STATE_CLEARED: user_id={user_id} goal_changed='{old_goal}' -> '{new_goal}'")

    # Save to in-memory store & disk
    PROFILES_STORE[user_id] = updated_profile
    save_profiles_to_disk()

    client = get_supabase_client()
    if client:
        try:
            client.table("user_profiles").upsert(updated_profile.model_dump()).execute()
        except Exception as e:
            print(f"[Profile Route] Supabase update profile error: {e}")

    # Recalculate twin and overload
    try:
        generate_and_save_digital_twin(updated_profile)
        calculate_and_save_overload(updated_profile)
    except Exception as e:
        print(f"[Profile Route] Error updating twin/overload: {e}")

    print(f"[Profile] UPDATE_SUCCESS: user_id={user_id}")
    return updated_profile

@router.get("/digital-twin/{user_id}", response_model=DerivedProfile)
def get_digital_twin_endpoint(user_id: str, auth_uid: Optional[str] = Depends(verify_jwt_token)):
    user_id = verify_user_ownership(user_id, auth_uid)
    return get_digital_twin(user_id)

@router.post("/digital-twin/{user_id}", response_model=DerivedProfile)
def generate_digital_twin_endpoint(user_id: str, auth_uid: Optional[str] = Depends(verify_jwt_token)):
    user_id = verify_user_ownership(user_id, auth_uid)
    profile = fetch_profile_from_db_or_fixture(user_id)
    if not profile:
        profile = UserProfile(user_id=user_id)
    return generate_and_save_digital_twin(profile)

