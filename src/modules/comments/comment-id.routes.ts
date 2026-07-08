import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { commentController } from './comment.controller';
import { UpdateCommentDto } from './dto/update-comment.dto';

const router = Router();

/**
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     summary: Update a comment (author only)
 *     tags: [Comments]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Comment not found
 */
router.patch('/:id', authMiddleware, validateBody(UpdateCommentDto), commentController.updateById.bind(commentController));

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment (author only)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Comment deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', authMiddleware, commentController.deleteById.bind(commentController));

export default router;
