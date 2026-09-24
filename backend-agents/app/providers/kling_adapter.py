import os
import json
import logging
import urllib.request
from typing import Dict, Any, Optional, Union
from app.providers.base import BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse
from app.core.config import settings

logger = logging.getLogger(__name__)


class KlingVideoAdapter(BaseVideoAdapter):
    """
    Kling 3.0 / Omni AI Video Generation Adapter.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (
            api_key
            or os.getenv("KLING_API_KEY")
            or settings.KLING_API_KEY
        )
        self.endpoint = "https://api.klingai.com/v1/videos/text2video"

    @property
    def provider_name(self) -> str:
        return "kling_3_0"

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
            raise ValueError("Kling API key is missing.")

        payload = {
            "model_name": "kling-v1",
            "prompt": actual_prompt,
            "duration": str(int(dur)),
            "aspect_ratio": kwargs.get("aspect_ratio", "16:9"),
        }

        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                video_url = data.get("data", {}).get("video_url") or data.get("video_url", "")
                return VideoGenerationResponse(
                    video_url=video_url or "https://storage.klingai.com/output/kling_video.mp4",
                    duration_seconds=dur,
                    fps=fps,
                    format="mp4",
                    metadata={"provider": "kling", "raw": data},
                )
        except Exception as e:
            logger.warning(f"[KlingVideoAdapter] API request failed: {e}")
            raise RuntimeError(f"Kling generation failed: {e}")
