'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Copy, Heart, MapPin, Pencil, Trash2, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { BookmarkButton } from '@/components/posts/BookmarkButton';
import { CommentSection } from '@/components/posts/CommentSection';
import { PopupStatusBadge } from '@/components/posts/PopupStatusBadge';
import { ClosingSoonBadge } from '@/components/posts/ClosingSoonBadge';
import { getCategoryLabel } from '@/constants/categories';
import { getAreaLabel } from '@/constants/areas';
import { isNotFoundError } from '@/lib/axiosError';
import { deletePost, fetchPost } from '@/lib/posts';
import { getClosingSoonLabel } from '@/lib/popupStatus';
import { useAuthStore } from '@/store/useAuthStore';
import type { Post } from '@/types/post';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const id = Number(params.id);
  const isValidId = Number.isInteger(id) && id > 0;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(isValidId);
  const [notFound, setNotFound] = useState(!isValidId);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const handleRetry = () => {
    setFetchError(false);
    setLoading(true);
    setRetryKey((k) => k + 1);
  };

  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;
    fetchPost(id)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) {
          if (isNotFoundError(err)) setNotFound(true);
          else setFetchError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isValidId, retryKey]);

  const handleDelete = async () => {
    if (!window.confirm('이 팝업을 삭제하시겠습니까?')) return;

    setDeleting(true);
    try {
      await deletePost(id);
      toast.success('팝업이 삭제되었습니다.');
      router.push('/explore');
    } finally {
      setDeleting(false);
    }
  };

  if (!isValidId || notFound) {
    return (
      <main className="detail page-shell">
        <AppHeader />
        <div className="container">
          <div className="home__state">
            <p className="home__message">팝업을 찾을 수 없습니다.</p>
            <Link href="/explore" className="home__link">
              목록으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="detail page-shell">
        <AppHeader />
        <div className="container">
          <div className="home__state">
            <p className="home__message">데이터를 불러오지 못했습니다.</p>
            <button type="button" className="home__retry" onClick={handleRetry}>
              다시 시도
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !post) {
    return (
      <main className="detail page-shell">
        <AppHeader />
        <div className="container">
          <div className="home__state">
            <p className="home__message">불러오는 중...</p>
          </div>
        </div>
      </main>
    );
  }

  const isAuthor = user?.id === post.authorId;
  const canEdit = isAuthor;
  const closingSoonLabel = getClosingSoonLabel(post.startDate, post.endDate);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(post.location);
      toast.success('주소가 클립보드에 복사되었습니다.');
    } catch {
      toast.error('주소 복사에 실패했습니다.');
    }
  };

  return (
    <main className="detail page-shell">
      <AppHeader />
      <div className="container">

        <header className="detail__hero">
          <div className="detail__badges">
            <span className="detail__category">{getCategoryLabel(post.category)}</span>
            <span className="detail__area">{getAreaLabel(post.area)}</span>
            <PopupStatusBadge startDate={post.startDate} endDate={post.endDate} />
            <ClosingSoonBadge startDate={post.startDate} endDate={post.endDate} />
          </div>
          <h1 className="detail__title">{post.title}</h1>
        </header>

        <div className="detail__split">
          <div className="detail__visual-wrap">
            <div className={`detail__visual${post.imageUrl ? '' : ' detail__visual--empty'}`}>
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="detail__visual-img"
                  unoptimized
                />
              )}
            </div>
          </div>

          <aside className="detail__meta">
            <div className="detail__meta-block detail__meta-block--icon">
              <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                <Calendar className="icon-line" size={14} strokeWidth={1.5} />
              </span>
              <div className="detail__meta-stack">
                <span className="detail__meta-label">기간</span>
                <span className="detail__meta-value">
                  {new Date(post.startDate).toLocaleDateString('ko-KR')} —{' '}
                  {new Date(post.endDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            {closingSoonLabel && (
              <div className="detail__meta-block detail__meta-block--icon">
                <span className="icon-wrapper icon-wrapper--sm icon-wrapper--brick" aria-hidden>
                  <Clock className="icon-line" size={14} strokeWidth={1.5} />
                </span>
                <div className="detail__meta-stack">
                  <span className="detail__meta-label">종료임박</span>
                  <span className="detail__meta-value detail__meta-value--brick">{closingSoonLabel}</span>
                </div>
              </div>
            )}

            <div className="detail__meta-block detail__meta-block--icon">
              <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                <MapPin className="icon-line" size={14} strokeWidth={1.5} />
              </span>
              <div className="detail__meta-stack">
                <span className="detail__meta-label">장소</span>
                <div className="detail__location-row">
                  <span className="detail__meta-value">{post.location}</span>
                  <button type="button" className="action__copy" onClick={handleCopyAddress}>
                    <span className="icon-wrapper" aria-hidden>
                      <Copy className="icon-line" size={16} strokeWidth={1.5} />
                    </span>
                    주소 복사
                  </button>
                </div>
              </div>
            </div>

            <div className="detail__meta-block detail__meta-block--icon">
              <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                <User className="icon-line" size={14} strokeWidth={1.5} />
              </span>
              <div className="detail__meta-stack">
                <span className="detail__meta-label">작성자</span>
                <span className="detail__meta-value icon-inline">
                  {post.author.name ?? post.author.email}
                  <span className="detail__meta-sep" aria-hidden>
                    ·
                  </span>
                  <Heart className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                  좋아요 {post._count?.bookmarks ?? 0}
                </span>
              </div>
            </div>

            <div className="detail__actions">
              <BookmarkButton
                postId={post.id}
                initialBookmarked={post.isBookmarked ?? false}
                onToggle={(bookmarked) => setPost((prev) => (prev ? { ...prev, isBookmarked: bookmarked } : prev))}
              />
              {canEdit && (
                <div className="detail__actions-edit">
                  <Link href={`/posts/${post.id}/edit`} className="action__text">
                    <Pencil className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                    수정하기
                  </Link>
                  <button type="button" className="action__text" onClick={handleDelete} disabled={deleting}>
                    <Trash2 className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                    {deleting ? '삭제 중...' : '삭제하기'}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>

        <article className="detail__body">{post.content}</article>

        <CommentSection postId={post.id} initialComments={post.comments} />

        <Link href="/explore" className="detail__back">
          <ArrowLeft className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
          목록으로
        </Link>
      </div>
    </main>
  );
}
