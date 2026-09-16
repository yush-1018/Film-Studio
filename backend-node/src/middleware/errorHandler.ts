import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      details: err.errors,
    });
    return;
  }

  const errorMessage = err instanceof Error ? err.message : 'Unknown internal server error';
  const errorStack = err instanceof Error && process.env.NODE_ENV === 'development' ? err.stack : undefined;

  console.error('[Error Middleware]:', errorMessage, errorStack);

  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: errorMessage,
    ...(errorStack ? { stack: errorStack } : {}),
  });
}
