import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error]', err);

  // Zod errors
  if (err.name === 'ZodError') {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      details: err.errors,
    });
    return;
  }

  // Domain errors
  if (err.code && typeof err.code === 'string') {
    res.status(400).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Fallback safe error
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err?.message || 'An unexpected error occurred',
  });
};
