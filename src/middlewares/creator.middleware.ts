import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from './error.middleware';
import { isCreatorOrAbove } from '../modules/users/dto/user-role.enum';

export async function creatorMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return next(new AppError(401, 'Unauthorized'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (!user || !isCreatorOrAbove(user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }

    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
}
