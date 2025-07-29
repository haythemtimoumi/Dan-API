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