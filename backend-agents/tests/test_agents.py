import asyncio
from fastapi.testclient import TestClient
from app.agents.scriptwriter_agent import ScriptwriterAgent
from app.agents.storyboard_agent import StoryboardAgent
from app.models.contracts import ProductionStrategy
from app.main import app


def test_scriptwriter_agent():
    async def _test():
        agent = ScriptwriterAgent()
        result = await agent.run(
            project_id="proj_test_script",
            title="Nebula Protocol",
            logline="An astronaut detects an ancient distress call from inside a dying star.",
            genre="Hard Sci-Fi",
            duration_seconds=120,
        )

        assert result.title == "NEBULA PROTOCOL"
        assert result.genre == "Hard Sci-Fi"
        assert len(result.scenes) >= 3
        assert len(result.suggested_characters) >= 1
        assert result.fountain_full_script is not None

        for scene in result.scenes:
            assert scene.scene_number > 0
            assert len(scene.shots) > 0
            for shot in scene.shots:
                assert shot.shot_number.startswith("Shot")
                assert shot.duration > 0
                assert shot.camera_directive != ""

    asyncio.run(_test())


def test_storyboard_agent():
    async def _test():
        writer = ScriptwriterAgent()
        script_result = await writer.run(
            project_id="proj_test_storyboard",
            title="The Last Signal",
            logline="A student discovers a signal.",
            genre="Sci-Fi Thriller",
        )

        storyboard_agent = StoryboardAgent()
        sb_result = await storyboard_agent.run(
            project_id="proj_test_storyboard",
            script_data=script_result,
        )

        assert sb_result.project_id == "proj_test_storyboard"
        assert sb_result.total_shots > 0
        assert sb_result.estimated_cost > 0
        assert sb_result.remaining_budget >= 0
        assert len(sb_result.scenes) == len(script_result.scenes)

        # Verify strategy assignments
        all_strategies = [
            shot.strategy
            for sc in sb_result.scenes
            for shot in sc.shots
        ]
        assert ProductionStrategy.VIDEO in all_strategies
        assert ProductionStrategy.IMAGE_MOTION in all_strategies

    asyncio.run(_test())


def test_workflow_trigger_script_and_storyboard():
    client = TestClient(app)

    # 1. Trigger Script Ideation Workflow
    script_payload = {
        "project_id": "proj_end_to_end",
        "workflow_type": "script_ideation",
        "parameters": {
            "title": "Quantum Echo",
            "logline": "A physicist hears voices from tomorrow.",
            "genre": "Psychological Sci-Fi",
            "duration_seconds": 120,
        },
        "interrupt_on_human_approval": False,
    }
    res1 = client.post("/api/v1/workflows/trigger", json=script_payload)
    assert res1.status_code == 202
    data1 = res1.json()
    assert data1["status"] == "completed"
    assert "scriptwriter_agent" in data1["completed_nodes"]
    assert data1["result"] is not None
    assert len(data1["result"]["scenes"]) >= 3

    # 2. Trigger Storyboard Workflow using scenes generated
    storyboard_payload = {
        "project_id": "proj_end_to_end",
        "workflow_type": "script_to_storyboard",
        "parameters": {
            "scenes": data1["result"]["scenes"],
        },
        "interrupt_on_human_approval": False,
    }
    res2 = client.post("/api/v1/workflows/trigger", json=storyboard_payload)
    assert res2.status_code == 202
    data2 = res2.json()
    assert data2["status"] == "completed"
    assert "storyboard_agent" in data2["completed_nodes"]
    assert data2["result"]["total_shots"] > 0
    assert data2["result"]["estimated_cost"] > 0
