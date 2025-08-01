import { Router } from 'express';
import { getListTypes, addMultipleTickers, updateTickerColor } from '../controllers/scraperTasksController';

const router = Router();

router.get('/list-types', getListTypes);
router.post('/add-multiple', addMultipleTickers);
router.put('/:id/color', updateTickerColor);

export default router;