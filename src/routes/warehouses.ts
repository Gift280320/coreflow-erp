import express from 'express';
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouseController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getWarehouses);
router.post('/', authenticate, createWarehouse);
router.put('/:id', authenticate, updateWarehouse);
router.delete('/:id', authenticate, deleteWarehouse);

export default router;
