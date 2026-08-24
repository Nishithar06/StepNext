"""
Progress Repository for LifePilot AI.
Encapsulates ProgressSummary retrieval and persistence.
"""

from typing import Optional
from app.schemas.models import ProgressSummary
from app.store import PROGRESS_STORE, save_progress_to_disk

class ProgressRepository:
    @staticmethod
    def get(user_id: str) -> Optional[ProgressSummary]:
        return PROGRESS_STORE.get(user_id)

    @staticmethod
    def save(progress: ProgressSummary) -> ProgressSummary:
        PROGRESS_STORE[progress.user_id] = progress
        save_progress_to_disk()
        return progress
