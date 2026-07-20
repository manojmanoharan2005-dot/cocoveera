/**
 * File: backend/controllers/categoryController.js
 * Purpose: Handles public category operations.
 */
import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .select('name slug image description displayOrder')
      .lean()
      .sort({ displayOrder: 1, _id: 1 });
      
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
