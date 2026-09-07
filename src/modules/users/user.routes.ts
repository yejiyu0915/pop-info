import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { csrfMiddleware } from '../../middlewares/csrf.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { userController } from './user.controller';
import { UpdateProfileDto } from './dto/update-profile.dto';

const router = Router();

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update the current user's public profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Updated profile
 *       401:
 *         description: Unauthorized
 */
router.patch('/me', authMiddleware, csrfMiddleware, validateBody(UpdateProfileDto), userController.updateMyProfile.bind(userController));

/**
 * @swagger
 * /api/users/me/bookmarks:
 *   get:
 *     summary: Get current user's bookmarked popup posts
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated bookmarked popup list
 *       401:
 *         description: Unauthorized
 */
router.get('/me/bookmarks', authMiddleware, userController.getMyBookmarks.bind(userController));

export default router;
