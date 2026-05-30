import express from 'express';
import {
  register,
  verifyOtp,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  resendOtp,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
