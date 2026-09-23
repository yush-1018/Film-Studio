from app.providers.base import BaseVideoAdapter, VideoGenerationRequest, VideoGenerationResponse
from app.services.video_engine import LocalVideoEngine


class LocalVideoAdapter(BaseVideoAdapter):
    """
    Local Video Adapter backed by SemanticSceneCompositor.
    Generates genuine, entity-derived video clips on CPU using OpenCV.
    """

    def __init__(self):
        self._engine = LocalVideoEngine()

    @property
    def provider_name(self) -> str:
        return "local_semantic_compositor"

    async def generate_video(self, request: VideoGenerationRequest) -> VideoGenerationResponse:
        res = self._engine.synthesize_shot_video(
            shot_id=request.metadata.get("shot_id", "shot_001"),
            shot_number=str(request.metadata.get("shot_number", 1)),
            action_description=request.prompt,
            camera_directive=request.camera_motion or "Push-in medium shot",
            genre=request.metadata.get("genre", "Sci-Fi"),
            duration_seconds=request.duration_seconds,
            characters=request.metadata.get("characters"),
            location=request.metadata.get("location"),
        )
        return VideoGenerationResponse(
            video_url=res["video_url"],
            duration_seconds=request.duration_seconds,
            fps=request.fps,
            format="mp4",
            metadata=res,
        )


class ExternalVideoAdapter(BaseVideoAdapter):
    """
    Pluggable External Video Adapter for third-party cloud video generators.
    """

    @property
    def provider_name(self) -> str:
        return "external_cloud_video"

    async def generate_video(self, request: VideoGenerationRequest) -> VideoGenerationResponse:
        return VideoGenerationResponse(
            video_url="https://cloud.provider.com/generated_video.mp4",
            duration_seconds=request.duration_seconds,
            fps=request.fps,
            format="mp4",
            metadata={"provider": "external"},
        )
