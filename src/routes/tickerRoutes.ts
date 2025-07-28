import { Router } from 'express';
import {
  getAllTickers,
  getTickerById,
  createTicker,
  updateTicker,
  deleteTicker,
  getGurus,
  getTickersBySymbol,
  getTickerStats
} from '../controllers/tickerController';

const router = Router();

// GET ticker statistics
router.get('/stats', getTickerStats);

// GET all gurus for combobox
router.get('/gurus', getGurus);

// GET all tickers
router.get('/', getAllTickers);

// GET tickers by symbol
router.get('/symbol/:symbol', getTickersBySymbol);

// GET ticker by ID - IMPORTANT: Keep this route last as it's a catch-all
router.get('/:id', getTickerById);

// POST create new ticker
router.post('/', createTicker);

// PUT update ticker
router.put('/:id', updateTicker);

// DELETE ticker
router.delete('/:id', deleteTicker);

export default router;