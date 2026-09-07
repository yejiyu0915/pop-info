'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { PopupPostForm } from '@/components/posts/PopupPostForm';
import { isNotFoundError } from '@/lib/axiosError';
import { fetchPost, updatePost } from '@/lib/posts';
import { useAuthStore } from '@/store/useAuthStore';
import type { Post } from '@/types/post';

function EditShell({ children }: { children: ReactNode }) {
  return (
    <main className="form-page page-shell">
      <AppHeader />
      <div className="container">
        {children}
      </div>
    </main>
  );
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const id = Number(params.id);
  const isValidId = Number.isInteger(id) && id > 0;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(isValidId);
  const [notFound, setNotFound] = useState(!isValidId);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

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

  const isUnauthorized =
    !authLoading &&
    !loading &&
    !!post &&
    !!user &&
    user.id !== post.authorId;

  useEffect(() => {
    if (!isUnauthorized) return;
    toast.error('권한이 없습니다.');
    router.replace(`/posts/${id}`);
  }, [isUnauthorized, id, router]);

  if (!isValidId || notFound) {
    return (
      <EditShell>
        <div className="home__state">
          <p className="home__message">팝업을 찾을 수 없습니다.</p>
          <Link href="/" className="home__link">
            목록으로
          </Link>
        </div>
      </EditShell>
    );
  }

  if (fetchError) {
    return (
      <EditShell>
        <div className="home__state">
          <p className="home__message">데이터를 불러오지 못했습니다.</p>
          <button type="button" className="home__retry" onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      </EditShell>
    );
  }

  if (loading || authLoading || !post || isUnauthorized) {
    return (
      <EditShell>
        <div className="home__state">
          <p className="home__message">불러오는 중...</p>
        </div>
      </EditShell>
    );
  }

  if (!user || user.id !== post.authorId) {
    return null;
  }

  return (
    <EditShell>
      <div className="form-page__inner">
        <h2 className="form-page__title">팝업 수정</h2>
        <PopupPostForm
          mode="edit"
          initialValues={post}
          submitLabel="저장"
          cancelHref={`/posts/${id}`}
          onSubmit={async (values) => {
            await updatePost(id, values);
            toast.success('팝업이 수정되었습니다.');
            router.push(`/posts/${id}`);
          }}
        />
      </div>
    </EditShell>
  );
}
