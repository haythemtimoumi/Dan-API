import { Router } from 'express';
import { getCommentsByUser } from '../controllers/commentController';

const router = Router();

// GET comments by user ID
router.get('/user/:userId', getCommentsByUser);

export default router;