import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/error.middleware';
import { LOCATION_AREA_VALUES, LocationArea } from './dto/location-area.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { POPUP_STATUS_VALUES, PopupStatus } from './dto/popup-status.enum';
import { POST_ORDER_BY_VALUES, PostOrderBy } from './dto/post-order-by.enum';
import { PopupCategory } from './dto/popup-category.enum';
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

function parseStatus(query: Request['query']): PopupStatus | undefined {
  if (query.status === undefined) return undefined;
  if (typeof query.status === 'string' && POPUP_STATUS_VALUES.includes(query.status as PopupStatus)) {
    return query.status as PopupStatus;
  }
  throw new AppError(400, 'Invalid status parameter');
}

function parseOrderBy(query: Request['query']): PostOrderBy | undefined {
  if (query.orderBy === undefined) return undefined;
  if (typeof query.orderBy === 'string' && POST_ORDER_BY_VALUES.includes(query.orderBy as PostOrderBy)) {
    return query.orderBy as PostOrderBy;
  }
  throw new AppError(400, 'Invalid orderBy parameter');
}

function parseArea(query: Request['query']): LocationArea | undefined {
  if (query.area === undefined) return undefined;
  if (typeof query.area === 'string' && LOCATION_AREA_VALUES.includes(query.area as LocationArea)) {
    return query.area as LocationArea;
  }
  throw new AppError(400, 'Invalid area parameter');
}

function parseFilters(query: Request['query']) {
  const q = typeof query.q === 'string' && query.q.trim() ? query.q.trim() : undefined;
  const location =
    typeof query.location === 'string' && query.location.trim()
      ? query.location.trim()
      : undefined;
  const category =
    typeof query.category === 'string' && Object.values(PopupCategory).includes(query.category as PopupCategory)
      ? (query.category as PopupCategory)
      : undefined;

  return {
    q,
    location,
    category,
    area: parseArea(query),
    status: parseStatus(query),
    orderBy: parseOrderBy(query),
  };
}

export class PostController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query);
      const filters = parseFilters(req.query);
      const result = await postService.findAll({
        page,
        limit,
        ...filters,
        userId: req.user?.id,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findKv(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await postService.findKv(req.user?.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postService.findById(parseId(req.params.id), req.user?.id);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreatePostDto;
      const post = await postService.create(dto, req.user!.id, req.user!.role!);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as UpdatePostDto;
      const post = await postService.update(parseId(req.params.id), dto, req.user!.id, req.user!.role!);
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
