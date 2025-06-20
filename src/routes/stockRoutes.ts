import { Router } from 'express';
import {
  getAllStocks,
  getAllStocksSorted,
  getStockById,
  getStocksByTicker,
  createStock,
  updateStock,
  deleteStock,
  getDailyChanges,
  getStocksWithSource,
  getHighlightedStocks,
  getStocksByDateRange,
  getHighlightedStocksByDateRange,
  getAllStocksByDateRange,
  getStockHistory,
  getStocksByDateAndSource,
  getRecentChanges,
  getRecentChangesAll
} from '../controllers/stockAnalysisController';

const router = Router();

// GET recent changes in metrics between dates - IMPORTANT: Keep this route first to ensure it matches correctly
router.get('/recent-changes', getRecentChanges);

// NEW: GET recent changes for all tickers
router.get('/recent-changes/all', getRecentChangesAll);
// GET all stocks
router.get('/', getAllStocks);

// GET all stocks sorted by sentiment score
router.get('/sorted', getAllStocksSorted);

// GET stocks with source (Magic Formula or Rule 1)
router.get('/with-source', getStocksWithSource);

// GET daily changes (new, removed, existing)
router.get('/daily-changes', getDailyChanges);

// GET highlighted stocks
router.get('/highlighted', getHighlightedStocks);

// GET highlighted stocks filtered by date range
router.get('/highlighted/filter', getHighlightedStocksByDateRange);

// GET all stocks filtered by date range
router.get('/filter', getAllStocksByDateRange);

// GET stocks by date range
router.get('/date-range', getStocksByDateRange);

// GET stocks filtered by date and source
router.get('/filter-by-date-source', getStocksByDateAndSource);

// GET stocks by ticker
router.get('/ticker/:ticker', getStocksByTicker);

// GET stock history by ID
router.get('/:id/history', getStockHistory);

// GET stock by ID - IMPORTANT: Keep this route last as it's a catch-all
router.get('/:id', getStockById);

// POST create new stock
router.post('/', createStock);

// PUT update stock
router.put('/:id', updateStock);

// DELETE stock
router.delete('/:id', deleteStock);

export default router;