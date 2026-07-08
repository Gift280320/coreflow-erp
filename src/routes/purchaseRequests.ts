import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPurchaseRequests,
  createPurchaseRequest,
  updatePurchaseRequestStatus,
  deletePurchaseRequest,
} from '../controllers/purchaseRequestController';

const router = Router();
router.use(authenticate);

router.get('/', getPurchaseRequests);
router.post('/', createPurchaseRequest);
router.patch('/:id/status', updatePurchaseRequestStatus);
router.delete('/:id', deletePurchaseRequest);

export default router;
