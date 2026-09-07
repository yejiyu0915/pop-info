import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isUniqueConstraint = (err as { code?: string }).code === 'P2002';
  const statusCode = err instanceof AppError ? err.statusCode : isUniqueConstraint ? 409 : 500;
  const isProduction = env.NODE_ENV === 'production';

  console.error('[Error]', {
    message: isUniqueConstraint ? 'Resource already exists' : err.message,
    stack: err.stack,
    statusCode,
  });

  if (statusCode >= 500 && isProduction) {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  res.status(statusCode).json({
    message: isUniqueConstraint ? 'Resource already exists' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
