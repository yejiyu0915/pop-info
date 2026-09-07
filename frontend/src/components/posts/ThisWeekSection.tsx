'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PopupTimeline } from '@/components/posts/PopupTimeline';
import { PostCard } from '@/components/posts/PostCard';
import { fetchPosts } from '@/lib/posts';
import { filterPostsInWeek } from '@/lib/weekRange';
import type { Post } from '@/types/post';

export function ThisWeekSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchPosts({ page: 1, limit: 100, orderBy: 'latest' })
      .then((data) => {
        if (!cancelled) setPosts(data.data);
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
  }, [retryKey]);

  const weekPosts = useMemo(() => filterPostsInWeek(posts), [posts]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  };

  return (
    <section className="this-week" aria-labelledby="this-week-title">
      <div className="this-week__head">
        <h2 id="this-week-title" className="home__section-title">
          이번 주 팝업
        </h2>
        <Link href="/explore" className="home__cta-chip">
          전체 팝업 보기
          <ArrowRight className="icon-line" size={16} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>

      {error ? (
        <div className="home__state">
          <p className="home__message">이번 주 일정을 불러오지 못했습니다.</p>
          <button type="button" className="home__retry" onClick={handleRetry}>
            <RefreshCw className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            다시 시도
          </button>
        </div>
      ) : (
        <div className="home__body">
          <aside className="home__aside">
            <PopupTimeline filters={{}} scope="week" seedPosts={loading ? undefined : posts} />
          </aside>
          <div className="home__main">
            {loading ? (
              <div className="home__state">
                <p className="home__message">이번 주 팝업을 불러오는 중...</p>
              </div>
            ) : weekPosts.length > 0 ? (
              <div className="home__grid">
                {weekPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="home__state">
                <p className="home__message">이번 주에 예정된 팝업이 없습니다.</p>
                <Link href="/explore" className="home__link">
                  전체 팝업 보러가기
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
