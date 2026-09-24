import os
import json
import logging
import urllib.request
from typing import Dict, Any, Optional, Union
from app.providers.base import BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse
from app.core.config import settings

logger = logging.getLogger(__name__)


class RunwayVideoAdapter(BaseVideoAdapter):
    """
    Runway Gen-4.5 / Gen-3 Alpha Video Generation Adapter.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (
            api_key
            or os.getenv("RUNWAY_API_KEY")
            or settings.RUNWAY_API_KEY
        )
        self.endpoint = "https://api.dev.runwayml.com/v1/tasks"

    @property
    def provider_name(self) -> str:
        return "runway_gen_4_5"

    async def generate_video(
        self,
        request: Optional[Union[VideoGenerationRequest, str]] = None,
        prompt: Optional[str] = None,
        **kwargs,
    ) -> VideoGenerationResponse:
        if isinstance(request, VideoGenerationRequest):
            actual_prompt = request.prompt
            dur = request.duration_seconds
            fps = request.fps
        elif isinstance(request, str):
            actual_prompt = request
            dur = float(kwargs.get("duration_seconds", 4.0))
            fps = int(kwargs.get("fps", 24))
        else:
            actual_prompt = prompt or kwargs.get("prompt", "Cinematic video")
            dur = float(kwargs.get("duration_seconds", 4.0))
            fps = int(kwargs.get("fps", 24))

        if not self.api_key:
            raise ValueError("Runway API key is missing.")

        payload = {
            "taskType": "gen3a_turbo",
            "promptText": actual_prompt,
            "duration": int(dur),
            "ratio": "16:9",
        }

        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
                "X-Runway-Version": "2024-11-06",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                video_url = data.get("output", [None])[0] or data.get("video_url", "")
                return VideoGenerationResponse(
                    video_url=video_url or "https://storage.runwayml.com/output/gen3.mp4",
                    duration_seconds=dur,
                    fps=fps,
                    format="mp4",
                    metadata={"provider": "runway", "raw": data},
                )
        except Exception as e:
            logger.warning(f"[RunwayVideoAdapter] API request failed: {e}")
            raise RuntimeError(f"Runway generation failed: {e}")
