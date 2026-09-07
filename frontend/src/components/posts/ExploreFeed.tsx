'use client';

import Link from 'next/link';
import { CalendarDays, Map, Plus, RefreshCw, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { PopupTimeline } from '@/components/posts/PopupTimeline';
import { PostCard } from '@/components/posts/PostCard';
import { PostFilterBar } from '@/components/posts/PostFilterBar';
import { Pagination } from '@/components/ui/Pagination';
import { fetchPosts } from '@/lib/posts';
import type { PopupStatus } from '@/lib/popupStatus';
import { isCreatorOrAbove } from '@/lib/roles';
import { postHasAllSubTags, SUB_TAG_OPTIONS } from '@/lib/subTags';
import { postCoversDate } from '@/lib/weekRange';
import { useAuthStore } from '@/store/useAuthStore';
import type { PaginatedPosts, PostFilters } from '@/types/post';

type ExploreView = 'timeline' | 'map';

const PAGE_SIZE = 12;

function parseStatusParam(value: string | null): PopupStatus | undefined {
  if (value === 'ONGOING' || value === 'UPCOMING' || value === 'ENDED') return value;
  return undefined;
}

function formatDateResultLabel(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${m}월 ${d}일 팝업 결과`;
}

function ExploreFeed({ statusFromUrl }: { statusFromUrl?: PopupStatus }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<PostFilters>({
    page: 1,
    limit: PAGE_SIZE,
    status: statusFromUrl,
  });
  const [rawPosts, setRawPosts] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [view, setView] = useState<ExploreView>('timeline');

  const activeFilters = useMemo(
    () => ({ ...filters, status: statusFromUrl }),
    [filters, statusFromUrl],
  );

  const needsClientFilter = Boolean(
    activeFilters.targetDate || (activeFilters.subTags && activeFilters.subTags.length > 0),
  );

  const timelineFilters = useMemo(
    () => ({
      area: activeFilters.area,
      category: activeFilters.category,
      orderBy: activeFilters.orderBy,
    }),
    [activeFilters.area, activeFilters.category, activeFilters.orderBy],
  );

  const handleFiltersChange = (newFilters: PostFilters) => {
    setLoading(true);
    setError(false);
    setFilters(newFilters);

    const nextStatus = newFilters.status;
    if ((nextStatus ?? undefined) !== (statusFromUrl ?? undefined)) {
      router.replace(nextStatus ? `/explore?status=${nextStatus}` : '/explore', {
        scroll: false,
      });
    }
  };

  const handleSubTagToggle = (tagId: string) => {
    const current = activeFilters.subTags ?? [];
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    handleFiltersChange({
      ...activeFilters,
      subTags: next.length ? next : undefined,
      page: 1,
    });
  };

  const handleDaySelect = (isoDate: string) => {
    handleFiltersChange({
      ...activeFilters,
      targetDate: isoDate || undefined,
      page: 1,
    });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  };

  const serverFetchKey = useMemo(
    () =>
      JSON.stringify({
        q: activeFilters.q,
        area: activeFilters.area,
        category: activeFilters.category,
        status: activeFilters.status,
        orderBy: activeFilters.orderBy,
        page: needsClientFilter ? 1 : (activeFilters.page ?? 1),
        limit: needsClientFilter ? 100 : PAGE_SIZE,
        client: needsClientFilter,
        retryKey,
      }),
    [
      activeFilters.q,
      activeFilters.area,
      activeFilters.category,
      activeFilters.status,
      activeFilters.orderBy,
      activeFilters.page,
      needsClientFilter,
      retryKey,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    const serverFilters: PostFilters = {
      q: activeFilters.q,
      area: activeFilters.area,
      category: activeFilters.category,
      status: activeFilters.status,
      orderBy: activeFilters.orderBy,
      page: needsClientFilter ? 1 : (activeFilters.page ?? 1),
      limit: needsClientFilter ? 100 : PAGE_SIZE,
    };

    fetchPosts(serverFilters)
      .then((data) => {
        if (!cancelled) setRawPosts(data);
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
    // serverFetchKey encodes the relevant server params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverFetchKey]);

  const posts = useMemo(() => {
    if (!rawPosts) return null;

    if (!needsClientFilter) return rawPosts;

    let data = rawPosts.data;
    if (activeFilters.targetDate) {
      data = data.filter((post) => postCoversDate(post, activeFilters.targetDate!));
    }
    if (activeFilters.subTags?.length) {
      data = data.filter((post) => postHasAllSubTags(post, activeFilters.subTags!));
    }

    const requestedPage = activeFilters.page ?? 1;
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    const start = (page - 1) * PAGE_SIZE;

    return {
      data: data.slice(start, start + PAGE_SIZE),
      meta: {
        total,
        page,
        limit: PAGE_SIZE,
        totalPages: total === 0 ? 1 : totalPages,
      },
    };
  }, [rawPosts, needsClientFilter, activeFilters.targetDate, activeFilters.subTags, activeFilters.page]);

  const sectionLabel =
    statusFromUrl === 'ONGOING'
      ? '진행중 팝업'
      : statusFromUrl === 'ENDED'
        ? '종료된 팝업'
        : statusFromUrl === 'UPCOMING'
          ? '오픈예정 팝업'
          : '전체 팝업';

  return (
    <div className="explore-feed">
      <PostFilterBar filters={activeFilters} onChange={handleFiltersChange} />

      <div className="explore__subtags" role="group" aria-label="혜택·조건 태그">
        {SUB_TAG_OPTIONS.map((tag) => {
          const isActive = (activeFilters.subTags ?? []).includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              className={`explore__subtag${isActive ? ' explore__subtag--active' : ''}`}
              aria-pressed={isActive}
              onClick={() => handleSubTagToggle(tag.id)}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div className="explore__view-bar">
        <div className="explore__view-toggle" role="tablist" aria-label="탐색 뷰">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'timeline'}
            className={`explore__view-btn${view === 'timeline' ? ' explore__view-btn--active' : ''}`}
            onClick={() => setView('timeline')}
          >
            <CalendarDays className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            타임라인 뷰
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'map'}
            className={`explore__view-btn${view === 'map' ? ' explore__view-btn--active' : ''}`}
            onClick={() => setView('map')}
          >
            <Map className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            지도 뷰 (준비중)
          </button>
        </div>
      </div>

      {view === 'timeline' ? (
        <div className="explore__timeline-panel">
          <PopupTimeline
            key={`${activeFilters.area ?? ''}-${activeFilters.category ?? ''}-${activeFilters.orderBy ?? 'latest'}`}
            filters={timelineFilters}
            variant="strip"
            selectedDayKey={activeFilters.targetDate}
            onDaySelect={handleDaySelect}
          />
          {activeFilters.targetDate ? (
            <div className="explore__date-result">
              <span className="explore__date-result-label">
                {formatDateResultLabel(activeFilters.targetDate)}
              </span>
              <button
                type="button"
                className="explore__date-result-clear"
                aria-label="날짜 필터 해제"
                onClick={() => handleDaySelect('')}
              >
                <X className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                해제
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="explore__map-placeholder" role="status">
          <div className="explore__map-visual" aria-hidden>
            <Map className="explore__map-icon" size={36} strokeWidth={1.25} />
          </div>
          <p className="explore__map-title">지도로 만나는 POPCAST, 곧 찾아옵니다!</p>
          <p className="explore__map-copy">
            성수, 홍대, 용산 등 주요 팝업 스팟의 위치와 실시간 밀집도를 한눈에 확인해 보세요.
          </p>
        </div>
      )}

      <div className="home__body explore-feed__body">
        <div className="home__main">
          <h2 className="home__section-title">{sectionLabel}</h2>

          {error ? (
            <div className="home__state">
              <p className="home__message">데이터를 불러오지 못했습니다.</p>
              <button type="button" className="home__retry" onClick={handleRetry}>
                <RefreshCw className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                다시 시도
              </button>
            </div>
          ) : loading ? (
            <div className="home__state">
              <p className="home__message">팝업 목록을 불러오는 중...</p>
            </div>
          ) : posts && posts.data.length > 0 ? (
            <>
              <div className="home__grid explore-feed__grid">
                {posts.data.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination
                page={posts.meta.page}
                totalPages={posts.meta.totalPages}
                onPageChange={(page) => {
                  setLoading(needsClientFilter ? false : true);
                  setError(false);
                  setFilters((prev) => ({ ...prev, page }));
                }}
              />
            </>
          ) : (
            <div className="home__state">
              <p className="home__message">조건에 맞는 팝업이 없습니다.</p>
              {isCreatorOrAbove(user?.role) && (
                <Link href="/posts/write" className="home__link">
                  <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                    <Plus className="icon-line" size={14} strokeWidth={1.5} />
                  </span>
                  새 팝업 등록하기
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExploreGate() {
  const searchParams = useSearchParams();
  const statusFromUrl = parseStatusParam(searchParams.get('status'));
  const statusKey = statusFromUrl ?? 'all';

  return <ExploreFeed key={statusKey} statusFromUrl={statusFromUrl} />;
}

export function ExplorePageContent() {
  return (
    <Suspense
      fallback={
        <div className="home__state">
          <p className="home__message">팝업 목록을 불러오는 중...</p>
        </div>
      }
    >
      <ExploreGate />
    </Suspense>
  );
}
