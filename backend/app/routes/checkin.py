import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.schemas.models import DailyCheckInInput, DailyCheckIn, CheckInSummary, WeeklyCheckInSubmission, WeeklyCheckInResult
from app.services.checkin import (
    create_or_update_daily_checkin,
    get_today_checkin,
    get_user_checkins,
    get_checkin_summary
)
from app.routes.profile import fetch_profile_from_db_or_fixture
from app.services.overload import calculate_and_save_overload
from app.store import ROADMAPS_STORE, WEEKLY_CHECKINS_STORE, save_roadmaps_to_disk, save_weekly_checkins_to_disk
from app.services.digital_twin import update_digital_twin_execution_signal

router = APIRouter(prefix="/api", tags=["Daily Check-ins"])

@router.post("/check-in", response_model=DailyCheckIn, status_code=status.HTTP_201_CREATED)
def submit_daily_checkin(input_data: DailyCheckInInput, user_id: str = "demo_user"):
    target_uid = input_data.user_id if (hasattr(input_data, 'user_id') and input_data.user_id) else user_id
    checkin = create_or_update_daily_checkin(target_uid, input_data)
    
    # Sync latest checked-in sleep duration to shared user profile state & update overload, progress, adaptive future
    try:
        profile = fetch_profile_from_db_or_fixture(target_uid)
        profile.sleep_hours = checkin.sleep_duration
        calculate_and_save_overload(profile)
        
        from app.services.progress import analyze_user_progress
        from app.services.adaptive_future import evaluate_future_feedback
        analyze_user_progress(target_uid)
        evaluate_future_feedback(target_uid)
    except Exception as e:
        print(f"[CheckIn Route] Error updating profile & recalculating overload on submit: {e}")

    return checkin

@router.get("/check-in/today", response_model=Optional[DailyCheckIn])
def get_today_checkin_endpoint(user_id: str = "demo_user"):
    """Retrieves today's check-in for user_id (returns null if not checked in today)."""
    return get_today_checkin(user_id)

@router.put("/check-in/today", response_model=DailyCheckIn)
def update_today_checkin_endpoint(input_data: DailyCheckInInput, user_id: str = "demo_user"):
    """Updates today's check-in for user_id, updates profile sleep_hours, and recalculates overload risk."""
    target_uid = input_data.user_id if (hasattr(input_data, 'user_id') and input_data.user_id) else user_id
    checkin = create_or_update_daily_checkin(target_uid, input_data)

    try:
        profile = fetch_profile_from_db_or_fixture(target_uid)
        profile.sleep_hours = checkin.sleep_duration
        calculate_and_save_overload(profile)
        
        from app.services.progress import analyze_user_progress
        from app.services.adaptive_future import evaluate_future_feedback
        analyze_user_progress(target_uid)
        evaluate_future_feedback(target_uid)
    except Exception as e:
        print(f"[CheckIn Route] Error updating profile & recalculating overload on update: {e}")

    return checkin

@router.get("/check-ins", response_model=List[DailyCheckIn])
def get_user_checkins_endpoint(user_id: str = "demo_user", limit: int = 30):
    """Retrieves list of past daily check-ins for user_id."""
    return get_user_checkins(user_id, limit=limit)

@router.get("/check-ins/summary", response_model=CheckInSummary)
def get_checkin_summary_endpoint(user_id: str = "demo_user"):
    """Retrieves weekly check-in summary analytics and streak for user_id."""
    return get_checkin_summary(user_id)

@router.post("/check-in/weekly", response_model=WeeklyCheckInResult)
def submit_weekly_checkin(input_data: WeeklyCheckInSubmission, user_id: str = "demo_user"):
    target_uid = input_data.user_id or user_id
    print(f"[CheckIn] SUBMIT_STARTED for user_id={target_uid}")

    roadmap = ROADMAPS_STORE.get(target_uid)
    roadmap_id = roadmap.id if roadmap else input_data.roadmap_id

    completed_count = 0
    total_count = 0

    if roadmap:
        for act in roadmap.weekly_actions:
            total_count += 1
            if act.id in input_data.action_statuses:
                act.status = input_data.action_statuses[act.id]
            if act.status == "completed":
                completed_count += 1

        ROADMAPS_STORE[target_uid] = roadmap
        save_roadmaps_to_disk()

    print(f"[CheckIn] ACTION_PROGRESS_RECEIVED: completed={completed_count}/{total_count}")

    completion_pct = int(round((completed_count / total_count * 100))) if total_count > 0 else (
        100 if input_data.completion_level == "All" else 75 if input_data.completion_level == "Most" else 40 if input_data.completion_level == "Some" else 15
    )

    comp_lvl = input_data.completion_level.lower()
    work_feel = input_data.workload_feeling.lower()

    if comp_lvl in ["almost none", "some"] and work_feel in ["heavy", "overwhelming"]:
        guidance = "Your plan may be too ambitious. Consider reducing workload before adding more goals."
    elif comp_lvl in ["most", "all"] and work_feel in ["easy", "manageable"]:
        guidance = "You're maintaining a sustainable pace and making solid progress."
    elif comp_lvl == "all" and work_feel == "easy":
        guidance = "You have execution capacity. Consider increasing depth rather than adding more commitments."
    else:
        guidance = "Keep tracking your weekly actions consistently to stay aligned with your trajectory."

    today_dt = datetime.utcnow()
    iso_year, iso_week, _ = today_dt.isocalendar()
    result_id = f"wcheckin_{target_uid}_{iso_year}_W{iso_week:02d}"

    result = WeeklyCheckInResult(
        id=result_id,
        user_id=target_uid,
        roadmap_id=roadmap_id,
        completed_actions_count=completed_count,
        total_actions_count=total_count,
        completion_percentage=completion_pct,
        completion_level=input_data.completion_level,
        workload_feeling=input_data.workload_feeling,
        blocker=input_data.blocker,
        guidance_message=guidance,
        created_at=datetime.utcnow().isoformat()
    )

    from app.repositories.checkin_repository import CheckInRepository
    CheckInRepository.save_weekly_checkin_deduped(target_uid, result)

    print(f"[CheckIn] SUBMIT_SUCCESS: id={result_id}")

    try:
        update_digital_twin_execution_signal(target_uid, completion_pct, input_data.workload_feeling)
    except Exception as e:
        print(f"[CheckIn] Digital twin signal warning: {e}")

    return result

@router.get("/check-in/weekly/history", response_model=List[WeeklyCheckInResult])
def get_weekly_checkin_history(user_id: str = "demo_user"):
    print(f"[CheckIn] LOAD_STARTED for user_id={user_id}")
    from app.repositories.checkin_repository import CheckInRepository
    history = CheckInRepository.get_weekly_checkins(user_id)
    print(f"[CheckIn] LOAD_SUCCESS: history_count={len(history)}")
    return history

