import { Router } from 'express';
import { getCommentsByUser, createComment, deleteComment } from '../controllers/commentController';

const router = Router();

// GET comments by user ID
router.get('/user/:userId', getCommentsByUser);

// POST create new comment
router.post('/', createComment);

// DELETE comment by user
router.delete('/:commentId/user/:userId', deleteComment);

export default router;