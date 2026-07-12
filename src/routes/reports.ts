import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  exportInvoicesExcel,
  exportInvoicePDF,
  exportPurchaseOrdersExcel,
  exportStockExcel,
  exportExpensesExcel,
  exportAssetsExcel,
} from '../controllers/reportController';

const router = Router();
router.use(authenticate);

router.get('/invoices/excel', exportInvoicesExcel);
router.get('/invoices/pdf/:id', exportInvoicePDF);
router.get('/purchase-orders/excel', exportPurchaseOrdersExcel);
router.get('/stock/excel', exportStockExcel);
router.get('/expenses/excel', exportExpensesExcel);
router.get('/assets/excel', exportAssetsExcel);

export default router;
