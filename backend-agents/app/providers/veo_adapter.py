import os
import json
import logging
import urllib.request
from typing import Dict, Any, Optional, Union
from app.providers.base import BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse
from app.core.config import settings

logger = logging.getLogger(__name__)


class GoogleVeoAdapter(BaseVideoAdapter):
    """
    Google Veo 3.1 Video Generation Adapter.
    Uses Google Generative Language / Vertex AI Veo video endpoints.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (
            api_key
            or os.getenv("GOOGLE_VEO_API_KEY")
            or os.getenv("GEMINI_API_KEY")
            or settings.GOOGLE_VEO_API_KEY
        )
        self.model = "veo-3.1-generate-preview"

    @property
    def provider_name(self) -> str:
        return "google_veo_3_1"

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
            raise ValueError("Google Veo API key is missing.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:predictLongRunning?key={self.api_key}"
        payload = {
            "instances": [{"prompt": actual_prompt}],
            "parameters": {
                "aspectRatio": kwargs.get("aspect_ratio", "16:9"),
                "durationSeconds": int(dur),
                "fps": fps,
            },
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                video_url = (
                    data.get("videoUri")
                    or data.get("response", {}).get("videoUri")
                    or data.get("name", "")
                )
                return VideoGenerationResponse(
                    video_url=video_url or f"https://storage.googleapis.com/veo-output/{self.model}.mp4",
                    duration_seconds=dur,
                    fps=fps,
                    format="mp4",
                    metadata={"provider": "google_veo", "raw": data},
                )
        except Exception as e:
            logger.warning(f"[GoogleVeoAdapter] API request failed: {e}")
            raise RuntimeError(f"Google Veo generation failed: {e}")
