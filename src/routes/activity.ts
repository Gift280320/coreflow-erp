import express from 'express';
import { getRecentActivity } from '../controllers/activityController';

const router = express.Router();

router.get('/recent', getRecentActivity);

export default router;
