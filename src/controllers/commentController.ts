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