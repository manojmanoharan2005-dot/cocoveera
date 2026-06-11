/**
 * File: backend/controllers/authController.js
 * Purpose: Handles the business logic and request processing for auth operations.
 */
import User from '../models/User.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/mailer.js';

// @desc    Register user (triggers OTP)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, phone, password, country, currency, companyName } = req.body;

  try {
    let userExists = await User.findOne({ email });

    if (userExists) {
      // If user exists but is not verified, allow re-registration to regenerate OTP
      if (!userExists.isVerified) {
        await User.deleteOne({ email });
      } else {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      phone,
      password,
      country,
      currency,
      companyName,
      otpCode,
      otpExpires,
    });

    // Send OTP Email
    await sendOTPEmail(email, name, otpCode);

    res.status(201).json({
      success: true,
      message: 'Registration initiated. OTP sent to your email.',
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    if (user.otpCode !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    // Send professional Welcome Email with Logo unconditionally upon successful verification
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      token: user.getSignedJwtToken(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        country: user.country,
        currency: user.currency,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  let { email, password } = req.body;

  try {
    email = email.toLowerCase().trim();
    console.log(`[User Auth] Attempting login for: ${email}`);

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`[User Auth] User not found for email ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (user.isBlocked) {
      console.log(`[User Auth] Account blocked for ${email}`);
      return res.status(403).json({ success: false, message: 'Your account is blocked.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log(`[User Auth] Password mismatch for ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password mismatch.' });
    }

    if (!user.isVerified) {
      console.log(`[User Auth] User ${email} is not verified. Sending OTP.`);
      // Regenerate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otpCode;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      await sendOTPEmail(user.email, user.name, otpCode);

      return res.status(403).json({
        success: false,
        message: 'Account not verified. A new OTP has been sent.',
        email: user.email,
        needsVerification: true,
      });
    }

    // Intercept admins
    if (['admin', 'manager', 'support'].includes(user.role)) {
      // Use the same logic as adminLogin Step 1
      const tempToken = user.getSignedJwtToken(); // Wait, temp token should be 5 mins and include step1
      const jwt = (await import('jsonwebtoken')).default;
      const adminTempToken = jwt.sign(
        { id: user._id, role: user.role, step1: true },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '5m' }
      );

      return res.status(200).json({
        success: true,
        requiresAdminVerification: true,
        tempToken: adminTempToken,
        message: 'Admin verification required',
      });
    }

    console.log(`[User Auth] Successful login for ${email}`);

    res.status(200).json({
      success: true,
      token: user.getSignedJwtToken(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        country: user.country,
        currency: user.currency,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    console.error(`[User Auth] Login error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google login callback simulation
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { email, name, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create user automatically
      user = await User.create({
        name,
        email,
        phone: 'N/A',
        password: Math.random().toString(36).slice(-8), // random temp password
        isVerified: true,
      });

      // Send professional Welcome Email since they bypassed OTP check with Google
      await sendWelcomeEmail(user.email, user.name);
    }

    res.status(200).json({
      success: true,
      token: user.getSignedJwtToken(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        country: user.country,
        currency: user.currency,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate numeric 6-digit reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP Email for Password Reset
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.status(200).json({
      success: true,
      message: 'Reset instructions sent to email',
      email: email,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP Email
    await sendOTPEmail(user.email, user.name, otpCode);

    res.status(200).json({
      success: true,
      message: 'A new OTP code has been generated and sent to your email.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

