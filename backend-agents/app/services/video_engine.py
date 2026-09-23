import os
import math
import random
import cv2
import numpy as np
from pathlib import Path
from typing import Tuple, Dict, Any, Optional, List
from app.models.contracts import GenreStyleProfile
from app.services.prompt_builder import ContextualPromptBuilder


class EntityVisualExtractor:
    """
    Analyzes shot metadata, action descriptions, characters, and locations
    to extract literal scene entities (settings, characters, props, actions).
    Enforces Rule #1: visual composition is keyed to actual story entities.
    """

    @staticmethod
    def extract_scene_entities(
        action_description: str,
        camera_directive: str,
        characters: Optional[List[str]] = None,
        location: Optional[str] = None,
    ) -> Dict[str, Any]:
        text = f"{action_description} {camera_directive} {location or ''} {' '.join(characters or [])}".lower()
        entities = {
            "setting": "room",
            "characters": [],
            "props": [],
            "camera_motion": "push_in",
            "atmosphere": "dim",
        }

        # Setting extraction
        if any(k in text for k in ["station", "railway", "train", "platform", "tracks"]):
            entities["setting"] = "railway_station"
        elif any(k in text for k in ["fountain", "stone fountain"]):
            entities["setting"] = "park_fountain"
        elif any(k in text for k in ["park", "trees", "lawn", "grass", "grove"]):
            entities["setting"] = "city_park"
        elif any(k in text for k in ["apartment", "desk", "computer", "workspace", "terminal"]):
            entities["setting"] = "apartment_workspace"
        else:
            entities["setting"] = "cinematic_environment"

        # Character extraction
        if "alex" in text or "hacker" in text:
            entities["characters"].append("alex_hacker")
        if "girl" in text or "child" in text or "lily" in text:
            entities["characters"].append("young_girl")
        if "dog" in text or "buddy" in text or "retriever" in text:
            entities["characters"].append("golden_dog")
        if not entities["characters"]:
            entities["characters"].append("protagonist_silhouette")

        # Props extraction
        if any(k in text for k in ["signal", "waveform", "monitor", "laptop", "screen"]):
            entities["props"].append("signal_terminal")
        if any(k in text for k in ["device", "artifact", "core", "futuristic"]):
            entities["props"].append("glowing_device")
        if any(k in text for k in ["fountain", "water", "spray"]):
            entities["props"].append("water_fountain")
        if any(k in text for k in ["ball", "red ball"]):
            entities["props"].append("toy_ball")

        # Camera trajectory
        if "pan" in text:
            entities["camera_motion"] = "pan"
        elif "zoom" in text or "close-up" in text:
            entities["camera_motion"] = "zoom"
        elif "orbit" in text or "circle" in text:
            entities["camera_motion"] = "orbit"
        elif "tracking" in text or "dolly" in text:
            entities["camera_motion"] = "dolly"
        else:
            entities["camera_motion"] = "push_in"

        return entities


