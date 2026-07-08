import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import commentRoutes from '../comments/comment.routes';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { postController } from './post.controller';

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get paginated posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starts at 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated post list with meta (total, page, limit, totalPages)
 */
router.get('/', postController.findAll.bind(postController));

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post with comments
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post detail
 *       404:
 *         description: Post not found
 */
router.get('/:id', postController.findById.bind(postController));

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post (requires login)
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateBody(CreatePostDto), postController.create.bind(postController));

router.use('/:postId/comments', commentRoutes);

/**
 * @swagger
 * /api/posts/{id}:
 *   patch:
 *     summary: Update a post (author only)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Post not found
 */
router.patch('/:id', authMiddleware, validateBody(UpdatePostDto), postController.update.bind(postController));

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post (author only)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Post not found
 */
router.delete('/:id', authMiddleware, postController.delete.bind(postController));

export default router;
