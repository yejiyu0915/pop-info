'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/AppHeader';
import { forgotPassword, resetPassword, verifyResetCode } from '@/lib/auth';
import { isAxiosError } from 'axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetVerificationState = () => {
    setCodeSent(false);
    setIsCodeVerified(false);
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    resetVerificationState();
  };

  const handleSendCode = async () => {
    if (!email) {
      toast.error('이메일을 입력해 주세요.');
      return;
    }

    setSendingCode(true);
    try {
      await forgotPassword({ email });
      setCodeSent(true);
      setIsCodeVerified(false);
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('인증 코드가 발송되었습니다. 서버 콘솔에서 코드를 확인하세요.');
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) {
          toast.error('존재하지 않는 회원입니다.');
        } else if (status === 400) {
          toast.error('입력 정보를 확인해 주세요.');
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
      await verifyResetCode({ email, code: verificationCode });
      setIsCodeVerified(true);
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
    if (!isCodeVerified) return;

    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ email, code: verificationCode, newPassword });
      toast.success('비밀번호가 변경되었습니다. 로그인해 주세요.');
      router.push('/login');
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400 || status === 410) {
          toast.error('인증이 만료되었습니다. 처음부터 다시 진행해 주세요.');
          resetVerificationState();
        } else if (status === 404) {
          toast.error('존재하지 않는 회원입니다.');
        } else {
          toast.error('비밀번호 변경에 실패했습니다.');
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
          <h1 className="auth__title">비밀번호 찾기</h1>
          <form onSubmit={handleSubmit} className="auth__form">
        <label className="auth__field">
          <span className="auth__label">이메일</span>
          <input
            type="email"
            className="auth__input"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
          />
        </label>

        <button
          type="button"
          className="auth__btn auth__btn--secondary"
          onClick={handleSendCode}
          disabled={sendingCode}
        >
          {sendingCode ? '발송 중...' : '인증 코드 발송'}
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

        {isCodeVerified && (
          <>
            <p className="auth__verified">이메일 인증이 완료되었습니다.</p>
            <label className="auth__field">
              <span className="auth__label">새 비밀번호</span>
              <input
                type="password"
                className="auth__input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label className="auth__field">
              <span className="auth__label">새 비밀번호 확인</span>
              <input
                type="password"
                className="auth__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
          </>
        )}

        <button
          type="submit"
          className="auth__btn auth__btn--primary"
          disabled={submitting || !isCodeVerified}
        >
          {submitting ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
      <p className="auth__footer">
        <Link href="/login" className="auth__footer-link">
          로그인으로 돌아가기
        </Link>
      </p>
        </div>
      </div>
    </main>
  );
}
