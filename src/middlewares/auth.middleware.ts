import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';

interface JwtPayload {
  userId: number;
  email: string;
  name: string | null;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(new AppError(401, 'Unauthorized'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name ?? null,
    };
    next();
  } catch {
    next(new AppError(401, 'Unauthorized'));
  }
}
