import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProjectById,
  triggerAgentWorkflow,
} from '../controllers/project.controller';

export const projectRouter = Router();

projectRouter.post('/', createProject);
projectRouter.get('/', listProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.post('/workflows/trigger', triggerAgentWorkflow);
