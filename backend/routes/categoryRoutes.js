/**
 * File: backend/routes/categoryRoutes.js
 * Purpose: Defines the public API endpoints for category requests.
 */
import express from 'express';
import { getCategories } from '../controllers/categoryController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

router.route('/')
  .get(cacheMiddleware(300), getCategories);

export default router;
