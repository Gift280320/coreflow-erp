import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getExpenses,
  createExpense,
  deleteExpense,
} from '../controllers/expenseController';

const router = Router();
router.use(authenticate);

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
