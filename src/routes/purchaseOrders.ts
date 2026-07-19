import express from 'express';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from '../controllers/purchaseOrderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getPurchaseOrders);
router.post('/', authenticate, createPurchaseOrder);
router.get('/:id', authenticate, getPurchaseOrder);
router.patch('/:id/status', authenticate, updatePurchaseOrderStatus);
router.delete('/:id', authenticate, deletePurchaseOrder);

export default router;
