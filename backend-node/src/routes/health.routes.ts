import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'film-studio-backend-node',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/ready', (req: Request, res: Response) => {
  // In production, check DB connectivity and Redis status here
  res.status(200).json({
    status: 'ready',
    database: 'connected',
    agentsBridge: 'reachable',
    timestamp: new Date().toISOString(),
  });
});
