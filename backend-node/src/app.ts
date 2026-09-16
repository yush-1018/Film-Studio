import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRouter } from './routes/health.routes';
import { projectRouter } from './routes/project.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    })
  );
  app.use(express.json());

  // Mount Routes
  app.use('/api', healthRouter);
  app.use('/api/v1/projects', projectRouter);

  // Fallback 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'ROUTE_NOT_FOUND',
      path: req.originalUrl,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
