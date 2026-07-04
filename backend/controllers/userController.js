/**
 * File: backend/controllers/userController.js
 * Purpose: Handles the business logic and request processing for user operations.
 */
import User from '../models/User.js';
import { sendOTPEmail } from '../utils/mailer.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.product')
      .populate('wishlist');
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const initialCartLength = user.cart.length;
    user.cart = user.cart.filter(item => item.product != null);

    const initialWishlistLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(item => item != null);

    if (user.cart.length !== initialCartLength || user.wishlist.length !== initialWishlistLength) {
      await user.save();
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.companyName = req.body.companyName !== undefined ? req.body.companyName : user.companyName;
    user.country = req.body.country !== undefined ? req.body.country : user.country;

    if (req.body.password) {
      if (!req.body.otp) {
        return res.status(400).json({ success: false, message: 'OTP is required to change password' });
      }
      if (user.otpCode !== req.body.otp || user.otpExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      user.password = req.body.password;
      user.otpCode = null;
      user.otpExpires = null;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        companyName: updatedUser.companyName,
        country: updatedUser.country,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request OTP for password change
// @route   POST /api/users/profile/request-password-otp
// @access  Private
export const requestPasswordChangeOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP Email
    await sendOTPEmail(user.email, user.name, otpCode);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for password change',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role/status (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = req.body.role || user.role;
    await user.save();

    res.status(200).json({ success: true, message: `User role updated to ${user.role}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (req.body.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    if (req.body._id) {
      const addrIndex = user.addresses.findIndex(a => a._id.toString() === req.body._id);
      if (addrIndex > -1) {
        user.addresses[addrIndex] = { ...user.addresses[addrIndex], ...req.body };
      }
    } else {
      user.addresses.push(req.body);
    }

    // Automatically sync phone number to main user profile if it's missing or N/A
    if (req.body.phone && (!user.phone || user.phone === 'N/A')) {
      user.phone = req.body.phone;
    }
    
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart
// @route   POST /api/users/cart
// @access  Private
export const updateCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product').populate('wishlist');
    const { productId, quantity, increment = false } = req.body;
    
    // Ensure quantity is a multiple of 0.25
    if (quantity !== 0 && (quantity % 0.25 !== 0)) {
      return res.status(400).json({ success: false, message: 'Quantity must be in increments of 0.25' });
    }

    const existingItem = user.cart.find(c => c.product._id.toString() === productId || c.product.toString() === productId);
    if (existingItem) {
      if (quantity <= 0 && !increment) {
        user.cart = user.cart.filter(c => c.product._id.toString() !== productId && c.product.toString() !== productId);
      } else {
        if (increment) {
          existingItem.quantity += quantity;
        } else {
          existingItem.quantity = quantity;
        }
      }
    } else if (quantity > 0) {
      user.cart.push({ product: productId, quantity });
    }
    await user.save();
    
    // Repopulate for frontend
    const updatedUser = await User.findById(req.user._id).populate('cart.product').populate('wishlist');
    res.status(200).json({ success: true, data: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/users/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.status(200).json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id).select('wishlist');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const exists = user.wishlist.some(p => p.toString() === productId);
    
    if (exists) {
      await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } });
    } else {
      await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });
    }
    
    res.status(200).json({ success: true, message: 'Wishlist updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Delete user from db
    await User.findByIdAndDelete(req.user._id);
    
    res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

