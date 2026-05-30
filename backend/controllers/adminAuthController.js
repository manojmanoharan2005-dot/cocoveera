import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer.js';

// @desc    Admin Login
// @route   POST /api/admin/auth/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    email = email.toLowerCase().trim();
    console.log(`Attempting admin login for: ${email}`);

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    console.log(`User found: ${user.email}, Role: ${user.role}`);

    // Check if user is admin
    if (!['admin', 'manager', 'support'].includes(user.role)) {
      console.log(`Login failed: User ${email} does not have admin access`);
      return res.status(403).json({
        success: false,
        message: 'You do not have admin access',
      });
    }

    // Check if user is verified
    if (user.isVerified === false) {
      console.log(`Login failed: Administrator account ${email} is not verified`);
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your email.',
      });
    }

    // Check if user is blocked
    if (user.isBlocked === true) {
      console.log(`Login failed: Administrator account ${email} is blocked`);
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact superadmin.',
      });
    }

    // Check password
    console.log(`Verifying password for ${email}`);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    console.log(`Password match successful for ${email}`);

    // Create tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, adminRole: user.adminRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' } // updated to 7d as requested
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' }
    );

    console.log(`Login successful for ${email}. Tokens generated.`);

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
    console.error(`Admin login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Refresh Admin Token
// @route   POST /api/admin/auth/refresh
// @access  Public
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

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, adminRole: user.adminRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
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
    // Client should remove token on their end
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
