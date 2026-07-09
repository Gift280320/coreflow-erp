import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController';

const router = Router();
router.use(authenticate);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
