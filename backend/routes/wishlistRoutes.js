/**
 * File: backend/routes/wishlistRoutes.js
 * Purpose: Defines REST API endpoints for wishlist management.
 */
import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

router.route('/:productId')
  .delete(protect, removeFromWishlist);

export default router;
