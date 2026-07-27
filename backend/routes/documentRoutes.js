/**
 * File: backend/routes/documentRoutes.js
 * Purpose: Defines secure API endpoints for document viewing, downloading, and listing.
 */
import express from 'express';
import { getMyDocuments, viewDocument, downloadDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-documents', protect, getMyDocuments);
router.get('/:id/view', protect, viewDocument);
router.get('/:id/download', protect, downloadDocument);

export default router;
