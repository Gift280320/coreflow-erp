import express from 'express';
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../controllers/leaveRequestController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getLeaveRequests);
router.post('/', authenticate, createLeaveRequest);
router.put('/:id', authenticate, updateLeaveRequest);
router.delete('/:id', authenticate, deleteLeaveRequest);
router.post('/:id/approve', authenticate, approveLeaveRequest);
router.post('/:id/reject', authenticate, rejectLeaveRequest);

export default router;
