import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { csrfMiddleware } from '../../middlewares/csrf.middleware';
import { rateLimit } from '../../middlewares/rate-limit.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { authController } from './auth.controller';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';

const router = Router();
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: (req) => `${req.ip}:${req.path}:${String(req.body?.email ?? '')}` });
const verifyRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: (req) => `${req.ip}:${req.path}` });

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Login successful. JWT is set as httpOnly cookie.
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', authRateLimit, validateBody(LoginDto), authController.login.bind(authController));

/**
 * @swagger
 * /api/auth/send-verification-code:
 *   post:
 *     summary: Send a 6-digit email verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Verification code sent
 *       409:
 *         description: Email already in use
 */
router.post(
  '/send-verification-code',
  authRateLimit, validateBody(SendVerificationCodeDto),
  authController.sendVerificationCode.bind(authController),
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with 6-digit code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or missing verification code
 *       410:
 *         description: Verification code expired
 */
router.post('/verify-email', verifyRateLimit, validateBody(VerifyEmailDto), authController.verifyEmail.bind(authController));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Complete registration after email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Email verification required
 *       410:
 *         description: Verification session expired
 */
router.post('/register', validateBody(RegisterDto), authController.register.bind(authController));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send a 6-digit password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset code sent
 *       404:
 *         description: User not found
 */
router.post(
  '/forgot-password',
  authRateLimit, validateBody(ForgotPasswordDto),
  authController.forgotPassword.bind(authController),
);

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *     responses:
 *       200:
 *         description: Reset code verified
 *       400:
 *         description: Invalid or missing verification code
 *       410:
 *         description: Verification code expired
 */
router.post(
  '/verify-reset-code',
  verifyRateLimit, validateBody(VerifyResetCodeDto),
  authController.verifyResetCode.bind(authController),
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password after email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Verification required or invalid code
 *       404:
 *         description: User not found
 *       410:
 *         description: Verification code expired
 */
router.post(
  '/reset-password',
  authRateLimit, validateBody(ResetPasswordDto),
  authController.resetPassword.bind(authController),
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, authController.me.bind(authController));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and clear auth cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', csrfMiddleware, authController.logout.bind(authController));

export default router;
