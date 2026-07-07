import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequestStatus,
  deleteLeaveRequest,
} from '../controllers/leaveRequestController';

const router = Router();
router.use(authenticate);

router.get('/', getLeaveRequests);
router.post('/', createLeaveRequest);
router.patch('/:id/status', updateLeaveRequestStatus);
router.delete('/:id', deleteLeaveRequest);

export default router;
