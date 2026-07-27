/**
 * File: backend/routes/quoteRequestRoutes.js
 * Purpose: Defines the public endpoints for Quote Requests (RFQs).
 */
import express from 'express';
import { submitQuoteRequest, checkActiveRFQ } from '../controllers/quoteRequestController.js';
import { validateQuoteRequest } from '../middleware/validators.js';
import { quoteRequestLimiter } from '../middleware/limiters.js';
import { securitySanitizers } from '../middleware/sanitize.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/active-check', protect, checkActiveRFQ);

router.route('/')
  .post(quoteRequestLimiter, securitySanitizers, validateQuoteRequest, submitQuoteRequest);

export default router;
