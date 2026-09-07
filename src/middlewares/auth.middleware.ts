import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { UserRole } from '../modules/users/dto/user-role.enum';
import { CSRF_COOKIE_NAME } from './csrf.middleware';
import { AppError } from './error.middleware';

interface JwtPayload {
  userId: number;
  email: string;
  name: string | null;
  role?: UserRole;
}

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const CSRF_COOKIE_OPTIONS = {
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

function clearInvalidAuthCookies(res: Response): void {
  res.clearCookie('access_token', AUTH_COOKIE_OPTIONS);
  res.clearCookie(CSRF_COOKIE_NAME, CSRF_COOKIE_OPTIONS);
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

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(new AppError(401, 'Unauthorized'));
  }

  if (!(await setUserFromToken(req, token))) {
    clearInvalidAuthCookies(res);
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
