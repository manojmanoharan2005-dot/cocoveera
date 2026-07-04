/**
 * File: backend/controllers/productController.js
 * Purpose: Handles the business logic and request processing for product operations.
 */
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { clearCache } from '../middleware/cache.js';

// @desc    Get all products (with category filter)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    const products = await Product.find(query)
      .select('name slug category description price stock images packageSize specifications')
      .lean();
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid product ID format' });
    }
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      ph,
      ec,
      moisture,
      compressionRatio,
      fiberLength,
      expansionVolume,
      sandContent,
      packageSize,
      price,
      stock,
      benefits,
      applications,
      imageUrls, // alternative to direct uploads
    } = req.body;

    let images = imageUrls ? (Array.isArray(imageUrls) ? imageUrls : [imageUrls]) : [];

    // If file uploads are provided via multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer, 'cocoveera_products');
        images.push(uploadResult.secure_url);
      }
    }

    // Default premium fallback image if none provided
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=800&q=80');
    }

    const product = await Product.create({
      name,
      description,
      category,
      specifications: {
        ph: ph || '5.5 - 6.5',
        ec: ec || '< 0.5 mS/cm',
        moisture: moisture || '< 20%',
        compressionRatio: compressionRatio || '5:1',
        fiberLength: fiberLength || 'Under 2cm',
        expansionVolume: expansionVolume || '15 Liters/kg',
        sandContent: sandContent || '< 2%',
      },
      packageSize,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      images,
      benefits: benefits ? (Array.isArray(benefits) ? benefits : [benefits]) : [],
      applications: applications ? (Array.isArray(applications) ? applications : [applications]) : [],
    });

    clearCache('/api/products');
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid product ID format' });
    }
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      description,
      category,
      ph,
      ec,
      moisture,
      compressionRatio,
      fiberLength,
      expansionVolume,
      sandContent,
      packageSize,
      price,
      stock,
      benefits,
      applications,
      imageUrls,
    } = req.body;

    let images = product.images;
    if (imageUrls) {
      images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    }

    if (req.files && req.files.length > 0) {
      images = []; // Clear and re-add if files uploaded
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer, 'cocoveera_products');
        images.push(uploadResult.secure_url);
      }
    }

    const updateData = {
      name: name || product.name,
      description: description || product.description,
      category: category || product.category,
      specifications: {
        ph: ph || product.specifications.ph,
        ec: ec || product.specifications.ec,
        moisture: moisture || product.specifications.moisture,
        compressionRatio: compressionRatio || product.specifications.compressionRatio,
        fiberLength: fiberLength || product.specifications.fiberLength,
        expansionVolume: expansionVolume || product.specifications.expansionVolume,
        sandContent: sandContent || product.specifications.sandContent,
      },
      packageSize: packageSize || product.packageSize,
      price: price !== undefined ? Number(price) : product.price,
      stock: stock !== undefined ? Number(stock) : product.stock,
      images,
      benefits: benefits ? (Array.isArray(benefits) ? benefits : [benefits]) : product.benefits,
      applications: applications ? (Array.isArray(applications) ? applications : [applications]) : product.applications,
    };

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

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Invalid product ID format' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.deleteOne();
    clearCache('/api/products');
    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
