import { VerificationPurpose } from '../generated/prisma/client';
import { AppError } from '../middlewares/error.middleware';
import { prisma } from './prisma';
import { CODE_TTL_MS, generateVerificationCode, hashVerificationCode } from './emailVerificationStore';

export { CODE_TTL_MS, generateVerificationCode };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertNotExpired(expiresAt: Date): void {
  if (Date.now() > expiresAt.getTime()) {
    throw new AppError(410, 'Verification code has expired');
  }
}

export async function setPasswordResetPending(email: string, code: string): Promise<void> {
  const key = normalizeEmail(email);

  await prisma.verificationCode.upsert({
    where: {
      email_purpose: {
        email: key,
        purpose: VerificationPurpose.PASSWORD_RESET,
      },
    },
    create: {
      email: key,
      code: hashVerificationCode(code),
      purpose: VerificationPurpose.PASSWORD_RESET,
      verified: false,
      attempts: 0,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
    update: {
      code: hashVerificationCode(code),
      verified: false,
      attempts: 0,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
}

export async function verifyPasswordReset(email: string, code: string): Promise<void> {
  const key = normalizeEmail(email);
  const entry = await prisma.verificationCode.findUnique({
    where: {
      email_purpose: {
        email: key,
        purpose: VerificationPurpose.PASSWORD_RESET,
      },
    },
  });

  if (!entry) {
    throw new AppError(400, 'Verification code not found. Please request a new code.');
  }

  assertNotExpired(entry.expiresAt);

  if (entry.attempts >= 5) {
    await prisma.verificationCode.delete({ where: { id: entry.id } });
    throw new AppError(429, 'Too many invalid verification attempts. Please request a new code.');
  }

  if (entry.code !== hashVerificationCode(code)) {
    const attempts = entry.attempts + 1;
    if (attempts >= 5) {
      await prisma.verificationCode.delete({ where: { id: entry.id } });
      throw new AppError(429, 'Too many invalid verification attempts. Please request a new code.');
    }
    await prisma.verificationCode.update({ where: { id: entry.id }, data: { attempts } });
    throw new AppError(400, 'Invalid verification code');
  }

  await prisma.verificationCode.update({
    where: { id: entry.id },
    data: { verified: true },
  });
}

export async function consumePasswordResetVerified(email: string, code: string): Promise<void> {
  const key = normalizeEmail(email);
  const entry = await prisma.verificationCode.findUnique({
    where: {
      email_purpose: {
        email: key,
        purpose: VerificationPurpose.PASSWORD_RESET,
      },
    },
  });

  if (!entry) {
    throw new AppError(400, 'Email verification is required');
  }

  assertNotExpired(entry.expiresAt);

  if (!entry.verified) {
    throw new AppError(400, 'Email verification is required');
  }

  if (entry.code !== hashVerificationCode(code)) {
    throw new AppError(400, 'Invalid verification code');
  }

  await prisma.verificationCode.delete({ where: { id: entry.id } });
}
