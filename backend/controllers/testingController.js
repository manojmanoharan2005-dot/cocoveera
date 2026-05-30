import TestingReport from '../models/TestingReport.js';
import Product from '../models/Product.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Submit a batch lab test report (Admin only)
// @route   POST /api/testing
// @access  Private/Admin
export const createReport = async (req, res) => {
  const {
    productId,
    batchNumber,
    ecValue,
    phValue,
    moisturePercent,
    compressionRatio,
    fiberContent,
    testerName,
    status,
    pdfUrl,
  } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let finalPdfUrl = pdfUrl || '';

    // If PDF file upload is provided via multer
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'cocoveera_lab_reports');
      finalPdfUrl = uploadResult.secure_url;
    }

    // Default mock pdf link if none exists
    if (!finalPdfUrl) {
      finalPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    const report = await TestingReport.create({
      product: productId,
      productName: product.name,
      batchNumber,
      ecValue,
      phValue,
      moisturePercent,
      compressionRatio,
      fiberContent,
      testerName,
      status: status || 'passed',
      pdfUrl: finalPdfUrl,
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Batch number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports (Admin/Staff view)
// @route   GET /api/testing
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const reports = await TestingReport.find()
      .populate('product', 'name category')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Public search - verify batch quality parameters
// @route   GET /api/testing/verify/:batchNumber
// @access  Public
export const verifyBatch = async (req, res) => {
  try {
    const report = await TestingReport.findOne({
      batchNumber: req.params.batchNumber.trim().toUpperCase(),
    }).populate('product', 'name description category specifications');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No laboratory records found for the specified batch number. Please contact customer support.',
      });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
