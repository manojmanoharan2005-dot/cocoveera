/**
 * File: backend/routes/contactRoutes.js
 * Purpose: Defines the API endpoints and routing logic for contact requests.
 */
import express from 'express';
import multer from 'multer';
import { submitContactForm } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/limiters.js';
import { validateContact } from '../middleware/validators.js';

const router = express.Router();

// Setup multer for in-memory file storage before uploading to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
});

router.post('/', contactLimiter, upload.array('files', 3), validateContact, submitContactForm);

export default router;
