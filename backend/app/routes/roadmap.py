from fastapi import APIRouter, HTTPException, Path
from typing import Dict, Any
from app.schemas.models import ActionRoadmap, UserProfile
from app.store import ROADMAPS_STORE, SIMULATIONS_STORE, PROFILES_STORE, save_roadmaps_to_disk
from app.services.roadmap import generate_roadmap_deterministic

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

@router.get("/{user_id}", response_model=ActionRoadmap)
def get_user_roadmap(user_id: str = Path(..., description="Target User ID")):
    print(f"[Roadmap] FETCH_REQUEST: user_id={user_id}")
    profile = PROFILES_STORE.get(user_id)
    sim = SIMULATIONS_STORE.get(user_id)
    
    current_goal = (profile.career_goal or profile.short_term_goal or "") if profile else ""

    if user_id in ROADMAPS_STORE:
        stored_rm = ROADMAPS_STORE[user_id]
        stored_goal = getattr(stored_rm, "goal_context", None)
        
        # Detect if stored roadmap is stale (e.g. user changed goal OR stored roadmap has hardcoded DSA for a non-developer goal)
        is_stale = False
        if current_goal and stored_goal and current_goal.lower().strip() != stored_goal.lower().strip():
            print(f"[Roadmap] STALE_GOAL_DETECTED: stored='{stored_goal}' current='{current_goal}'. Regenerating...")
            is_stale = True
        elif current_goal and not any(dev_term in current_goal.lower() for dev_term in ["software", "developer", "coder", "programmer", "full stack"]):
            if any("dsa" in a.title.lower() or "dsa" in a.description.lower() for a in stored_rm.weekly_actions):
                print(f"[Roadmap] STALE_DEVELOPER_ACTION_DETECTED for non-developer goal='{current_goal}'. Regenerating...")
                is_stale = True

        if not is_stale:
            print(f"[Roadmap] LOAD_SUCCESS: user_id={user_id}")
            return stored_rm

    # If no stored roadmap or stale roadmap detected, generate fresh goal-grounded roadmap
    if sim:
        roadmap = generate_roadmap_deterministic(user_id, profile, sim)
        return roadmap

    raise HTTPException(status_code=404, detail=f"No roadmap found for user_id: {user_id}. Run simulation first.")

@router.post("/{user_id}", response_model=ActionRoadmap)
def generate_or_update_roadmap(user_id: str = Path(..., description="Target User ID")):
    print(f"[Roadmap] POST_REQUEST: user_id={user_id}")
    if user_id not in SIMULATIONS_STORE:
        raise HTTPException(status_code=400, detail="Cannot generate roadmap: Run a Future Simulation first.")
    
    profile = PROFILES_STORE.get(user_id)
    sim = SIMULATIONS_STORE[user_id]
    roadmap = generate_roadmap_deterministic(user_id, profile, sim)
    return roadmap

@router.put("/{user_id}/action/{action_id}", response_model=ActionRoadmap)
def update_action_status(
    user_id: str = Path(...),
    action_id: str = Path(...)
):
    if user_id not in ROADMAPS_STORE:
        raise HTTPException(status_code=404, detail=f"No roadmap found for user_id: {user_id}")
    
    roadmap = ROADMAPS_STORE[user_id]
    found = False
    
    for action in roadmap.weekly_actions:
        if action.id == action_id:
            action.status = "completed" if action.status != "completed" else "not_started"
            found = True
            break
            
    if not found:
        for item in roadmap.top_priorities:
            if item.id == action_id:
                item.status = "completed" if item.status != "completed" else "not_started"
                found = True
                break

    if not found:
        raise HTTPException(status_code=404, detail=f"Action ID {action_id} not found in roadmap.")
    
    ROADMAPS_STORE[user_id] = roadmap
    save_roadmaps_to_disk()
    
    # Recalculate progress intelligence & adaptive future feedback
    try:
        from app.services.progress import analyze_user_progress
        from app.services.adaptive_future import evaluate_future_feedback
        analyze_user_progress(user_id)
        evaluate_future_feedback(user_id)
    except Exception as e:
        print(f"[Roadmap Route] Error triggering progress update on action toggle: {e}")

    print(f"[Roadmap] ACTION_UPDATED: user_id={user_id}, action_id={action_id}")
    return roadmap
