import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getTasks, updateTaskStatus, createTask } from '../controllers/taskController.js';

const router = Router();

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
