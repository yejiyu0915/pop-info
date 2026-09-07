'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { PopupPostForm } from '@/components/posts/PopupPostForm';
import { createPost } from '@/lib/posts';
import { useAuthStore } from '@/store/useAuthStore';

export default function WritePostPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      toast.error('권한이 없습니다.');
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
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
        <div className="form-page__inner">
          <h2 className="form-page__title">팝업 등록</h2>
          <PopupPostForm
            mode="create"
            submitLabel="등록"
            cancelHref="/"
            onSubmit={async (values) => {
              const post = await createPost(values);
              toast.success('팝업이 등록되었습니다.');
              router.push(`/posts/${post.id}`);
            }}
          />
        </div>
      </div>
    </main>
  );
}
