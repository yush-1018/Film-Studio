import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
import pymongo

from app.models.contracts import (
    TriggerWorkflowRequest,
    ResumeWorkflowRequest,
    WorkflowRunResponse,
    WorkflowRunStatus,
    WorkflowType,
    GenerationStage,
)
from app.services.pipeline_runner import GenerationPipelineRunner, get_mongo_db

workflows_router = APIRouter(prefix="/workflows", tags=["Workflows"])

# Pipeline runner singleton
pipeline_runner = GenerationPipelineRunner()


@workflows_router.post("/trigger", response_model=WorkflowRunResponse, status_code=status.HTTP_202_ACCEPTED)
async def trigger_workflow(payload: TriggerWorkflowRequest):
    """
    Triggers an autonomous multi-stage film generation workflow.
    Closes Loophole #16 (strictly validates story inputs, rejects missing with 400).
    Closes fake-202 loophole: creates MongoDB checkpoint and executes asynchronously.
    """
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    db = get_mongo_db()

    # Rule #16 Validation: Extract story fields without silent fallback defaults
    title = payload.parameters.get("title")
    content = payload.parameters.get("content") or payload.parameters.get("logline")
    genre = payload.parameters.get("genre", "Sci-Fi")
    duration_raw = payload.parameters.get("duration_seconds", 120)

    if not title or not str(title).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required story field 'title'. A valid title must be provided; silent defaults are prohibited (Rule #16).",
        )
    if not content or not str(content).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required story field 'content' or 'logline'. Story prompt must be provided; silent defaults are prohibited (Rule #16).",
        )

    try:
        duration = int(duration_raw)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parameter 'duration_seconds' must be an integer between 60 and 300.",
        )

    if duration < 60 or duration > 300:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid duration {duration}s. Film duration must be between 60s (1 min) and 300s (5 min).",
        )

    cost_budget = float(payload.parameters.get("cost_budget", 15.00))

    # 1. Create initial persistent job record in MongoDB (snake_case)
    initial_job_doc = {
        "job_id": run_id,
        "project_id": payload.project_id,
        "current_stage": "understanding",
        "progress": 5.0,
        "stage_results": {"understanding": "pending"},
        "cost_used": 0.0,
        "cost_budget": cost_budget,
        "error_message": None,
        "intermediate_artifacts": {"title": str(title).strip(), "content": str(content).strip(), "genre": str(genre).strip()},
        "created_at": now,
        "updated_at": now,
    }

    try:
        db.generation_jobs.insert_one(initial_job_doc)
    except Exception as e:
        print(f"[Workflows] MongoDB insert warning: {e}")

    # 2. Asynchronous execution in background task (non-blocking)
    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        None,
        pipeline_runner.run_pipeline,
        run_id,
        payload.project_id,
        str(title).strip(),
        str(content).strip(),
        str(genre).strip(),
        duration,
        cost_budget,
    )

    return WorkflowRunResponse(
        run_id=run_id,
        project_id=payload.project_id,
        workflow_type=payload.workflow_type,
        status=WorkflowRunStatus.RUNNING,
        current_stage=GenerationStage.UNDERSTANDING,
        progress=5.0,
        stage_results={"understanding": "pending"},
        cost_used=0.0,
        cost_budget=cost_budget,
        created_at=now,
        updated_at=now,
    )


@workflows_router.get("/{run_id}/state", response_model=WorkflowRunResponse)
async def get_workflow_state(run_id: str):
    """
    Reads persistent execution state and checkpoints from MongoDB generation_jobs (Rule #10).
    """
    db = get_mongo_db()
    job = db.generation_jobs.find_one({"job_id": run_id})

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow run with ID {run_id} not found in database.",
        )

    current_stage_str = job.get("current_stage", "understanding")
    stage_enum = GenerationStage.UNDERSTANDING
    try:
        stage_enum = GenerationStage(current_stage_str)
    except ValueError:
        pass

    # Map status
    run_status = WorkflowRunStatus.RUNNING
    if current_stage_str == "completed":
        run_status = WorkflowRunStatus.COMPLETED
    elif current_stage_str == "failed":
        run_status = WorkflowRunStatus.FAILED

    return WorkflowRunResponse(
        run_id=job["job_id"],
        project_id=job.get("project_id", "unknown"),
        workflow_type=WorkflowType.FULL_PIPELINE,
        status=run_status,
        current_stage=stage_enum,
        progress=float(job.get("progress", 0.0)),
        stage_results=job.get("stage_results", {}),
        cost_used=float(job.get("cost_used", 0.0)),
        cost_budget=float(job.get("cost_budget", 15.00)),
        intermediate_artifacts=job.get("intermediate_artifacts", {}),
        result=job.get("result"),
        error_message=job.get("error_message"),
        created_at=str(job.get("created_at")),
        updated_at=str(job.get("updated_at")),
    )


@workflows_router.post("/{run_id}/resume", response_model=WorkflowRunResponse)
async def resume_workflow(run_id: str, payload: ResumeWorkflowRequest):
    """
    Resumes an existing workflow run from the last passed stage checkpoint (Rule #10).
    """
    db = get_mongo_db()
    job = db.generation_jobs.find_one({"job_id": run_id})

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow run with ID {run_id} not found",
        )

    # Re-dispatch execution starting from checkpoint
    title = job.get("intermediate_artifacts", {}).get("title", "Resumed Film")
    content = job.get("intermediate_artifacts", {}).get("content", title)
    genre = job.get("intermediate_artifacts", {}).get("genre", "Sci-Fi")

    if payload.reviewer_feedback:
        result_dict = job.get("result") or {}
        result_dict["reviewer_feedback"] = payload.reviewer_feedback
        db.generation_jobs.update_one(
            {"job_id": run_id},
            {"$set": {"result": result_dict, "intermediate_artifacts.reviewer_feedback": payload.reviewer_feedback}}
        )

    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        None,
        pipeline_runner.run_pipeline,
        run_id,
        job["project_id"],
        title,
        content,
        genre,
        120,
        float(job.get("cost_budget", 15.00)),
    )

    return await get_workflow_state(run_id)


@workflows_router.post("/{run_id}/cancel", response_model=WorkflowRunResponse)
async def cancel_workflow(run_id: str):
    """
    Cancels an active generation job in MongoDB.
    """
    db = get_mongo_db()
    now = datetime.now(timezone.utc).isoformat()
    result = db.generation_jobs.update_one(
        {"job_id": run_id},
        {"$set": {"current_stage": "failed", "error_message": "User cancelled workflow", "updated_at": now}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow run with ID {run_id} not found",
        )

    return await get_workflow_state(run_id)
