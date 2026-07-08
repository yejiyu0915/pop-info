import { prisma } from '../../lib/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { assertOwner } from '../../utils/ownership';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const authorSelect = { id: true, email: true, name: true } as const;

export class PostService {
  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        include: {
          author: { select: authorSelect },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count(),
    ]);

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

  async findById(id: number) {
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
      },
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    return post;
  }

  async create(dto: CreatePostDto, authorId: number) {
    return prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId,
      },
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async update(id: number, dto: UpdatePostDto, userId: number) {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    assertOwner(post.authorId, userId);

    if (dto.title === undefined && dto.content === undefined) {
      throw new AppError(400, 'At least one field (title or content) is required');
    }

    return prisma.post.update({
      where: { id },
      data: dto,
      include: {
        author: { select: authorSelect },
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
