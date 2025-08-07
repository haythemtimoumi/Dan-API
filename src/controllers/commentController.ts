import { Request, Response } from 'express';
import commentModel from '../models/Comment';

export const getCommentsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    const comments = await commentModel.getCommentsByUser(userId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments by user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { comment, user_id, ticker_symbol, color } = req.body;
    
    if (!comment || !user_id || !ticker_symbol) {
      res.status(400).json({ error: 'Comment, user_id, and ticker_symbol are required' });
      return;
    }

    const newComment = await commentModel.createComment({ comment, user_id, ticker_symbol, color });
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error && error.message === 'Ticker not found') {
      res.status(404).json({ error: 'Ticker not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(commentId) || isNaN(userId)) {
      res.status(400).json({ error: 'Invalid comment ID or user ID format' });
      return;
    }

    const deleted = await commentModel.deleteComment(commentId, userId);
    
    if (!deleted) {
      res.status(404).json({ error: 'Comment not found or not authorized' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};