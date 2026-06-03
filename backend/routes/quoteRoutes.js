/**
 * File: backend/routes/quoteRoutes.js
 * Purpose: Defines the API endpoints and routing logic for quote requests.
 */
import express from 'express';
import {
  submitQuoteRequest,
  getMyQuotes,
  getAllQuotes,
  replyToQuote,
} from '../controllers/quoteController.js';
import { protect, admin } from '../middleware/auth.js';
import { validateQuote, validateIdParam } from '../middleware/validators.js';

const router = express.Router();

router.route('/')
  .post(protect, validateQuote, submitQuoteRequest)
  .get(protect, admin, getAllQuotes);

router.route('/myquotes')
  .get(protect, getMyQuotes);

router.route('/:id/reply')
  .put(protect, admin, validateIdParam, replyToQuote);

export default router;
