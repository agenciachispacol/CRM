import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { sendWhatsApp } from '../controllers/whatsappController.js';

const router = Router();

router.post('/send-whatsapp', authenticate, sendWhatsApp);

export default router;
