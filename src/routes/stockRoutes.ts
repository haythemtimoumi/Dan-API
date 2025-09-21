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
  getStocksByDateRange,
  getLatestStockAnalysis,
  getFilterValues,
  getGroupedByTicker,
  getTickerByGuruGrouped,
  getLastDate,
  getFilteredStocks,
  updateStockColor,
  activateTickersForDan,
  getMissingAnalysis,
  updateDanTickerInfo,
  getTickerChanges,
  getGuruPortfolios,
  getCompanyInfo,
  getAllWithTickerInfo,
  getByTickerAndDate,
  getCompaniesWithAnalysis,
  getRecentCompanyDate,
  getTickersWithViewByDate,
  updateTickerView,
  updateStockTicker,
  updateRule1Ticker,
  getTickerDataByDate
} from '../controllers/stockAnalysisController';

const router = Router();

// GET all companies with latest analysis data
router.get('/companies-with-analysis', getCompaniesWithAnalysis);

// GET most recent company creation date
router.get('/companies/recent-date', getRecentCompanyDate);

// GET tickers with ticker_view and stock_ticker by date
router.get('/tickers-with-view', getTickersWithViewByDate);

// GET ticker data by date (combined from scraper_tasks and stock_analysis)
router.get('/ticker-data', getTickerDataByDate);

// GET stocks by ticker and date with ticker info
router.get('/by-ticker-date', getByTickerAndDate);

// GET all stocks with ticker info from scraper_tasks
router.get('/with-ticker-info', getAllWithTickerInfo);

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

// GET stocks by date range - IMPORTANT: Keep before /:id route
router.get('/by-date-range', getStocksByDateRange);

// GET stocks by source only - IMPORTANT: Keep before /:id route
router.get('/by-source', getStocksBySource);

// GET latest stock analysis without duplications - IMPORTANT: Keep before /:id route
router.get('/latest', getLatestStockAnalysis);

// GET filter values - IMPORTANT: Keep before /:id route
router.get('/filter-values', getFilterValues);

// GET stocks grouped by ticker with aggregated gurus - IMPORTANT: Keep before /:id route
router.get('/grouped', getGroupedByTicker);

// GET last date available in stock_analysis table - IMPORTANT: Keep before /:id route
router.get('/last-date', getLastDate);

// GET stocks filtered by sentiment, moat, rule1, and management scores - IMPORTANT: Keep before /:id route
router.get('/filtered', getFilteredStocks);

// GET ticker changes between two dates - IMPORTANT: Keep before /:id route
router.get('/tickers/changes', getTickerChanges);

// GET guru portfolios by date - IMPORTANT: Keep before /:id route
router.get('/gurus/portfolios/:date', getGuruPortfolios);

// GET company information by symbol - IMPORTANT: Keep before /:id route
router.get('/company/:symbol', getCompanyInfo);

// GET highlighted stocks filtered by date range - IMPORTANT: Keep before /highlighted
router.get('/highlighted/filter', getHighlightedStocksByDateRange);

// GET highlighted stocks - IMPORTANT: Keep before /:id route
router.get('/highlighted', getHighlightedStocks);

// GET stocks filtered by date and source
router.get('/filter-by-date-source', getStocksByDateAndSource);

// GET ticker data grouped by guru with optional date filter
router.get('/ticker/:ticker/by-guru', getTickerByGuruGrouped);

// PUT update stock color
router.put('/ticker/:ticker/color', updateStockColor);

// PUT update ticker view
router.put('/ticker/:ticker/ticker-view', updateTickerView);

// PUT update stock ticker
router.put('/ticker/:ticker/stock-ticker', updateStockTicker);

// PUT update rule1 ticker
router.put('/ticker/:ticker/rule1-ticker', updateRule1Ticker);

// POST activate tickers for Dan
router.post('/activate-for-dan', activateTickersForDan);

// PUT update Dan ticker info
router.put('/dan/ticker-info', updateDanTickerInfo);

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