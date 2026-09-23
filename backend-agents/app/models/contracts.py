from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AspectRatio(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_239_1 = "2.39:1"
    RATIO_4_3 = "4:3"


class ProjectStyle(str, Enum):
    CINEMATIC_35MM = "cinematic_35mm"
    CYBERPUNK_NOIR = "cyberpunk_noir"
    ANIME_4K = "anime_4k"
    DOCUMENTARY_REALISM = "documentary_realism"
    VINTAGE_POLAROID = "vintage_polaroid"


class GenerationStage(str, Enum):
    UNDERSTANDING = "understanding"
    SCREENPLAY = "screenplay"
    STORYBOARD = "storyboard"
    VISUALS = "visuals"
    CONTINUITY = "continuity"
    VOICE = "voice"
    SOUND = "sound"
    EDITING = "editing"
    COMPLETED = "completed"
    FAILED = "failed"


class WorkflowType(str, Enum):
    SCRIPT_IDEATION = "script_ideation"
    SCRIPT_TO_STORYBOARD = "script_to_storyboard"
    CONTINUITY_VALIDATION = "continuity_validation"
    SCENE_SYNTHESIS = "scene_synthesis"
    RENDER_TIMELINE = "render_timeline"
    FULL_PIPELINE = "full_pipeline"


class WorkflowRunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    WAITING_FOR_APPROVAL = "waiting_for_approval"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ProductionStrategy(str, Enum):
    VIDEO = "VIDEO"
    IMAGE_MOTION = "IMAGE_MOTION"
    REUSE = "REUSE"
    EXTEND = "EXTEND"
    TRANSITION = "TRANSITION"


class GenreStyleProfile(BaseModel):
    genre: str = Field(..., description="Open string genre (sci-fi, horror, romance, comedy, drama, etc.)")
    color_palette: List[str] = Field(default_factory=list, description="Hex color strings or grading tags")
    lighting_bias: str = Field(default="natural", description="e.g. high-contrast, chiaroscuro, soft-warm, bright-even")
    pacing_bias: str = Field(default="medium", description="slow | medium | fast - affects shot duration distribution only")
    music_mood_default: str = Field(default="cinematic ambient", description="Fallback only if scene mood unspecified")


class CharacterProfile(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    role: str
    description: str
    voice_archetype: Optional[str] = None
    visual_reference_seeds: List[str] = Field(default_factory=list)
    face_embedding_id: Optional[str] = None


class LocationProfile(BaseModel):
    id: str
    name: str = Field(..., min_length=1)
    setting_type: str = "interior"  # interior / exterior
    atmosphere: str
    lighting_signature: str


class Shot(BaseModel):
    id: Optional[str] = None
    scene_id: Optional[str] = None
    shot_number: int = Field(..., gt=0)
    duration_seconds: float = Field(default=4.0, gt=0)
    purpose: Optional[str] = None
    description: Optional[str] = None
    action_description: str
    visual_prompt: Optional[str] = None
    camera_directive: str  # e.g., "dolly zoom, medium close-up, 50mm f/1.8"
    lighting: Optional[str] = None
    mood: Optional[str] = None
    characters: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    dialogue_speaker: Optional[str] = None
    dialogue_text: Optional[str] = None
    audio_cue: Optional[str] = None
    keyframe_image_url: Optional[str] = None
    rendered_video_url: Optional[str] = None
    status: str = Field(default="pending")
    strategy: Optional[ProductionStrategy] = ProductionStrategy.VIDEO


class Scene(BaseModel):
    id: Optional[str] = None
    scene_number: int = Field(..., gt=0)
    duration_seconds: float = Field(default=20.0, gt=0)
    summary: Optional[str] = None
    heading: str  # e.g., "EXT. RAILWAY STATION - NIGHT"
    narrative_summary: str
    location: Optional[str] = None
    characters: List[str] = Field(default_factory=list)
    mood: Optional[str] = None
    shots: List[Shot] = Field(default_factory=list)


class ProjectInput(BaseModel):
    type: str = Field(default="story", description="script | story | audio")
    content: str = Field(..., min_length=5, description="raw user text — preserved verbatim, never overwritten")
    audio_url: Optional[str] = None
    transcript: Optional[str] = None


class VoicePreferences(BaseModel):
    enabled: bool = True
    gender: str = "neutral"
    tone: str = "cinematic narrator"


class MusicPreferences(BaseModel):
    enabled: bool = True
    mood: Optional[str] = None


class ProjectPreferences(BaseModel):
    duration_seconds: int = Field(default=120, ge=60, le=300, description="60-300 seconds strictly validated")
    aspect_ratio: AspectRatio = AspectRatio.RATIO_16_9
    visual_style: str = "cinematic_35mm"
    language: str = "en"
    voice: VoicePreferences = Field(default_factory=VoicePreferences)
    music: MusicPreferences = Field(default_factory=MusicPreferences)
    subtitles: bool = False


class TriggerWorkflowRequest(BaseModel):
    project_id: str
    workflow_type: WorkflowType
    parameters: Dict[str, Any] = Field(default_factory=dict)
    user_feedback: Optional[str] = None
    target_scene_number: Optional[int] = None
    target_shot_number: Optional[int] = None
    interrupt_on_human_approval: bool = False


class ResumeWorkflowRequest(BaseModel):
    run_id: str
    approved: bool
    reviewer_feedback: Optional[str] = None
    overrides: Optional[Dict[str, Any]] = None


class WorkflowRunResponse(BaseModel):
    run_id: str
    project_id: str
    workflow_type: WorkflowType
    status: WorkflowRunStatus
    current_stage: Optional[GenerationStage] = None
    progress: float = Field(default=0.0, ge=0.0, le=100.0)
    stage_results: Dict[str, str] = Field(default_factory=dict)
    cost_used: float = Field(default=0.0)
    cost_budget: float = Field(default=15.00)
    current_node: Optional[str] = None
    completed_nodes: List[str] = Field(default_factory=list)
    intermediate_artifacts: Dict[str, Any] = Field(default_factory=dict)
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: str
    updated_at: str


class FilmProject(BaseModel):
    id: str
    owner_id: str = "user_ayush"  # Single-tenant dev mode default
    title: str
    input: ProjectInput
    preferences: ProjectPreferences
    status: str = "draft"
    characters: List[CharacterProfile] = Field(default_factory=list)
    locations: List[LocationProfile] = Field(default_factory=list)
    scenes: List[Scene] = Field(default_factory=list)
    shots: List[Shot] = Field(default_factory=list)
    master_video_url: Optional[str] = None
    created_at: str
    updated_at: str


class ScriptShot(BaseModel):
    id: Optional[str] = None
    shot_id: Optional[str] = None
    shot_number: str
    scene_number: int = 1
    shot_type: str = "Medium Shot"
    type: Optional[str] = None
    action_description: str
    camera_directive: str
    duration: float
    time_range: Optional[str] = None
    dialogue_speaker: Optional[str] = None
    dialogue_text: Optional[str] = None
    audio_cue: Optional[str] = None
    motion_intensity: str = "medium"
    strategy: Optional[ProductionStrategy] = None
    strategy_reason: Optional[str] = None
    recommended_model: Optional[str] = None
    estimated_cost: Optional[float] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None


class ScriptScene(BaseModel):
    id: Optional[str] = None
    scene_number: int
    title: str
    heading: Optional[str] = None
    time_range: Optional[str] = None
    duration: float
    slugline: Optional[str] = None
    description: Optional[str] = None
    narrative_summary: Optional[str] = None
    shots: List[ScriptShot] = Field(default_factory=list)
    fountain_content: Optional[str] = None
    fountain_script: Optional[str] = None


class ScriptIdeationResult(BaseModel):
    project_id: str = "proj_default"
    title: str
    logline: str
    genre: str
    duration_seconds: int = 120
    synopsis: Optional[str] = None
    scenes: List[ScriptScene] = Field(default_factory=list)
    suggested_characters: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_locations: List[Dict[str, Any]] = Field(default_factory=list)
    fountain_full_script: Optional[str] = None
    cost: float = 0.0


class StoryboardShot(BaseModel):
    id: Optional[str] = None
    shot_number: str
    scene_number: int
    shot_type: str
    duration: float
    camera_directive: str
    action_description: str
    dialogue_speaker: Optional[str] = None
    dialogue_text: Optional[str] = None
    audio_cue: Optional[str] = None
    motion_intensity: str
    strategy: ProductionStrategy
    strategy_reason: str
    recommended_model: str
    estimated_cost: float
    thumbnail_url: str
    video_url: Optional[str] = None
    thumbnail_gradient: str
    continuity_score: int
    status: str = "ready"


class StoryboardScene(BaseModel):
    id: Optional[str] = None
    scene_number: int
    title: str
    slugline: Optional[str] = None
    description: Optional[str] = None
    duration: float
    fountain_script: Optional[str] = None
    shots: List[StoryboardShot] = Field(default_factory=list)


class StoryboardResult(BaseModel):
    project_id: str
    total_shots: int
    estimated_cost: float
    total_budget: float
    remaining_budget: float
    potential_savings: float
    optimization_suggestion: str
    scenes: List[StoryboardScene] = Field(default_factory=list)
