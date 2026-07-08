import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/error.middleware';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { commentService } from './comment.service';

function parsePostId(value: string | string[]): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'Invalid postId parameter');
  }
  return id;
}

function parseId(value: string | string[]): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'Invalid id parameter');
  }
  return id;
}

export class CommentController {
  async findByPost(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.findByPostId(parsePostId(req.params.postId));
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateCommentDto;
      const comment = await commentService.create(
        parsePostId(req.params.postId),
        dto,
        req.user!.id,
      );
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as UpdateCommentDto;
      const comment = await commentService.update(parseId(req.params.id), dto, req.user!.id);
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      await commentService.delete(parseId(req.params.id), req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
