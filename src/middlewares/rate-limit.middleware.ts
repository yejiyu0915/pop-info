import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

interface Entry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
}

/**
 * Small dependency-free limiter for a single API process. For horizontally
 * scaled deployments, replace its in-memory store with Redis at the edge.
 */
export function rateLimit({ windowMs, max, key }: RateLimitOptions) {
  const entries = new Map<string, Entry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const id = key?.(req) ?? req.ip ?? 'unknown';
    const current = entries.get(id);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    entry.count += 1;
    entries.set(id, entry);
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return next(new AppError(429, 'Too many requests. Please try again later.'));
    }

    next();
  };
}
