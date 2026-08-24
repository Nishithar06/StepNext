from fastapi import APIRouter, HTTPException, Path
from app.schemas.models import AdaptiveFutureFeedback
from app.services.adaptive_future import evaluate_future_feedback
from app.store import ADAPTIVE_FUTURE_STORE

router = APIRouter(prefix="/api/adaptive-future", tags=["Adaptive Future Feedback"])

@router.get("/{user_id}", response_model=AdaptiveFutureFeedback)
def get_adaptive_future_feedback(user_id: str = Path(..., description="Target User ID")):
    if user_id in ADAPTIVE_FUTURE_STORE:
        return ADAPTIVE_FUTURE_STORE[user_id]
    
    # Compute if not existing
    return evaluate_future_feedback(user_id)

@router.post("/{user_id}", response_model=AdaptiveFutureFeedback)
def request_adaptive_future_feedback(user_id: str = Path(..., description="Target User ID")):
    return evaluate_future_feedback(user_id)
