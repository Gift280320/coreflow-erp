import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from '../controllers/leaveTypeController';

const router = Router();
router.use(authenticate);

router.get('/', getLeaveTypes);
router.post('/', createLeaveType);
router.put('/:id', updateLeaveType);
router.delete('/:id', deleteLeaveType);

export default router;
