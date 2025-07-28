import { Request, Response } from 'express';
import oldStockAnalysisModel from '../models/OldStockAnalysis';

export const getAllOldStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await oldStockAnalysisModel.getAll();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching old stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllOldStocksSorted = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await oldStockAnalysisModel.getAllSorted();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching sorted old stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldStockById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const stock = await oldStockAnalysisModel.getById(id);
    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    res.json(stock);
  } catch (error) {
    console.error('Error fetching old stock by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldStocksByTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const stocks = await oldStockAnalysisModel.getByTicker(ticker);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching old stocks by ticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldDailyChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const changes = await oldStockAnalysisModel.getDailyChanges();
    res.json(changes);
  } catch (error) {
    console.error('Error fetching old daily changes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldStocksWithSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await oldStockAnalysisModel.getStocksWithSource();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching old stocks with source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldHighlightedStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await oldStockAnalysisModel.getHighlightedStocks();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching old highlighted stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldHighlightedStocksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stocks = await oldStockAnalysisModel.getHighlightedStocksByDateRange(
      startDate as string,
      endDate as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching old highlighted stocks by date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldAllStocksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stocks = await oldStockAnalysisModel.getAllStocksByDateRange(
      startDate as string,
      endDate as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching old stocks by date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOldStocksByDateAndSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, source } = req.query;
    
    if (!date || !source) {
      res.status(400).json({ error: 'Date and source parameters are required' });
      return;
    }
    
    const stocks = await oldStockAnalysisModel.getStocksByDateAndSource(
      date as string,
      source as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching old stocks by date and source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};