/**
 * File: backend/routes/userRoutes.js
 * Purpose: Defines the API endpoints and routing logic for user requests.
 */
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  requestPasswordChangeOtp,
  getUsers,
  updateUserRole,
  addAddress,
  deleteAddress,
  updateCart,
  clearCart,
  toggleWishlist,
  deleteUserProfile,
  saveContainers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

router.route('/profile/request-password-otp')
  .post(protect, requestPasswordChangeOtp);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id/role')
  .put(protect, admin, updateUserRole);

router.route('/addresses')
  .post(protect, addAddress);

router.route('/addresses/:addressId')
  .delete(protect, deleteAddress);

router.route('/cart')
  .post(protect, updateCart)
  .delete(protect, clearCart);

router.route('/wishlist')
  .post(protect, toggleWishlist);

router.route('/containers')
  .post(protect, saveContainers);

export default router;