class SemanticSceneCompositor:
    """
    Procedural scene compositor that draws authentic, story-derived visual layers:
    1. Background environment (apartment workspace, railway platform, city park, water fountain).
    2. Character silhouettes and postures (hacker, girl, companion dog).
    3. Foreground props (monitors with signal pulses, glowing futuristic device, water sprays).
    4. Post-content GenreStyleProfile color grade & lighting bias (Rule #11).
    5. Emits drawn_composition_tags as a deterministic byproduct of layers drawn (Rule #14).
    """

    def __init__(self, output_dir: Path):
        self.output_dir = output_dir

    def render_shot(
        self,
        shot_id: str,
        action_description: str,
        camera_directive: str,
        genre: str = "Sci-Fi",
        characters: Optional[List[str]] = None,
        location: Optional[str] = None,
        duration_seconds: float = 4.0,
        fps: int = 24,
        width: int = 720,
        height: int = 405,
    ) -> Tuple[str, str, List[str]]:
        clean_id = "".join(c if c.isalnum() or c in "-_" else "_" for c in shot_id)
        mp4_filename = f"gen_{clean_id}.mp4"
        jpg_filename = f"gen_{clean_id}.jpg"

        mp4_path = self.output_dir / mp4_filename
        jpg_path = self.output_dir / jpg_filename

        total_frames = max(24, int(duration_seconds * fps))
        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        writer = cv2.VideoWriter(str(mp4_path), fourcc, fps, (width, height))

        # 1. Extract story entities (Rule #1)
        entities = EntityVisualExtractor.extract_scene_entities(
            action_description, camera_directive, characters, location
        )

        # 2. Get post-styling GenreStyleProfile (Rule #11)
        genre_style = ContextualPromptBuilder.get_genre_style(genre)

        # Track drawn composition tags deterministically (Rule #14)
        drawn_tags: List[str] = []

        mid_frame_idx = total_frames // 2
        mid_frame = None

        # Seed random generator by shot_id for reproducible visual variation
        rng = random.Random(abs(hash(shot_id)) % (2**31))

        # Precompute particle states
        num_particles = 60
        particles = [
            [rng.uniform(0, width), rng.uniform(0, height), rng.uniform(1, 3), rng.uniform(0.5, 2.0)]
            for _ in range(num_particles)
        ]

        for frame_idx in range(total_frames):
            t = frame_idx / float(max(1, total_frames - 1))

            # Base layer canvas
            canvas = np.zeros((height, width, 3), dtype=np.uint8)

            # LAYER 1: Draw setting environment
            setting = entities["setting"]
            if setting == "apartment_workspace":
                self._draw_apartment_environment(canvas, width, height, t, frame_idx)
                if "environment:apartment_workspace" not in drawn_tags:
                    drawn_tags.append("environment:apartment_workspace")
            elif setting == "railway_station":
                self._draw_railway_station(canvas, width, height, t, frame_idx)
                if "environment:railway_station" not in drawn_tags:
                    drawn_tags.append("environment:railway_station")
            elif setting == "city_park":
                self._draw_city_park(canvas, width, height, t, frame_idx)
                if "environment:city_park" not in drawn_tags:
                    drawn_tags.append("environment:city_park")
            elif setting == "park_fountain":
                self._draw_park_fountain(canvas, width, height, t, frame_idx)
                if "environment:park_fountain" not in drawn_tags:
                    drawn_tags.append("environment:park_fountain")
            else:
                self._draw_cinematic_gradient(canvas, width, height, t)
                if "environment:cinematic_landscape" not in drawn_tags:
                    drawn_tags.append("environment:cinematic_landscape")

            # LAYER 2: Draw Character silhouettes & figures
            for char in entities["characters"]:
                if char == "alex_hacker":
                    self._draw_hacker_silhouette(canvas, width, height, t)
                    if "character:alex_hacker" not in drawn_tags:
                        drawn_tags.append("character:alex_hacker")
                elif char == "young_girl":
                    self._draw_girl_figure(canvas, width, height, t)
                    if "character:young_girl" not in drawn_tags:
                        drawn_tags.append("character:young_girl")
                elif char == "golden_dog":
                    self._draw_dog_figure(canvas, width, height, t)
                    if "character:companion_dog" not in drawn_tags:
                        drawn_tags.append("character:companion_dog")
                elif char == "protagonist_silhouette":
                    self._draw_protagonist_silhouette(canvas, width, height, t)
                    if "character:protagonist" not in drawn_tags:
                        drawn_tags.append("character:protagonist")

            # LAYER 3: Draw Props
            for prop in entities["props"]:
                if prop == "signal_terminal":
                    self._draw_signal_waveform(canvas, width, height, frame_idx)
                    if "prop:signal_terminal_waveform" not in drawn_tags:
                        drawn_tags.append("prop:signal_terminal_waveform")
                elif prop == "glowing_device":
                    self._draw_glowing_device(canvas, width, height, frame_idx)
                    if "prop:futuristic_device_core" not in drawn_tags:
                        drawn_tags.append("prop:futuristic_device_core")
                elif prop == "water_fountain":
                    self._draw_fountain_particles(canvas, width, height, particles, frame_idx)
                    if "prop:water_fountain_spray" not in drawn_tags:
                        drawn_tags.append("prop:water_fountain_spray")

            # LAYER 4: POST-STYLING GenreStyleProfile (Rule #11)
            # Apply color grading LUT & lighting bias without modifying underlying entities
            canvas = self._apply_genre_grading(canvas, genre_style, width, height)

            # LAYER 5: Subtle cinematic camera motion (dolly / push-in)
            motion = entities["camera_motion"]
            canvas = self._apply_camera_motion(canvas, motion, t, width, height)

            if frame_idx == mid_frame_idx:
                mid_frame = canvas.copy()

            writer.write(canvas)

        writer.release()

        # Save frame-accurate video thumbnail from actual rendered mid-frame
        if mid_frame is not None:
            cv2.imwrite(str(jpg_path), mid_frame)

        return str(mp4_path), str(jpg_path), drawn_tags

    def _draw_apartment_environment(self, canvas: np.ndarray, w: int, h: int, t: float, f: int):
        # Room walls with dark ambient gradient
        cv2.rectangle(canvas, (0, 0), (w, int(h * 0.7)), (18, 14, 22), -1)
        # Wooden desk surface
        cv2.rectangle(canvas, (0, int(h * 0.65)), (w, h), (28, 22, 18), -1)
        # Dual monitors on desk
        cv2.rectangle(canvas, (int(w * 0.2), int(h * 0.25)), (int(w * 0.48), int(h * 0.65)), (40, 40, 45), -1)
        cv2.rectangle(canvas, (int(w * 0.22), int(h * 0.28)), (int(w * 0.46), int(h * 0.62)), (15, 30, 45), -1)
        cv2.rectangle(canvas, (int(w * 0.52), int(h * 0.22)), (int(w * 0.82), int(h * 0.65)), (40, 40, 45), -1)
        cv2.rectangle(canvas, (int(w * 0.54), int(h * 0.25)), (int(w * 0.80), int(h * 0.62)), (12, 28, 40), -1)

    def _draw_railway_station(self, canvas: np.ndarray, w: int, h: int, t: float, f: int):
        # Night sky through roof
        cv2.rectangle(canvas, (0, 0), (w, h), (12, 14, 18), -1)
        # Steel truss roof girders
        for x in range(0, w, 120):
            cv2.line(canvas, (x, 0), (x + 60, int(h * 0.4)), (35, 40, 45), 3)
            cv2.line(canvas, (x + 60, int(h * 0.4)), (x + 120, 0), (35, 40, 45), 3)
        # Concrete platform
        pts = np.array([[0, int(h * 0.6)], [int(w * 0.45), int(h * 0.6)], [int(w * 0.35), h], [0, h]], np.int32)
        cv2.fillPoly(canvas, [pts], (45, 48, 52))
        # Rusted train tracks on right
        for r_y in range(int(h * 0.65), h, 18):
            cv2.line(canvas, (int(w * 0.5), r_y), (w, int(r_y + (r_y - h * 0.65) * 0.2)), (60, 50, 40), 2)
        # Fog layer
        fog_alpha = 0.25 + 0.08 * math.sin(f * 0.08)
        fog = np.full((h, w, 3), (80, 85, 95), dtype=np.uint8)
        cv2.addWeighted(fog, fog_alpha, canvas, 1.0 - fog_alpha, 0, canvas)

    def _draw_city_park(self, canvas: np.ndarray, w: int, h: int, t: float, f: int):
        # Sunlit summer sky
        cv2.rectangle(canvas, (0, 0), (w, int(h * 0.5)), (220, 180, 130), -1)
        # Lush grass lawn
        cv2.rectangle(canvas, (0, int(h * 0.45)), (w, h), (40, 110, 50), -1)
        # Shady park trees in background
        tree_centers = [(int(w * 0.15), int(h * 0.42)), (int(w * 0.4), int(h * 0.38)), (int(w * 0.85), int(h * 0.4))]
        for tx, ty in tree_centers:
            cv2.rectangle(canvas, (tx - 8, ty), (tx + 8, ty + 70), (35, 55, 70), -1)
            cv2.circle(canvas, (tx, ty - 10), 45, (30, 95, 40), -1)
            cv2.circle(canvas, (tx - 15, ty), 35, (45, 120, 55), -1)
        # Winding stone walkway
        path_pts = np.array([[int(w * 0.3), h], [int(w * 0.45), int(h * 0.5)], [int(w * 0.55), int(h * 0.5)], [int(w * 0.7), h]], np.int32)
        cv2.fillPoly(canvas, [path_pts], (140, 150, 155))

    def _draw_park_fountain(self, canvas: np.ndarray, w: int, h: int, t: float, f: int):
        # Park background
        self._draw_city_park(canvas, w, h, t, f)
        # Center tiered stone fountain basin
        cx, cy = int(w * 0.5), int(h * 0.65)
        # Base basin
        cv2.ellipse(canvas, (cx, cy + 25), (140, 35), 0, 0, 360, (110, 115, 120), -1)
        cv2.ellipse(canvas, (cx, cy + 22), (130, 28), 0, 0, 360, (160, 130, 70), -1) # water inside
        # Middle tier pedestal
        cv2.rectangle(canvas, (cx - 18, cy - 25), (cx + 18, cy + 20), (120, 125, 130), -1)
        cv2.ellipse(canvas, (cx, cy - 25), (65, 16), 0, 0, 360, (135, 140, 145), -1)
        cv2.ellipse(canvas, (cx, cy - 27), (58, 12), 0, 0, 360, (180, 150, 85), -1)

    def _draw_cinematic_gradient(self, canvas: np.ndarray, w: int, h: int, t: float):
        for y in range(h):
            ratio = y / float(h)
            canvas[y, :] = (int(15 + 25 * ratio), int(12 + 20 * ratio), int(25 + 35 * ratio))

    def _draw_hacker_silhouette(self, canvas: np.ndarray, w: int, h: int, t: float):
        # Alex seated in hoodie at desk
        cx, cy = int(w * 0.35 + 10 * math.sin(t * 3.14)), int(h * 0.62)
        # Torso / hoodie
        cv2.ellipse(canvas, (cx, cy), (40, 55), 0, 0, 360, (18, 18, 22), -1)
        # Head with hood
        cv2.circle(canvas, (cx, cy - 60), 22, (15, 15, 18), -1)
        # Hands on keyboard
        cv2.ellipse(canvas, (cx + 15, cy + 30), (12, 6), 0, 0, 360, (130, 110, 95), -1)

    def _draw_girl_figure(self, canvas: np.ndarray, w: int, h: int, t: float):
        # Young girl Lily in yellow coat
        gx = int(w * 0.42 + 25 * math.sin(t * 2.5))
        gy = int(h * 0.68)
        # Yellow raincoat body
        pts = np.array([[gx - 18, gy + 35], [gx + 18, gy + 35], [gx + 12, gy], [gx - 12, gy]], np.int32)
        cv2.fillPoly(canvas, [pts], (20, 200, 230)) # BGR bright yellow
        # Head and braided hair
        cv2.circle(canvas, (gx, gy - 16), 14, (140, 160, 205), -1) # skin
        cv2.circle(canvas, (gx - 10, gy - 12), 7, (25, 45, 80), -1) # hair braid
        cv2.circle(canvas, (gx + 10, gy - 12), 7, (25, 45, 80), -1)

    def _draw_dog_figure(self, canvas: np.ndarray, w: int, h: int, t: float):
        # Golden retriever dog Buddy
        dx = int(w * 0.62 + 20 * math.sin(t * 2.8))
        dy = int(h * 0.74)
        # Dog body (golden fur)
        cv2.ellipse(canvas, (dx, dy), (28, 16), 0, 0, 360, (50, 140, 210), -1)
        # Dog head & snout
        cv2.circle(canvas, (dx - 22, dy - 12), 12, (55, 150, 225), -1)
        cv2.ellipse(canvas, (dx - 30, dy - 8), (9, 6), 0, 0, 360, (40, 120, 190), -1)
        # Red collar
        cv2.line(canvas, (dx - 18, dy - 8), (dx - 18, dy + 2), (30, 30, 220), 3)
        # Wagging tail
        tail_angle = 0.5 * math.sin(t * 15.0)
        tx = int(dx + 26 + 12 * math.cos(tail_angle))
        ty = int(dy - 8 - 12 * math.sin(tail_angle))
        cv2.line(canvas, (dx + 24, dy), (tx, ty), (50, 140, 210), 4)

    def _draw_protagonist_silhouette(self, canvas: np.ndarray, w: int, h: int, t: float):
        cx, cy = int(w * 0.5), int(h * 0.68)
        cv2.ellipse(canvas, (cx, cy), (32, 50), 0, 0, 360, (20, 20, 25), -1)
        cv2.circle(canvas, (cx, cy - 55), 18, (18, 18, 22), -1)

    def _draw_signal_waveform(self, canvas: np.ndarray, w: int, h: int, f: int):
        # Draw oscilloscope cyan signal pulses on the right monitor
        x_start, x_end = int(w * 0.55), int(w * 0.79)
        base_y = int(h * 0.43)
        points = []
        for x in range(x_start, x_end, 3):
            # Dynamic signal pulse with spikes
            phase = (x - x_start) * 0.08 + f * 0.25
            spike = math.sin(phase) * 18.0 + 8.0 * math.sin(phase * 2.5)
            y = int(base_y + spike)
            points.append((x, y))
        for i in range(len(points) - 1):
            cv2.line(canvas, points[i], points[i + 1], (255, 230, 0), 2) # Cyan BGR
            cv2.circle(canvas, points[i], 1, (255, 255, 120), -1)

    def _draw_glowing_device(self, canvas: np.ndarray, w: int, h: int, f: int):
        # Mysterious futuristic glowing device hidden beneath platform
        cx, cy = int(w * 0.68), int(h * 0.78)
        pulse = 0.7 + 0.3 * math.sin(f * 0.2)
        radius = int(22 * pulse)
        # Core glowing rings
        cv2.circle(canvas, (cx, cy), radius + 14, (120, 70, 20), -1)
        cv2.circle(canvas, (cx, cy), radius + 6, (220, 140, 40), -1)
        cv2.circle(canvas, (cx, cy), radius, (255, 255, 220), -1) # bright core

    def _draw_fountain_particles(self, canvas: np.ndarray, w: int, h: int, particles: list, f: int):
        cx, cy = int(w * 0.5), int(h * 0.62)
        # Fountain water jets spraying upwards
        for p in particles:
            p[1] += p[3] * 1.5
            p[0] += (p[0] - cx) * 0.02
            if p[1] > cy + 20:
                p[0] = cx + random.uniform(-8, 8)
                p[1] = cy - 30 + random.uniform(-10, 0)
            cv2.circle(canvas, (int(p[0]), int(p[1])), int(p[2]), (240, 210, 160), -1)

    def _apply_genre_grading(self, canvas: np.ndarray, genre_style: GenreStyleProfile, w: int, h: int) -> np.ndarray:
        g = genre_style.genre.lower()
        if "horror" in g:
            # Desaturate + dark shadows + red emphasis
            gray = cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)
            desat = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
            canvas = cv2.addWeighted(canvas, 0.4, desat, 0.6, 0)
            canvas[:, :, 2] = np.clip(canvas[:, :, 2].astype(np.int16) + 18, 0, 255).astype(np.uint8) # Boost Red
        elif "thriller" in g:
            # Chiaroscuro high contrast
            canvas = cv2.convertScaleAbs(canvas, alpha=1.25, beta=-15)
        elif "sci-fi" in g:
            # Cyan / teal push in shadows and mids
            canvas[:, :, 0] = np.clip(canvas[:, :, 0].astype(np.int16) + 20, 0, 255).astype(np.uint8) # Boost Blue
            canvas[:, :, 1] = np.clip(canvas[:, :, 1].astype(np.int16) + 10, 0, 255).astype(np.uint8) # Boost Green
        elif "romance" in g:
            # Warm golden glow
            canvas[:, :, 2] = np.clip(canvas[:, :, 2].astype(np.int16) + 16, 0, 255).astype(np.uint8) # Warm Red
            canvas[:, :, 1] = np.clip(canvas[:, :, 1].astype(np.int16) + 8, 0, 255).astype(np.uint8)
        elif "comedy" in g:
            # High key bright
            canvas = cv2.convertScaleAbs(canvas, alpha=1.1, beta=15)
        return canvas

    def _apply_camera_motion(self, canvas: np.ndarray, motion: str, t: float, w: int, h: int) -> np.ndarray:
        if motion == "push_in":
            scale = 1.0 + 0.05 * t
            M = cv2.getRotationMatrix2D((w / 2, h / 2), 0, scale)
            return cv2.warpAffine(canvas, M, (w, h))
        elif motion == "pan":
            tx = int(15.0 * math.sin(t * 3.14))
            M = np.float32([[1, 0, tx], [0, 1, 0]])
            return cv2.warpAffine(canvas, M, (w, h))
        return canvas


