import { prisma } from '../../lib/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { PostListFilters } from '../posts/post.service';

export class BookmarkService {
  async toggle(userId: number, postId: number) {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await prisma.bookmark.create({ data: { userId, postId } });
    return { bookmarked: true };
  }

  async findByUser(userId: number, filters: Pick<PostListFilters, 'page' | 'limit'>) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            include: {
              author: { select: { id: true, email: true, name: true } },
              _count: { select: { comments: true, bookmarks: true } },
            },
          },
        },
      }),
      prisma.bookmark.count({ where }),
    ]);

    const data = bookmarks.map((bookmark) => ({
      ...bookmark.post,
      isBookmarked: true,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const bookmarkService = new BookmarkService();
