import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/error.middleware';
import { bookmarkService } from './bookmark.service';

function parseId(value: string | string[]): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'Invalid id parameter');
  }
  return id;
}

export class BookmarkController {
  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookmarkService.toggle(req.user!.id, parseId(req.params.id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const bookmarkController = new BookmarkController();
