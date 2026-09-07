import { VerificationPurpose } from '../generated/prisma/client';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { prisma } from './prisma';

export const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertNotExpired(expiresAt: Date): void {
  if (Date.now() > expiresAt.getTime()) {
    throw new AppError(410, 'Verification code has expired');
  }
}

export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 1_000_000).toString();
}

export function hashVerificationCode(code: string): string {
  return crypto.createHmac('sha256', env.JWT_SECRET).update(code).digest('hex');
}

function codeMatches(storedHash: string, code: string): boolean {
  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(hashVerificationCode(code), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

async function verifyCode(entry: { id: number; code: string; attempts: number }, code: string): Promise<void> {
  if (entry.attempts >= MAX_CODE_ATTEMPTS) {
    await prisma.verificationCode.delete({ where: { id: entry.id } });
    throw new AppError(429, 'Too many invalid verification attempts. Please request a new code.');
  }

  if (!codeMatches(entry.code, code)) {
    const attempts = entry.attempts + 1;
    if (attempts >= MAX_CODE_ATTEMPTS) {
      await prisma.verificationCode.delete({ where: { id: entry.id } });
      throw new AppError(429, 'Too many invalid verification attempts. Please request a new code.');
    }
    await prisma.verificationCode.update({ where: { id: entry.id }, data: { attempts } });
    throw new AppError(400, 'Invalid verification code');
  }
}

export async function setPending(
  email: string,
  data: { code: string; password: string; name: string },
): Promise<void> {
  const key = normalizeEmail(email);

  await prisma.verificationCode.upsert({
    where: {
      email_purpose: {
        email: key,
        purpose: VerificationPurpose.REGISTER,
      },
    },
    create: {
      email: key,
      code: hashVerificationCode(data.code),
      purpose: VerificationPurpose.REGISTER,
      password: data.password,
      name: data.name,
      verified: false,
      attempts: 0,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
    update: {
      code: hashVerificationCode(data.code),
      password: data.password,
      name: data.name,
      verified: false,
      attempts: 0,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
}

export async function verify(email: string, code: string): Promise<void> {
  const key = normalizeEmail(email);
  const entry = await prisma.verificationCode.findUnique({
    where: {
      email_purpose: {
        email: key,
        purpose: VerificationPurpose.REGISTER,
      },
    },
  });

  if (!entry) {
    throw new AppError(400, 'Verification code not found. Please request a new code.');
  }

  assertNotExpired(entry.expiresAt);

  await verifyCode(entry, code);

  await prisma.verificationCode.update({
    where: { id: entry.id },
    data: { verified: true },
  });
}

export async function consumeVerified(
  email: string,
): Promise<{ password: string; name: string }> {
  const key = normalizeEmail(email);
  const entry = await prisma.verificationCode.findUnique({
    where: {
      email_purpose: {
        email: key,
        purpose: VerificationPurpose.REGISTER,
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

  if (!entry.password || !entry.name) {
    throw new AppError(400, 'Email verification is required');
  }

  await prisma.verificationCode.delete({ where: { id: entry.id } });

  return {
    password: entry.password,
    name: entry.name,
  };
}
