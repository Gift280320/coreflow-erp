import express from 'express';
import { login, logout, getMe, refresh } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', refresh);

export default router;
