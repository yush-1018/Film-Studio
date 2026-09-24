import os
import json
import urllib.request
from typing import AsyncGenerator, Type
from pydantic import BaseModel
from app.providers.base import BaseLLMAdapter, LLMRequest, LLMResponse
from app.core.config import settings


class GeminiLLMAdapter(BaseLLMAdapter):
    """
    Google Gemini LLM Adapter powered by Google's official Generative Language API.
    Uses gemini-3.6-flash for state-of-the-art scriptwriting, scene decomposition,
    and narrative planning.
    """

    def __init__(self, api_key: str | None = None):
        self.api_key = (
            api_key
            or os.getenv("GEMINI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
            or getattr(settings, "GEMINI_API_KEY", "")
        )
        self.model = "gemini-3.6-flash"

    @property
    def provider_name(self) -> str:
        return "google_gemini"

    async def generate_text(self, request: LLMRequest) -> LLMResponse:
        prompt_parts = [m.content for m in request.messages]
        full_prompt = "\n\n".join(prompt_parts)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": request.temperature or 0.7,
                "maxOutputTokens": request.max_tokens or 2048,
            },
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return LLMResponse(
                    text=text,
                    tokens_used=len(text.split()),
                    model=self.model,
                    finish_reason="stop",
                )
        except Exception as e:
            print(f"[GeminiLLMAdapter] API call failed: {e}")
            raise

    async def generate_structured(
        self, request: LLMRequest, response_schema: type[BaseModel]
    ) -> BaseModel:
        # Prompt Gemini to output valid JSON matching schema
        schema_json = json.dumps(response_schema.model_json_schema(), indent=2)
        augmented_prompt = (
            f"{request.messages[-1].content if request.messages else ''}\n\n"
            f"You MUST output valid, parseable JSON conforming strictly to this JSON Schema:\n{schema_json}\n"
            f"Output JSON only with no extra markdown code block wrapping."
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": augmented_prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
            },
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            return response_schema.model_validate(parsed)

    async def stream_text(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        res = await self.generate_text(request)
        yield res.text
