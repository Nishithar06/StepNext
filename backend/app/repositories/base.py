"""
Base Repository module for LifePilot AI.
Provides clean data access interfaces isolating business logic from in-memory/JSON store
and future Supabase PostgreSQL database integration.
"""

import os
from typing import Dict, Any, Optional, List

class BaseRepository:
    def __init__(self, entity_name: str):
        self.entity_name = entity_name

    def log(self, action: str, details: str):
        print(f"[Repository:{self.entity_name}] {action}: {details}")
