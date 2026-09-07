import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { userController } from './user.controller';

const router = Router();

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
