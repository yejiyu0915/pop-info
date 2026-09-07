'use client';

import { useEffect, useState } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { fetchPersonalizedPosts } from '@/lib/recommendations';
import { useAuthStore } from '@/store/useAuthStore';
import type { Post } from '@/types/post';

export function PersonalizedFeed() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const displayName = user?.name?.trim() || user?.email || 'GUEST';
  const requestKey = `${isAuthenticated}:${user?.id ?? 'guest'}`;
  const [activeKey, setActiveKey] = useState(requestKey);

  if (!authLoading && requestKey !== activeKey) {
    setActiveKey(requestKey);
    setLoading(true);
    setError(false);
  }

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    fetchPersonalizedPosts({ isAuthenticated, limit: 6 })
      .then((data) => {
        if (!cancelled) setPosts(data);
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
  }, [authLoading, isAuthenticated, user?.id]);

  return (
    <section className="personalized" aria-labelledby="personalized-title">
      <h2 id="personalized-title" className="home__section-title">
        {displayName}님이 좋아할 만한 팝업
      </h2>
      <p className="personalized__lead">
        {isAuthenticated
          ? '찜한 팝업의 지역·카테고리를 바탕으로 골라 모았습니다.'
          : '인기 있는 팝업을 먼저 만나보세요.'}
      </p>

      {error ? (
        <div className="home__state">
          <p className="home__message">추천을 불러오지 못했습니다.</p>
        </div>
      ) : loading || authLoading ? (
        <div className="home__state">
          <p className="home__message">추천 팝업을 준비하는 중...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="home__grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="home__state">
          <p className="home__message">아직 추천할 팝업이 없습니다.</p>
        </div>
      )}
    </section>
  );
}
