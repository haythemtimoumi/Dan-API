import { Router } from 'express';
import { getGurusWithTickers, getGuruTickers } from '../controllers/guruController';

const router = Router();

// GET all gurus with their tickers
router.get('/gurus-with-tickers', getGurusWithTickers);

// GET specific guru's tickers
router.get('/guru/:id/tickers', getGuruTickers);

export default router;