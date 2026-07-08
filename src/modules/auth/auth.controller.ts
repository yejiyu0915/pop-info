import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { LoginDto } from './dto/login.dto';
import { authService } from './auth.service';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
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

      res.json({ message: 'Login successful', user });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('access_token', COOKIE_OPTIONS);
      res.json({ message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
