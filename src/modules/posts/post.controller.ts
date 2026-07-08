import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/error.middleware';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { postService } from './post.service';

function parseId(value: string | string[]): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'Invalid id parameter');
  }
  return id;
}

function parsePagination(query: Request['query']) {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '10'), 10) || 10));
  return { page, limit };
}

export class PostController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query);
      const result = await postService.findAll(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.findById(parseId(req.params.id));
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreatePostDto;
      const post = await postService.create(dto, req.user!.id);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as UpdatePostDto;
      const post = await postService.update(parseId(req.params.id), dto, req.user!.id);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await postService.delete(parseId(req.params.id), req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
