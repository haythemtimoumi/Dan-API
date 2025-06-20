import { Request, Response } from 'express';
import { StockAnalysisModel, StockAnalysis } from '../models/StockAnalysis';
import { pool } from '../config/db';
const stockModel = new StockAnalysisModel();

export const getRecentChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { metric, start_date, end_date, threshold, ticker, source, guru } = req.query;
    
    // Validate required parameters
    if (!metric) {
      res.status(400).json({ message: 'metric parameter is required' });
      return;
    }
    
    if (!start_date) {
      res.status(400).json({ message: 'start_date parameter is required' });
      return;
    }
    
    if (!end_date) {
      res.status(400).json({ message: 'end_date parameter is required' });
      return;
    }
    
    // Validate metric is one of the allowed values
    const allowedMetrics = ['pe', 'signal_score', 'sentiment_score', 'buy_price'];
    if (!allowedMetrics.includes(metric as string)) {
      res.status(400).json({ 
        message: `Invalid metric: ${metric}. Must be one of: ${allowedMetrics.join(', ')}` 
      });
      return;
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date as string) || !dateRegex.test(end_date as string)) {
      res.status(400).json({ message: 'Dates must be in YYYY-MM-DD format' });
      return;
    }
    
    // Parse threshold to number with default value of 5
    const parsedThreshold = threshold ? parseFloat(threshold as string) : 5;
    if (isNaN(parsedThreshold)) {
      res.status(400).json({ message: 'threshold must be a valid number' });
      return;
    }
    
    // Get the recent changes
    const changes = await stockModel.getRecentChanges(
      metric as string,
      start_date as string,
      end_date as string,
      parsedThreshold,
      ticker as string | undefined,
      source as string | undefined,
      guru as string | undefined
    );
    
    res.status(200).json(changes);
  } catch (error) {
    console.error('Error fetching recent changes:', error);
    res.status(500).json({ message: 'Failed to fetch recent changes' });
  }
};

export const getAllStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockModel.getAll();
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Failed to fetch stocks' });
  }
};

export const getAllStocksSorted = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockModel.getAllSorted();
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching sorted stocks:', error);
    res.status(500).json({ message: 'Failed to fetch sorted stocks' });
  }
};

export const getStockHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    // Extract optional date filter parameters
    const { from, to } = req.query;
    const fromDate = from ? from.toString() : undefined;
    const toDate = to ? to.toString() : undefined;

    // First, check if the stock with the given ID exists
    const stock = await stockModel.getById(id);
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }

    // Get all stocks with the same ticker, source, and guru (if present)
    // and filter by date range if provided
    const stockHistory = await stockModel.getStockHistory(id, fromDate, toDate);
    if (stockHistory.length === 0) {
      res.status(404).json({ message: 'No history available for this stock' });
      return;
    }

    res.status(200).json(stockHistory);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ message: 'Failed to fetch stock history' });
  }
};

export const getStockById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const stock = await stockModel.getById(id);
    if (!stock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }

    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock by ID:', error);
    res.status(500).json({ message: 'Failed to fetch stock' });
  }
};

export const getStocksByTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticker = req.params.ticker;
    const stocks = await stockModel.getByTicker(ticker);
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by ticker:', error);
    res.status(500).json({ message: 'Failed to fetch stocks by ticker' });
  }
};

export const getStocksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Both startDate and endDate are required' });
      return;
    }
    
    // Validate date format (MM/DD/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
      res.status(400).json({ message: 'Dates must be in MM/DD/YYYY format' });
      return;
    }
    
    // Convert MM/DD/YYYY to YYYY-MM-DD for PostgreSQL
    const formatDate = (dateStr: string): string => {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };
    
    const formattedStartDate = formatDate(startDate as string);
    const formattedEndDate = formatDate(endDate as string);
    
    const stocks = await stockModel.getByDateRange(formattedStartDate, formattedEndDate);
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by date range:', error);
    res.status(500).json({ message: 'Failed to fetch stocks by date range' });
  }
};

export const createStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const stockData: StockAnalysis = req.body;
    const newStock = await stockModel.create(stockData);
    res.status(201).json(newStock);
  } catch (error) {
    console.error('Error creating stock:', error);
    res.status(500).json({ message: 'Failed to create stock' });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const stockData: StockAnalysis = req.body;
    const updatedStock = await stockModel.update(id, stockData);
    
    if (!updatedStock) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }

    res.status(200).json(updatedStock);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
};

export const deleteStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const deleted = await stockModel.delete(id);
    if (!deleted) {
      res.status(404).json({ message: 'Stock not found' });
      return;
    }

    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: 'Failed to delete stock' });
  }
};

export const getDailyChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const changes = await stockModel.getDailyChanges();
    res.status(200).json(changes);
  } catch (error) {
    console.error('Error fetching daily changes:', error);
    res.status(500).json({ message: 'Failed to fetch daily changes' });
  }
};

export const getStocksWithSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockModel.getStocksWithSource();
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks with source:', error);
    res.status(500).json({ message: 'Failed to fetch stocks with source' });
  }
};

export const getHighlightedStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await stockModel.getHighlightedStocks();
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching highlighted stocks:', error);
    res.status(500).json({ message: 'Failed to fetch highlighted stocks' });
  }
};

export const getHighlightedStocksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates if provided
    const parsedStartDate = startDate ? startDate.toString() : undefined;
    const parsedEndDate = endDate ? endDate.toString() : undefined;
    
    const stocks = await stockModel.getHighlightedStocksByDateRange(parsedStartDate, parsedEndDate);
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching highlighted stocks by date range:', error);
    res.status(500).json({ message: 'Failed to fetch highlighted stocks by date range' });
  }
};

export const getAllStocksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates if provided
    const parsedStartDate = startDate ? startDate.toString() : undefined;
    const parsedEndDate = endDate ? endDate.toString() : undefined;
    
    const stocks = await stockModel.getAllStocksByDateRange(parsedStartDate, parsedEndDate);
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by date range:', error);
    res.status(500).json({ message: 'Failed to fetch stocks by date range' });
  }
};

export const getStocksByDateAndSource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, source } = req.query;

    if (!date || !source) {
      res.status(400).json({ message: 'Both date and source parameters are required' });
      return;
    }

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date as string)) {
      res.status(400).json({ message: 'Date must be in MM/DD/YYYY format' });
      return;
    }

    const formatDate = (dateStr: string): string => {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };
    const formattedDate = formatDate(date as string);

    const query = `
      SELECT * FROM stock_analysis 
      WHERE date::date = $1::date 
      AND source = $2
      ORDER BY sentiment_score DESC
    `;

    const { rows } = await pool.query(query, [formattedDate, source]);

    console.log(`Found ${rows.length} stocks for date ${formattedDate} and source ${source}`);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching stocks by date and source:', error);
    res.status(500).json({ message: 'Failed to fetch stocks by date and source' });
  }
};
