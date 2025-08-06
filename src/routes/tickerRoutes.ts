import { Router } from 'express';
import { getMissingAnalysis } from '../controllers/stockAnalysisController';

const router = Router();

// GET missing analysis tickers
router.get('/missing-analysis', getMissingAnalysis);

export default router;