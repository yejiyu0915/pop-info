import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { authService } from './auth.service';
import { createCsrfToken, CSRF_COOKIE_NAME } from '../../middlewares/csrf.middleware';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const CSRF_COOKIE_OPTIONS = {
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as LoginDto;
      const { token, user } = await authService.login(dto);

      res.cookie('access_token', token, {
        ...COOKIE_OPTIONS,
        maxAge: COOKIE_MAX_AGE_MS,
      });
      const csrfToken = createCsrfToken();
      res.cookie(CSRF_COOKIE_NAME, csrfToken, { ...CSRF_COOKIE_OPTIONS, maxAge: COOKIE_MAX_AGE_MS });

      res.json({ message: 'Login successful', user, csrfToken });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ user, csrfToken: req.cookies?.[CSRF_COOKIE_NAME] });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('access_token', COOKIE_OPTIONS);
      res.clearCookie(CSRF_COOKIE_NAME, CSRF_COOKIE_OPTIONS);
      res.json({ message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }

  async sendVerificationCode(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as SendVerificationCodeDto;
      const result = await authService.sendVerificationCode(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as VerifyEmailDto;
      const result = await authService.verifyEmail(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as RegisterDto;
      const user = await authService.register(dto);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as ForgotPasswordDto;
      const result = await authService.forgotPassword(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyResetCode(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as VerifyResetCodeDto;
      const result = await authService.verifyResetCode(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as ResetPasswordDto;
      const result = await authService.resetPassword(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
