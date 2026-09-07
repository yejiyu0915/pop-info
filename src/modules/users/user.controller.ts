import { Request, Response, NextFunction } from 'express';
import { bookmarkService } from '../bookmarks/bookmark.service';
import { userService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

function parsePagination(query: Request['query']) {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '10'), 10) || 10));
  return { page, limit };
}

export class UserController {
  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body as UpdateProfileDto);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async getMyBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query);
      const result = await bookmarkService.findByUser(req.user!.id, { page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
