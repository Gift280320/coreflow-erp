import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';

const router = Router();
router.use(authenticate);

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
