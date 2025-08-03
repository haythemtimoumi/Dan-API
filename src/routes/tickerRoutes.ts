import { Router } from 'express';
import {
  getAllTickers,
  getTickerById,
  createTicker,
  updateTicker,
  deleteTicker,
  getGurus,
  getTickersBySymbol,
  getTickerStats,
  getMissingAnalysis,
  getUniqueWithGurus,
  createTickerWithGuru,
  updateTickerWithGuru
} from '../controllers/tickerController';

const router = Router();

// GET ticker statistics
router.get('/stats', getTickerStats);

// GET tickers with target=true but no stock analysis
router.get('/missing-analysis', getMissingAnalysis);

// GET unique tickers with their associated gurus
router.get('/unique-with-gurus', getUniqueWithGurus);

// GET all gurus for combobox
router.get('/gurus', getGurus);

// GET all tickers
router.get('/', getAllTickers);

// GET tickers by symbol
router.get('/symbol/:symbol', getTickersBySymbol);

// GET ticker by ID - IMPORTANT: Keep this route last as it's a catch-all
router.get('/:id', getTickerById);

// POST create new ticker with guru relationship (NEW API)
router.post('/', createTickerWithGuru);

// POST create legacy ticker (keeping for backward compatibility)
router.post('/legacy', createTicker);

// PUT update ticker with guru relationship (NEW API)
router.put('/:id', updateTickerWithGuru);

// PUT update legacy ticker (keeping for backward compatibility)
router.put('/legacy/:id', updateTicker);

// DELETE ticker
router.delete('/:id', deleteTicker);

export default router;