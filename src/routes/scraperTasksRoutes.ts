import { Router } from 'express';
import { getListTypes } from '../controllers/scraperTasksController';

const router = Router();

router.get('/list-types', getListTypes);

export default router;