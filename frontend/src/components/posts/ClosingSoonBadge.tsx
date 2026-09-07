'use client';

import { Clock } from 'lucide-react';
import { getClosingSoonLabel } from '@/lib/popupStatus';

interface ClosingSoonBadgeProps {
  startDate: string;
  endDate: string;
}

export function ClosingSoonBadge({ startDate, endDate }: ClosingSoonBadgeProps) {
  const label = getClosingSoonLabel(startDate, endDate);
  if (!label) return null;

  return (
    <span className="badge badge--closing">
      <span className="icon-wrapper icon-wrapper--sm icon-wrapper--brick" aria-hidden>
        <Clock className="icon-line" size={14} strokeWidth={1.5} />
      </span>
      {label}
    </span>
  );
}
