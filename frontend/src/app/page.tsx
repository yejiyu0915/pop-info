'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { fetchPosts } from '@/lib/posts';
import { useAuthStore } from '@/store/useAuthStore';
import type { PaginatedPosts } from '@/types/post';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [posts, setPosts] = useState<PaginatedPosts | null>(null);
  const [page, setPage] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    setLoadingPosts(true);
    fetchPosts(page, 10)
      .then(setPosts)
      .finally(() => setLoadingPosts(false));
  }, [page]);

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const renderPagination = () => {
    if (!posts?.meta) return null;
    const { page: current, totalPages } = posts.meta;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={current <= 1}
          onClick={() => setPage(current - 1)}
        >
          이전
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            disabled={p === current}
            onClick={() => setPage(p)}
            style={{ fontWeight: p === current ? 'bold' : 'normal' }}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={current >= totalPages}
          onClick={() => setPage(current + 1)}
        >
          다음
        </button>
      </div>
    );
  };

  if (isLoading) {
    return <main style={{ padding: '2rem' }}>인증 상태 확인 중...</main>;
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>게시판</h1>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          {isAuthenticated ? (
            <>
              <Link href="/posts/write">
                <button type="button">글쓰기</button>
              </Link>
              <button type="button" onClick={handleLogout}>
                로그아웃
              </button>
              {user && <span style={{ marginLeft: '0.5rem' }}>{user.name ?? user.email}</span>}
            </>
          ) : (
            <>
              <Link href="/login">
                <button type="button">로그인</button>
              </Link>
              <Link href="/register">
                <button type="button">회원가입</button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {loadingPosts ? (
        <p>게시글 불러오는 중...</p>
      ) : posts && posts.data.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>제목</th>
              <th style={{ padding: '0.5rem' }}>작성자</th>
              <th style={{ padding: '0.5rem' }}>댓글</th>
              <th style={{ padding: '0.5rem' }}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.data.map((post) => (
              <tr key={post.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{post.title}</td>
                <td style={{ padding: '0.5rem' }}>{post.author.name ?? post.author.email}</td>
                <td style={{ padding: '0.5rem' }}>{post._count?.comments ?? 0}</td>
                <td style={{ padding: '0.5rem' }}>
                  {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>게시글이 없습니다.</p>
      )}

      {renderPagination()}
    </main>
  );
}
