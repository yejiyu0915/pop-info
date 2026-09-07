import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

function hasCompleteSmtpConfiguration(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
}

function hasPartialSmtpConfiguration(): boolean {
  return Boolean(env.SMTP_HOST || env.SMTP_USER || env.SMTP_PASS || env.SMTP_FROM);
}

async function sendWithSmtp(to: string, subject: string, text: string, html: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST!,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
  });

  await transporter.sendMail({ from: env.SMTP_FROM!, to, subject, text, html });
}

async function sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    // Local development only. Never emit authentication secrets in production logs.
    console.log('[Development email]', { to, subject, text });
    return;
  }

  if (hasCompleteSmtpConfiguration()) {
    try {
      await sendWithSmtp(to, subject, text, html);
      return;
    } catch (error) {
      console.error('[SMTP email delivery failed]', {
        message: error instanceof Error ? error.message : 'Unknown SMTP error',
      });
      throw new AppError(503, 'Unable to send verification email');
    }
  }

  if (hasPartialSmtpConfiguration()) {
    console.error('[SMTP email configuration is incomplete]');
    throw new AppError(503, 'Email delivery is not configured yet');
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
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text, html }),
  });

  if (!response.ok) {
    console.error('[Email delivery failed]', { status: response.status });
    throw new AppError(503, 'Unable to send verification email');
  }
}

function emailTemplate(title: string, description: string, code: string): string {
  return `<!doctype html>
<html lang="ko"><body style="margin:0;background:#f6f7f4;color:#202520;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <main style="max-width:520px;margin:0 auto;padding:40px 20px">
    <section style="background:#fff;border:1px solid #dfe3dc;padding:40px">
      <p style="margin:0 0 28px;font-weight:800;font-size:18px;letter-spacing:.18em">POPCAST</p>
      <p style="margin:0 0 8px;color:#5e665e;font-size:12px;font-weight:700;letter-spacing:.12em">ACCOUNT SECURITY</p>
      <h1 style="margin:0;font-size:25px;line-height:1.35">${title}</h1>
      <p style="margin:18px 0 24px;color:#4f584f;font-size:15px;line-height:1.7">${description}</p>
      <div style="padding:20px;background:#edf4ef;border:1px solid #c7d6ca;text-align:center;font-size:30px;font-weight:800;letter-spacing:.25em">${code}</div>
      <p style="margin:24px 0 0;color:#6a726a;font-size:13px;line-height:1.65">인증번호는 5분 후 만료됩니다. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.</p>
    </section>
    <p style="margin:16px 0 0;color:#7a827a;font-size:12px;line-height:1.6">POPCAST는 비밀번호나 인증번호를 이메일로 요청하지 않습니다.</p>
  </main>
</body></html>`;
}

export function sendVerificationCodeEmail(email: string, code: string): Promise<void> {
  return sendEmail(
    email,
    '[POPCAST] 회원가입 인증번호',
    `POPCAST 회원가입 인증번호: ${code}\n5분 후 만료됩니다. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.`,
    emailTemplate('이메일 인증이 필요해요', 'POPCAST 회원가입을 마무리하려면 아래 인증번호를 입력해 주세요.', code),
  );
}

export function sendPasswordResetCodeEmail(email: string, code: string): Promise<void> {
  return sendEmail(
    email,
    '[POPCAST] 비밀번호 재설정 인증번호',
    `POPCAST 비밀번호 재설정 인증번호: ${code}\n5분 후 만료됩니다. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.`,
    emailTemplate('비밀번호를 다시 설정할까요?', '아래 인증번호를 입력하면 새로운 비밀번호를 설정할 수 있어요.', code),
  );
}
