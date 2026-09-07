'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchPosts } from '@/lib/posts';
import { filterPostsInWeek } from '@/lib/weekRange';
import type { PopupCategory, Post, TimelineFilters } from '@/types/post';

interface PopupTimelineProps {
  filters: TimelineFilters;
  /** Restrict list + strip to the current week (home curation). */
  scope?: 'month' | 'week';
  /** Skip internal fetch when parent already loaded posts. */
  seedPosts?: Post[];
  /** `strip` = month nav + day strip only (explore date picker). */
  variant?: 'panel' | 'strip';
  /** Selected day as `YYYY-MM-DD`. */
  selectedDayKey?: string;
  /** Fired when a day chip is clicked (iso date). Re-click clears via parent. */
  onDaySelect?: (isoDate: string) => void;
}

function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end, daysInMonth: end.getDate() };
}

function toDayKey(date: Date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatShortDate(date: Date) {
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatDateRange(start: Date, end: Date) {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

/** Sun-start week containing `anchor` (local calendar). */
function getWeekDays(anchor: Date): Date[] {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** Full month grid (Sun–Sat rows), including leading/trailing outside days. */
function getMonthGridDays(year: number, month: number): Date[] {
  const { start, end } = getMonthBounds(year, month);
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay());
  const lastOffset = 6 - end.getDay();
  const totalDays =
    Math.round((end.getTime() - gridStart.getTime()) / 86_400_000) + 1 + lastOffset;

  return Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const CATEGORY_DOT_CLASS: Record<PopupCategory, string> = {
  FASHION: 'timeline__dot--fashion',
  FOOD: 'timeline__dot--food',
  ART: 'timeline__dot--art',
  LIFESTYLE: 'timeline__dot--lifestyle',
  ETC: 'timeline__dot--etc',
};

export function PopupTimeline({
  filters,
  scope = 'month',
  seedPosts,
  variant = 'panel',
  selectedDayKey,
  onDaySelect,
}: PopupTimelineProps) {
  const weekOnly = scope === 'week';
  const isStrip = variant === 'strip';
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [fetchedPosts, setFetchedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(seedPosts === undefined);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const filterKey = `${filters.area ?? ''}:${filters.category ?? ''}:${filters.orderBy ?? 'latest'}`;
  const [activeFilterKey, setActiveFilterKey] = useState(filterKey);

  if (seedPosts === undefined && filterKey !== activeFilterKey) {
    setActiveFilterKey(filterKey);
    setLoading(true);
    setError(false);
  }

  const posts = seedPosts ?? fetchedPosts;
  const isLoading = seedPosts !== undefined ? false : loading;

  const { daysInMonth } = useMemo(
    () => getMonthBounds(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  useEffect(() => {
    if (seedPosts !== undefined) return;

    let cancelled = false;

    fetchPosts({
      area: filters.area,
      category: filters.category || undefined,
      orderBy: filters.orderBy,
      page: 1,
      limit: 100,
    })
      .then((data) => {
        if (!cancelled) setFetchedPosts(data.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters.area, filters.category, filters.orderBy, retryKey, seedPosts]);

  // Sync month view when parent selects a date outside current strip.
  const [boundSelectedDay, setBoundSelectedDay] = useState(selectedDayKey);
  if (selectedDayKey !== boundSelectedDay) {
    setBoundSelectedDay(selectedDayKey);
    if (selectedDayKey && !weekOnly) {
      const [y, m] = selectedDayKey.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }

  const monthStartKey = viewYear * 10000 + (viewMonth + 1) * 100 + 1;
  const monthEndKey = viewYear * 10000 + (viewMonth + 1) * 100 + daysInMonth;

  const visiblePosts = useMemo(() => {
    const base = weekOnly
      ? filterPostsInWeek(posts)
      : posts.filter((post) => {
          const startKey = toDayKey(new Date(post.startDate));
          const endKey = toDayKey(new Date(post.endDate));
          return endKey >= monthStartKey && startKey <= monthEndKey;
        });

    return [...base].sort((a, b) => {
      const startDiff = toDayKey(new Date(a.startDate)) - toDayKey(new Date(b.startDate));
      if (startDiff !== 0) return startDiff;
      return a.title.localeCompare(b.title, 'ko');
    });
  }, [posts, monthStartKey, monthEndKey, weekOnly]);

  const todayKey = toDayKey(new Date());

  /** Week scope: this week only. Month/strip: full 1~말일 calendar grid. */
  const calendarDays = useMemo(() => {
    if (weekOnly) return getWeekDays(new Date());
    return getMonthGridDays(viewYear, viewMonth);
  }, [weekOnly, viewYear, viewMonth]);

  const daysWithPosts = useMemo(() => {
    const keys = new Set<number>();
    for (const day of calendarDays) {
      const key = toDayKey(day);
      const hasEvent = posts.some((post) => {
        const startKey = toDayKey(new Date(post.startDate));
        const endKey = toDayKey(new Date(post.endDate));
        return key >= startKey && key <= endKey;
      });
      if (hasEvent) keys.add(key);
    }
    return keys;
  }, [posts, calendarDays]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  const handleDayClick = (day: Date) => {
    if (!onDaySelect) return;
    const iso = toIsoDate(day);
    onDaySelect(iso === selectedDayKey ? '' : iso);
  };

  return (
    <section
      className={`timeline${isStrip ? ' timeline--strip' : ''}`}
      aria-label={weekOnly ? '이번 주 팝업 일정' : '월별 팝업 일정'}
    >
      <div className="timeline__header">
        <p className="timeline__title">{weekOnly ? '이번 주' : isStrip ? '날짜로 탐색' : '팝업 일정'}</p>
        <div className="timeline__nav">
          {!weekOnly && (
            <button type="button" className="timeline__nav-btn" onClick={handlePrevMonth} aria-label="이전 달">
              <ChevronLeft className="icon-line" size={18} strokeWidth={1.5} />
            </button>
          )}
          <span className="timeline__month">
            {viewYear}년 {viewMonth + 1}월
          </span>
          {!weekOnly && (
            <button type="button" className="timeline__nav-btn" onClick={handleNextMonth} aria-label="다음 달">
              <ChevronRight className="icon-line" size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <div
        className={`timeline__week${weekOnly ? '' : ' timeline__week--month'}`}
        role={onDaySelect ? 'group' : 'list'}
        aria-label={weekOnly ? '주간 날짜' : '월간 날짜'}
      >
        {!weekOnly
          ? WEEKDAY_LABELS.map((label) => (
              <span key={label} className="timeline__weekday-label" aria-hidden>
                {label}
              </span>
            ))
          : null}
        {calendarDays.map((day) => {
          const key = toDayKey(day);
          const iso = toIsoDate(day);
          const inMonth = day.getMonth() === viewMonth && day.getFullYear() === viewYear;
          const isToday = key === todayKey;
          const hasEvent = daysWithPosts.has(key);
          const isSelected = selectedDayKey === iso;
          const dayClass = [
            'timeline__day',
            !weekOnly && !inMonth && 'timeline__day--outside',
            isToday && 'timeline__day--today',
            hasEvent && 'timeline__day--has-event',
            isSelected && 'timeline__day--selected',
            onDaySelect && 'timeline__day--interactive',
          ]
            .filter(Boolean)
            .join(' ');

          if (onDaySelect) {
            return (
              <button
                key={`${key}-${iso}`}
                type="button"
                className={dayClass}
                aria-pressed={isSelected}
                aria-current={isToday ? 'date' : undefined}
                aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일`}
                disabled={!weekOnly && !inMonth}
                onClick={() => handleDayClick(day)}
              >
                {weekOnly ? (
                  <span className="timeline__day-weekday">{WEEKDAY_LABELS[day.getDay()]}</span>
                ) : null}
                <span className="timeline__day-num">{day.getDate()}</span>
                {hasEvent ? <span className="timeline__day-mark" aria-hidden /> : null}
              </button>
            );
          }

          return (
            <div
              key={`${key}-${iso}`}
              role="listitem"
              className={dayClass}
              aria-current={isToday ? 'date' : undefined}
            >
              {weekOnly ? (
                <span className="timeline__day-weekday">{WEEKDAY_LABELS[day.getDay()]}</span>
              ) : null}
              <span className="timeline__day-num">{day.getDate()}</span>
              {hasEvent ? <span className="timeline__day-mark" aria-hidden /> : null}
            </div>
          );
        })}
      </div>

      {!isStrip &&
        (error ? (
          <div className="timeline__error">
            <p className="timeline__error-text">일정을 불러오지 못했습니다.</p>
            <button type="button" className="timeline__retry" onClick={handleRetry}>
              <RefreshCw className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
              다시 시도
            </button>
          </div>
        ) : isLoading ? (
          <p className="timeline__loading">일정을 불러오는 중...</p>
        ) : visiblePosts.length === 0 ? (
          <p className="timeline__empty">
            {weekOnly ? '이번 주에 표시할 팝업이 없습니다.' : '이 달에 표시할 팝업이 없습니다.'}
          </p>
        ) : (
          <ul className="timeline__list">
            {visiblePosts.map((post) => {
              const start = new Date(post.startDate);
              const end = new Date(post.endDate);

              return (
                <li key={post.id} className="timeline__item">
                  <Link href={`/posts/${post.id}`} className="timeline__link" title={post.title}>
                    <span
                      className={`timeline__dot ${CATEGORY_DOT_CLASS[post.category]}`}
                      aria-hidden
                    />
                    <span className="timeline__link-body">
                      <span className="timeline__link-title">{post.title}</span>
                      <span className="timeline__link-dates">{formatDateRange(start, end)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}

      {isStrip && error ? (
        <div className="timeline__error">
          <p className="timeline__error-text">일정을 불러오지 못했습니다.</p>
          <button type="button" className="timeline__retry" onClick={handleRetry}>
            <RefreshCw className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            다시 시도
          </button>
        </div>
      ) : null}
    </section>
  );
}
