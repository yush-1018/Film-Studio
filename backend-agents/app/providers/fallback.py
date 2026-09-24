import logging
from typing import List, Dict, Any, Optional, Union
from app.providers.base import BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse

logger = logging.getLogger(__name__)


class ResilientVideoAdapter(BaseVideoAdapter):
    """
    Wraps an ordered chain of video adapters (e.g., Veo 3.1 -> Kling 3.0 -> Runway Gen-4.5 -> Local Compositor).
    Executes automatic failover if any provider returns an error, 429 rate limits, or out of credits.
    """

    def __init__(self, adapters: List[BaseVideoAdapter]):
        self.adapters = adapters

    @property
    def provider_name(self) -> str:
        names = [a.provider_name for a in self.adapters]
        return f"resilient_chain({ ' -> '.join(names) })"

    async def generate_video(
        self,
        request: Optional[Union[VideoGenerationRequest, str]] = None,
        prompt: Optional[str] = None,
        **kwargs,
    ) -> VideoGenerationResponse:
        # Standardize request
        if isinstance(request, str):
            req_obj = VideoGenerationRequest(prompt=request, **kwargs)
        elif isinstance(request, VideoGenerationRequest):
            req_obj = request
        else:
            req_obj = VideoGenerationRequest(prompt=prompt or kwargs.get("prompt", "Cinematic shot"), **kwargs)

        last_error = None
        for idx, adapter in enumerate(self.adapters):
            provider_name = adapter.__class__.__name__
            try:
                logger.info(f"Attempting video generation using [{idx+1}/{len(self.adapters)}]: {provider_name}")
                res = await adapter.generate_video(req_obj)
                if isinstance(res, VideoGenerationResponse):
                    return res
                elif isinstance(res, dict):
                    return VideoGenerationResponse(
                        video_url=res.get("video_url") or res.get("url", ""),
                        duration_seconds=req_obj.duration_seconds,
                        fps=req_obj.fps,
                        format="mp4",
                        metadata=res,
                    )
            except Exception as e:
                logger.warning(
                    f"Provider [{provider_name}] failed with error: '{e}'. "
                    f"Automatically failing over to next provider..."
                )
                last_error = e

        raise RuntimeError(f"All video generation providers in resilient chain failed! Final exception: {last_error}")
