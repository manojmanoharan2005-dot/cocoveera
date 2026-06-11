import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer.js';

// @desc    Admin Login Step 1
// @route   POST /api/admin/auth/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Invalid Credentials' });
    }

    email = email.toLowerCase().trim();
    const user = await User.findOne({ email }).select('+password');

    const genericError = 'Invalid Credentials';

    if (!user) {
      return res.status(401).json({ success: false, message: genericError });
    }

    if (!['admin', 'manager', 'support'].includes(user.role)) {
      return res.status(401).json({ success: false, message: genericError });
    }

    // Check lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ success: false, message: `Account locked. Try again in ${remainingTime} minutes.` });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();
        return res.status(403).json({ success: false, message: 'Account locked due to too many failed attempts. Try again in 15 minutes.' });
      }
      await user.save();
      return res.status(401).json({ success: false, message: genericError });
    }

    // Reset password attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Generate temp token for Step 2
    const tempToken = jwt.sign(
      { id: user._id, role: user.role, step1: true },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '5m' }
    );

    res.status(200).json({
      success: true,
      requiresVerification: true,
      tempToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Admin Verify Key Step 2
// @route   POST /api/admin/auth/verify-key
// @access  Public
export const adminVerifyKey = async (req, res) => {
  try {
    const { tempToken, verificationKey } = req.body;

    if (!tempToken || !verificationKey) {
      return res.status(400).json({ success: false, message: 'Missing token or key' });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');
      if (!decoded.step1) throw new Error('Invalid token type');
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ success: false, message: 'Account locked.' });
    }

    // Verify key
    const actualKey = process.env.ADMIN_VERIFICATION_KEY || 'CVR@2026#SecureAdminKey'; // fallback for safety
    if (verificationKey !== actualKey) {
      user.failedKeyAttempts += 1;
      if (user.failedKeyAttempts >= 3) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
        await user.save();
        return res.status(403).json({ success: false, message: 'Account locked due to too many failed key attempts.' });
      }
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid Verification Key' });
    }

    // Success! Reset attempts
    user.failedKeyAttempts = 0;
    user.lockUntil = null;

    // Track session
    const sessionId = crypto.randomBytes(16).toString('hex');
    const ip = req.ip || req.connection.remoteAddress;
    const browser = req.headers['user-agent'] || 'Unknown';
    
    user.sessions.push({
      sessionId,
      ip,
      browser,
      device: 'Desktop/Mobile',
      lastActive: Date.now()
    });

    await user.save();

    // Generate full tokens (with sessionId included so we can track it)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, adminRole: user.adminRole, sessionId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30m' } // Changed to 30 mins per prompt requirement
    );

    const refreshToken = jwt.sign(
      { id: user._id, sessionId },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminRole: user.adminRole,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Admin logout all devices
// @route   POST /api/admin/auth/logout-all
// @access  Private
export const adminLogoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.sessions = [];
      await user.save();
    }
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret'
    );

    const user = await User.findById(decoded.id);

    if (!user || !['admin', 'manager', 'support'].includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate a new sessionId because old one is expiring/refreshing, or we just keep the old one?
    // Let's keep the existing sessionId if it's there
    const sessionId = decoded.sessionId || crypto.randomBytes(16).toString('hex');
    
    // update session lastActive
    const session = user.sessions.find(s => s.sessionId === decoded.sessionId);
    if(session) {
      session.lastActive = Date.now();
      await user.save();
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, adminRole: user.adminRole, sessionId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30m' }
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// @desc    Get current admin user
// @route   GET /api/admin/auth/me
// @access  Private
export const getAdminMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Admin forgot password
// @route   POST /api/admin/auth/forgot-password
// @access  Public
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || !['admin', 'manager', 'support'].includes(user.role)) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Admin reset password
// @route   POST /api/admin/auth/reset-password/:token
// @access  Public
export const adminResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Admin change password
// @route   POST /api/admin/auth/change-password
// @access  Private
export const adminChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Private
export const adminLogout = async (req, res) => {
  try {
    // Client should remove token on their end, but we can also remove the session from the DB if sessionId is present
    if (req.user && req.user.sessionId) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.sessions = user.sessions.filter(s => s.sessionId !== req.user.sessionId);
        await user.save();
      }
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
