"""
Check-in Repository for LifePilot AI.
Encapsulates DailyCheckIn and WeeklyCheckInResult retrieval, week deduping, and persistence.
"""

from datetime import datetime, date
from typing import Optional, List, Dict
from app.schemas.models import DailyCheckIn, WeeklyCheckInResult, CheckInSummary
from app.store import (
    CHECKINS_STORE,
    WEEKLY_CHECKINS_STORE,
    save_checkins_to_disk,
    save_weekly_checkins_to_disk,
    normalize_weekly_checkin_list
)

class CheckInRepository:
    @staticmethod
    def get_today_checkin(user_id: str) -> Optional[DailyCheckIn]:
        today_str = date.today().isoformat()
        return CHECKINS_STORE.get(user_id, {}).get(today_str)

    @staticmethod
    def save_daily_checkin(user_id: str, checkin: DailyCheckIn) -> DailyCheckIn:
        user_store = CHECKINS_STORE.setdefault(user_id, {})
        user_store[checkin.date] = checkin
        save_checkins_to_disk()
        return checkin

    @staticmethod
    def get_daily_checkins(user_id: str, limit: int = 30) -> List[DailyCheckIn]:
        user_store = CHECKINS_STORE.get(user_id, {})
        sorted_checkins = sorted(user_store.values(), key=lambda c: c.date, reverse=True)
        return sorted_checkins[:limit]

    @staticmethod
    def save_weekly_checkin_deduped(user_id: str, result: WeeklyCheckInResult) -> WeeklyCheckInResult:
        """Saves weekly check-in result, updating existing record if submitted during same ISO week."""
        user_checkins = WEEKLY_CHECKINS_STORE.setdefault(user_id, [])
        user_checkins.insert(0, result)
        normalized = normalize_weekly_checkin_list(user_checkins)
        WEEKLY_CHECKINS_STORE[user_id] = normalized
        save_weekly_checkins_to_disk()
        return result

    @staticmethod
    def get_weekly_checkins(user_id: str) -> List[WeeklyCheckInResult]:
        raw_checkins = WEEKLY_CHECKINS_STORE.get(user_id, [])
        normalized = normalize_weekly_checkin_list(raw_checkins)
        WEEKLY_CHECKINS_STORE[user_id] = normalized
        return normalized
