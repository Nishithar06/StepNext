import uuid
import os
import json
from datetime import datetime, timedelta, date
from typing import Dict, List
from app.config import load_dummy_fixture
from app.schemas.models import UserProfile, DerivedProfile, OverloadScore, SimulationResponse, DailyCheckIn, ActionRoadmap, WeeklyCheckInResult, ProgressSummary, AdaptiveFutureFeedback

_dummy = load_dummy_fixture()

# Initialize in-memory dictionaries with fixture data for demo_user
PROFILES_STORE: Dict[str, UserProfile] = {}
TWINS_STORE: Dict[str, DerivedProfile] = {}
OVERLOADS_STORE: Dict[str, OverloadScore] = {}
SIMULATIONS_STORE: Dict[str, SimulationResponse] = {}
CHECKINS_STORE: Dict[str, Dict[str, DailyCheckIn]] = {}  # user_id -> date_str -> DailyCheckIn
ROADMAPS_STORE: Dict[str, ActionRoadmap] = {}
WEEKLY_CHECKINS_STORE: Dict[str, List[WeeklyCheckInResult]] = {}
PROGRESS_STORE: Dict[str, ProgressSummary] = {}
ADAPTIVE_FUTURE_STORE: Dict[str, AdaptiveFutureFeedback] = {}

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
PROFILES_FILE = os.path.join(DATA_DIR, "profiles.json")
ROADMAPS_FILE = os.path.join(DATA_DIR, "roadmaps.json")
WEEKLY_CHECKINS_FILE = os.path.join(DATA_DIR, "weekly_checkins.json")
PROGRESS_FILE = os.path.join(DATA_DIR, "progress.json")
ADAPTIVE_FUTURE_FILE = os.path.join(DATA_DIR, "adaptive_future.json")
CHECKINS_FILE = os.path.join(DATA_DIR, "checkins.json")

