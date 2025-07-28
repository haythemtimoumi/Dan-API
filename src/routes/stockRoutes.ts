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
  getHighlightedStocksByDateRange,
  getStocksByDateAndSource,
  getAvailableSources,
  getStocksBySource,
  getFilterValues
} from '../controllers/stockAnalysisController';

const router = Router();

// GET all stocks
router.get('/', getAllStocks);

// GET all stocks sorted by sentiment score
router.get('/sorted', getAllStocksSorted);

// GET stocks with source (Magic Formula or Rule 1)
router.get('/with-source', getStocksWithSource);

// GET daily changes (new, removed, existing)
router.get('/daily-changes', getDailyChanges);

// GET available sources - IMPORTANT: Keep before /:id route
router.get('/sources', getAvailableSources);

// GET stocks by source only - IMPORTANT: Keep before /:id route
router.get('/by-source', getStocksBySource);

// GET filter values - IMPORTANT: Keep before /:id route
router.get('/filter-values', getFilterValues);

// GET highlighted stocks filtered by date range - IMPORTANT: Keep before /highlighted
router.get('/highlighted/filter', getHighlightedStocksByDateRange);

// GET highlighted stocks - IMPORTANT: Keep before /:id route
router.get('/highlighted', getHighlightedStocks);

// GET stocks filtered by date and source
router.get('/filter-by-date-source', getStocksByDateAndSource);

// GET stocks by ticker
router.get('/ticker/:ticker', getStocksByTicker);

// GET stock by ID - IMPORTANT: Keep this route last as it's a catch-all
router.get('/:id', getStockById);

// POST create new stock
router.post('/', createStock);

// PUT update stock
router.put('/:id', updateStock);

// DELETE stock
router.delete('/:id', deleteStock);

export default router;