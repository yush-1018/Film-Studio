from typing import Dict, Any, List
from app.models.contracts import Scene, GenreStyleProfile, MusicPreferences
from app.services.prompt_builder import ContextualPromptBuilder


class SoundAgent:
    """
    Autonomous Sound Design & Score Agent.
    Derives ambient music mood and SFX cues strictly from scene content and narrative beats.
    Falls back to GenreStyleProfile.music_mood_default ONLY if the scene implies no mood.
    """

    def __init__(self):
        self.agent_name = "Sound & Score Agent"

    def design_scene_audio(
        self,
        scene: Scene,
        music_prefs: MusicPreferences,
        genre: str = "Sci-Fi",
    ) -> Dict[str, Any]:
        genre_style = ContextualPromptBuilder.get_genre_style(genre)
        
        # Priority: explicit scene mood -> genre fallback mood (Rule #11)
        effective_mood = scene.mood if scene.mood and scene.mood.strip() else genre_style.music_mood_default

        sfx_cues = []
        text = f"{scene.heading} {scene.narrative_summary}".lower()
        if "computer" in text or "signal" in text or "monitor" in text:
            sfx_cues.extend(["keyboard clatter", "oscilloscope hum", "digital pulse spike"])
        if "station" in text or "train" in text or "tracks" in text:
            sfx_cues.extend(["distant metal creak", "fog wind howl", "gravel footsteps"])
        if "park" in text or "fountain" in text:
            sfx_cues.extend(["birds chirping in trees", "splashing fountain water", "rustling leaves"])
        if "dog" in text:
            sfx_cues.append("soft dog pant and collar jingle")
        if "device" in text:
            sfx_cues.append("low-frequency harmonic core hum")

        return {
            "scene_number": scene.scene_number,
            "music_enabled": music_prefs.enabled,
            "music_mood": effective_mood,
            "sfx_cues": sfx_cues or ["atmospheric ambient tone"],
        }
