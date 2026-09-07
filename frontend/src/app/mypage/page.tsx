'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Compass, Heart, KeyRound, MapPinned, Pencil, Plus, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { PostCard } from '@/components/posts/PostCard';
import { Pagination } from '@/components/ui/Pagination';
import { api } from '@/lib/api';
import { fetchMyBookmarks } from '@/lib/bookmarks';
import { useAuthStore } from '@/store/useAuthStore';
import type { PaginatedPosts } from '@/types/post';

export default function MyPage() {
  const { user, isLoading, setUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

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

  const startProfileEdit = () => {
    setName(user?.name ?? '');
    setIsEditingProfile(true);
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setName('');
  };

  const saveProfile = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      toast.error('이름은 2자 이상 50자 이하로 입력해 주세요.');
      return;
    }

    setSavingProfile(true);
    try {
      const { data } = await api.patch<{ user: NonNullable<typeof user> }>('/api/users/me', { name: trimmedName });
      setUser(data.user);
      setIsEditingProfile(false);
      toast.success('계정 정보가 수정됐어요.');
    } catch {
      // The shared API interceptor displays a safe error message.
    } finally {
      setSavingProfile(false);
    }
  };

  const roleLabel = user?.role === 'ADMIN' ? '관리자' : user?.role === 'CREATOR' ? '크리에이터' : '탐색자';

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
      <div className="container mypage">
        <section className="mypage__intro" aria-labelledby="mypage-title">
          <div className="mypage__intro-copy">
            <p className="mypage__eyebrow">MY POPCAST</p>
            <h1 id="mypage-title" className="mypage__title">
              {user?.name ? `${user.name}님의 저장 목록` : '나의 저장 목록'}
            </h1>
            <p className="mypage__lead">마음에 둔 팝업을 다시 확인하고, 방문 계획을 이어가세요.</p>
          </div>
          <div className="mypage__profile" aria-label="내 계정 정보">
            <div className="mypage__profile-head">
              <span className="mypage__profile-label">계정</span>
              {!isEditingProfile && (
                <button type="button" className="mypage__profile-edit" onClick={startProfileEdit}>
                  <Pencil className="icon-line" size={14} strokeWidth={1.7} />정보 수정
                </button>
              )}
            </div>
            {isEditingProfile ? (
              <div className="mypage__profile-form">
                <label htmlFor="profile-name">이름</label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={50}
                  autoFocus
                  disabled={savingProfile}
                />
                <div className="mypage__profile-actions">
                  <button type="button" className="mypage__profile-save" onClick={saveProfile} disabled={savingProfile}>
                    <Check className="icon-line" size={15} strokeWidth={2} />{savingProfile ? '저장 중' : '저장'}
                  </button>
                  <button type="button" className="mypage__profile-cancel" onClick={cancelProfileEdit} disabled={savingProfile}>
                    <X className="icon-line" size={15} strokeWidth={2} />취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <strong className="mypage__profile-name">{user?.name ?? '사용자'}</strong>
                <span className="mypage__profile-email">{user?.email}</span>
                <span className="mypage__role">{roleLabel}</span>
                <Link href="/forgot-password" className="mypage__password-link"><KeyRound className="icon-line" size={14} strokeWidth={1.7} />비밀번호 재설정</Link>
              </>
            )}
          </div>
        </section>

        <section className="mypage__overview" aria-label="저장 현황">
          <div className="mypage__overview-item">
            <span className="icon-wrapper" aria-hidden><Heart className="icon-line" size={16} strokeWidth={1.5} /></span>
            <div><strong>{loading ? '—' : bookmarks?.meta.total ?? 0}</strong><span>저장한 팝업</span></div>
          </div>
          <div className="mypage__overview-item">
            <span className="icon-wrapper" aria-hidden><Sparkles className="icon-line" size={16} strokeWidth={1.5} /></span>
            <div><strong>{roleLabel}</strong><span>현재 계정</span></div>
          </div>
          <div className="mypage__overview-action">
            <Link href="/explore" className="mypage__text-link"><Compass className="icon-line" size={15} strokeWidth={1.5} />팝업 탐색</Link>
            {user && (
              <Link href="/posts/write" className="mypage__text-link"><Plus className="icon-line" size={15} strokeWidth={1.5} />팝업 등록</Link>
            )}
          </div>
        </section>

        <section className="mypage__saved" aria-labelledby="saved-popups-title">
          <div className="mypage__section-head">
            <div>
              <p className="mypage__eyebrow">SAVED PLACES</p>
              <h2 id="saved-popups-title" className="mypage__section-title">좋아요한 팝업</h2>
            </div>
            {!loading && bookmarks && bookmarks.data.length > 0 && <span className="mypage__count">{bookmarks.meta.total}개</span>}
          </div>
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
            <div className="mypage__empty">
              <span className="icon-wrapper" aria-hidden><MapPinned className="icon-line" size={18} strokeWidth={1.5} /></span>
              <div>
                <h3>아직 저장한 팝업이 없어요.</h3>
                <p>마음에 드는 팝업의 하트를 눌러 나만의 방문 목록을 만들어보세요.</p>
              </div>
              <Link href="/explore" className="mypage__empty-link"><Sparkles className="icon-line" size={15} strokeWidth={1.5} />팝업 둘러보기</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
