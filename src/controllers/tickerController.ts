import { Request, Response } from 'express';
import tickerModel, { Ticker } from '../models/Ticker';

export const getAllTickers = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickers = await tickerModel.getAll();
    res.json(tickers);
  } catch (error) {
    console.error('Error fetching tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTickerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const ticker = await tickerModel.getById(id);
    if (!ticker) {
      res.status(404).json({ error: 'Ticker not found' });
      return;
    }

    res.json(ticker);
  } catch (error) {
    console.error('Error fetching ticker by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickerData: Ticker = req.body;
    
    if (!tickerData.symbol) {
      res.status(400).json({ error: 'Symbol is required' });
      return;
    }

    const newTicker = await tickerModel.create(tickerData);
    res.status(201).json(newTicker);
  } catch (error: any) {
    console.error('Error creating ticker:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Ticker with this symbol and guru already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const tickerData: Ticker = req.body;
    const updatedTicker = await tickerModel.update(id, tickerData);
    
    if (!updatedTicker) {
      res.status(404).json({ error: 'Ticker not found' });
      return;
    }

    res.json(updatedTicker);
  } catch (error) {
    console.error('Error updating ticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTicker = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID format' });
      return;
    }

    const deleted = await tickerModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Ticker not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGurus = async (req: Request, res: Response): Promise<void> => {
  try {
    const gurus = await tickerModel.getGurus();
    res.json(gurus);
  } catch (error) {
    console.error('Error fetching gurus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTickersBySymbol = async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const tickers = await tickerModel.getBySymbol(symbol);
    res.json(tickers);
  } catch (error) {
    console.error('Error fetching tickers by symbol:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTickerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeCount = await tickerModel.getActiveCount();
    const allTickers = await tickerModel.getAll();
    
    res.json({
      total: allTickers.length,
      active: activeCount,
      inactive: allTickers.length - activeCount
    });
  } catch (error) {
    console.error('Error fetching ticker stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMissingAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickers = await tickerModel.getMissingAnalysis();
    res.json(tickers);
  } catch (error) {
    console.error('Error fetching missing analysis tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};