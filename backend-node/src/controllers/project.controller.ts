import { Request, Response, NextFunction } from 'express';
import {
  CreateProjectSchema,
  Project,
  TriggerWorkflowRequestSchema,
  WorkflowRunResponse,
} from '../contracts/types';
import axios from 'axios';
import { env } from '../config/env';

// In-memory mock store for development and testing
const projectsStore = new Map<string, Project>();

// Auto-seed demo project "proj_last_signal"
projectsStore.set('proj_last_signal', {
  id: 'proj_last_signal',
  title: 'THE LAST SIGNAL',
  logline: 'A college student discovers a strange signal on his laptop late at night.',
  genre: 'Sci-Fi Thriller',
  aspectRatio: '16:9',
  visualStyle: 'cinematic_35mm',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'storyboarding',
  characters: [],
  scenes: [],
});

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedInput = CreateProjectSchema.parse(req.body);
    const projectId = req.body.id || `proj_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newProject: Project = {
      ...validatedInput,
      id: projectId,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'draft',
      characters: [],
      scenes: [],
    };

    projectsStore.set(projectId, newProject);

    res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = Array.from(projectsStore.values());
    res.status(200).json({
      success: true,
      data: projects,
      total: projects.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const project = projectsStore.get(id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerAgentWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedPayload = TriggerWorkflowRequestSchema.parse(req.body);
    let project = projectsStore.get(validatedPayload.projectId);

    if (!project) {
      // Auto-register project so workflow is never blocked
      project = {
        id: validatedPayload.projectId,
        title: (validatedPayload.parameters?.title as string) || 'New Production',
        logline: (validatedPayload.parameters?.logline as string) || 'Autonomous cinematic project.',
        genre: (validatedPayload.parameters?.genre as string) || 'Cinematic',
        aspectRatio: '16:9',
        visualStyle: 'cinematic_35mm',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        characters: [],
        scenes: [],
      };
      projectsStore.set(validatedPayload.projectId, project);
    }

    try {
      // Forward request to FastAPI / LangGraph agents service
      const agentPayload = {
        project_id: validatedPayload.projectId,
        workflow_type: validatedPayload.workflowType,
        parameters: validatedPayload.parameters || {},
        user_feedback: validatedPayload.userFeedback,
        target_scene_number: validatedPayload.targetSceneNumber,
        target_shot_number: validatedPayload.targetShotNumber,
        interrupt_on_human_approval: validatedPayload.interruptOnHumanApproval ?? true,
      };

      const response = await axios.post<WorkflowRunResponse>(
        `${env.AGENTS_SERVICE_URL}/api/v1/workflows/trigger`,
        agentPayload,
        { timeout: 15000 }
      );

      res.status(202).json({
        success: true,
        data: response.data,
      });
    } catch (err: any) {
      console.warn('[Workflow Trigger] Failed to reach agent backend, falling back to local simulation:', err?.message);
      // If agents service is not reachable in dev or mock mode, generate fallback workflow run response
      const fallbackRun: WorkflowRunResponse = {
        runId: `run_${Date.now()}`,
        projectId: validatedPayload.projectId,
        workflowType: validatedPayload.workflowType,
        status: 'queued',
        completedNodes: [],
        intermediateArtifacts: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.status(202).json({
        success: true,
        note: 'Agents service offline; queued locally via fallback response',
        data: fallbackRun,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getWorkflowStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { runId } = req.params;
    const response = await axios.get(
      `${env.AGENTS_SERVICE_URL}/api/v1/workflows/${runId}/state`,
      { timeout: 5000 }
    );
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    res.status(error?.response?.status || 500).json({
      success: false,
      error: error?.message || 'FAILED_TO_FETCH_WORKFLOW_STATE',
    });
  }
};

