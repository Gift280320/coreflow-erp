import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/assetController';

const router = Router();
router.use(authenticate);

router.get('/', getAssets);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
