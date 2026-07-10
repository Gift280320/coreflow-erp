import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getBudgets,
  createBudget,
  deleteBudget,
} from '../controllers/budgetController';

const router = Router();
router.use(authenticate);

router.get('/', getBudgets);
router.post('/', createBudget);
router.delete('/:id', deleteBudget);

export default router;
