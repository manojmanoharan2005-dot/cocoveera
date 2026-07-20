/**
 * File: backend/routes/rfqRoutes.js
 * Purpose: Defines API endpoints for RFQ / Quote Request actions, approvals, and webhook integration.
 */
import express from 'express';
import {
  submitQuoteRequest,
  getAdminQuoteRequests,
  getAdminQuoteRequestById,
  approveQuoteRequest,
  rejectQuoteRequest,
  requestInfoQuoteRequest,
  deleteQuoteRequest,
  handleBrevoWebhook,
} from '../controllers/quoteRequestController.js';
import { protect, admin } from '../middleware/auth.js';
import { securitySanitizers } from '../middleware/sanitize.js';

const router = express.Router();

// Brevo Webhook Endpoint (Public, processed safely)
router.post('/webhook/brevo', handleBrevoWebhook);

// Public RFQ submission
router.post('/', securitySanitizers, submitQuoteRequest);

// Protected Admin Endpoints
router.get('/', protect, admin, getAdminQuoteRequests);
router.get('/:id', protect, admin, getAdminQuoteRequestById);
router.post('/:id/approve', protect, admin, approveQuoteRequest);
router.post('/:id/reject', protect, admin, rejectQuoteRequest);
router.post('/:id/request-info', protect, admin, requestInfoQuoteRequest);
router.delete('/:id', protect, admin, deleteQuoteRequest);

export default router;
