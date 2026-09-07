import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function csrfMiddleware(req: Request, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return next(new AppError(403, 'Invalid CSRF token'));
  }

  const cookie = Buffer.from(cookieToken);
  const header = Buffer.from(headerToken);
  if (cookie.length !== header.length || !crypto.timingSafeEqual(cookie, header)) {
    return next(new AppError(403, 'Invalid CSRF token'));
  }

  next();
}
