import { Router } from 'express';
import {
  getAllOldStocks,
  getAllOldStocksSorted,
  getOldStockById,
  getOldStocksByTicker,
  getOldDailyChanges,
  getOldStocksWithSource,
  getOldHighlightedStocks,
  getOldHighlightedStocksByDateRange,
  getOldAllStocksByDateRange,
  getOldStocksByDateAndSource
} from '../controllers/oldStockAnalysisController';
import { authenticateToken } from '../middleware/rbac';

const router = Router();

// Apply authentication check to all routes
router.use(authenticateToken);

// GET all old stocks
router.get('/', getAllOldStocks);

// GET all old stocks sorted by sentiment score
router.get('/sorted', getAllOldStocksSorted);

// GET old stocks with source (Magic Formula or Rule 1)
router.get('/with-source', getOldStocksWithSource);

// GET old daily changes (new, removed, existing)
router.get('/daily-changes', getOldDailyChanges);

// GET old highlighted stocks
router.get('/highlighted', getOldHighlightedStocks);

// GET old highlighted stocks filtered by date range
router.get('/highlighted/filter', getOldHighlightedStocksByDateRange);

// GET all old stocks filtered by date range
router.get('/filter', getOldAllStocksByDateRange);

// GET old stocks filtered by date and source
router.get('/filter-by-date-source', getOldStocksByDateAndSource);

// GET old stocks by ticker
router.get('/ticker/:ticker', getOldStocksByTicker);

// GET old stock by ID - IMPORTANT: Keep this route last as it's a catch-all
router.get('/:id', getOldStockById);

export default router;