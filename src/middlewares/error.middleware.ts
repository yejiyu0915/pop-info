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
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isProduction = env.NODE_ENV === 'production';

  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    statusCode,
  });

  if (statusCode >= 500 && isProduction) {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  res.status(statusCode).json({
    message: err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
