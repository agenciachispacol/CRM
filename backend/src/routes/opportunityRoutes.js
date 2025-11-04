import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getOpportunities, createOpportunity, updateOpportunityStage, updateOpportunity } from '../controllers/opportunityController.js';

const router = Router();

router.use(authenticate);
router.get('/', getOpportunities);
router.post('/', createOpportunity);
router.patch('/:id/stage', updateOpportunityStage);
router.put('/:id', updateOpportunity);

export default router;
