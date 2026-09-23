from typing import List, Optional
from app.models.contracts import CharacterProfile, LocationProfile, GenreStyleProfile


class ContextualPromptBuilder:
    """
    Constructs rich, context-aware visual prompts traceably derived from the user's actual story.
    Enforces Rule #1 (story entities dictate what is shown) and Rule #11 (GenreStyleProfile is
    appended strictly as a post-content styling layer, never substituting characters or events).
    """

    GENRE_STYLE_DEFAULTS = {
        "sci-fi": GenreStyleProfile(
            genre="sci-fi",
            color_palette=["#0A192F", "#00F0FF", "#172A45"],
            lighting_bias="cool cyan monitor glow and deep space contrast",
            pacing_bias="medium",
            music_mood_default="atmospheric synth ambient",
        ),
        "thriller": GenreStyleProfile(
            genre="thriller",
            color_palette=["#0B0C10", "#1F2833", "#C5A059"],
            lighting_bias="chiaroscuro high-contrast shadows and sharp rim lights",
            pacing_bias="fast",
            music_mood_default="tense pulsating sub-bass drone",
        ),
        "horror": GenreStyleProfile(
            genre="horror",
            color_palette=["#050505", "#1A0000", "#7A0000"],
            lighting_bias="desaturated oppressive dark tones with blood-red accents",
            pacing_bias="slow",
            music_mood_default="eerie dissonant strings and silence",
        ),
        "romance": GenreStyleProfile(
            genre="romance",
            color_palette=["#FFF0F5", "#FFB6C1", "#E6E6FA"],
            lighting_bias="warm soft-glow diffused golden hour sunlight",
            pacing_bias="slow",
            music_mood_default="tender acoustic melody",
        ),
        "comedy": GenreStyleProfile(
            genre="comedy",
            color_palette=["#FFD700", "#FF6B6B", "#4ECDC4"],
            lighting_bias="bright even high-key illumination",
            pacing_bias="fast",
            music_mood_default="upbeat playful rhythm",
        ),
        "drama": GenreStyleProfile(
            genre="drama",
            color_palette=["#2C3E50", "#BDC3C7", "#7F8C8D"],
            lighting_bias="naturalistic cinematic three-point lighting",
            pacing_bias="medium",
            music_mood_default="emotive orchestral cello",
        ),
        "action": GenreStyleProfile(
            genre="action",
            color_palette=["#E74C3C", "#2C3E50", "#F39C12"],
            lighting_bias="dynamic saturated practical lighting with muzzle/streak flare",
            pacing_bias="fast",
            music_mood_default="driving cinematic percussive beats",
        ),
        "cyberpunk": GenreStyleProfile(
            genre="cyberpunk",
            color_palette=["#0F051D", "#FF007F", "#00F0FF"],
            lighting_bias="neon saturated reflections in rain and wet asphalt with intense cyan and magenta highlights",
            pacing_bias="fast",
            music_mood_default="analog synthesizer and dark synthwave",
        ),
        "noir": GenreStyleProfile(
            genre="noir",
            color_palette=["#000000", "#333333", "#CCCCCC"],
            lighting_bias="stark Venetian blind slatted shadows and smoky silhouette backlight",
            pacing_bias="slow",
            music_mood_default="melancholic solo jazz trumpet and soft rain",
        ),
        "western": GenreStyleProfile(
            genre="western",
            color_palette=["#D2B48C", "#8B4513", "#F4A460"],
            lighting_bias="harsh midday desert sun and dusty warm sepia horizon rim glow",
            pacing_bias="medium",
            music_mood_default="acoustic Spanish guitar and whistling wind",
        ),
    }

    @classmethod
    def get_genre_style(cls, genre: str) -> GenreStyleProfile:
        clean = (genre or "drama").lower().strip()
        for key, profile in cls.GENRE_STYLE_DEFAULTS.items():
            if key in clean:
                return profile
        return GenreStyleProfile(
            genre=clean,
            color_palette=["#1E1E24", "#444140", "#F7EBE8"],
            lighting_bias="balanced cinematic three-point lighting",
            pacing_bias="medium",
            music_mood_default="cinematic ambient score",
        )

    @classmethod
    def build_visual_prompt(
        cls,
        story_excerpt: str,
        scene_heading: str,
        scene_narrative: str,
        shot_action: str,
        camera_directive: str,
        lighting: Optional[str] = None,
        mood: Optional[str] = None,
        characters: Optional[List[CharacterProfile]] = None,
        location: Optional[LocationProfile] = None,
        visual_style: str = "cinematic_35mm",
        genre: str = "Sci-Fi",
    ) -> str:
        parts: List[str] = []

        # 1. Subject and character binding from Character Bible
        if characters:
            char_descs = [f"{c.name} ({c.description})" for c in characters]
            parts.append(f"Subject: {', '.join(char_descs)}")

        # 2. Setting and atmosphere from Location Bible
        if location:
            parts.append(f"Setting: {location.name} [{location.setting_type}] - {location.atmosphere}")
        else:
            parts.append(f"Scene Location: {scene_heading}")

        # 3. Specific shot action derived from user story beat
        parts.append(f"Action: {shot_action}")

        # 4. Cinematic camera directive
        parts.append(f"Camera: {camera_directive}")

        # 5. Lighting signature
        effective_lighting = lighting or (location.lighting_signature if location else "Cinematic key lighting")
        parts.append(f"Lighting: {effective_lighting}")

        # 6. Mood and narrative grounding
        if mood:
            parts.append(f"Atmospheric Mood: {mood}")

        # 7. Post-content GenreStyleProfile styling layer (Rule #11)
        genre_style = cls.get_genre_style(genre)
        palette_str = ", ".join(genre_style.color_palette)
        style_suffix = (
            f"Style Grading: {visual_style}, {genre_style.lighting_bias}, "
            f"palette accents [{palette_str}], {genre.lower()} tonal aesthetic."
        )
        parts.append(style_suffix)

        return " | ".join(parts)
