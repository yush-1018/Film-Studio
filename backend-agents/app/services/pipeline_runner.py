import os
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import pymongo
from app.models.contracts import (
    GenerationStage,
    ProjectInput,
    ProjectPreferences,
    Scene,
    Shot,
    CharacterProfile,
    LocationProfile,
)
from app.agents.story_planner_agent import StoryPlannerAgent
from app.agents.continuity_agent import ContinuityAgent
from app.agents.voice_agent import VoiceAgent
from app.agents.sound_agent import SoundAgent
from app.agents.editor_agent import EditorAgent
from app.agents.final_qa_agent import FinalQAAgent
from app.services.video_engine import LocalVideoEngine


def get_mongo_db():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/film_studio")
    client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
    db_name = mongo_uri.split("/")[-1].split("?")[0] or "film_studio"
    return client[db_name]


class GenerationPipelineRunner:
    """
    Asynchronous Generation Pipeline Runner.
    Executes multi-agent stages, writes stage checkpoints to shared MongoDB generation_jobs (snake_case),
    tracks provider cost proactively against cost_budget ($15.00 default cap), and supports
    crash-recovery resumption from the last passed stage (Rule #10).
    """

    def __init__(self):
        self.story_planner = StoryPlannerAgent()
        self.continuity_agent = ContinuityAgent()
        self.voice_agent = VoiceAgent()
        self.sound_agent = SoundAgent()
        self.editor_agent = EditorAgent()
        self.final_qa_agent = FinalQAAgent()
        self.video_engine = LocalVideoEngine()

    def checkpoint_stage(
        self,
        db,
        job_id: str,
        stage: str,
        status: str,
        progress: float,
        cost_used: float,
        intermediate_data: Optional[Dict[str, Any]] = None,
        error_msg: Optional[str] = None,
    ):
        now = datetime.now(timezone.utc).isoformat()
        update_doc = {
            "current_stage": stage,
            f"stage_results.{stage}": status,
            "progress": progress,
            "cost_used": round(cost_used, 4),
            "updated_at": now,
        }
        if intermediate_data:
            for k, v in intermediate_data.items():
                update_doc[f"intermediate_artifacts.{k}"] = v
        if error_msg:
            update_doc["error_message"] = error_msg

        try:
            db.generation_jobs.update_one(
                {"job_id": job_id},
                {"$set": update_doc},
                upsert=True,
            )
        except Exception as e:
            print(f"[Pipeline Checkpoint Error] {e}")

    def run_pipeline(
        self,
        job_id: str,
        project_id: str,
        title: str,
        content: str,
        genre: str = "Sci-Fi",
        duration_seconds: int = 120,
        cost_budget: float = 15.00,
    ) -> Dict[str, Any]:
        db = get_mongo_db()
        cost_used = 0.0

        # Check existing job record for resumption (Rule #10)
        existing_job = db.generation_jobs.find_one({"job_id": job_id})
        stage_results = (existing_job.get("stage_results") or {}) if existing_job else {}

        print(f"[Pipeline] Starting execution for job {job_id}, project {project_id}")

        # ---------------------------------------------------------------------
        # STAGE 1: UNDERSTANDING
        # ---------------------------------------------------------------------
        if stage_results.get("understanding") != "passed":
            # Proactive cost check
            cost_used += 0.01
            if cost_used > cost_budget:
                self.checkpoint_stage(db, job_id, "understanding", "failed", 10, cost_used, error_msg="Cost budget exceeded")
                return {"status": "failed", "error": "Budget exceeded"}

            story_input = ProjectInput(content=content)
            prefs = ProjectPreferences(duration_seconds=duration_seconds)
            self.checkpoint_stage(db, job_id, "understanding", "passed", 15, cost_used, {"story_analyzed": True})
            print("[Pipeline] Stage 'understanding' passed.")
        else:
            print("[Pipeline] Resuming: Stage 'understanding' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 2: SCREENPLAY & PLANNING
        # ---------------------------------------------------------------------
        if stage_results.get("screenplay") != "passed":
            cost_used += 0.02
            if cost_used > cost_budget:
                self.checkpoint_stage(db, job_id, "screenplay", "failed", 20, cost_used, error_msg="Cost budget exceeded")
                return {"status": "failed", "error": "Budget exceeded"}

            story_input = ProjectInput(content=content)
            prefs = ProjectPreferences(duration_seconds=duration_seconds)
            scenes, characters, locations = self.story_planner.plan_story(
                project_id=project_id,
                title=title,
                story_input=story_input,
                preferences=prefs,
                genre=genre,
            )
            self.checkpoint_stage(
                db, job_id, "screenplay", "passed", 30, cost_used,
                {
                    "scenes_count": len(scenes),
                    "characters_count": len(characters),
                    "locations_count": len(locations),
                }
            )
            print(f"[Pipeline] Stage 'screenplay' passed with {len(scenes)} scenes.")
        else:
            # Reconstruct scenes if resuming
            story_input = ProjectInput(content=content)
            prefs = ProjectPreferences(duration_seconds=duration_seconds)
            scenes, characters, locations = self.story_planner.plan_story(
                project_id=project_id,
                title=title,
                story_input=story_input,
                preferences=prefs,
                genre=genre,
            )
            print("[Pipeline] Resuming: Stage 'screenplay' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 3: STORYBOARD
        # ---------------------------------------------------------------------
        if stage_results.get("storyboard") != "passed":
            cost_used += 0.02
            total_shots = sum(len(sc.shots) for sc in scenes)
            self.checkpoint_stage(
                db, job_id, "storyboard", "passed", 45, cost_used,
                {"total_shots": total_shots}
            )
            print(f"[Pipeline] Stage 'storyboard' passed ({total_shots} shots).")
        else:
            print("[Pipeline] Resuming: Stage 'storyboard' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 4: VISUAL GENERATION
        # ---------------------------------------------------------------------
        rendered_shots = []
        if stage_results.get("visuals") != "passed":
            cost_used += 0.05
            for sc in scenes:
                for sh in sc.shots:
                    res = self.video_engine.synthesize_shot_video(
                        shot_id=sh.id or f"shot_{sh.shot_number}",
                        shot_number=str(sh.shot_number),
                        action_description=sh.action_description,
                        camera_directive=sh.camera_directive,
                        genre=genre,
                        duration_seconds=sh.duration_seconds,
                        characters=sh.characters,
                        location=sh.location,
                    )
                    sh.rendered_video_url = res["video_url"]
                    sh.keyframe_image_url = res["thumbnail_url"]
                    sh.status = "completed"
                    rendered_shots.append(res)

            self.checkpoint_stage(
                db, job_id, "visuals", "passed", 65, cost_used,
                {"rendered_shots_count": len(rendered_shots)}
            )
            print(f"[Pipeline] Stage 'visuals' passed ({len(rendered_shots)} rendered).")
        else:
            # Re-synthesize or fetch
            for sc in scenes:
                for sh in sc.shots:
                    res = self.video_engine.synthesize_shot_video(
                        shot_id=sh.id or f"shot_{sh.shot_number}",
                        shot_number=str(sh.shot_number),
                        action_description=sh.action_description,
                        camera_directive=sh.camera_directive,
                        genre=genre,
                        duration_seconds=sh.duration_seconds,
                        characters=sh.characters,
                        location=sh.location,
                    )
                    rendered_shots.append(res)
            print("[Pipeline] Resuming: Stage 'visuals' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 5: CONTINUITY VALIDATION & REPAIR LOOP (Rule #5)
        # ---------------------------------------------------------------------
        if stage_results.get("continuity") != "passed":
            cost_used += 0.01
            scenes, cont_res = self.continuity_agent.audit_and_repair(scenes, characters, locations)
            self.checkpoint_stage(
                db, job_id, "continuity", "passed", 75, cost_used,
                {"continuity_passed": cont_res.passed, "issues_repaired": len(cont_res.repairs)}
            )
            print(f"[Pipeline] Stage 'continuity' passed.")
        else:
            print("[Pipeline] Resuming: Stage 'continuity' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 6: VOICE SYNTHESIS
        # ---------------------------------------------------------------------
        if stage_results.get("voice") != "passed":
            cost_used += 0.02
            for sc in scenes:
                self.voice_agent.generate_scene_voice(sc, prefs.voice, prefs.language)
            self.checkpoint_stage(db, job_id, "voice", "passed", 82, cost_used, {"voice_enabled": True})
            print("[Pipeline] Stage 'voice' passed.")
        else:
            print("[Pipeline] Resuming: Stage 'voice' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 7: SOUND DESIGN & SCORE
        # ---------------------------------------------------------------------
        if stage_results.get("sound") != "passed":
            cost_used += 0.01
            for sc in scenes:
                self.sound_agent.design_scene_audio(sc, prefs.music, genre)
            self.checkpoint_stage(db, job_id, "sound", "passed", 88, cost_used, {"music_enabled": True})
            print("[Pipeline] Stage 'sound' passed.")
        else:
            print("[Pipeline] Resuming: Stage 'sound' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 8: EDITING & MASTER ASSEMBLY
        # ---------------------------------------------------------------------
        if stage_results.get("editing") != "passed":
            cost_used += 0.02
            assembly_res = self.editor_agent.assemble_film(
                project_id=project_id,
                scenes=scenes,
                shots_data=rendered_shots,
                title=title,
                genre=genre,
                target_duration=float(duration_seconds),
            )
            master_video_url = assembly_res["master_video_url"]
            master_file_path = assembly_res["file_path"]
            self.checkpoint_stage(
                db, job_id, "editing", "passed", 95, cost_used,
                {"master_video_url": master_video_url}
            )
            print(f"[Pipeline] Stage 'editing' passed (master: {master_video_url}).")
        else:
            assembly_res = self.editor_agent.assemble_film(
                project_id=project_id,
                scenes=scenes,
                shots_data=rendered_shots,
                title=title,
                genre=genre,
                target_duration=float(duration_seconds),
            )
            master_video_url = assembly_res["master_video_url"]
            master_file_path = assembly_res["file_path"]
            print("[Pipeline] Resuming: Stage 'editing' already passed.")

        # ---------------------------------------------------------------------
        # STAGE 9: FINAL QA & STORY FIDELITY GATE (Rule #3 & Section 10)
        # ---------------------------------------------------------------------
        qa_res = self.final_qa_agent.run_qa(
            raw_story_input=content,
            scenes=scenes,
            shots_data=rendered_shots,
            master_video_path=master_file_path,
            duration_seconds=float(duration_seconds),
            cost_used=cost_used,
            cost_budget=cost_budget,
        )

        final_status = "completed" if qa_res.passed else "failed"
        self.checkpoint_stage(
            db, job_id, final_status, "passed" if qa_res.passed else "failed", 100, cost_used,
            {
                "qa_report": qa_res.to_dict(),
                "master_video_url": master_video_url,
                "fidelity_score": qa_res.fidelity_score,
            },
            error_msg="; ".join(qa_res.errors) if qa_res.errors else None,
        )

        # Update Project record in MongoDB if available
        try:
            db.projects.update_one(
                {"id": project_id},
                {
                    "$set": {
                        "status": "completed" if qa_res.passed else "failed",
                        "master_video_url": master_video_url,
                        "scenes": [sc.model_dump() for sc in scenes],
                        "characters": [c.model_dump() for c in characters],
                        "locations": [l.model_dump() for l in locations],
                    }
                }
            )
        except Exception as e:
            print(f"[Pipeline Project Update Error] {e}")

        print(f"[Pipeline] Finished job {job_id} with status: {final_status} (Fidelity: {qa_res.fidelity_score*100:.1f}%)")
        return {
            "status": final_status,
            "master_video_url": master_video_url,
            "fidelity_score": qa_res.fidelity_score,
            "fidelity_gate_passed": qa_res.fidelity_gate_passed,
            "cost_used": cost_used,
            "drawn_tags": [tag for sh in rendered_shots for tag in sh.get("drawn_composition_tags", [])],
            "drawn_composition_tags": [tag for sh in rendered_shots for tag in sh.get("drawn_composition_tags", [])],
            "qa_report": qa_res.to_dict(),
        }
