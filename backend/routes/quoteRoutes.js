import express from 'express';
import {
  submitQuoteRequest,
  getMyQuotes,
  getAllQuotes,
  replyToQuote,
} from '../controllers/quoteController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, submitQuoteRequest)
  .get(protect, admin, getAllQuotes);

router.route('/myquotes')
  .get(protect, getMyQuotes);

router.route('/:id/reply')
  .put(protect, admin, replyToQuote);

export default router;
