import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendPasswordResetCodeEmail, sendVerificationCodeEmail } from '../../lib/emailSender';
import {
  consumeVerified,
  generateVerificationCode,
  setPending,
  verify as verifyEmailCode,
} from '../../lib/emailVerificationStore';
import {
  consumePasswordResetVerified,
  generateVerificationCode as generateResetCode,
  setPasswordResetPending,
  verifyPasswordReset,
} from '../../lib/passwordResetStore';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';
import { userService } from '../users/user.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';

const SALT_ROUNDS = 10;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class AuthService {
  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(dto.email) },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new AppError(401, 'Unauthorized');
    }

    return user;
  }

  async sendVerificationCode(dto: SendVerificationCodeDto) {
    const existing = await prisma.user.findUnique({
      where: { email: normalizeEmail(dto.email) },
    });

    // Do not disclose whether an email address is registered.
    if (existing) return { message: 'If the email can be registered, a verification code has been sent' };

    const code = generateVerificationCode();
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    await setPending(normalizeEmail(dto.email), {
      code,
      password: passwordHash,
      name: dto.name,
    });

    await sendVerificationCodeEmail(normalizeEmail(dto.email), code);

    return { message: 'If the email can be registered, a verification code has been sent' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    await verifyEmailCode(dto.email, dto.code);
    return { verified: true };
  }

  async register(dto: RegisterDto) {
    const { password, name } = await consumeVerified(dto.email);

    const user = await userService.createUserFromPasswordHash(normalizeEmail(dto.email), password, name);

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(dto.email) },
    });

    // A uniform response prevents account enumeration through password reset.
    if (!user) return { message: 'If the account exists, a password reset code has been sent' };

    const code = generateResetCode();
    await setPasswordResetPending(normalizeEmail(dto.email), code);
    await sendPasswordResetCodeEmail(normalizeEmail(dto.email), code);

    return { message: 'If the account exists, a password reset code has been sent' };
  }

  async verifyResetCode(dto: VerifyResetCodeDto) {
    await verifyPasswordReset(dto.email, dto.code);
    return { verified: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    await consumePasswordResetVerified(dto.email, dto.code);

    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(dto.email) },
    });

    if (!user) {
      throw new AppError(404, '존재하지 않는 회원입니다');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successful' };
  }
}

export const authService = new AuthService();
