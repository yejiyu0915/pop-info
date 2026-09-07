'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuthStore } from '@/store/useAuthStore';

function isSafeRedirect(path: string | null): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//');
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      const redirect = searchParams.get('redirect');
      router.push(isSafeRedirect(redirect) ? redirect : '/');
    } catch {
      toast.error('이메일 또는 비밀번호를 확인해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth__title">로그인</h1>
      <form onSubmit={handleSubmit} className="auth__form">
        <label className="auth__field">
          <span className="auth__label">이메일</span>
          <input
            type="email"
            className="auth__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="auth__field">
          <span className="auth__label">비밀번호</span>
          <input
            type="password"
            className="auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <button type="submit" className="auth__btn auth__btn--primary" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p className="auth__footer">
        <Link href="/forgot-password" className="auth__footer-link">
          비밀번호 찾기
        </Link>
      </p>
      <p className="auth__footer">
        계정이 없으신가요?{' '}
        <Link href="/register" className="auth__footer-link">
          회원가입
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="page-shell">
      <AppHeader />
      <div className="container">
        <div className="auth">
          <Suspense fallback={<p className="home__message">불러오는 중...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
