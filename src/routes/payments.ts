import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPayments,
  createPayment,
  deletePayment,
} from '../controllers/paymentController';

const router = Router();
router.use(authenticate);

router.get('/', getPayments);
router.post('/', createPayment);
router.delete('/:id', deletePayment);

export default router;
