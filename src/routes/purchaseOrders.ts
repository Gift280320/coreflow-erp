import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from '../controllers/purchaseOrderController';

const router = Router();
router.use(authenticate);

router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.patch('/:id/status', updatePurchaseOrderStatus);
router.delete('/:id', deletePurchaseOrder);

export default router;