def save_checkins_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        data = {u: {d: c.model_dump() for d, c in checkins.items()} for u, checkins in CHECKINS_STORE.items()}
        with open(CHECKINS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[Store] Error saving checkins to disk: {e}")

def load_checkins_from_disk():
    if os.path.exists(CHECKINS_FILE):
        try:
            with open(CHECKINS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for u, checkins in data.items():
                    CHECKINS_STORE[u] = {d: DailyCheckIn(**c) for d, c in checkins.items()}
        except Exception as e:
            print(f"[Store] Error loading checkins from disk: {e}")

def save_profiles_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        data = {k: v.model_dump() for k, v in PROFILES_STORE.items()}
        with open(PROFILES_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[Store] Error saving profiles to disk: {e}")

def load_profiles_from_disk():
    if os.path.exists(PROFILES_FILE):
        try:
            with open(PROFILES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    PROFILES_STORE[k] = UserProfile(**v)
        except Exception as e:
            print(f"[Store] Error loading profiles from disk: {e}")

def save_roadmaps_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        data = {k: v.model_dump() for k, v in ROADMAPS_STORE.items()}
        with open(ROADMAPS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[Store] Error saving roadmaps to disk: {e}")

def load_roadmaps_from_disk():
    if os.path.exists(ROADMAPS_FILE):
        try:
            with open(ROADMAPS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    ROADMAPS_STORE[k] = ActionRoadmap(**v)
        except Exception as e:
            print(f"[Store] Error loading roadmaps from disk: {e}")

def normalize_weekly_checkin_list(user_checkins: list) -> list:
    """
    Groups weekly check-in records by (iso_year, iso_week) derived from record ID or created_at.
    Keeps the newest record for each ISO week and returns records sorted descending.
    """
    if not user_checkins:
        return []
    
    seen_weeks = {}
    for r in user_checkins:
        iso_year, iso_week = None, None
        if hasattr(r, 'id') and r.id and "_W" in r.id:
            try:
                parts = r.id.split("_")
                iso_year = int(parts[-2])
                iso_week = int(parts[-1].replace("W", ""))
            except Exception:
                pass
        
        if iso_year is None or iso_week is None:
            try:
                created_str = getattr(r, 'created_at', None)
                if created_str:
                    dt = datetime.fromisoformat(created_str.replace("Z", ""))
                else:
                    dt = datetime.utcnow()
                iso_year, iso_week, _ = dt.isocalendar()
            except Exception:
                iso_year, iso_week = 2026, 34

        week_key = (iso_year, iso_week)
        if week_key not in seen_weeks:
            seen_weeks[week_key] = r
        else:
            existing = seen_weeks[week_key]
            r_created = getattr(r, 'created_at', "") or ""
            ex_created = getattr(existing, 'created_at', "") or ""
            if r_created >= ex_created:
                seen_weeks[week_key] = r

    normalized = list(seen_weeks.values())
    normalized.sort(key=lambda item: getattr(item, 'created_at', "") or "", reverse=True)
    return normalized

def save_weekly_checkins_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        data = {k: [item.model_dump() for item in normalize_weekly_checkin_list(v)] for k, v in WEEKLY_CHECKINS_STORE.items()}
        with open(WEEKLY_CHECKINS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[Store] Error saving weekly checkins to disk: {e}")

def load_weekly_checkins_from_disk():
    if os.path.exists(WEEKLY_CHECKINS_FILE):
        try:
            with open(WEEKLY_CHECKINS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    raw_items = [WeeklyCheckInResult(**item) for item in v]
                    WEEKLY_CHECKINS_STORE[k] = normalize_weekly_checkin_list(raw_items)
        except Exception as e:
            print(f"[Store] Error loading weekly checkins from disk: {e}")

def save_progress_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        data = {k: v.model_dump() for k, v in PROGRESS_STORE.items()}
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[Store] Error saving progress to disk: {e}")

def load_progress_from_disk():
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    PROGRESS_STORE[k] = ProgressSummary(**v)
        except Exception as e:
            print(f"[Store] Error loading progress from disk: {e}")

def save_adaptive_future_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        data = {k: v.model_dump() for k, v in ADAPTIVE_FUTURE_STORE.items()}
        with open(ADAPTIVE_FUTURE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[Store] Error saving adaptive future to disk: {e}")

def load_adaptive_future_from_disk():
    if os.path.exists(ADAPTIVE_FUTURE_FILE):
        try:
            with open(ADAPTIVE_FUTURE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    ADAPTIVE_FUTURE_STORE[k] = AdaptiveFutureFeedback(**v)
        except Exception as e:
            print(f"[Store] Error loading adaptive future from disk: {e}")

if "profile" in _dummy:
    PROFILES_STORE["demo_user"] = UserProfile(**_dummy["profile"])

# Load locally persisted data if available
load_profiles_from_disk()
load_roadmaps_from_disk()
load_weekly_checkins_from_disk()
load_checkins_from_disk()
load_progress_from_disk()
load_adaptive_future_from_disk()

if "digital_twin" in _dummy:
    TWINS_STORE["demo_user"] = DerivedProfile(**_dummy["digital_twin"])

if "overload_score" in _dummy:
    OVERLOADS_STORE["demo_user"] = OverloadScore(**_dummy["overload_score"])

if "latest_scenarios" in _dummy:
    sc_data = _dummy["latest_scenarios"]
    SIMULATIONS_STORE["demo_user"] = SimulationResponse(
        id=sc_data["id"],
        user_id=sc_data["user_id"],
        scenarios=sc_data["scenarios"],
        results=sc_data["results"],
        recommendation=sc_data["recommendation"]
    )

# Pre-seed 4 days of historical check-ins for demo_user
today_date = date.today()
demo_checkins: Dict[str, DailyCheckIn] = {}
seed_days = [
    (today_date - timedelta(days=4), "23:00", "06:30", 7.5, 7, 5, 8, 5, 4, 6.0, 2.0, True, "Completed system architecture draft", "Context switching", "Finalize API endpoints"),
    (today_date - timedelta(days=3), "23:30", "06:30", 7.0, 8, 4, 7, 6, 5, 7.0, 2.5, True, "Refactored database queries", "Minor bug in cache", "Write unit tests"),
    (today_date - timedelta(days=2), "00:00", "07:00", 7.0, 6, 6, 6, 4, 3, 5.5, 1.5, False, "Completed 3 LeetCode problems", "Sleepiness in afternoon", "Focus on React state"),
    (today_date - timedelta(days=1), "23:15", "06:45", 7.5, 8, 3, 8, 5, 5, 6.5, 3.0, True, "Finished project demo build", "Late night review", "Deploy staging MVP")
]

for dt_val, st, wt, dur, nrg, strss, md, pl, cmp, wk, std, ex, ach, blk, tmr in seed_days:
    d_str = dt_val.isoformat()
    demo_checkins[d_str] = DailyCheckIn(
        id=str(uuid.uuid4()),
        user_id="demo_user",
        date=d_str,
        sleep_time=st,
        wake_time=wt,
        sleep_duration=dur,
        energy=nrg,
        stress=strss,
        mood=md,
        planned_tasks=pl,
        completed_tasks=cmp,
        work_hours=wk,
        study_hours=std,
        exercise_completed=ex,
        achievement=ach,
        blocker=blk,
        tomorrow_priority=tmr
    )

CHECKINS_STORE["demo_user"] = demo_checkins


