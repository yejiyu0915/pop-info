import { Prisma } from '../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { assertOwner } from '../../utils/ownership';
import { buildStatusWhere, getDayBounds } from '../../utils/popupStatus';
import { expandAreaFilter, LocationArea } from './dto/location-area.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PostOrderBy } from './dto/post-order-by.enum';
import { PopupCategory } from './dto/popup-category.enum';
import { PopupStatus } from './dto/popup-status.enum';
import { UpdatePostDto } from './dto/update-post.dto';
import { isAdmin } from '../users/dto/user-role.enum';

const authorSelect = { id: true, email: true, name: true } as const;

export interface PostListFilters {
  page: number;
  limit: number;
  q?: string;
  location?: string;
  category?: PopupCategory;
  area?: LocationArea;
  status?: PopupStatus;
  orderBy?: PostOrderBy;
  userId?: number;
}

function validateDateRange(startDate: string, endDate: string) {
  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError(400, 'endDate must be greater than or equal to startDate');
  }
}

function buildWhereClause(
  filters: Pick<PostListFilters, 'q' | 'location' | 'category' | 'area' | 'status' | 'orderBy'>,
): Prisma.PostWhereInput {
  const conditions: Prisma.PostWhereInput[] = [];

  if (filters.q) {
    conditions.push({
      OR: [
        { title: { contains: filters.q } },
        { content: { contains: filters.q } },
        { location: { contains: filters.q } },
      ],
    });
  }

  if (filters.location) {
    conditions.push({ location: { contains: filters.location } });
  }

  if (filters.category) {
    conditions.push({ category: filters.category });
  }

  if (filters.area) {
    conditions.push({ area: { in: expandAreaFilter(filters.area) } });
  }

  if (filters.status) {
    conditions.push(buildStatusWhere(filters.status));
  }

  if (filters.orderBy === PostOrderBy.ENDING_SOON) {
    const { startOfToday } = getDayBounds();
    conditions.push({ endDate: { gte: startOfToday } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

function buildOrderBy(orderBy: PostOrderBy = PostOrderBy.LATEST): Prisma.PostOrderByWithRelationInput {
  switch (orderBy) {
    case PostOrderBy.POPULAR:
      return { bookmarks: { _count: 'desc' } };
    case PostOrderBy.ENDING_SOON:
      return { endDate: 'asc' };
    case PostOrderBy.LATEST:
    default:
      return { createdAt: 'desc' };
  }
}

async function getBookmarkedPostIds(userId: number, postIds: number[]): Promise<Set<number>> {
  if (postIds.length === 0) return new Set();

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  });

  return new Set(bookmarks.map((b) => b.postId));
}

function attachBookmarkStatus<T extends { id: number }>(
  posts: T[],
  bookmarkedIds: Set<number>,
): (T & { isBookmarked: boolean })[] {
  return posts.map((post) => ({
    ...post,
    isBookmarked: bookmarkedIds.has(post.id),
  }));
}

export class PostService {
  async findAll(filters: PostListFilters) {
    const { page, limit, userId, orderBy = PostOrderBy.LATEST, ...queryFilters } = filters;
    const skip = (page - 1) * limit;
    const where = buildWhereClause({ ...queryFilters, orderBy });

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: { select: authorSelect },
          _count: { select: { comments: true, bookmarks: true } },
        },
        orderBy: buildOrderBy(orderBy),
      }),
      prisma.post.count({ where }),
    ]);

    const bookmarkedIds = userId
      ? await getBookmarkedPostIds(userId, data.map((p) => p.id))
      : new Set<number>();

    return {
      data: attachBookmarkStatus(data, bookmarkedIds),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findKv(userId?: number) {
    const { startOfToday, endOfToday } = getDayBounds();

    const data = await prisma.post.findMany({
      where: {
        isKv: true,
        startDate: { lte: endOfToday },
        endDate: { gte: startOfToday },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: true, bookmarks: true } },
      },
    });

    const bookmarkedIds = userId
      ? await getBookmarkedPostIds(userId, data.map((p) => p.id))
      : new Set<number>();

    return attachBookmarkStatus(data, bookmarkedIds);
  }

  async findById(id: number, userId?: number) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: authorSelect },
        comments: {
          include: {
            author: { select: authorSelect },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { comments: true, bookmarks: true } },
      },
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    const bookmarkedIds = userId
      ? await getBookmarkedPostIds(userId, [post.id])
      : new Set<number>();

    return {
      ...post,
      isBookmarked: bookmarkedIds.has(post.id),
    };
  }

  async create(dto: CreatePostDto, authorId: number, role: string) {
    validateDateRange(dto.startDate, dto.endDate);

    const isKv = isAdmin(role) ? (dto.isKv ?? false) : false;

    return prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        location: dto.location,
        area: dto.area,
        category: dto.category,
        imageUrl: dto.imageUrl ? dto.imageUrl : null,
        isKv,
        authorId,
      },
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: true, bookmarks: true } },
      },
    });
  }

  async update(id: number, dto: UpdatePostDto, userId: number, role: string) {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    assertOwner(post.authorId, userId);

    const isKvUpdate = isAdmin(role) ? dto.isKv : undefined;

    const hasUpdate =
      dto.title !== undefined ||
      dto.content !== undefined ||
      dto.startDate !== undefined ||
      dto.endDate !== undefined ||
      dto.location !== undefined ||
      dto.area !== undefined ||
      dto.category !== undefined ||
      dto.imageUrl !== undefined ||
      isKvUpdate !== undefined;

    if (!hasUpdate) {
      throw new AppError(400, 'At least one field is required');
    }

    const startDate = dto.startDate ?? post.startDate.toISOString();
    const endDate = dto.endDate ?? post.endDate.toISOString();
    validateDateRange(startDate, endDate);

    return prisma.post.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.area !== undefined && { area: dto.area }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl ? dto.imageUrl : null }),
        ...(isKvUpdate !== undefined && { isKv: isKvUpdate }),
      },
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: true, bookmarks: true } },
      },
    });
  }

  async delete(id: number, userId: number) {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    assertOwner(post.authorId, userId);

    await prisma.post.delete({ where: { id } });
  }
}

export const postService = new PostService();
