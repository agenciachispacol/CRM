import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getMessages } from '../controllers/messageController.js';

const router = Router();

router.use(authenticate);
router.get('/', getMessages);

export default router;
