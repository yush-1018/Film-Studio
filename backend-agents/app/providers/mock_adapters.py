import hashlib
from typing import AsyncGenerator, List, Optional
from pydantic import BaseModel

from app.providers.base import (
    BaseImageAdapter,
    BaseLLMAdapter,
    BaseSTTAdapter,
    BaseTTSAdapter,
    BaseVideoAdapter,
    ImageGenerationRequest,
    ImageGenerationResponse,
    LLMRequest,
    LLMResponse,
    STTRequest,
    STTResponse,
    TTSRequest,
    TTSResponse,
    VideoGenerationRequest,
    VideoGenerationResponse,
)


class MockLLMAdapter(BaseLLMAdapter):
    @property
    def provider_name(self) -> str:
        return "mock_llm"

    async def generate_text(self, request: LLMRequest) -> LLMResponse:
        last_msg = request.messages[-1].content if request.messages else "No prompt"
        generated = (
            f"[MOCK SCRIPTWRITER SCENE]\n"
            f"EXT. NEO-TOKYO METROPOLIS - NIGHT\n"
            f"Rain cascades across holographic billboards reflecting in pools of oily water.\n"
            f"Prompt: {last_msg}\n"
            f"DIRECTOR: Action begins with a slow pan across the skyline."
        )
        return LLMResponse(
            text=generated,
            tokens_used=42,
            model="mock-gpt-4o",
            finish_reason="stop",
        )

    async def generate_structured(
        self, request: LLMRequest, response_schema: type[BaseModel]
    ) -> BaseModel:
        # Create an instance with dummy fields conforming to model fields
        fields = response_schema.model_fields
        dummy_data = {}
        for field_name, field_info in fields.items():
            annotation = field_info.annotation
            if annotation in (str, Optional[str]):
                dummy_data[field_name] = f"mock_{field_name}"
            elif annotation in (int, Optional[int]):
                dummy_data[field_name] = 1
            elif annotation in (float, Optional[float]):
                dummy_data[field_name] = 1.0
            elif annotation in (bool, Optional[bool]):
                dummy_data[field_name] = True
            elif annotation in (list, List[str]):
                dummy_data[field_name] = ["mock_item_1", "mock_item_2"]
            else:
                dummy_data[field_name] = None

        return response_schema.model_validate(dummy_data)

    async def stream_text(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        chunks = [
            "EXT. CYBERPUNK ALLEY - NIGHT\n",
            "Neon reflection shimmers against wet pavement.\n",
            "KAI walks slowly towards the flickering street lamp.\n",
        ]
        for chunk in chunks:
            yield chunk


class MockSTTAdapter(BaseSTTAdapter):
    @property
    def provider_name(self) -> str:
        return "mock_stt"

    async def transcribe_audio(self, request: STTRequest) -> STTResponse:
        audio_len = len(request.audio_bytes)
        return STTResponse(
            transcript=f"Transcribed dialogue from audio buffer ({audio_len} bytes).",
            confidence=0.98,
            words=[
                {"word": "Transcribed", "start": 0.0, "end": 0.5},
                {"word": "dialogue", "start": 0.5, "end": 1.2},
            ],
        )


class MockTTSAdapter(BaseTTSAdapter):
    @property
    def provider_name(self) -> str:
        return "mock_tts"

    async def synthesize_speech(self, request: TTSRequest) -> TTSResponse:
        # Generate dummy audio bytes representing synthetic speech
        dummy_pcm = b"RIFF" + request.text.encode("utf-8") + b"WAVEfmt "
        estimated_duration = max(1.0, len(request.text.split()) * 0.35)
        return TTSResponse(
            audio_bytes=dummy_pcm,
            audio_format="wav",
            duration_seconds=round(estimated_duration, 2),
            sample_rate=44100,
        )


class MockImageAdapter(BaseImageAdapter):
    @property
    def provider_name(self) -> str:
        return "mock_image"

    async def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResponse:
        hash_seed = int(hashlib.md5(request.prompt.encode("utf-8")).hexdigest()[:8], 16)
        urls = [
            f"https://storage.filmstudio.local/mock-renders/{hash_seed}_var{i}.png"
            for i in range(request.num_variants)
        ]
        return ImageGenerationResponse(
            image_urls=urls,
            seed=hash_seed,
            prompt_used=request.prompt,
            metadata={
                "aspect_ratio": request.aspect_ratio,
                "style": request.style_preset,
                "references_count": len(request.reference_face_seeds),
            },
        )

    async def edit_image(
        self, base_image_url: str, edit_instruction: str
    ) -> ImageGenerationResponse:
        edited_seed = 99999
        return ImageGenerationResponse(
            image_urls=[f"{base_image_url}_edited_{edited_seed}.png"],
            seed=edited_seed,
            prompt_used=edit_instruction,
            metadata={"source_url": base_image_url},
        )


class MockVideoAdapter(BaseVideoAdapter):
    @property
    def provider_name(self) -> str:
        return "mock_video"

    async def generate_video(self, request: VideoGenerationRequest) -> VideoGenerationResponse:
        hash_seed = int(hashlib.md5(request.prompt.encode("utf-8")).hexdigest()[:8], 16)
        return VideoGenerationResponse(
            video_url=f"https://storage.filmstudio.local/mock-video/{hash_seed}_motion.mp4",
            duration_seconds=request.duration_seconds,
            fps=request.fps,
            format="mp4",
            metadata={
                "camera_motion": request.camera_motion or "static_cinematic",
                "init_image": request.init_image_url,
            },
        )
