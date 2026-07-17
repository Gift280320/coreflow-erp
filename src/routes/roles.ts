import express from 'express';
import { getRoles } from '../controllers/roleController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getRoles);

export default router;