class LocalVideoEngine:
    """
    Main Video Engine façade wrapping SemanticSceneCompositor.
    Replaces genre-only canned visuals with genuine, entity-composed video rendering.
    """

    def __init__(self):
        current_dir = Path(__file__).resolve().parent
        project_root = current_dir.parent.parent.parent
        self.output_dir = project_root / "frontend" / "public" / "generated_videos"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.compositor = SemanticSceneCompositor(self.output_dir)

    def synthesize_shot_video(
        self,
        shot_id: str,
        shot_number: str,
        action_description: str,
        camera_directive: str,
        genre: str = "Sci-Fi",
        model_name: str = "Semantic Compositor",
        duration_seconds: float = 3.5,
        fps: int = 24,
        width: int = 720,
        height: int = 405,
        characters: Optional[List[str]] = None,
        location: Optional[str] = None,
    ) -> Dict[str, Any]:
        mp4_path, jpg_path, drawn_tags = self.compositor.render_shot(
            shot_id=shot_id,
            action_description=action_description,
            camera_directive=camera_directive,
            genre=genre,
            characters=characters,
            location=location,
            duration_seconds=duration_seconds,
            fps=fps,
            width=width,
            height=height,
        )

        mp4_filename = Path(mp4_path).name
        jpg_filename = Path(jpg_path).name

        return {
            "shot_id": shot_id,
            "video_url": f"/generated_videos/{mp4_filename}",
            "thumbnail_url": f"/generated_videos/{jpg_filename}",
            "file_path": mp4_path,
            "thumbnail_path": jpg_path,
            "duration_seconds": duration_seconds,
            "status": "ready",
            "model_used": model_name,
            "genre": genre,
            "drawn_composition_tags": drawn_tags, # Emitted directly from drawing log (Rule #14)
        }

    def assemble_master_video(
        self,
        project_id: str,
        shots_data: List[Dict[str, Any]],
        title: str = "Master Film",
        genre: str = "Sci-Fi",
        target_duration: float = 120.0,
    ) -> Dict[str, Any]:
        clean_proj = "".join(c if c.isalnum() or c in "-_" else "_" for c in project_id)
        master_mp4 = f"master_{clean_proj}_{int(target_duration)}s.mp4"
        master_jpg = f"master_{clean_proj}_{int(target_duration)}s.jpg"
        master_path = self.output_dir / master_mp4
        master_jpg_path = self.output_dir / master_jpg

        fps = 24
        w, h = 720, 405
        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        writer = cv2.VideoWriter(str(master_path), fourcc, fps, (w, h))

        all_drawn_tags: List[str] = []
        first_thumbnail = None

        for shot in shots_data:
            shot_file = shot.get("file_path")
            if shot_file and os.path.exists(shot_file):
                cap = cv2.VideoCapture(shot_file)
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    if first_thumbnail is None:
                        first_thumbnail = frame.copy()
                    writer.write(frame)
                cap.release()
            for tag in shot.get("drawn_composition_tags", []):
                if tag not in all_drawn_tags:
                    all_drawn_tags.append(tag)

        writer.release()

        if first_thumbnail is not None:
            cv2.imwrite(str(master_jpg_path), first_thumbnail)

        return {
            "master_video_url": f"/generated_videos/{master_mp4}",
            "master_thumbnail_url": f"/generated_videos/{master_jpg}",
            "file_path": str(master_path),
            "target_duration": target_duration,
            "drawn_composition_tags": all_drawn_tags,
        }
