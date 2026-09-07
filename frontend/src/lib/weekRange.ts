import type { Post } from '@/types/post';

export interface DayRange {
  start: Date;
  end: Date;
}

/** Local calendar: Sunday 00:00 → Saturday 23:59:59.999 of the week containing `anchor`. */
export function getWeekRange(anchor = new Date()): DayRange {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function toDayStart(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Inclusive date overlap between post [startDate, endDate] and range. */
export function postOverlapsRange(post: Post, range: DayRange) {
  const postStart = toDayStart(post.startDate);
  const postEnd = toDayStart(post.endDate);
  return postEnd >= range.start && postStart <= range.end;
}

export function filterPostsInWeek(posts: Post[], anchor = new Date()) {
  const range = getWeekRange(anchor);
  return posts.filter((post) => postOverlapsRange(post, range));
}

/** Local calendar day range from `YYYY-MM-DD`. */
export function getDayRange(isoDate: string): DayRange {
  const [year, month, day] = isoDate.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { start, end };
}

/** True when target day falls within post [startDate, endDate] (local days). */
export function postCoversDate(post: Post, isoDate: string) {
  return postOverlapsRange(post, getDayRange(isoDate));
}
