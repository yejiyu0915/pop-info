export type PopupStatus = 'ONGOING' | 'UPCOMING' | 'ENDED';

export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** `<input type="date">` 값(YYYY-MM-DD)을 로컬 자정 기준 Date로 파싱 */
export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isEndDateBeforeStartDate(startDate: string, endDate: string): boolean {
  return stripTime(parseDateInput(endDate)) < stripTime(parseDateInput(startDate));
}

export function getPopupStatus(
  startDate: string,
  endDate: string,
  now: Date = new Date(),
): PopupStatus {
  const today = stripTime(now);
  const start = stripTime(new Date(startDate));
  const end = stripTime(new Date(endDate));

  if (today < start) return 'UPCOMING';
  if (today > end) return 'ENDED';
  return 'ONGOING';
}

export function getPopupStatusLabel(status: PopupStatus): string {
  const labels: Record<PopupStatus, string> = {
    ONGOING: '진행중',
    UPCOMING: '오픈예정',
    ENDED: '종료',
  };
  return labels[status];
}

export function getDaysUntilEnd(endDate: string, now: Date = new Date()): number {
  const today = stripTime(now);
  const end = stripTime(new Date(endDate));
  const diffMs = end.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getClosingSoonLabel(
  startDate: string,
  endDate: string,
  now: Date = new Date(),
): string | null {
  const status = getPopupStatus(startDate, endDate, now);
  if (status !== 'ONGOING') return null;

  const daysLeft = getDaysUntilEnd(endDate, now);
  if (daysLeft < 0 || daysLeft > 3) return null;

  return `마감 임박🔥 D-${daysLeft}`;
}
