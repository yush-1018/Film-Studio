import asyncio
from pydantic import BaseModel

from app.providers.base import (
    ImageGenerationRequest,
    LLMMessage,
    LLMRequest,
    STTRequest,
    TTSRequest,
    VideoGenerationRequest,
)
from app.providers.factory import ProviderRegistry, provider_registry
from app.providers.mock_adapters import (
    MockImageAdapter,
    MockLLMAdapter,
    MockSTTAdapter,
    MockTTSAdapter,
    MockVideoAdapter,
)


class DummySceneSchema(BaseModel):
    title: str
    shot_count: int


def test_mock_llm_adapter():
    async def _test():
        adapter = MockLLMAdapter()
        assert adapter.provider_name == "mock_llm"

        # Test text generation
        req = LLMRequest(
            messages=[LLMMessage(role="user", content="Write a scene for a rainy cyberpunk alley.")]
        )
        res = await adapter.generate_text(req)
        assert "MOCK SCRIPTWRITER SCENE" in res.text
        assert res.tokens_used > 0
        assert res.model == "mock-gpt-4o"

        # Test structured generation
        structured_res = await adapter.generate_structured(req, DummySceneSchema)
        assert isinstance(structured_res, DummySceneSchema)
        assert structured_res.title == "mock_title"
        assert structured_res.shot_count == 1

        # Test streaming
        chunks = []
        async for chunk in adapter.stream_text(req):
            chunks.append(chunk)
        assert len(chunks) == 3
        assert "CYBERPUNK ALLEY" in "".join(chunks)

    asyncio.run(_test())


def test_mock_stt_adapter():
    async def _test():
        adapter = MockSTTAdapter()
        assert adapter.provider_name == "mock_stt"

        sample_audio = b"\x00\x01\x02\x03\x04" * 100
        res = await adapter.transcribe_audio(STTRequest(audio_bytes=sample_audio))
        assert "Transcribed dialogue" in res.transcript
        assert res.confidence >= 0.9
        assert len(res.words) == 2

    asyncio.run(_test())


def test_mock_tts_adapter():
    async def _test():
        adapter = MockTTSAdapter()
        assert adapter.provider_name == "mock_tts"

        req = TTSRequest(text="We are not alone in the cyber city.", voice_id="voice_detective_01")
        res = await adapter.synthesize_speech(req)
        assert len(res.audio_bytes) > 0
        assert res.audio_format == "wav"
        assert res.duration_seconds > 0

    asyncio.run(_test())


def test_mock_image_adapter():
    async def _test():
        adapter = MockImageAdapter()
        assert adapter.provider_name == "mock_image"

        req = ImageGenerationRequest(
            prompt="Cinematic shot of neon blade runner, anamorphic lens flare",
            num_variants=2,
        )
        res = await adapter.generate_image(req)
        assert len(res.image_urls) == 2
        assert "storage.filmstudio.local" in res.image_urls[0]
        assert res.seed > 0

        # Test image edit
        edit_res = await adapter.edit_image(res.image_urls[0], "Add heavy rain and volumetric smoke")
        assert len(edit_res.image_urls) == 1
        assert "edited" in edit_res.image_urls[0]

    asyncio.run(_test())


def test_mock_video_adapter():
    async def _test():
        adapter = MockVideoAdapter()
        assert adapter.provider_name == "mock_video"

        req = VideoGenerationRequest(
            prompt="Slow cinematic push-in towards a neon-lit skyscraper",
            duration_seconds=5.0,
            camera_motion="dolly_in",
        )
        res = await adapter.generate_video(req)
        assert "mock-video" in res.video_url
        assert res.duration_seconds == 5.0
        assert res.metadata["camera_motion"] == "dolly_in"

    asyncio.run(_test())


def test_provider_registry_and_factory():
    registry = ProviderRegistry()

    # Verify default retrieval
    llm = registry.get_llm_adapter("mock")
    assert isinstance(llm, MockLLMAdapter)

    stt = registry.get_stt_adapter("mock")
    assert isinstance(stt, MockSTTAdapter)

    tts = registry.get_tts_adapter("mock")
    assert isinstance(tts, MockTTSAdapter)

    img = registry.get_image_adapter("mock")
    assert isinstance(img, MockImageAdapter)

    vid = registry.get_video_adapter("mock")
    assert isinstance(vid, MockVideoAdapter)

    # Fallback to mock on unknown provider
    unknown_llm = registry.get_llm_adapter("non_existent_provider_xyz")
    assert isinstance(unknown_llm, MockLLMAdapter)
