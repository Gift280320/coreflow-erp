import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';

const router = Router();
router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
