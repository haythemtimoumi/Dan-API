import { Router } from 'express';
import { getListTypes, addMultipleTickers } from '../controllers/scraperTasksController';

const router = Router();

router.get('/list-types', getListTypes);
router.post('/add-multiple', addMultipleTickers);

export default router;