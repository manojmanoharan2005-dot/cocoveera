import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressById,
  getAllAddressesAdmin,
} from '../controllers/addressController.js';

const router = express.Router();

import { validateAddress } from '../middleware/validators.js';
import { createLimiter } from '../middleware/limiters.js';

const addressLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 50, message: { success: false, message: 'Too many address changes, try later.' } });

router.route('/').post(protect, addressLimiter, validateAddress, createAddress).get(protect, admin, getAllAddressesAdmin);
router.route('/me').get(protect, getMyAddresses);
router.route('/:id').get(protect, getAddressById).put(protect, addressLimiter, validateAddress, updateAddress).delete(protect, deleteAddress);
router.route('/:id/default').patch(protect, setDefaultAddress);

export default router;
