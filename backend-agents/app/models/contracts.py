from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AspectRatio(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_239_1 = "2.39:1"
    RATIO_1_1 = "1:1"
    RATIO_4_3 = "4:3"


class ProjectStyle(str, Enum):
    CINEMATIC_35MM = "cinematic_35mm"
    CYBERPUNK_NOIR = "cyberpunk_noir"
    ANIME_4K = "anime_4k"
    DOCUMENTARY_REALISM = "documentary_realism"
    VINTAGE_POLAROID = "vintage_polaroid"


class WorkflowType(str, Enum):
    SCRIPT_IDEATION = "script_ideation"
    SCRIPT_TO_STORYBOARD = "script_to_storyboard"
    CONTINUITY_VALIDATION = "continuity_validation"
    SCENE_SYNTHESIS = "scene_synthesis"
    RENDER_TIMELINE = "render_timeline"


class WorkflowRunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    WAITING_FOR_APPROVAL = "waiting_for_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class CharacterProfile(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    role: str
    description: str
    voice_archetype: str
    visual_reference_seeds: List[str] = Field(default_factory=list)
    face_embedding_id: Optional[str] = None


class Shot(BaseModel):
    shot_number: int = Field(..., gt=0)
    camera_directive: str  # e.g., "dolly zoom, medium close-up, 50mm f/1.8"
    action_description: str
    dialogue_speaker: Optional[str] = None
    dialogue_text: Optional[str] = None
    audio_cue: Optional[str] = None
    duration_seconds: float = Field(default=4.0, gt=0)
    keyframe_image_url: Optional[str] = None
    rendered_video_url: Optional[str] = None
    status: str = Field(default="pending")


class Scene(BaseModel):
    scene_number: int = Field(..., gt=0)
    heading: str  # e.g., "EXT. CYBERPUNK ALLEYWAY - NIGHT"
    narrative_summary: str
    shots: List[Shot] = Field(default_factory=list)


class TriggerWorkflowRequest(BaseModel):
    project_id: str
    workflow_type: WorkflowType
    parameters: Dict[str, Any] = Field(default_factory=dict)
    user_feedback: Optional[str] = None
    target_scene_number: Optional[int] = None
    target_shot_number: Optional[int] = None
    interrupt_on_human_approval: bool = True


class WorkflowRunResponse(BaseModel):
    run_id: str
    project_id: str
    workflow_type: WorkflowType
    status: WorkflowRunStatus
    current_node: Optional[str] = None
    completed_nodes: List[str] = Field(default_factory=list)
    intermediate_artifacts: Dict[str, Any] = Field(default_factory=dict)
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: str
    updated_at: str



class ProductionStrategy(str, Enum):
    VIDEO = "VIDEO"
    IMAGE_MOTION = "IMAGE_MOTION"
    REUSE = "REUSE"
    EXTEND = "EXTEND"
    TRANSITION = "TRANSITION"


class ResumeWorkflowRequest(BaseModel):
    run_id: str
    approved: bool
    reviewer_feedback: Optional[str] = None
    overrides: Optional[Dict[str, Any]] = None


class ScriptShot(BaseModel):
    id: str
    shot_number: str  # e.g., "Shot 1.1"
    scene_number: int
    shot_type: str  # "Wide Shot", "Close Up", "Medium Shot", etc.
    duration: float = 4.0
    camera_directive: str
    action_description: str
    dialogue_speaker: Optional[str] = None
    dialogue_text: Optional[str] = None
    audio_cue: Optional[str] = None
    motion_intensity: str = "medium"  # low, medium, high


class ScriptScene(BaseModel):
    id: str
    scene_number: int
    title: str
    slugline: str  # e.g., "INT. HOSTEL ROOM - NIGHT"
    description: str
    duration: float = 15.0
    fountain_script: Optional[str] = None
    shots: List[ScriptShot] = Field(default_factory=list)


class ScriptIdeationResult(BaseModel):
    title: str
    logline: str
    genre: str
    synopsis: str
    scenes: List[ScriptScene] = Field(default_factory=list)
    suggested_characters: List[Dict[str, Any]] = Field(default_factory=list)
    fountain_full_script: Optional[str] = None


class StoryboardShot(ScriptShot):
    strategy: ProductionStrategy = ProductionStrategy.VIDEO
    strategy_reason: str
    recommended_model: str
    estimated_cost: float
    thumbnail_url: str = "/generated_videos/gen_default.jpg"
    video_url: Optional[str] = None
    thumbnail_gradient: str = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
    continuity_score: int = 95
    status: str = "ready"


class StoryboardScene(BaseModel):
    id: str
    scene_number: int
    title: str
    slugline: str
    description: str
    duration: float
    fountain_script: Optional[str] = None
    shots: List[StoryboardShot] = Field(default_factory=list)


class StoryboardResult(BaseModel):
    project_id: str
    total_shots: int
    estimated_cost: float
    total_budget: float = 500.0
    remaining_budget: float
    potential_savings: float
    optimization_suggestion: str
    scenes: List[StoryboardScene] = Field(default_factory=list)

