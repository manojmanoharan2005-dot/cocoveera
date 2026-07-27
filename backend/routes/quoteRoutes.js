/**
 * File: backend/routes/quoteRoutes.js
 * Purpose: Defines the API endpoints and routing logic for client-side quotations.
 */
import express from 'express';
import {
  submitQuoteRequest,
  getMyQuotes,
  getAllQuotes,
  replyToQuote,
  getQuoteDetails,
  viewQuotePDF,
  downloadQuotePDF,
  acceptQuote,
  rejectQuote,
  requestRevision,
} from '../controllers/quoteController.js';
import { protect, admin } from '../middleware/auth.js';
import { validateQuote, validateIdParam } from '../middleware/validators.js';

const router = express.Router();

// Client-facing Quote Routes
router.route('/')
  .post(protect, validateQuote, submitQuoteRequest)
  .get(protect, getMyQuotes);

router.route('/myquotes')
  .get(protect, getMyQuotes);

router.route('/:id')
  .get(protect, validateIdParam, getQuoteDetails);

router.route('/:id/view-pdf')
  .get(protect, validateIdParam, viewQuotePDF);

router.route('/:id/download-pdf')
  .get(protect, validateIdParam, downloadQuotePDF);

router.route('/:id/accept')
  .put(protect, validateIdParam, acceptQuote);

router.route('/:id/reject')
  .put(protect, validateIdParam, rejectQuote);

router.route('/:id/revision')
  .post(protect, validateIdParam, requestRevision);

// Admin-facing legacy Quote Routes
router.route('/admin/all')
  .get(protect, admin, getAllQuotes);

router.route('/:id/reply')
  .put(protect, admin, validateIdParam, replyToQuote);

export default router;
