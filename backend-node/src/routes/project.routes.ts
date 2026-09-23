import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
  triggerAgentWorkflow,
  getWorkflowStatus,
} from '../controllers/project.controller';

export const projectRouter = Router();

projectRouter.post('/', createProject);
projectRouter.get('/', listProjects);
projectRouter.post('/workflows/trigger', triggerAgentWorkflow);
projectRouter.get('/workflows/:runId/state', getWorkflowStatus);
projectRouter.post('/:id/generate', triggerAgentWorkflow);
projectRouter.get('/:id', getProjectById);
projectRouter.put('/:id', updateProject);
projectRouter.delete('/:id', deleteProject);


