import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from '../controllers/invoiceController';

const router = Router();
router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.patch('/:id/status', updateInvoiceStatus);
router.delete('/:id', deleteInvoice);

export default router;
