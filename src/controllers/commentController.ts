import { Request, Response } from 'express';
import commentModel, { Comment } from '../models/Comment';

export const getCommentsByTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const comments = await commentModel.getByTicker(ticker);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticker, comment_text, comment, text } = req.body;
    const commentText = comment_text || comment || text;
    const tickerSymbol = ticker || req.params.ticker;
    
    console.log('Create comment request:', { ticker: tickerSymbol, comment_text: commentText, body: req.body });
    
    if (!tickerSymbol || !commentText) {
      res.status(400).json({ 
        error: 'Ticker and comment text are required',
        received: { ticker: tickerSymbol, comment_text: commentText }
      });
      return;
    }

    const commentData: Comment = {
      ticker: tickerSymbol.toUpperCase(),
      user_id: 1, // Default user for now
      comment: commentText
    };

    const newComment = await commentModel.create(commentData);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    const { comment_text } = req.body;
    if (!comment_text) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    const updatedComment = await commentModel.update(id, { comment: comment_text } as Comment);
    
    if (!updatedComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid comment ID' });
      return;
    }

    const deleted = await commentModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const initializeCommentsTable = async (req: Request, res: Response): Promise<void> => {
  try {
    await commentModel.createTable();
    res.json({ message: 'Comments table initialized successfully' });
  } catch (error) {
    console.error('Error initializing comments table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};