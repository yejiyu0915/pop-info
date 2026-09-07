import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { UserRole } from '../modules/users/dto/user-role.enum';
import { AppError } from './error.middleware';

interface JwtPayload {
  userId: number;
  email: string;
  name: string | null;
  role?: UserRole;
}

async function setUserFromToken(req: Request, token: string): Promise<boolean> {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return false;

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return true;
  } catch {
    return false;
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(new AppError(401, 'Unauthorized'));
  }

  if (!(await setUserFromToken(req, token))) {
    return next(new AppError(401, 'Unauthorized'));
  }

  next();
}

export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (token) {
    await setUserFromToken(req, token);
  }

  next();
}
