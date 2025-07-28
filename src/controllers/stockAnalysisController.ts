import { Request, Response } from 'express';
import stockAnalysisModel, { StockAnalysis } from '../models/StockAnalysis';

export const getAllStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockAnalysisModel.getAll();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllStocksSorted = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockAnalysisModel.getAllSorted();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching sorted stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStockById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const stock = await stockAnalysisModel.getById(id);
    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    res.json(stock);
  } catch (error) {
    console.error('Error fetching stock by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStocksByTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const stocks = await stockAnalysisModel.getByTicker(ticker);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by ticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const stockData: StockAnalysis = req.body;
    const newStock = await stockAnalysisModel.create(stockData);
    res.status(201).json(newStock);
  } catch (error) {
    console.error('Error creating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const stockData: StockAnalysis = req.body;
    const updatedStock = await stockAnalysisModel.update(id, stockData);
    
    if (!updatedStock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    res.json(updatedStock);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const deleted = await stockAnalysisModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDailyChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const changes = await stockAnalysisModel.getDailyChanges();
    res.json(changes);
  } catch (error) {
    console.error('Error fetching daily changes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStocksWithSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockAnalysisModel.getStocksWithSource();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks with source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHighlightedStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockAnalysisModel.getHighlightedStocks();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching highlighted stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHighlightedStocksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stocks = await stockAnalysisModel.getHighlightedStocksByDateRange(
      startDate as string,
      endDate as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching highlighted stocks by date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStocksByDateAndSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, source } = req.query;
    
    if (!date || !source) {
      res.status(400).json({ error: 'Date and source parameters are required' });
      return;
    }
    
    const stocks = await stockAnalysisModel.getStocksByDateAndSource(
      date as string,
      source as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by date and source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAvailableSources = async (req: Request, res: Response): Promise<void> => {
  try {
    const sources = await stockAnalysisModel.getAvailableSources();
    res.json(sources);
  } catch (error) {
    console.error('Error fetching available sources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStocksBySource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { source } = req.query;
    
    if (!source) {
      res.status(400).json({ error: 'Source parameter is required' });
      return;
    }
    
    const stocks = await stockAnalysisModel.getStocksBySource(source as string);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFilterValues = async (req: Request, res: Response): Promise<void> => {
  try {
    const filterValues = await stockAnalysisModel.getFilterValues();
    res.json(filterValues);
  } catch (error) {
    console.error('Error fetching filter values:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};