import { CalendarClock, CircleDot, CircleOff } from 'lucide-react';
import { getPopupStatus, getPopupStatusLabel } from '@/lib/popupStatus';

interface PopupStatusBadgeProps {
  startDate: string;
  endDate: string;
}

export function PopupStatusBadge({ startDate, endDate }: PopupStatusBadgeProps) {
  const status = getPopupStatus(startDate, endDate);

  const Icon =
    status === 'ONGOING' ? CircleDot : status === 'UPCOMING' ? CalendarClock : CircleOff;

  return (
    <span className={`badge badge--status badge--status-${status.toLowerCase()}`}>
      <Icon className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
      {getPopupStatusLabel(status)}
    </span>
  );
}
