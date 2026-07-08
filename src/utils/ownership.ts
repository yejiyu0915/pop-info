import { AppError } from '../middlewares/error.middleware';

export function assertOwner(authorId: number, userId: number): void {
  if (authorId !== userId) {
    throw new AppError(403, 'Forbidden');
  }
}
