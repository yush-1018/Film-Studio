import { Request, Response, NextFunction } from 'express';
import {
  CreateProjectSchema,
  Project,
  TriggerWorkflowRequestSchema,
  WorkflowRunResponse,
} from '../contracts/types';
import axios from 'axios';
import { env } from '../config/env';
import { ProjectModel } from '../models/project.model';
import { GenerationJobModel } from '../models/generation_job.model';
import { assertDbHealthy } from '../models/db';

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    assertDbHealthy();
    const validatedInput = CreateProjectSchema.parse(req.body);

    const duration = validatedInput.preferences?.durationSeconds ?? 120;
    if (duration < 60 || duration > 300) {
      res.status(400).json({
        success: false,
        error: 'INVALID_DURATION',
        message: `Duration ${duration}s is invalid. Film duration must be between 60s (1 min) and 300s (5 min).`,
      });
      return;
    }

    const projectId = req.body.id || `proj_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const ownerId = req.body.ownerId || 'user_ayush'; // single-tenant dev default

    const inputContent = validatedInput.input?.content || validatedInput.logline || 'A new film story';

    const projectData = {
      id: projectId,
      ownerId,
      title: validatedInput.title,
      logline: validatedInput.logline || inputContent,
      genre: validatedInput.genre,
      aspectRatio: validatedInput.aspectRatio,
      visualStyle: validatedInput.visualStyle,
      input: {
        type: validatedInput.input?.type || 'story',
        content: inputContent,
        audioUrl: validatedInput.input?.audioUrl,
        transcript: validatedInput.input?.transcript,
      },
      preferences: {
        durationSeconds: duration,
        aspectRatio: validatedInput.aspectRatio,
        visualStyle: validatedInput.visualStyle,
        language: validatedInput.preferences?.language || 'en',
        voice: validatedInput.preferences?.voice || { enabled: true, gender: 'neutral', tone: 'cinematic narrator' },
        music: validatedInput.preferences?.music || { enabled: true },
        subtitles: validatedInput.preferences?.subtitles || false,
      },
      status: 'draft' as const,
      characters: [],
      locations: [],
      scenes: [],
      shots: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const created = await ProjectModel.create(projectData);

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    if (error?.code === 'DATABASE_UNAVAILABLE' || error?.status === 503) {
      res.status(503).json({
        success: false,
        error: 'DATABASE_UNAVAILABLE',
        message: 'MongoDB is unreachable. Writes are refused to prevent non-persistent state drift (Rule #12).',
      });
      return;
    }
    next(error);
  }
};

function formatProjectDoc(doc: any) {
  if (!doc) return doc;
  const raw = doc.toObject ? doc.toObject() : { ...doc };
  const masterUrl = raw.master_video_url || raw.masterVideoUrl;
  const masterThumb = raw.master_thumbnail_url || raw.masterThumbnailUrl;
  return {
    ...raw,
    masterVideoUrl: masterUrl,
    master_video_url: masterUrl,
    masterThumbnailUrl: masterThumb,
    master_thumbnail_url: masterThumb,
  };
}

export const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    assertDbHealthy();
    const ownerId = (req.query.ownerId as string) || 'user_ayush';
    const projects = await ProjectModel.find({ ownerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: projects.map(formatProjectDoc),
      total: projects.length,
    });
  } catch (error: any) {
    if (error?.code === 'DATABASE_UNAVAILABLE' || error?.status === 503) {
      res.status(503).json({
        success: false,
        error: 'DATABASE_UNAVAILABLE',
        message: 'MongoDB is unreachable. Database query failed (Rule #12).',
      });
      return;
    }
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    assertDbHealthy();
    const { id } = req.params;
    const project = await ProjectModel.findOne({ id });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${id} not found`,
      });
      return;
    }

    // Ownership check (Rule #9, Loophole #13: single-tenant dev scope)
    const requestingUser = (req.headers['x-user-id'] as string) || 'user_ayush';
    if (project.ownerId && project.ownerId !== requestingUser && requestingUser !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `User ${requestingUser} does not have permission to access project ${id}.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatProjectDoc(project),
    });
  } catch (error: any) {
    if (error?.code === 'DATABASE_UNAVAILABLE' || error?.status === 503) {
      res.status(503).json({
        success: false,
        error: 'DATABASE_UNAVAILABLE',
        message: 'MongoDB is unreachable. Read failed (Rule #12).',
      });
      return;
    }
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    assertDbHealthy();
    const { id } = req.params;
    const project = await ProjectModel.findOne({ id });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${id} not found`,
      });
      return;
    }

    const requestingUser = (req.headers['x-user-id'] as string) || 'user_ayush';
    if (project.ownerId && project.ownerId !== requestingUser && requestingUser !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `User ${requestingUser} does not have permission to modify project ${id}.`,
      });
      return;
    }

    const updated = await ProjectModel.findOneAndUpdate(
      { id },
      { $set: { ...req.body, updatedAt: new Date().toISOString() } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: formatProjectDoc(updated),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    assertDbHealthy();
    const { id } = req.params;
    const project = await ProjectModel.findOne({ id });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${id} not found`,
      });
      return;
    }

    const requestingUser = (req.headers['x-user-id'] as string) || 'user_ayush';
    if (project.ownerId && project.ownerId !== requestingUser && requestingUser !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `User ${requestingUser} does not have permission to delete project ${id}.`,
      });
      return;
    }

    await ProjectModel.deleteOne({ id });

    res.status(200).json({
      success: true,
      message: `Project ${id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    assertDbHealthy();
    const rawPayload = {
      projectId: req.body.projectId || req.params.id,
      workflowType: req.body.workflowType || 'full_pipeline',
      ...req.body,
    };
    if (req.params.id && !req.body.projectId) {
      rawPayload.projectId = req.params.id;
    }
    const validatedPayload = TriggerWorkflowRequestSchema.parse(rawPayload);

    const project = await ProjectModel.findOne({ id: validatedPayload.projectId });
    if (!project) {
      res.status(404).json({
        success: false,
        error: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${validatedPayload.projectId} not found`,
      });
      return;
    }

    const requestingUser = (req.headers['x-user-id'] as string) || 'user_ayush';
    if (project.ownerId && project.ownerId !== requestingUser && requestingUser !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `User ${requestingUser} cannot trigger generation for project ${validatedPayload.projectId}.`,
      });
      return;
    }

    // Build agent payload preserving ground truth story
    const agentPayload = {
      project_id: validatedPayload.projectId,
      workflow_type: validatedPayload.workflowType,
      parameters: {
        ...validatedPayload.parameters,
        title: project.title,
        content: project.input?.content || project.logline,
        logline: project.input?.content || project.logline,
        genre: project.genre,
        duration_seconds: project.preferences?.durationSeconds || 120,
      },
      user_feedback: validatedPayload.userFeedback,
      target_scene_number: validatedPayload.targetSceneNumber,
      target_shot_number: validatedPayload.targetShotNumber,
      interrupt_on_human_approval: validatedPayload.interruptOnHumanApproval ?? false,
    };

    try {
      const response = await axios.post<WorkflowRunResponse>(
        `${env.AGENTS_SERVICE_URL}/api/v1/workflows/trigger`,
        agentPayload,
        { timeout: 15000 }
      );

      // Upsert generation job in MongoDB
      if (response.data?.runId) {
        await GenerationJobModel.findOneAndUpdate(
          { jobId: response.data.runId },
          {
            $set: {
              jobId: response.data.runId,
              projectId: validatedPayload.projectId,
              currentStage: response.data.currentStage || 'understanding',
              progress: response.data.progress || 10,
              stageResults: response.data.stageResults || {},
              costUsed: response.data.costUsed || 0.0,
              costBudget: response.data.costBudget || 15.00,
            },
          },
          { upsert: true, new: true }
        );
      }

      res.status(202).json({
        success: true,
        data: response.data,
      });
    } catch (err: any) {
      // RULE #15: No silent fake fallback! Return genuine 503
      console.error('[Workflow Trigger] Failed to reach agent backend:', err?.message);
      res.status(503).json({
        success: false,
        error: 'AGENTS_SERVICE_UNAVAILABLE',
        message: 'The agent compute engine is currently offline or unreachable. Workflow cannot be queued.',
      });
      return;
    }
  } catch (error: any) {
    if (error?.code === 'DATABASE_UNAVAILABLE' || error?.status === 503) {
      res.status(503).json({
        success: false,
        error: 'DATABASE_UNAVAILABLE',
        message: 'MongoDB is unreachable. Cannot trigger generation (Rule #12).',
      });
      return;
    }
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

    // Check MongoDB first for persistent job checkpoint (Rule #10)
    try {
      assertDbHealthy();
      const dbJob = await GenerationJobModel.findOne({ jobId: runId });
      if (dbJob) {
        res.status(200).json({
          success: true,
          data: {
            runId: dbJob.jobId,
            projectId: dbJob.projectId,
            currentStage: dbJob.currentStage,
            progress: dbJob.progress,
            stageResults: dbJob.stageResults,
            costUsed: dbJob.costUsed,
            costBudget: dbJob.costBudget,
            errorMessage: dbJob.errorMessage,
          },
        });
        return;
      }
    } catch {
      // Fall through to agent service if DB check fails
    }

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

export const triggerAgentWorkflow = triggerWorkflow;

