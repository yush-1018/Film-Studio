import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './models/db';

const app = createApp();

connectDatabase().catch((err) => {
  console.error('[Film Studio Node Gateway] Initial DB connect error:', err);
});

const server = app.listen(env.PORT, () => {
  console.log(`[Film Studio Node Gateway] Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});

const gracefulShutdown = () => {
  console.log('[Film Studio Node Gateway] Shutting down gracefully...');
  server.close(() => {
    console.log('[Film Studio Node Gateway] Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
