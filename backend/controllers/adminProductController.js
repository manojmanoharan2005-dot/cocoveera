/**
 * File: backend/controllers/adminProductController.js
 * Purpose: Handles the business logic and request processing for adminProduct operations.
 */
import Product from '../models/Product.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { clearCache } from '../middleware/cache.js';

// @desc    Get all products with filters, search, pagination (Admin)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) {
      const upperStatus = status.toUpperCase();
      if (upperStatus === 'PUBLISHED') {
        query.isPublished = true;
      } else if (upperStatus === 'HIDDEN') {
        query.isHidden = true;
      } else if (upperStatus === 'DELETED') {
        query.isDeleted = true;
      } else {
        query.status = upperStatus;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product (Admin)
// @route   GET /api/admin/products/:id
// @access  Private/Admin
export const getAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/admin/products
// @access  Private/Admin
export const createAdminProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      packageSize,
      price,
      stock,
      specifications,
      benefits,
      applications,
      isPublished,
      status,
      isHidden,
      isDeleted,
      imageUrls,
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !packageSize || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    let images = [];
    if (imageUrls) {
      images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    }

    // Auto-assign next displayOrder within the category
    const maxProd = await Product.findOne({ category }).sort({ displayOrder: -1 });
    const displayOrder = maxProd && maxProd.displayOrder ? maxProd.displayOrder + 1 : 1;

    const finalStatus = status || (isPublished === false ? 'DRAFT' : 'ACTIVE');
    const finalIsHidden = isHidden !== undefined ? Boolean(isHidden) : (finalStatus === 'HIDDEN');
    const finalIsDeleted = isDeleted !== undefined ? Boolean(isDeleted) : (finalStatus === 'DELETED');
    const finalIsPublished = isPublished !== undefined ? Boolean(isPublished) : (finalStatus === 'ACTIVE' || finalStatus === 'PUBLISHED');

    const product = await Product.create({
      name,
      description,
      category,
      packageSize,
      price: Number(price),
      stock: Number(stock) || 0,
      images,
      specifications: specifications || {},
      benefits: Array.isArray(benefits) ? benefits : [],
      applications: Array.isArray(applications) ? applications : [],
      status: finalStatus,
      isPublished: finalIsPublished,
      isHidden: finalIsHidden,
      isDeleted: finalIsDeleted,
      displayOrder,
    });

    clearCache('/api/products');
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateAdminProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      description,
      category,
      packageSize,
      price,
      stock,
      specifications,
      benefits,
      applications,
      isPublished,
      status,
      isHidden,
      isDeleted,
      imageUrls,
    } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category }),
      ...(packageSize && { packageSize }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(specifications && { specifications }),
      ...(benefits && { benefits: Array.isArray(benefits) ? benefits : [] }),
      ...(applications && { applications: Array.isArray(applications) ? applications : [] }),
      ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      ...(status && { status }),
      ...(isHidden !== undefined && { isHidden: Boolean(isHidden) }),
      ...(isDeleted !== undefined && { isDeleted: Boolean(isDeleted) }),
    };

    if (status) {
      const upperStatus = status.toUpperCase();
      if (upperStatus === 'DRAFT') {
        updateData.isPublished = false;
      } else if (upperStatus === 'ACTIVE') {
        updateData.isPublished = true;
        updateData.isHidden = false;
        updateData.isDeleted = false;
      } else if (upperStatus === 'HIDDEN') {
        updateData.isHidden = true;
      } else if (upperStatus === 'DELETED') {
        updateData.isDeleted = true;
      }
    }

    if (imageUrls) {
      updateData.images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    clearCache('/api/products');
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Admin only - soft delete)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, status: 'DELETED', isPublished: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    clearCache('/api/products');
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish/Unpublish product (Admin toggle)
// @route   PATCH /api/admin/products/:id/publish
// @access  Private/Admin
export const togglePublishProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isPublished = !product.isPublished;
    if (product.isPublished) {
      product.status = 'ACTIVE';
      product.isHidden = false;
      product.isDeleted = false;
    } else {
      product.status = 'DRAFT';
    }
    await product.save();

    clearCache('/api/products');
    res.status(200).json({
      success: true,
      message: `Product ${product.isPublished ? 'published' : 'unpublished'} successfully`,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
