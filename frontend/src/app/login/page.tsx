'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAuthStore } from '@/store/useAuthStore';
import { isValidPassword } from '@/lib/password';

function isSafeRedirect(path: string | null): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//');
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
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
      <p className="auth__eyebrow"><LogIn size={14} aria-hidden="true" /> WELCOME BACK</p>
      <h1 className="auth__title">로그인</h1>
      <p className="auth__description">저장한 팝업과 내 활동을 이어서 확인하세요.</p>
      <form onSubmit={handleSubmit} className="auth__form">
        <label className="auth__field">
          <span className="auth__label">이메일</span>
          <input
            type="email"
            className="auth__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="name@example.com"
            required
          />
        </label>
        <label className="auth__field">
          <span className="auth__label">비밀번호</span>
          <span className="auth__password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={8}
            />
            <button
              type="button"
              className="auth__password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </span>
        </label>
        <button
          type="submit"
          className="auth__btn auth__btn--primary"
          disabled={submitting || !email.trim() || !isValidPassword(password)}
        >
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
