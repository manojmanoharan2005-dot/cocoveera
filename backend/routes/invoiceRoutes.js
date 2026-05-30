import express from 'express';
import { getInvoices, getMyInvoices, getInvoiceById, downloadInvoice } from '../controllers/invoiceController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, admin, getInvoices);
router.route('/myinvoices').get(protect, getMyInvoices);
router.route('/:id').get(protect, getInvoiceById);
router.route('/:id/download').get(protect, downloadInvoice);

export default router;
