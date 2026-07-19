import express from 'express';
import {
  getPurchaseRequests,
  createPurchaseRequest,
  updatePurchaseRequest,
  deletePurchaseRequest,
  updatePurchaseRequestStatus,
} from '../controllers/purchaseRequestController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getPurchaseRequests);
router.post('/', authenticate, createPurchaseRequest);
router.put('/:id', authenticate, updatePurchaseRequest);
router.delete('/:id', authenticate, deletePurchaseRequest);
router.patch('/:id/status', authenticate, updatePurchaseRequestStatus);

export default router;
