import os
from typing import Dict, Any, List
from app.models.contracts import Scene
from app.services.video_engine import LocalVideoEngine


class EditorAgent:
    """
    Autonomous Editor Agent.
    Assembles synthesized shot clips, audio stems, and continuity pacing into a master film.
    Ensures final runtime is between 60s and 300s.
    """

    def __init__(self):
        self.agent_name = "Master Editor Agent"
        self._engine = LocalVideoEngine()

    def assemble_film(
        self,
        project_id: str,
        scenes: List[Scene],
        shots_data: List[Dict[str, Any]],
        title: str = "Master Film",
        genre: str = "Sci-Fi",
        target_duration: float = 120.0,
    ) -> Dict[str, Any]:
        return self._engine.assemble_master_video(
            project_id=project_id,
            shots_data=shots_data,
            title=title,
            genre=genre,
            target_duration=target_duration,
        )
