import { AppError } from '../middlewares/error.middleware';
import { isAdmin } from '../modules/users/dto/user-role.enum';

export function assertOwner(authorId: number, userId: number): void {
  if (authorId !== userId) {
    throw new AppError(403, 'Forbidden');
  }
}

export function assertCommentOwner(
  commentAuthorId: number,
  userId: number,
  actorRole?: string,
): void {
  if (commentAuthorId === userId) return;
  if (actorRole && isAdmin(actorRole)) return;
  throw new AppError(403, 'Forbidden');
}
