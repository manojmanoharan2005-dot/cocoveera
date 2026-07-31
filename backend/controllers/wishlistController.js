/**
 * File: backend/controllers/wishlistController.js
 * Purpose: Handles business logic for user wishlist management (REST endpoints).
 */
import User from '../models/User.js';

// Populate field specification for consistent product data return
const POPULATE_FIELDS = 'name price images slug category stock packageSize weight status isPublished isHidden isDeleted';

const mapWishlistWithAvailability = (wishlistArray) => {
  if (!Array.isArray(wishlistArray)) return [];
  return wishlistArray.map((item) => {
    if (!item) return null;
    if (typeof item === 'object') {
      const isAvailable =
        item.status === 'ACTIVE' &&
        item.isPublished === true &&
        item.isHidden !== true &&
        item.isDeleted !== true;
      return {
        ...item.toObject ? item.toObject() : item,
        isAvailable,
      };
    }
    return item;
  }).filter(Boolean);
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', POPULATE_FIELDS);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const formattedWishlist = mapWishlistWithAvailability(user.wishlist || []);
    res.status(200).json({ success: true, data: formattedWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { wishlist: productId } }
    );

    const user = await User.findById(req.user._id).populate('wishlist', POPULATE_FIELDS);
    res.status(200).json({ success: true, message: 'Product added to wishlist', data: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { wishlist: productId } }
    );

    const user = await User.findById(req.user._id).populate('wishlist', POPULATE_FIELDS);
    res.status(200).json({ success: true, message: 'Product removed from wishlist', data: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all items from wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Authentication required. req.user is undefined.' });
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      { $set: { wishlist: [] } }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Wishlist cleared successfully', 
      deletedCount: result.modifiedCount || 0,
      data: [] 
    });
  } catch (error) {
    console.error('Wishlist Clear Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};
