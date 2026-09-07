import { prisma } from '../../lib/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { assertCommentOwner } from '../../utils/ownership';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const authorSelect = { id: true, email: true, name: true } as const;

async function getActorRole(userId: number): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) {
    throw new AppError(403, 'Forbidden');
  }
  return user.role;
}

export class CommentService {
  async findByPostId(postId: number) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    return prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: authorSelect },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(postId: number, dto: CreateCommentDto, authorId: number) {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    return prisma.comment.create({
      data: {
        content: dto.content,
        authorId,
        postId,
      },
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async update(id: number, dto: UpdateCommentDto, userId: number) {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    const actorRole = await getActorRole(userId);
    assertCommentOwner(comment.authorId, userId, actorRole);

    if (dto.content === undefined) {
      throw new AppError(400, 'content field is required');
    }

    return prisma.comment.update({
      where: { id },
      data: dto,
      include: {
        author: { select: authorSelect },
      },
    });
  }

  async delete(id: number, userId: number) {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    const actorRole = await getActorRole(userId);
    assertCommentOwner(comment.authorId, userId, actorRole);

    await prisma.comment.delete({ where: { id } });
  }
}

export const commentService = new CommentService();
