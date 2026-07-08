import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import commentIdRoutes from '../modules/comments/comment-id.routes';
import postRoutes from '../modules/posts/post.routes';
import userRoutes from '../modules/users/user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentIdRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;
