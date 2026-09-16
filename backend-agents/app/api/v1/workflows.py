from datetime import datetime, timezone
import uuid
from typing import Dict
from fastapi import APIRouter, HTTPException, status

from app.models.contracts import (
    ResumeWorkflowRequest,
    TriggerWorkflowRequest,
    WorkflowRunResponse,
    WorkflowRunStatus,
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

    # Pre-simulate initial graph execution using provider adapters
    llm_adapter = provider_registry.get_llm_adapter()
    llm_response = await llm_adapter.generate_text(
        LLMRequest(
            messages=[
                LLMMessage(role="system", content="You are a narrative film script agent."),
                LLMMessage(
                    role="user",
                    content=f"Initialize workflow {payload.workflow_type.value} for project {payload.project_id}",
                ),
            ]
        )
    )

    run_response = WorkflowRunResponse(
        run_id=run_id,
        project_id=payload.project_id,
        workflow_type=payload.workflow_type,
        status=WorkflowRunStatus.RUNNING if not payload.interrupt_on_human_approval else WorkflowRunStatus.WAITING_FOR_APPROVAL,
        current_node="script_breakdown_node",
        completed_nodes=["workflow_initializer"],
        intermediate_artifacts={
            "initial_agent_note": llm_response.text,
            "provider_used": llm_adapter.provider_name,
        },
        result=None,
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
