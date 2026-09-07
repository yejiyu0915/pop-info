import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    // Local development only. Never emit authentication secrets in production logs.
    console.log('[Development email]', { to, subject, text });
    return;
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new AppError(503, 'Email delivery is not configured yet');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text }),
  });

  if (!response.ok) {
    console.error('[Email delivery failed]', { status: response.status });
    throw new AppError(503, 'Unable to send verification email');
  }
}

export function sendVerificationCodeEmail(email: string, code: string): Promise<void> {
  return sendEmail(email, 'POPCAST 이메일 인증 코드', `인증 코드: ${code}\n5분 후 만료됩니다.`);
}

export function sendPasswordResetCodeEmail(email: string, code: string): Promise<void> {
  return sendEmail(email, 'POPCAST 비밀번호 재설정 코드', `재설정 코드: ${code}\n5분 후 만료됩니다.`);
}
