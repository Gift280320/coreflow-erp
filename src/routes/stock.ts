import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getStockItems,
  updateStock,
  getStockMovements,
} from '../controllers/stockController';

const router = Router();
router.use(authenticate);

router.get('/items', getStockItems);
router.post('/update', updateStock);
router.get('/movements', getStockMovements);

export default router;
