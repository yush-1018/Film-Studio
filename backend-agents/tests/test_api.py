import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "film-studio-backend-agents"


def test_readiness_endpoint():
    response = client.get("/api/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert "default_providers" in data


def test_workflow_trigger_and_state():
    trigger_payload = {
        "project_id": "proj_test_001",
        "workflow_type": "script_to_storyboard",
        "parameters": {
            "title": "Neon Grid",
            "logline": "A netrunner hacks into an orbital mainframe.",
            "style": "cyberpunk",
        },
        "interrupt_on_human_approval": True,
    }

    # Trigger workflow
    trigger_res = client.post("/api/v1/workflows/trigger", json=trigger_payload)
    assert trigger_res.status_code == 202
    data = trigger_res.json()
    run_id = data["run_id"]
    assert run_id.startswith("run_")
    assert data["status"] in ["running", "queued", "waiting_for_approval"]

    # Query state
    state_res = client.get(f"/api/v1/workflows/{run_id}/state")
    assert state_res.status_code == 200
    state_data = state_res.json()
    assert state_data["run_id"] == run_id

    # Resume workflow with approval
    resume_payload = {
        "run_id": run_id,
        "approved": True,
        "reviewer_feedback": "Looks great, proceed with generation.",
    }
    resume_res = client.post(f"/api/v1/workflows/{run_id}/resume", json=resume_payload)
    assert resume_res.status_code == 200
    completed_data = resume_res.json()
    assert completed_data["status"] == "completed"
    assert completed_data["result"]["reviewer_feedback"] == "Looks great, proceed with generation."
