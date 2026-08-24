"""
Profile Repository for LifePilot AI.
Encapsulates UserProfile retrieval and persistence.
"""

from typing import Optional
from app.schemas.models import UserProfile
from app.store import PROFILES_STORE, save_profiles_to_disk

class ProfileRepository:
    @staticmethod
    def get(user_id: str) -> Optional[UserProfile]:
        return PROFILES_STORE.get(user_id)

    @staticmethod
    def save(profile: UserProfile) -> UserProfile:
        PROFILES_STORE[profile.user_id] = profile
        save_profiles_to_disk()
        return profile

    @staticmethod
    def delete(user_id: str) -> bool:
        if user_id in PROFILES_STORE:
            del PROFILES_STORE[user_id]
            save_profiles_to_disk()
            return True
        return False
