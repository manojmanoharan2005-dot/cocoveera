import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/limiters.js';
import { validateContact } from '../middleware/validators.js';

const router = express.Router();

router.post('/', contactLimiter, validateContact, submitContactForm);

export default router;
