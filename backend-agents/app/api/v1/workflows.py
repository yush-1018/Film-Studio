from datetime import datetime, timezone
import uuid
from typing import Dict
from fastapi import APIRouter, HTTPException, status

from app.agents.scriptwriter_agent import ScriptwriterAgent
from app.agents.storyboard_agent import StoryboardAgent
from app.agents.visual_generation_agent import VisualGenerationAgent
from app.models.contracts import (
    ResumeWorkflowRequest,
    TriggerWorkflowRequest,
    WorkflowRunResponse,
    WorkflowRunStatus,
    WorkflowType,
)
from app.providers.factory import provider_registry
from app.providers.base import LLMMessage, LLMRequest

workflows_router = APIRouter(prefix="/workflows", tags=["Workflows"])

# In-memory execution state store for dev and CI
workflow_runs_store: Dict[str, WorkflowRunResponse] = {}


@workflows_router.post("/trigger", response_model=WorkflowRunResponse, status_code=status.HTTP_202_ACCEPTED)
async def trigger_workflow(payload: TriggerWorkflowRequest):
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    status_code = (
        WorkflowRunStatus.WAITING_FOR_APPROVAL
        if payload.interrupt_on_human_approval
        else WorkflowRunStatus.COMPLETED
    )

    result_data = None
    intermediate_artifacts = {}
    completed_nodes = ["workflow_initializer"]
    current_node = None

    if payload.workflow_type == WorkflowType.SCRIPT_IDEATION:
        scriptwriter = ScriptwriterAgent()
        title = payload.parameters.get("title", "The Last Signal")
        logline = payload.parameters.get(
            "logline",
            "A college student discovers an anomalous extraterrestrial signal on his laptop."
        )
        genre = payload.parameters.get("genre", "Sci-Fi Thriller")
        duration = int(payload.parameters.get("duration_seconds", 120))

        script_result = await scriptwriter.run(
            project_id=payload.project_id,
            title=title,
            logline=logline,
            genre=genre,
            duration_seconds=duration,
            user_feedback=payload.user_feedback,
            parameters=payload.parameters,
        )

        completed_nodes.append("scriptwriter_agent")
        current_node = "script_review_node" if payload.interrupt_on_human_approval else None
        intermediate_artifacts = {
            "agent_executed": "Scriptwriter Agent",
            "scenes_count": len(script_result.scenes),
            "suggested_characters": script_result.suggested_characters,
            "fountain_script": script_result.fountain_full_script,
        }
        result_data = script_result.model_dump()

    elif payload.workflow_type == WorkflowType.SCRIPT_TO_STORYBOARD:
        storyboard_agent = StoryboardAgent()
        scenes_input = payload.parameters.get("scenes")

        storyboard_result = await storyboard_agent.run(
            project_id=payload.project_id,
            scenes=scenes_input,
            user_feedback=payload.user_feedback,
            parameters=payload.parameters,
        )

        completed_nodes.append("storyboard_agent")
        current_node = "storyboard_review_node" if payload.interrupt_on_human_approval else None
        intermediate_artifacts = {
            "agent_executed": "Storyboard & Production Intelligence Agent",
            "total_shots": storyboard_result.total_shots,
            "estimated_cost": storyboard_result.estimated_cost,
            "potential_savings": storyboard_result.potential_savings,
            "optimization_suggestion": storyboard_result.optimization_suggestion,
        }
        result_data = storyboard_result.model_dump()

    elif payload.workflow_type == WorkflowType.SCENE_SYNTHESIS:
        visual_agent = VisualGenerationAgent()
        scene_num = payload.target_scene_number or int(payload.parameters.get("scene_number", 1))
        shots_input = payload.parameters.get("shots")

        synthesis_result = await visual_agent.run(
            project_id=payload.project_id,
            scene_number=scene_num,
            shots=shots_input,
            user_feedback=payload.user_feedback,
            parameters=payload.parameters,
        )

        completed_nodes.append("visual_generation_agent")
        current_node = "video_review_node" if payload.interrupt_on_human_approval else None
        intermediate_artifacts = {
            "agent_executed": "Visual Generation Agent",
            "total_rendered": synthesis_result.total_rendered,
            "scene_number": synthesis_result.scene_number,
        }
        result_data = synthesis_result.model_dump()

    else:
        # Fallback generic provider execution

        llm_adapter = provider_registry.get_llm_adapter()
        llm_response = await llm_adapter.generate_text(
            LLMRequest(
                messages=[
                    LLMMessage(role="system", content="You are a virtual film studio production agent."),
                    LLMMessage(
                        role="user",
                        content=f"Initialize workflow {payload.workflow_type.value} for project {payload.project_id}",
                    ),
                ]
            )
        )
        current_node = "generic_task_node"
        intermediate_artifacts = {
            "initial_agent_note": llm_response.text,
            "provider_used": llm_adapter.provider_name,
        }

    run_response = WorkflowRunResponse(
        run_id=run_id,
        project_id=payload.project_id,
        workflow_type=payload.workflow_type,
        status=status_code,
        current_node=current_node,
        completed_nodes=completed_nodes,
        intermediate_artifacts=intermediate_artifacts,
        result=result_data,
        error_message=None,
        created_at=now,
        updated_at=now,
    )

    workflow_runs_store[run_id] = run_response
    return run_response



@workflows_router.get("/{run_id}/state", response_model=WorkflowRunResponse)
async def get_workflow_state(run_id: str):
    if run_id not in workflow_runs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow run with ID {run_id} not found",
        )
    return workflow_runs_store[run_id]


@workflows_router.post("/{run_id}/resume", response_model=WorkflowRunResponse)
async def resume_workflow(run_id: str, payload: ResumeWorkflowRequest):
    if run_id not in workflow_runs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow run with ID {run_id} not found",
        )

    current_state = workflow_runs_store[run_id]
    now = datetime.now(timezone.utc).isoformat()

    if payload.approved:
        current_state.status = WorkflowRunStatus.COMPLETED
        current_state.completed_nodes.append(current_state.current_node or "human_review")
        current_state.current_node = None
        current_state.result = {
            "summary": "Workflow completed successfully following approval.",
            "reviewer_feedback": payload.reviewer_feedback,
        }
    else:
        current_state.status = WorkflowRunStatus.FAILED
        current_state.error_message = f"Rejected during human review: {payload.reviewer_feedback or 'No feedback given'}"

    current_state.updated_at = now
    workflow_runs_store[run_id] = current_state
    return current_state


@workflows_router.post("/{run_id}/cancel", response_model=WorkflowRunResponse)
async def cancel_workflow(run_id: str):
    if run_id not in workflow_runs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow run with ID {run_id} not found",
        )

    current_state = workflow_runs_store[run_id]
    current_state.status = WorkflowRunStatus.CANCELLED
    current_state.updated_at = datetime.now(timezone.utc).isoformat()
    workflow_runs_store[run_id] = current_state
    return current_state
