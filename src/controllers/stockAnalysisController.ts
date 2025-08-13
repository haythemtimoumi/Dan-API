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

export const getStocksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stocks = await stockAnalysisModel.getStocksByDateRange(
      startDate as string,
      endDate as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks by date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLatestStockAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guru, list_type } = req.query;
    const stocks = await stockAnalysisModel.getLatestStockAnalysis(
      guru as string,
      list_type as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching latest stock analysis:', error);
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

export const getGroupedByTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stocks = await stockAnalysisModel.getGroupedByTicker(
      startDate as string,
      endDate as string
    );
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching grouped stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTickerByGuruGrouped = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const { date } = req.query;
    const result = await stockAnalysisModel.getTickerByGuruGrouped(ticker, date as string);
    res.json(result);
  } catch (error) {
    console.error('Error fetching ticker by guru grouped:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLastDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const lastDate = await stockAnalysisModel.getLastDate();
    const formattedDate = lastDate ? new Date(lastDate).toISOString().split('T')[0] : null;
    res.json({ last_date: formattedDate });
  } catch (error) {
    console.error('Error fetching last date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFilteredStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('getFilteredStocks called with query:', req.query);
    const { sentiment, moat, rule1, management } = req.query;
    
    const filters: {
      sentiment?: number;
      moat?: number;
      rule1?: number;
      management?: number;
    } = {};
    
    if (sentiment !== undefined) {
      const sentimentValue = parseFloat(sentiment as string);
      if (!isNaN(sentimentValue)) {
        filters.sentiment = sentimentValue;
      }
    }
    
    if (moat !== undefined) {
      const moatValue = parseFloat(moat as string);
      if (!isNaN(moatValue)) {
        filters.moat = moatValue;
      }
    }
    
    if (rule1 !== undefined) {
      const rule1Value = parseFloat(rule1 as string);
      if (!isNaN(rule1Value)) {
        filters.rule1 = rule1Value;
      }
    }
    
    if (management !== undefined) {
      const managementValue = parseFloat(management as string);
      if (!isNaN(managementValue)) {
        filters.management = managementValue;
      }
    }
    
    console.log('Applied filters:', filters);
    const stocks = await stockAnalysisModel.getFilteredStocks(filters);
    console.log(`Found ${stocks.length} filtered stocks`);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching filtered stocks:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateStockColor = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const { color } = req.body;
    
    if (!color) {
      res.status(400).json({ error: 'Color is required' });
      return;
    }
    
    const result = await stockAnalysisModel.updateStockColor(ticker, color);
    
    if (!result) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }
    
    res.json({ success: true, ticker, color });
  } catch (error) {
    console.error('Error updating stock color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const activateTickersForDan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tickers } = req.body;
    
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      res.status(400).json({ error: 'Tickers array is required' });
      return;
    }
    
    const result = await stockAnalysisModel.activateTickersForDan(tickers);
    res.json(result);
  } catch (error) {
    console.error('Error activating tickers for Dan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMissingAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await stockAnalysisModel.getMissingAnalysis();
    res.json(result);
  } catch (error) {
    console.error('Error fetching missing analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDanTickerInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticker, last_action, per_portfolio } = req.body;
    console.log(`[updateDanTickerInfo] Request received - ticker: ${ticker}, last_action: ${last_action}, per_portfolio: ${per_portfolio}`);
    
    if (!ticker) {
      console.log('[updateDanTickerInfo] Error: Ticker is required');
      res.status(400).json({ error: 'Ticker is required' });
      return;
    }
    
    const result = await stockAnalysisModel.updateDanTickerInfo(ticker, last_action, per_portfolio);
    
    if (!result) {
      console.log(`[updateDanTickerInfo] Error: Ticker ${ticker} not found for guru Dan`);
      res.status(404).json({ error: 'Ticker not found for guru Dan' });
      return;
    }
    
    console.log(`[updateDanTickerInfo] Success: Updated ticker ${ticker} for Dan`);
    res.json({ success: true, ticker, last_action, per_portfolio });
  } catch (error) {
    console.error('[updateDanTickerInfo] Error updating Dan ticker info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTickerChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      res.status(400).json({ error: 'Both from and to date parameters are required' });
      return;
    }
    
    const changes = await stockAnalysisModel.getTickerChanges(from as string, to as string);
    res.json(changes);
  } catch (error) {
    console.error('Error fetching ticker changes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuruPortfolios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const portfolios = await stockAnalysisModel.getGuruPortfolios(date === 'latest' ? null : date);
    res.json(portfolios);
  } catch (error) {
    console.error('Error fetching guru portfolios:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

