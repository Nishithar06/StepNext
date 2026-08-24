from fastapi import APIRouter, HTTPException, Path
from app.schemas.models import ProgressSummary
from app.services.progress import analyze_user_progress

router = APIRouter(prefix="/api/progress", tags=["Progress Intelligence"])

@router.get("/{user_id}", response_model=ProgressSummary)
def get_user_progress_summary(user_id: str = Path(..., description="Target User ID")):
    summary = analyze_user_progress(user_id)
    return summary

@router.post("/{user_id}/adapt", response_model=ProgressSummary)
def adapt_user_progress(user_id: str = Path(..., description="Target User ID")):
    summary = analyze_user_progress(user_id)
    return summary
