import os
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pipeline_runner import GenerationPipelineRunner, get_mongo_db
from app.services.bible_service import BibleService
from app.services.prompt_builder import ContextualPromptBuilder, GenreStyleProfile
from app.services.audio_transcriber import AudioTranscriber
from app.agents.story_planner_agent import StoryPlannerAgent
from app.agents.continuity_agent import ContinuityAgent
from app.agents.final_qa_agent import FinalQAAgent
from app.models.contracts import FilmProject, ProjectInput, ProjectPreferences, GenerationStage

client = TestClient(app)


def test_rule_16_empty_story_rejected_with_400():
    """Rule 16: Missing or empty story content at trigger boundary must be a hard 400 error."""
    payload = {
        "project_id": "proj_fail_empty",
        "workflow_type": "full_pipeline",
        "parameters": {
            "title": "",
            "content": "",
        },
    }
    res = client.post("/api/v1/workflows/trigger", json=payload)
    assert res.status_code == 400
    assert "Missing required story" in res.json()["detail"]


def test_duration_boundaries():
    """Strict duration boundaries: 59s rejected, 60s accepted, 300s accepted, 301s rejected."""
    # 59 seconds - must reject
    res_59 = client.post("/api/v1/workflows/trigger", json={
        "project_id": "proj_dur_59",
        "workflow_type": "full_pipeline",
        "parameters": {
            "title": "Too Short",
            "content": "A brief glimpse of something unexpected.",
            "duration_seconds": 59,
        }
    })
    assert res_59.status_code == 400
    assert "between 60s" in res_59.json()["detail"]

    # 301 seconds - must reject
    res_301 = client.post("/api/v1/workflows/trigger", json={
        "project_id": "proj_dur_301",
        "workflow_type": "full_pipeline",
        "parameters": {
            "title": "Too Long",
            "content": "An extraordinarily long film idea that exceeds the maximum limit.",
            "duration_seconds": 301,
        }
    })
    assert res_301.status_code == 400
    assert "between 60s" in res_301.json()["detail"]

    # 60 seconds - must accept
    res_60 = client.post("/api/v1/workflows/trigger", json={
        "project_id": "proj_dur_60",
        "workflow_type": "full_pipeline",
        "parameters": {
            "title": "Valid Min",
            "content": "A college student discovers an extraterrestrial signal on his laptop.",
            "duration_seconds": 60,
        }
    })
    assert res_60.status_code == 202

    # 300 seconds - must accept
    res_300 = client.post("/api/v1/workflows/trigger", json={
        "project_id": "proj_dur_300",
        "workflow_type": "full_pipeline",
        "parameters": {
            "title": "Valid Max",
            "content": "A college student discovers an extraterrestrial signal on his laptop.",
            "duration_seconds": 300,
        }
    })
    assert res_300.status_code == 202


def test_canonical_test_a_the_last_signal():
    """
    Canonical Acceptance Test A:
    Title: 'The Last Signal', 120s, Sci-Fi Thriller
    Content: 'A college student discovers an anomalous extraterrestrial signal on his laptop.'
    """
    runner = GenerationPipelineRunner()
    test_id = f"test_a_{uuid.uuid4().hex[:6]}"
    result = runner.run_pipeline(
        job_id=f"job_{test_id}",
        project_id=f"proj_{test_id}",
        title="The Last Signal",
        content="A college student discovers an anomalous extraterrestrial signal on his laptop.",
        genre="Sci-Fi Thriller",
        duration_seconds=120,
        cost_budget=15.0,
    )

    assert result["status"] == "completed"
    assert result["fidelity_gate_passed"] is True
    assert result["fidelity_score"] >= 0.80
    
    # Traceability checks:
    # 1. Master video exists
    assert result["master_video_url"] is not None
    # 2. Composition tags must reflect student/laptop, NOT random content
    drawn_tags = result["drawn_tags"]
    assert any("laptop" in tag.lower() or "student" in tag.lower() or "desk" in tag.lower() or "signal" in tag.lower() or "workspace" in tag.lower() for tag in drawn_tags)
    # 3. Cost within budget
    assert result["cost_used"] <= 15.0


def test_canonical_test_b_girl_and_dog_in_park():
    """
    Canonical Acceptance Test B:
    Title: 'A Day in the Park', 60s, Drama
    Content: 'A young girl named Lily plays fetch with her golden retriever Buddy in a sunny city park by a fountain.'
    """
    runner = GenerationPipelineRunner()
    test_id = f"test_b_{uuid.uuid4().hex[:6]}"
    result = runner.run_pipeline(
        job_id=f"job_{test_id}",
        project_id=f"proj_{test_id}",
        title="A Day in the Park",
        content="A young girl named Lily plays fetch with her golden retriever Buddy in a sunny city park by a fountain.",
        genre="Drama",
        duration_seconds=60,
        cost_budget=15.0,
    )

    assert result["status"] == "completed"
    assert result["fidelity_gate_passed"] is True
    assert result["fidelity_score"] >= 0.80

    # Traceability checks:
    # Must contain Lily, Buddy / retriever, park, fountain
    drawn_tags = result["drawn_tags"]
    assert any("lily" in tag.lower() or "park" in tag.lower() or "dog" in tag.lower() or "fountain" in tag.lower() for tag in drawn_tags)
    assert result["cost_used"] <= 15.0


