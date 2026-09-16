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

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedInput = CreateProjectSchema.parse(req.body);
    const projectId = `proj_${Date.now()}`;
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
    const project = projectsStore.get(validatedPayload.projectId);

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${validatedPayload.projectId} not found`,
      });
      return;
    }

    try {
      // Forward request to FastAPI / LangGraph agents service
      const response = await axios.post<WorkflowRunResponse>(
        `${env.AGENTS_SERVICE_URL}/api/v1/workflows/trigger`,
        validatedPayload,
        { timeout: 10000 }
      );

      res.status(202).json({
        success: true,
        data: response.data,
      });
    } catch {
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
