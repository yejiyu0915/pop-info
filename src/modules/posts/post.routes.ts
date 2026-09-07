import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../../middlewares/auth.middleware';
import { csrfMiddleware } from '../../middlewares/csrf.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { bookmarkController } from '../bookmarks/bookmark.controller';
import commentRoutes from '../comments/comment.routes';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { postController } from './post.controller';

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get paginated popup posts with filters
 *     tags: [Posts]
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
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword (title, content, location)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FASHION, FOOD, ART, LIFESTYLE, ETC]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ONGOING, UPCOMING, ENDED]
 *         description: Filter by popup status (day-level)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [latest, popular, endingSoon]
 *           default: latest
 *         description: Sort order (endingSoon excludes ended popups)
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *           enum: [SEONGSU, HONGDAE, YONGSAN, SEOUL, GYEONGGI, INCHEON, ETC]
 *     responses:
 *       200:
 *         description: Paginated popup list with meta
 */
router.get('/', optionalAuthMiddleware, postController.findAll.bind(postController));

/**
 * @swagger
 * /api/posts/kv:
 *   get:
 *     summary: Get main KV banner posts (ongoing, isKv=true, max 5)
 *     tags: [Posts]
 */
router.get('/kv', optionalAuthMiddleware, postController.findKv.bind(postController));

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new popup post (requires login)
 *     tags: [Posts]
 */
router.post('/', authMiddleware, csrfMiddleware, validateBody(CreatePostDto), postController.create.bind(postController));

/**
 * @swagger
 * /api/posts/{id}/bookmark:
 *   post:
 *     summary: Toggle bookmark on a popup post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bookmark toggled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/:id/bookmark', authMiddleware, csrfMiddleware, bookmarkController.toggle.bind(bookmarkController));

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a popup post with comments
 *     tags: [Posts]
 */
router.get('/:id', optionalAuthMiddleware, postController.findById.bind(postController));

router.patch('/:id', authMiddleware, csrfMiddleware, validateBody(UpdatePostDto), postController.update.bind(postController));
router.delete('/:id', authMiddleware, csrfMiddleware, postController.delete.bind(postController));

router.use('/:postId/comments', commentRoutes);

export default router;
