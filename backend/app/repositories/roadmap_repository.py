"""
Roadmap Repository for LifePilot AI.
Encapsulates ActionRoadmap retrieval and persistence.
"""

from typing import Optional
from app.schemas.models import ActionRoadmap
from app.store import ROADMAPS_STORE, save_roadmaps_to_disk

class RoadmapRepository:
    @staticmethod
    def get(user_id: str) -> Optional[ActionRoadmap]:
        return ROADMAPS_STORE.get(user_id)

    @staticmethod
    def save(roadmap: ActionRoadmap) -> ActionRoadmap:
        ROADMAPS_STORE[roadmap.user_id] = roadmap
        save_roadmaps_to_disk()
        return roadmap

    @staticmethod
    def delete(user_id: str) -> bool:
        if user_id in ROADMAPS_STORE:
            del ROADMAPS_STORE[user_id]
            save_roadmaps_to_disk()
            return True
        return False
