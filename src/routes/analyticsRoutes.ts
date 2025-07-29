import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';

const router = Router();

// GET analytics data
router.get('/', getAnalytics);

export default router;