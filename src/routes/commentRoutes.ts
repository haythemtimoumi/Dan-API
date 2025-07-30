import { Router } from 'express';
import {
  getCommentsByTicker,
  createComment,
  updateComment,
  deleteComment,
  getTickerColor,
  getAllTickerColors,
  initializeCommentsTable
} from '../controllers/commentController';

const router = Router();

// Initialize comments table
router.post('/init', initializeCommentsTable);

// GET all ticker colors
router.get('/colors', getAllTickerColors);

// GET color by ticker
router.get('/ticker/:ticker/color', getTickerColor);

// GET comments by ticker
router.get('/ticker/:ticker', getCommentsByTicker);

// POST create new comment for ticker
router.post('/ticker/:ticker', createComment);

// POST create new comment
router.post('/', createComment);

// PUT update comment
router.put('/:id', updateComment);

// DELETE comment
router.delete('/:id', deleteComment);

export default router;