from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Dict, List, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Modality Data Transfer Objects (DTOs)
# =============================================================================

class LLMMessage(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str


class LLMRequest(BaseModel):
    messages: List[LLMMessage]
    temperature: float = 0.7
    max_tokens: Optional[int] = 2048
    system_prompt: Optional[str] = None
    stop_sequences: List[str] = Field(default_factory=list)


class LLMResponse(BaseModel):
    text: str
    tokens_used: int = 0
    model: str
    finish_reason: str = "stop"


class STTRequest(BaseModel):
    audio_bytes: bytes
    audio_format: str = "wav"  # wav, mp3, ogg
    language: Optional[str] = "en"


class STTResponse(BaseModel):
    transcript: str
    confidence: float = 1.0
    words: List[Dict[str, Any]] = Field(default_factory=list)  # word-level timestamps


class TTSRequest(BaseModel):
    text: str
    voice_id: str
    emotion_or_style: Optional[str] = "neutral"
    speaking_rate: float = 1.0
    pitch: float = 1.0


class TTSResponse(BaseModel):
    audio_bytes: bytes
    audio_format: str = "mp3"
    duration_seconds: float
    sample_rate: int = 44100


class ImageGenerationRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    aspect_ratio: str = "16:9"
    width: int = 1920
    height: int = 1080
    reference_face_seeds: List[str] = Field(default_factory=list)
    style_preset: Optional[str] = "cinematic_35mm"
    num_variants: int = 1


class ImageGenerationResponse(BaseModel):
    image_urls: List[str]
    seed: int
    prompt_used: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class VideoGenerationRequest(BaseModel):
    prompt: str
    init_image_url: Optional[str] = None
    duration_seconds: float = 4.0
    camera_motion: Optional[str] = None  # e.g., "pan_left", "zoom_in", "dolly_out"
    fps: int = 24
    aspect_ratio: str = "16:9"


class VideoGenerationResponse(BaseModel):
    video_url: str
    duration_seconds: float
    fps: int
    format: str = "mp4"
    metadata: Dict[str, Any] = Field(default_factory=dict)


# =============================================================================
# Abstract Base Adapter Interfaces
# =============================================================================

class BaseLLMAdapter(ABC):
    """Abstract Base Class for Large Language Model Providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def generate_text(self, request: LLMRequest) -> LLMResponse:
        """Generate text completion from messages."""
        pass

    @abstractmethod
    async def generate_structured(
        self, request: LLMRequest, response_schema: type[BaseModel]
    ) -> BaseModel:
        """Generate structured JSON conforming strictly to a Pydantic schema."""
        pass

    @abstractmethod
    async def stream_text(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        """Stream generated text chunks asynchronously."""
        pass


class BaseSTTAdapter(ABC):
    """Abstract Base Class for Speech-to-Text Transcription Providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def transcribe_audio(self, request: STTRequest) -> STTResponse:
        """Transcribe speech audio bytes into structured text with timestamps."""
        pass


class BaseTTSAdapter(ABC):
    """Abstract Base Class for Text-to-Speech Providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def synthesize_speech(self, request: TTSRequest) -> TTSResponse:
        """Synthesize dialogue into high-fidelity speech audio bytes."""
        pass


class BaseImageAdapter(ABC):
    """Abstract Base Class for Keyframe & Storyboard Image Providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResponse:
        """Synthesize cinematic keyframe images with character style consistency."""
        pass

    @abstractmethod
    async def edit_image(
        self, base_image_url: str, edit_instruction: str
    ) -> ImageGenerationResponse:
        """Inpaint or modify an existing frame while retaining continuity."""
        pass


class BaseVideoAdapter(ABC):
    """Abstract Base Class for Video Generation Providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def generate_video(self, request: VideoGenerationRequest) -> VideoGenerationResponse:
        """Synthesize motion clips from prompts, optional keyframes, and camera controls."""
        pass
