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
import { validateRegistration, validateLogin } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
