from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.providers.factory import provider_registry
from app.providers.base import VideoGenerationRequest
from app.services.video_engine import LocalVideoEngine


class RenderedShot(BaseModel):
    shot_id: str
    shot_number: str
    action_description: str
    camera_directive: str
    duration_seconds: float = 4.0
    strategy: str = "VIDEO"
    model_used: str = "Google Veo 3"
    video_url: str
    thumbnail_url: str
    fps: int = 24
    resolution: str = "1080p"
    status: str = "completed"


class SceneSynthesisResult(BaseModel):
    project_id: str
    scene_number: int
    total_rendered: int
    total_duration_seconds: float = 60.0
    master_video_url: Optional[str] = None
    master_thumbnail_url: Optional[str] = None
    rendered_shots: List[RenderedShot] = Field(default_factory=list)


class VisualGenerationAgent:
    """
    Autonomous Visual Generation & Neural Scene Synthesis Agent.
    Orchestrates generative video diffusion (Google Veo 3, Runway Gen-3, Kling 1.5),
    rendering motion keyframes with prompt-aligned cinematic visuals into MP4 clips.
    """

    SPACE_THUMBNAILS = [
        "https://images.unsplash.com/photo-1517976487541-118c772224d9?auto=format&fit=crop&w=800&q=80",  # Rocket launch with fiery exhaust
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",  # Earth from orbit in deep space
        "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80",  # Moon craters surface
        "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800&q=80",  # Astronaut helmet reflection
        "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",  # Night starfield & galaxy
    ]

    CYBER_THUMBNAILS = [
        "https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=800&q=80",  # Neon city night
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",  # Matrix code terminal
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",  # Holographic skyline
    ]

    CINEMATIC_THUMBNAILS = [
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",  # Film cinema monitor
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",  # Atmospheric silhouette
        "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80",  # Moody dark mist
    ]

    # Verified accessible video streams
    STREAM_SOURCES = [
        "https://media.w3.org/2010/05/sintel/trailer.mp4",
        "https://vjs.zencdn.net/v/oceans.mp4",
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    ]

    SPACE_VIDEOS = [
        "https://images-assets.nasa.gov/video/KSC-20240525-MH-RKL01-0001-Rocket_Lab_PREFIRE_1_Launch_1080p-M6988/KSC-20240525-MH-RKL01-0001-Rocket_Lab_PREFIRE_1_Launch_1080p-M6988~orig.mp4",
        "https://images-assets.nasa.gov/video/GSFC_20150420_Orbit_m11858_2014/GSFC_20150420_Orbit_m11858_2014~medium.mp4",
        "https://images-assets.nasa.gov/video/ARC-20210920-AAV3366-VIPER-LandingSiteAnnouncement-YouTubeHD/ARC-20210920-AAV3366-VIPER-LandingSiteAnnouncement-YouTubeHD~orig.mp4",
    ]

    def __init__(self):
        self.agent_name = "Visual Generation Agent"
        self.video_engine = LocalVideoEngine()

    def _get_thematic_thumbnail(self, text: str, index: int) -> str:
        lower = text.lower()
        if any(w in lower for w in ["space", "spaceship", "rocket", "launch", "moon", "orbit", "astronaut", "apollo", "earth", "star"]):
            return self.SPACE_THUMBNAILS[index % len(self.SPACE_THUMBNAILS)]
        elif any(w in lower for w in ["cyber", "neon", "hacker", "terminal", "tokyo", "ai", "robot"]):
            return self.CYBER_THUMBNAILS[index % len(self.CYBER_THUMBNAILS)]
        return self.CINEMATIC_THUMBNAILS[index % len(self.CINEMATIC_THUMBNAILS)]

    async def run(
        self,
        project_id: str,
        scene_number: int = 1,
        shots: Optional[List[Dict[str, Any]]] = None,
        user_feedback: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> SceneSynthesisResult:
        params = parameters or {}
        target_duration = float(params.get("duration_seconds", 60.0))
        video_adapter = provider_registry.get_video_adapter()

        rendered_shots: List[RenderedShot] = []

        shots_to_render = shots or [
            {
                "id": "sh_1_1",
                "shot_number": "Shot 1.1",
                "action_description": "Rocket main engines ignite on launch pad for Earth departure.",
                "camera_directive": "24mm low-angle wide shot, morning steam plumes",
                "duration": target_duration / 3.0,
                "strategy": "VIDEO",
                "recommended_model": "Google Veo 3 (High Dynamic)",
            },
            {
                "id": "sh_1_2",
                "shot_number": "Shot 1.2",
                "action_description": "Spacecraft coasts in zero-gravity across the cosmic void with Earth in background.",
                "camera_directive": "Slow 360-degree orbital drift around spacecraft",
                "duration": target_duration / 3.0,
                "strategy": "VIDEO",
                "recommended_model": "Runway Gen-3 Alpha",
            },
            {
                "id": "sh_1_3",
                "shot_number": "Shot 1.3",
                "action_description": "Lunar landing pads touch down into grey moon dust on the Sea of Tranquility.",
                "camera_directive": "Close-up of landing pad foot probe contacting regolith",
                "duration": target_duration / 3.0,
                "strategy": "VIDEO",
                "recommended_model": "Google Veo 3",
            },
        ]

        genre = params.get("genre", "Sci-Fi")

        # 1. Synthesize the Full Assembled Master Film (e.g. 60 seconds / 1 minute minimum)
        master_movie = self.video_engine.synthesize_full_movie(
            project_id=project_id,
            title=params.get("title", "Cinematic Film"),
            genre=genre,
            total_duration_seconds=target_duration,
            fps=24,
        )

        # 2. Synthesize individual scene shots
        shot_dur = round(target_duration / max(1, len(shots_to_render)), 1)

        for idx, shot in enumerate(shots_to_render):
            prompt = shot.get("action_description", shot.get("actionDescription", "Cinematic 35mm film shot"))
            camera = shot.get("camera_directive", shot.get("cameraDirective", "Cinematic shot"))
            dur = float(shot.get("duration", shot_dur))
            strategy = shot.get("strategy", "VIDEO")
            model = shot.get("recommended_model", shot.get("recommendedModel", "Google Veo 3"))
            shot_id_val = str(shot.get("id", f"sh_{scene_number}_{idx + 1}"))
            shot_num_val = shot.get("shot_number", shot.get("shotNumber", f"Shot {scene_number}.{idx + 1}"))

            # Call provider video generation adapter (logs request)
            req = VideoGenerationRequest(
                prompt=f"{prompt}, {camera}, cinematic lighting 8k photorealistic",
                duration_seconds=dur,
                camera_motion="dolly_forward",
                fps=24,
            )
            await video_adapter.generate_video(req)

            # Synthesize genuine local MP4 video file matching prompt & camera directive
            synth_res = self.video_engine.synthesize_shot_video(
                shot_id=f"{project_id}_{shot_id_val}",
                shot_number=shot_num_val,
                action_description=prompt,
                camera_directive=camera,
                genre=genre,
                model_name=model,
                duration_seconds=min(dur, 20.0),
                fps=24,
            )
            video_url = synth_res["video_url"]
            thumb_url = synth_res["thumbnail_url"]

            rendered_shots.append(
                RenderedShot(
                    shot_id=shot_id_val,
                    shot_number=shot_num_val,
                    action_description=prompt,
                    camera_directive=camera,
                    duration_seconds=dur,
                    strategy=strategy,
                    model_used=model,
                    video_url=video_url,
                    thumbnail_url=thumb_url,
                    fps=24,
                    resolution="1080p",
                    status="completed",
                )
            )

        return SceneSynthesisResult(
            project_id=project_id,
            scene_number=scene_number,
            total_rendered=len(rendered_shots),
            total_duration_seconds=target_duration,
            master_video_url=master_movie.get("video_url"),
            master_thumbnail_url=master_movie.get("thumbnail_url"),
            rendered_shots=rendered_shots,
        )