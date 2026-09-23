import math
import numpy as np
import scipy.io.wavfile as wavfile
from pathlib import Path
from typing import Dict, Any, Optional


class ProceduralSoundEngine:
    """
    Synthesizes authentic procedural soundtracks and sound design based on story prompt,
    genre, and mood. Supports full orchestration for cartoon/happy tunes, sci-fi synth pads,
    thriller drones, and cinematic themes.
    """

    SAMPLE_RATE = 44100

    @classmethod
    def synthesize_soundtrack(
        cls,
        output_path: Path,
        duration_seconds: float,
        genre: str = "Sci-Fi",
        mood: str = "cinematic",
        title: str = "",
        content_text: str = "",
    ) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        duration = max(3.0, float(duration_seconds))
        sr = cls.SAMPLE_RATE
        total_samples = int(sr * duration)
        t = np.linspace(0, duration, total_samples, endpoint=False)

        text = f"{genre} {mood} {title} {content_text}".lower()
        is_cartoon_happy = any(k in text for k in ["cartoon", "happy", "play", "child", "tune", "ground", "comedy", "fun"])
        is_thriller = any(k in text for k in ["thriller", "horror", "mystery", "suspense", "dark"])
        is_scifi = any(k in text for k in ["sci-fi", "scifi", "space", "alien", "signal", "cyber"])

        if is_cartoon_happy:
            audio = cls._synthesize_happy_cartoon_tune(t, duration, sr)
        elif is_thriller:
            audio = cls._synthesize_thriller_score(t, duration, sr)
        elif is_scifi:
            audio = cls._synthesize_scifi_score(t, duration, sr)
        else:
            audio = cls._synthesize_cinematic_score(t, duration, sr)

        # Gentle master fade-in and fade-out to prevent clicks
        fade_len = int(sr * 0.5)
        if total_samples > fade_len * 2:
            fade_in = np.linspace(0.0, 1.0, fade_len)
            fade_out = np.linspace(1.0, 0.0, fade_len)
            audio[:fade_len] *= fade_in
            audio[-fade_len:] *= fade_out

        # Normalize and convert to 16-bit PCM WAV
        max_val = np.max(np.abs(audio))
        if max_val > 0.001:
            audio = (audio / max_val) * 0.85
        audio_int16 = (audio * 32767).astype(np.int16)

        wavfile.write(str(output_path), sr, audio_int16)
        return output_path

    @classmethod
    def _synthesize_happy_cartoon_tune(cls, t: np.ndarray, duration: float, sr: int) -> np.ndarray:
        """
        Synthesizes an upbeat, cheerful cartoon melody with bouncy marimba/bell notes,
        walking bassline, and warm harmonic chords in C Major.
        """
        audio = np.zeros_like(t)

        # Melody: Pentatonic happy motifs (C4, E4, G4, A4, G4, E4, D4, C4, G4, C5)
        # Note frequencies in Hz
        C4, D4, E4, F4, G4, A4, B4, C5, D5, E5 = 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25
        melody_notes = [
            C4, E4, G4, A4, G4, E4, C4, D4,
            E4, G4, C5, A4, G4, E4, D4, C4,
            E4, E4, G4, G4, A4, C5, G4, E4,
            C5, A4, G4, E4, D4, G4, C4, C4
        ]
        note_dur = 0.35  # seconds per beat (~170 BPM cheerful cartoon tempo)

        for i, f in enumerate(melody_notes * int(math.ceil(duration / (len(melody_notes) * note_dur)) + 1)):
            t_start = i * note_dur
            t_end = t_start + note_dur
            if t_start >= duration:
                break
            mask = (t >= t_start) & (t < t_end)
            if not np.any(mask):
                continue
            t_sub = t[mask] - t_start
            # Plucky marimba / glockenspiel envelope (fast attack, exponential decay)
            env = np.exp(-5.0 * t_sub)
            # Fundamental + soft second harmonic for bell/marimba character
            lead = np.sin(2 * np.pi * f * t_sub) + 0.45 * np.sin(4 * np.pi * f * t_sub) + 0.15 * np.sin(6 * np.pi * f * t_sub)
            audio[mask] += lead * env * 0.45

        # Bouncy walking bassline (C3, G2, A2, F2, C3)
        bass_notes = [130.81, 98.00, 110.00, 87.31] # C, G, A, F
        bass_step = note_dur * 2.0
        for i, bf in enumerate(bass_notes * int(math.ceil(duration / (len(bass_notes) * bass_step)) + 1)):
            t_start = i * bass_step
            t_end = t_start + bass_step
            if t_start >= duration:
                break
            mask = (t >= t_start) & (t < t_end)
            if not np.any(mask):
                continue
            t_sub = t[mask] - t_start
            env = np.exp(-3.5 * t_sub)
            bass = np.sin(2 * np.pi * bf * t_sub) + 0.25 * np.sin(4 * np.pi * bf * t_sub)
            audio[mask] += bass * env * 0.35

        # Playful rhythmic pulse (soft wooden tick / snare on upbeats)
        tick_period = note_dur
        tick_phase = (t % tick_period)
        tick_env = np.exp(-40.0 * tick_phase)
        rng = np.random.RandomState(42)
        noise = rng.uniform(-0.1, 0.1, size=len(t))
        audio += noise * tick_env * 0.12

        return audio

    @classmethod
    def _synthesize_scifi_score(cls, t: np.ndarray, duration: float, sr: int) -> np.ndarray:
        """
        Synthesizes atmospheric futuristic synthesizer pads, sub-bass drones, and arpeggios.
        """
        # Low drone at 55 Hz (A1) and 110 Hz (A2)
        drone = 0.3 * np.sin(2 * np.pi * 55.0 * t) + 0.2 * np.sin(2 * np.pi * 110.0 * t + 0.5)
        # Resonant sweep
        sweep = 0.18 * np.sin(2 * np.pi * (220.0 + 35.0 * np.sin(2 * np.pi * 0.15 * t)) * t)
        # Ethereal high harmonics (alien signal shimmer)
        shimmer = 0.12 * np.sin(2 * np.pi * 880.0 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.8 * t))
        audio = drone + sweep + shimmer
        return audio

    @classmethod
    def _synthesize_thriller_score(cls, t: np.ndarray, duration: float, sr: int) -> np.ndarray:
        """
        Synthesizes brooding suspenseful drone, heartbeat sub-thump, and dissonant chord.
        """
        sub_heartbeat = np.zeros_like(t)
        beat_interval = 1.2  # 50 BPM heartbeat
        for beat_t in np.arange(0, duration, beat_interval):
            mask = (t >= beat_t) & (t < beat_t + 0.4)
            t_sub = t[mask] - beat_t
            sub_heartbeat[mask] = np.sin(2 * np.pi * 45.0 * t_sub) * np.exp(-8.0 * t_sub)
        drone = 0.3 * np.sin(2 * np.pi * 73.42 * t) + 0.15 * np.sin(2 * np.pi * 110.0 * t)
        tension = 0.1 * np.sin(2 * np.pi * 587.33 * t) * np.sin(2 * np.pi * 0.2 * t)
        return drone + sub_heartbeat * 0.4 + tension

    @classmethod
    def _synthesize_cinematic_score(cls, t: np.ndarray, duration: float, sr: int) -> np.ndarray:
        """
        Synthesizes warm orchestral harmonic bed (strings/piano chords).
        """
        root = 130.81  # C3
        third = 164.81  # E3
        fifth = 196.00  # G3
        pad = (
            0.28 * np.sin(2 * np.pi * root * t)
            + 0.22 * np.sin(2 * np.pi * third * t)
            + 0.20 * np.sin(2 * np.pi * fifth * t)
        )
        sub = 0.2 * np.sin(2 * np.pi * (root / 2) * t)
        return pad + sub
