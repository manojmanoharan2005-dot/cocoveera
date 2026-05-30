import express from 'express';
import multer from 'multer';
import {
  createReport,
  getReports,
  verifyBatch,
} from '../controllers/testingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for PDFs
  },
});

router.route('/')
  .get(protect, admin, getReports)
  .post(protect, admin, upload.single('pdf'), createReport);

router.route('/verify/:batchNumber')
  .get(verifyBatch);

export default router;
