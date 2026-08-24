"""
Adaptive Future Repository for LifePilot AI.
Encapsulates AdaptiveFutureFeedback retrieval and persistence.
"""

from typing import Optional
from app.schemas.models import AdaptiveFutureFeedback
from app.store import ADAPTIVE_FUTURE_STORE, save_adaptive_future_to_disk

class AdaptiveFutureRepository:
    @staticmethod
    def get(user_id: str) -> Optional[AdaptiveFutureFeedback]:
        return ADAPTIVE_FUTURE_STORE.get(user_id)

    @staticmethod
    def save(feedback: AdaptiveFutureFeedback) -> AdaptiveFutureFeedback:
        ADAPTIVE_FUTURE_STORE[feedback.user_id] = feedback
        save_adaptive_future_to_disk()
        return feedback
