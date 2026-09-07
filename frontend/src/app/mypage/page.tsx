'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { PostCard } from '@/components/posts/PostCard';
import { Pagination } from '@/components/ui/Pagination';
import { fetchMyBookmarks } from '@/lib/bookmarks';
import { useAuthStore } from '@/store/useAuthStore';
import type { PaginatedPosts } from '@/types/post';

export default function MyPage() {
  const { user, isLoading } = useAuthStore();
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const handlePageChange = (nextPage: number) => {
    setLoading(true);
    setError(false);
    setPage(nextPage);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    fetchMyBookmarks(page, 12)
      .then((data) => {
        if (!cancelled) setBookmarks(data);
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
  }, [page, retryKey]);

  if (isLoading) {
    return (
      <main className="form-page page-shell">
        <AppHeader />
      <div className="container">
          <div className="home__state">
            <p className="home__message">불러오는 중...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="form-page page-shell">
      <AppHeader />
      <div className="container">

        <section className="mypage__profile">
          <h2 className="mypage__profile-title">내 정보</h2>
          {user && (
            <>
              <p className="mypage__profile-name">{user.name ?? '-'}</p>
              <p className="mypage__profile-email">{user.email}</p>
            </>
          )}
        </section>

        <section>
          <h2 className="mypage__section-title">좋아요한 팝업</h2>
          {error ? (
            <div className="home__state">
              <p className="home__message">데이터를 불러오지 못했습니다.</p>
              <button type="button" className="home__retry" onClick={handleRetry}>
                다시 시도
              </button>
            </div>
          ) : loading ? (
            <div className="home__state">
              <p className="home__message">불러오는 중...</p>
            </div>
          ) : bookmarks && bookmarks.data.length > 0 ? (
            <>
              <div className="home__grid">
                {bookmarks.data.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination
                page={bookmarks.meta.page}
                totalPages={bookmarks.meta.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="home__state">
              <p className="home__message">좋아요한 팝업이 없습니다.</p>
              <Link href="/" className="home__link">
                팝업 둘러보러 가기
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
