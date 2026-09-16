from typing import Dict, Type
from app.core.config import settings
from app.providers.base import (
    BaseImageAdapter,
    BaseLLMAdapter,
    BaseSTTAdapter,
    BaseTTSAdapter,
    BaseVideoAdapter,
)
from app.providers.mock_adapters import (
    MockImageAdapter,
    MockLLMAdapter,
    MockSTTAdapter,
    MockTTSAdapter,
    MockVideoAdapter,
)


class ProviderRegistry:
    """Registry and factory for pluggable AI provider adapters."""

    def __init__(self):
        self._llm_providers: Dict[str, Type[BaseLLMAdapter]] = {"mock": MockLLMAdapter}
        self._stt_providers: Dict[str, Type[BaseSTTAdapter]] = {"mock": MockSTTAdapter}
        self._tts_providers: Dict[str, Type[BaseTTSAdapter]] = {"mock": MockTTSAdapter}
        self._image_providers: Dict[str, Type[BaseImageAdapter]] = {"mock": MockImageAdapter}
        self._video_providers: Dict[str, Type[BaseVideoAdapter]] = {"mock": MockVideoAdapter}

    # Registration methods
    def register_llm(self, name: str, provider_cls: Type[BaseLLMAdapter]) -> None:
        self._llm_providers[name.lower()] = provider_cls

    def register_stt(self, name: str, provider_cls: Type[BaseSTTAdapter]) -> None:
        self._stt_providers[name.lower()] = provider_cls

    def register_tts(self, name: str, provider_cls: Type[BaseTTSAdapter]) -> None:
        self._tts_providers[name.lower()] = provider_cls

    def register_image(self, name: str, provider_cls: Type[BaseImageAdapter]) -> None:
        self._image_providers[name.lower()] = provider_cls

    def register_video(self, name: str, provider_cls: Type[BaseVideoAdapter]) -> None:
        self._video_providers[name.lower()] = provider_cls

    # Factory retrieval methods
    def get_llm_adapter(self, provider_name: str | None = None) -> BaseLLMAdapter:
        name = (provider_name or settings.DEFAULT_LLM_PROVIDER).lower()
        adapter_cls = self._llm_providers.get(name, MockLLMAdapter)
        return adapter_cls()

    def get_stt_adapter(self, provider_name: str | None = None) -> BaseSTTAdapter:
        name = (provider_name or settings.DEFAULT_STT_PROVIDER).lower()
        adapter_cls = self._stt_providers.get(name, MockSTTAdapter)
        return adapter_cls()

    def get_tts_adapter(self, provider_name: str | None = None) -> BaseTTSAdapter:
        name = (provider_name or settings.DEFAULT_TTS_PROVIDER).lower()
        adapter_cls = self._tts_providers.get(name, MockTTSAdapter)
        return adapter_cls()

    def get_image_adapter(self, provider_name: str | None = None) -> BaseImageAdapter:
        name = (provider_name or settings.DEFAULT_IMAGE_PROVIDER).lower()
        adapter_cls = self._image_providers.get(name, MockImageAdapter)
        return adapter_cls()

    def get_video_adapter(self, provider_name: str | None = None) -> BaseVideoAdapter:
        name = (provider_name or settings.DEFAULT_VIDEO_PROVIDER).lower()
        adapter_cls = self._video_providers.get(name, MockVideoAdapter)
        return adapter_cls()


# Global Singleton Registry Instance
provider_registry = ProviderRegistry()
