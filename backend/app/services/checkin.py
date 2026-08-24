import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from app.config import get_supabase_client
from app.store import CHECKINS_STORE
from app.schemas.models import DailyCheckInInput, DailyCheckIn, CheckInSummary

def calculate_sleep_duration(sleep_time: str, wake_time: str) -> float:
    """
    Calculates sleep duration in hours from HH:MM sleep_time to HH:MM wake_time,
    handling midnight crossover correctly.
    Example: 23:30 -> 06:30 = 7.0 hours.
    """
    try:
        sh, sm = map(int, sleep_time.split(":"))
        wh, wm = map(int, wake_time.split(":"))

        sleep_minutes = sh * 60 + sm
        wake_minutes = wh * 60 + wm

        if wake_minutes < sleep_minutes:
            # Crossed midnight
            total_minutes = (1440 - sleep_minutes) + wake_minutes
        else:
            total_minutes = wake_minutes - sleep_minutes

        return round(total_minutes / 60.0, 1)
    except Exception as e:
        print(f"[CheckIn Service] Error parsing times '{sleep_time}', '{wake_time}': {e}")
        return 7.0

def create_or_update_daily_checkin(
    user_id: str,
    input_data: DailyCheckInInput,
    target_date: Optional[str] = None,
    checkin_date: Optional[str] = None
) -> DailyCheckIn:
    """Creates or updates a daily check-in for target_date (defaults to today YYYY-MM-DD)."""
    today_str = target_date or checkin_date or date.today().isoformat()
    
    # If sleep_duration was explicitly provided without explicit sleep_time/wake_time, respect it
    if "sleep_duration" in input_data.model_fields_set and "sleep_time" not in input_data.model_fields_set and "wake_time" not in input_data.model_fields_set:
        calc_duration = input_data.sleep_duration
    else:
        duration = calculate_sleep_duration(input_data.sleep_time, input_data.wake_time)
        calc_duration = duration if duration > 0 else input_data.sleep_duration

    checkin_id = str(uuid.uuid4())
    now_iso = datetime.now().isoformat()

    # Check if already exists in memory
    user_store = CHECKINS_STORE.setdefault(user_id, {})
    existing = user_store.get(today_str)
    if existing:
        checkin_id = existing.id

    checkin_obj = DailyCheckIn(
        id=checkin_id,
        user_id=user_id,
        date=today_str,
        sleep_time=input_data.sleep_time,
        wake_time=input_data.wake_time,
        sleep_duration=calc_duration,
        energy=input_data.energy,
        stress=input_data.stress,
        mood=input_data.mood,
        planned_tasks=input_data.planned_tasks,
        completed_tasks=input_data.completed_tasks,
        work_hours=input_data.work_hours,
        study_hours=input_data.study_hours,
        exercise_completed=input_data.exercise_completed,
        achievement=input_data.achievement,
        blocker=input_data.blocker,
        tomorrow_priority=input_data.tomorrow_priority,
        created_at=existing.created_at if existing else now_iso,
        updated_at=now_iso
    )

    # Save in memory store and persist to disk
    user_store[today_str] = checkin_obj
    try:
        from app.store import save_checkins_to_disk
        save_checkins_to_disk()
    except Exception as e:
        print(f"[CheckIn Service] Error saving checkins to disk: {e}")

    # Persist in Supabase if available
    client = get_supabase_client()
    if client:
        try:
            row = checkin_obj.model_dump()
            client.table("daily_checkins").upsert(row, on_conflict="user_id,date").execute()
        except Exception as e:
            print(f"[CheckIn Service] Supabase upsert error: {e}")

    return checkin_obj

def get_today_checkin(user_id: str) -> Optional[DailyCheckIn]:
    """Retrieves today's check-in for user_id."""
    today_str = date.today().isoformat()
    
    client = get_supabase_client()
    if client:
        try:
            res = client.table("daily_checkins") \
                .select("*") \
                .eq("user_id", user_id) \
                .eq("date", today_str) \
                .execute()
            if res.data and len(res.data) > 0:
                return DailyCheckIn(**res.data[0])
        except Exception as e:
            print(f"[CheckIn Service] Supabase get today checkin error: {e}")

    user_store = CHECKINS_STORE.get(user_id, {})
    return user_store.get(today_str)

def get_user_checkins(user_id: str, limit: int = 30) -> List[DailyCheckIn]:
    """Retrieves user's check-in history ordered by date DESC."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("daily_checkins") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("date", desc=True) \
                .limit(limit) \
                .execute()
            if res.data:
                return [DailyCheckIn(**item) for item in res.data]
        except Exception as e:
            print(f"[CheckIn Service] Supabase query checkins error: {e}")

    user_store = CHECKINS_STORE.get(user_id, {})
    sorted_checkins = sorted(user_store.values(), key=lambda c: c.date, reverse=True)
    return sorted_checkins[:limit]

def get_checkin_summary(user_id: str) -> CheckInSummary:
    """Calculates weekly analytics summary and streak for user."""
    checkins = get_user_checkins(user_id, limit=30)
    if not checkins:
        return CheckInSummary(user_id=user_id)

    # 1. Streak Calculation
    today_val = date.today()
    checkin_dates = {datetime.strptime(c.date, "%Y-%m-%d").date() for c in checkins}
    
    streak = 0
    curr = today_val
    if curr not in checkin_dates:
        curr = today_val - timedelta(days=1)
    
    while curr in checkin_dates:
        streak += 1
        curr -= timedelta(days=1)

    # 2. Averages over last 7 checkins
    recent = checkins[:7]
    n = len(recent)

    def _fmt_avg(val: float) -> float:
        r = round(val, 1)
        return int(r) if r.is_integer() else r

    avg_sleep = _fmt_avg(sum(c.sleep_duration for c in recent) / n) if n > 0 else 0.0
    avg_energy = _fmt_avg(sum(c.energy for c in recent) / n) if n > 0 else 0.0
    avg_stress = _fmt_avg(sum(c.stress for c in recent) / n) if n > 0 else 0.0
    avg_mood = _fmt_avg(sum(c.mood for c in recent) / n) if n > 0 else 0.0

    total_planned = sum(c.planned_tasks for c in recent)
    total_completed = sum(c.completed_tasks for c in recent)
    task_rate = round((total_completed / total_planned * 100.0), 1) if total_planned > 0 else 0.0

    exercise_count = sum(1 for c in recent if c.exercise_completed)
    exercise_rate = round((exercise_count / n * 100.0), 1)

    return CheckInSummary(
        user_id=user_id,
        total_checkins=len(checkins),
        streak_days=streak,
        avg_sleep=avg_sleep,
        avg_energy=avg_energy,
        avg_stress=avg_stress,
        avg_mood=avg_mood,
        task_completion_rate=task_rate,
        exercise_completion_rate=exercise_rate,
        average_sleep=avg_sleep,
        average_energy=avg_energy,
        average_stress=avg_stress,
        average_completion_rate=task_rate,
        recent_checkins=checkins
    )
