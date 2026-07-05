import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMe,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', getMe);
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
