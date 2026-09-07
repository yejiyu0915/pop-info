'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { BadgeCheck, Eye, EyeOff, Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { register, sendVerificationCode, verifyEmail } from '@/lib/auth';
import { isValidPassword, PASSWORD_RULE_MESSAGE } from '@/lib/password';
import { isAxiosError } from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetVerificationState = () => {
    setCodeSent(false);
    setIsEmailVerified(false);
    setVerificationCode('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    resetVerificationState();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    resetVerificationState();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    resetVerificationState();
  };

  const handleSendCode = async () => {
    if (!email || !password || !name) {
      toast.error('이름, 이메일, 비밀번호를 모두 입력해 주세요.');
      return;
    }
    if (!isValidPassword(password)) {
      toast.error(PASSWORD_RULE_MESSAGE);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setSendingCode(true);
    try {
      await sendVerificationCode({ email, password, name });
      setCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');
      toast.success(
        process.env.NODE_ENV === 'development'
          ? '인증 코드를 발송했습니다. 개발 중에는 API 실행 창에서 확인할 수 있습니다.'
          : '인증 코드를 발송했습니다. 이메일을 확인해 주세요.',
      );
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 409) {
          toast.error('이미 사용 중인 이메일입니다.');
        } else if (status === 400) {
          toast.error('입력 정보를 확인해 주세요. (비밀번호는 영문·숫자 포함 8자 이상)');
        } else {
          toast.error('인증 코드 발송에 실패했습니다.');
        }
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('6자리 인증 코드를 입력해 주세요.');
      return;
    }

    setVerifying(true);
    try {
      await verifyEmail({ email: email.trim(), code: verificationCode });
      setIsEmailVerified(true);
      toast.success('이메일 인증이 완료되었습니다.');
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 410) {
          toast.error('인증 코드가 만료되었습니다. 다시 발송해 주세요.');
          resetVerificationState();
        } else if (status === 400) {
          toast.error('인증 코드가 올바르지 않습니다.');
        } else {
          toast.error('이메일 인증에 실패했습니다.');
        }
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) return;

    setSubmitting(true);
    try {
      await register({ email: email.trim() });
      toast.success('회원가입이 완료되었습니다. 로그인해 주세요.');
      router.push('/login');
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400 || status === 410) {
          toast.error('이메일 인증이 만료되었습니다. 처음부터 다시 진행해 주세요.');
          resetVerificationState();
        } else {
          toast.error('회원가입에 실패했습니다.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <AppHeader />
      <div className="container">
        <div className="auth">
          <p className="auth__eyebrow"><UserPlus size={14} aria-hidden="true" /> JOIN POPCAST</p>
          <h1 className="auth__title">회원가입</h1>
          <p className="auth__description">관심 팝업을 저장하고, 나만의 방문 목록을 만들어 보세요.</p>
          <form onSubmit={handleSubmit} className="auth__form">
        <label className="auth__field">
          <span className="auth__label">이름</span>
          <input
            type="text"
            className="auth__input"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            maxLength={50}
            autoComplete="name"
            placeholder="이름 또는 닉네임"
          />
        </label>
        <label className="auth__field">
          <span className="auth__label">이메일</span>
          <input
            type="email"
            className="auth__input"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            autoComplete="email"
            placeholder="name@example.com"
          />
        </label>
        <label className="auth__field">
          <span className="auth__label">비밀번호</span>
          <span className="auth__password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth__input"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              aria-describedby="password-rule"
            />
            <button type="button" className="auth__password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </span>
          <span id="password-rule" className="auth__hint">{PASSWORD_RULE_MESSAGE}</span>
        </label>

        <label className="auth__field">
          <span className="auth__label">비밀번호 확인</span>
          <span className="auth__password-wrap">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="auth__input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={Boolean(confirmPassword) && password !== confirmPassword}
            />
            <button type="button" className="auth__password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
              {showConfirmPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </span>
          {confirmPassword && password !== confirmPassword && <span className="auth__hint auth__hint--error">비밀번호가 일치하지 않습니다.</span>}
        </label>

        <button
          type="button"
          className="auth__btn auth__btn--secondary"
          onClick={handleSendCode}
          disabled={sendingCode}
        >
          <Mail size={16} aria-hidden="true" />
          {sendingCode ? '발송 중...' : '인증 코드 받기'}
        </button>

        {codeSent && (
          <>
            <label className="auth__field">
              <span className="auth__label">인증 코드 (6자리)</span>
              <input
                type="text"
                className="auth__input"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
            </label>
            <button
              type="button"
              className="auth__btn auth__btn--secondary"
              onClick={handleVerifyCode}
              disabled={verifying || verificationCode.length !== 6}
            >
              {verifying ? '확인 중...' : '인증 확인'}
            </button>
          </>
        )}

        {isEmailVerified && <p className="auth__verified"><BadgeCheck size={16} aria-hidden="true" /> 이메일 인증이 완료되었습니다.</p>}

        <button
          type="submit"
          className="auth__btn auth__btn--primary"
          disabled={submitting || !isEmailVerified}
        >
          {submitting ? '가입 중...' : '회원가입'}
        </button>
      </form>
      <p className="auth__footer">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="auth__footer-link">
          로그인
        </Link>
      </p>
        </div>
      </div>
    </main>
  );
}