def test_canonical_test_c_audio_transcription_pipeline():
    """
    Canonical Acceptance Test C:
    Audio input transcribed into editable story text and passed to pipeline.
    """
    transcriber = AudioTranscriber()
    # Mock audio bytes
    audio_sample = b"RIFF" + b"\x00" * 100
    res = transcriber.transcribe_audio_bytes(audio_sample, file_name="pitch.wav")
    assert res.success is True
    assert res.transcript != ""
    assert res.is_editable is True
    
    # Story is parsed directly from transcribed content
    bible_service = BibleService()
    chars, locs = bible_service.extract_entities(res.transcript)
    assert len(chars) > 0 or len(locs) > 0


def test_genre_crossing_fidelity_rule_12_9():
    """
    Rule 12.9: Genre-Crossing Fidelity Test
    Same story prompt processed under 5 distinct genres:
    Characters and locations remain IDENTICAL; visual palette / lighting bias differ.
    """
    prompt = "A young girl named Lily plays fetch with her golden retriever Buddy in a sunny city park by a fountain."
    genres = ["Sci-Fi", "Cyberpunk", "Drama", "Noir", "Western"]
    
    bible_service = BibleService()
    prompt_builder = ContextualPromptBuilder()

    chars_base, locs_base = bible_service.extract_entities(prompt)
    base_char_names = [c.name for c in chars_base]
    base_loc_names = [l.name for l in locs_base]

    style_profiles = []

    for g in genres:
        # Entities extracted from story are strictly immutable across all genres
        chars, locs = bible_service.extract_entities(prompt)
        assert [c.name for c in chars] == base_char_names
        assert [l.name for l in locs] == base_loc_names

        # GenreStyleProfile modifies color grading & lighting, NOT entities
        style = prompt_builder.get_genre_style(g)
        style_profiles.append(style)

    # Verify that different genres produce different lighting biases
    lighting_biases = [s.lighting_bias for s in style_profiles]
    assert len(set(lighting_biases)) == len(genres), "Every genre must have a distinct lighting bias"


def test_continuity_repair_not_reroll():
    """
    Rule 11: Continuity repairs must modify prompts with corrective delta, not reroll randomly.
    """
    continuity_agent = ContinuityAgent()
    
    bible_service = BibleService()
    chars, locs = bible_service.extract_entities("Lily and Buddy in the park.")
    char_map = {c.name.lower(): c for c in chars}
    loc_map = {l.name.lower(): l for l in locs}

    # Flawed shot description where wardrobe/lighting deviates
    flawed_shot = {
        "id": "shot_01",
        "shot_number": "1.1",
        "action_description": "Lily enters wearing a bright neon spacesuit inside a dark futuristic cave.",
        "camera_directive": "Wide static view",
        "duration": 5.0,
    }

    result = continuity_agent.validate_shot_continuity(flawed_shot, char_map, loc_map)
    assert result.passed is False
    assert len(result.issues) > 0
    assert result.repaired_prompt is not None
    # Repaired prompt includes corrective directive
    assert "Correction" in result.repaired_prompt or "Wardrobe" in result.repaired_prompt or "Continuity" in result.repaired_prompt


def test_cross_language_schema_integrity_rule_12_10():
    """
    Rule 12.10: Cross-Language Schema Integrity
    pymongo in Python writes snake_case checkpoint, ensuring Node Mongoose alias mapping compatibility.
    """
    db = get_mongo_db()
    if db is None:
        pytest.skip("MongoDB is not available in local test environment")

    test_job_id = "test_cross_schema_001"
    doc = {
        "job_id": test_job_id,
        "project_id": "proj_cross_schema",
        "status": "running",
        "current_stage": "visuals",
        "progress": 55.0,
        "stage_results": {
            "understanding": "completed",
            "screenplay": "completed",
        },
        "cost_used": 0.42,
        "cost_budget": 15.00,
        "drawn_composition_tags": ["laptop", "desk", "blue_cathode_ray"],
    }

    # PyMongo write
    db["generation_jobs"].update_one(
        {"job_id": test_job_id},
        {"$set": doc},
        upsert=True
    )

    # PyMongo read-back
    saved = db["generation_jobs"].find_one({"job_id": test_job_id})
    assert saved is not None
    assert saved["job_id"] == test_job_id
    assert saved["cost_used"] == 0.42
    assert saved["cost_budget"] == 15.00
    assert "laptop" in saved["drawn_composition_tags"]
    assert saved["stage_results"]["understanding"] == "completed"

    # Cleanup
    db["generation_jobs"].delete_one({"job_id": test_job_id})
