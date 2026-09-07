'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { toggleBookmark } from '@/lib/bookmarks';
import { useAuthStore } from '@/store/useAuthStore';

interface BookmarkButtonProps {
  postId: number;
  initialBookmarked: boolean;
  onToggle?: (bookmarked: boolean) => void;
}

export function BookmarkButton({ postId, initialBookmarked, onToggle }: BookmarkButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const result = await toggleBookmark(postId);
      setBookmarked(result.bookmarked);
      onToggle?.(result.bookmarked);
      toast.success(result.bookmarked ? '좋아요에 추가했습니다.' : '좋아요를 취소했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`action__bookmark${bookmarked ? ' action__bookmark--active' : ''}`}
      aria-pressed={bookmarked}
    >
      <span className={`icon-wrapper${bookmarked ? ' icon-wrapper--brick' : ''}`} aria-hidden>
        <Heart
          className="icon-line"
          size={16}
          strokeWidth={1.5}
          fill={bookmarked ? 'currentColor' : 'none'}
        />
      </span>
      {bookmarked ? '좋아요 취소' : '좋아요'}
    </button>
  );
}
