import { Prisma } from '../generated/prisma/client';
import { PopupStatus } from '../modules/posts/dto/popup-status.enum';

export function getDayBounds(now: Date = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { startOfToday, endOfToday };
}

export function buildStatusWhere(status: PopupStatus, now: Date = new Date()): Prisma.PostWhereInput {
  const { startOfToday, endOfToday } = getDayBounds(now);

  switch (status) {
    case PopupStatus.ONGOING:
      return {
        startDate: { lte: endOfToday },
        endDate: { gte: startOfToday },
      };
    case PopupStatus.UPCOMING:
      return {
        startDate: { gt: endOfToday },
      };
    case PopupStatus.ENDED:
      return {
        endDate: { lt: startOfToday },
      };
    default:
      return {};
  }
}
