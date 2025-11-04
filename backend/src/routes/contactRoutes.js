import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getContacts, getContactById, createContact, updateContact, deleteContact } from '../controllers/contactController.js';

const router = Router();

router.use(authenticate);
router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
