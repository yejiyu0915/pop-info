'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import { Calendar, Heart, MapPin, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { getCategoryLabel } from '@/constants/categories';
import { getAreaLabel } from '@/constants/areas';
import { ClosingSoonBadge } from '@/components/posts/ClosingSoonBadge';
import { PopupStatusBadge } from '@/components/posts/PopupStatusBadge';
import { toggleBookmark } from '@/lib/bookmarks';
import { useAuthStore } from '@/store/useAuthStore';
import type { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

function formatDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = new Date(start).toLocaleDateString('ko-KR', opts);
  const endStr = new Date(end).toLocaleDateString('ko-KR', opts);
  return `${startStr} ~ ${endStr}`;
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookmarked, setBookmarked] = useState(Boolean(post.isBookmarked));
  const [bookmarkCount, setBookmarkCount] = useState(post._count?.bookmarks ?? 0);
  const [loading, setLoading] = useState(false);

  const handleBookmarkClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (loading) return;

    const nextBookmarked = !bookmarked;
    setLoading(true);
    setBookmarked(nextBookmarked);
    setBookmarkCount((count) => Math.max(0, count + (nextBookmarked ? 1 : -1)));

    try {
      const result = await toggleBookmark(post.id);
      setBookmarked(result.bookmarked);
      setBookmarkCount((count) => {
        if (result.bookmarked === nextBookmarked) return count;
        return Math.max(0, count + (result.bookmarked ? 1 : -1));
      });
      toast.success(result.bookmarked ? '좋아요에 추가했습니다.' : '좋아요를 취소했습니다.');
    } catch {
      setBookmarked(!nextBookmarked);
      setBookmarkCount((count) => Math.max(0, count + (nextBookmarked ? -1 : 1)));
      toast.error('좋아요 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/posts/${post.id}`} className="card">
      <div className={`card__image${post.imageUrl ? '' : ' card__image--empty'}`}>
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt=""
            fill
            className="card__image-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 280px"
            loading="lazy"
            unoptimized
          />
        )}
        <button
          type="button"
          className={`card__bookmark${bookmarked ? ' card__bookmark--active' : ''}`}
          onClick={handleBookmarkClick}
          disabled={loading}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? '찜 해제' : '찜하기'}
        >
          <Heart
            className="icon-line"
            size={14}
            strokeWidth={1.5}
            fill={bookmarked ? 'currentColor' : 'none'}
            aria-hidden
          />
        </button>
      </div>
      <div className="card__body">
        <div className="card__badges">
          <span className="card__category">{getCategoryLabel(post.category)}</span>
          <PopupStatusBadge startDate={post.startDate} endDate={post.endDate} />
          <ClosingSoonBadge startDate={post.startDate} endDate={post.endDate} />
        </div>
        <h3 className="card__title">{post.title}</h3>
        <p className="card__meta-row">
          <MapPin className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
          <span className="card__location">
            {getAreaLabel(post.area)} · {post.location}
          </span>
        </p>
        <p className="card__meta-row card__meta-row--date">
          <Calendar className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
          <span className="card__dates">{formatDateRange(post.startDate, post.endDate)}</span>
        </p>
        <div className="card__stats">
          <span className="card__stat">
            <MessageSquare className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            {post._count?.comments ?? 0}
          </span>
          <span className="card__stat">
            <Heart className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
            {bookmarkCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
