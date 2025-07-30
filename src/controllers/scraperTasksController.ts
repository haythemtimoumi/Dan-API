import { Request, Response } from 'express';
import { ScraperTasksModel } from '../models/ScraperTasks';

export const getListTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const listTypes = await ScraperTasksModel.getDistinctListTypes();
    res.json(listTypes);
  } catch (error) {
    console.error('Error fetching list types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMultipleTickers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tickers } = req.body;
    
    if (!Array.isArray(tickers) || tickers.length === 0) {
      res.status(400).json({ error: 'tickers must be a non-empty array' });
      return;
    }

    const result = await ScraperTasksModel.addMultipleTickers(tickers);
    res.json({
      message: 'Tickers processed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error adding multiple tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};