import TestingReport from '../models/TestingReport.js';
import Product from '../models/Product.js';

// @desc    Get all quality testing reports (Admin)
// @route   GET /api/admin/testing
// @access  Private/Admin
export const getAdminTestingReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;

    const total = await TestingReport.countDocuments(query);
    const reports = await TestingReport.find(query)
      .populate('product')
      .populate('approvedBy', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reports,
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

// @desc    Get single testing report
// @route   GET /api/admin/testing/:id
// @access  Private/Admin
export const getAdminTestingReport = async (req, res) => {
  try {
    const report = await TestingReport.findById(req.params.id)
      .populate('product')
      .populate('approvedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Testing report not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create testing report (Admin)
// @route   POST /api/admin/testing
// @access  Private/Admin
export const createAdminTestingReport = async (req, res) => {
  try {
    const {
      product,
      productName,
      batchNumber,
      ecValue,
      phValue,
      moisturePercent,
      compressionRatio,
      fiberContent,
      testerName,
      reportPdfUrl,
    } = req.body;

    // Validate required fields
    if (
      !productName ||
      !batchNumber ||
      !ecValue ||
      !phValue ||
      !moisturePercent ||
      !testerName
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const report = await TestingReport.create({
      product: product || null,
      productName,
      batchNumber,
      ecValue,
      phValue,
      moisturePercent,
      compressionRatio: compressionRatio || 'N/A',
      fiberContent: fiberContent || 'N/A',
      testerName,
      status: 'pending',
      reportPdfUrl: reportPdfUrl || '',
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update testing report
// @route   PUT /api/admin/testing/:id
// @access  Private/Admin
export const updateAdminTestingReport = async (req, res) => {
  try {
    const {
      productName,
      batchNumber,
      ecValue,
      phValue,
      moisturePercent,
      compressionRatio,
      fiberContent,
      testerName,
      reportPdfUrl,
      remarks,
    } = req.body;

    let report = await TestingReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Testing report not found' });
    }

    const updateData = {
      ...(productName && { productName }),
      ...(batchNumber && { batchNumber }),
      ...(ecValue && { ecValue }),
      ...(phValue && { phValue }),
      ...(moisturePercent && { moisturePercent }),
      ...(compressionRatio && { compressionRatio }),
      ...(fiberContent && { fiberContent }),
      ...(testerName && { testerName }),
      ...(reportPdfUrl && { reportPdfUrl }),
      ...(remarks && { remarks }),
    };

    report = await TestingReport.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Testing report updated successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve testing report
// @route   PATCH /api/admin/testing/:id/approve
// @access  Private/Admin
export const approveTestingReport = async (req, res) => {
  try {
    const { remarks } = req.body;

    let report = await TestingReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Testing report not found' });
    }

    report.status = 'approved';
    report.approvedBy = req.user._id;
    report.approvalDate = new Date();
    if (remarks) report.remarks = remarks;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Testing report approved successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject testing report
// @route   PATCH /api/admin/testing/:id/reject
// @access  Private/Admin
export const rejectTestingReport = async (req, res) => {
  try {
    const { remarks } = req.body;

    let report = await TestingReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Testing report not found' });
    }

    report.status = 'rejected';
    if (remarks) report.remarks = remarks;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Testing report rejected successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete testing report
// @route   DELETE /api/admin/testing/:id
// @access  Private/Admin
export const deleteAdminTestingReport = async (req, res) => {
  try {
    const report = await TestingReport.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Testing report not found' });
    }

    res.status(200).json({ success: true, message: 'Testing report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get testing statistics
// @route   GET /api/admin/testing/stats
// @access  Private/Admin
export const getTestingStats = async (req, res) => {
  try {
    const totalReports = await TestingReport.countDocuments();
    const approvedReports = await TestingReport.countDocuments({ status: 'approved' });
    const rejectedReports = await TestingReport.countDocuments({ status: 'rejected' });
    const pendingReports = await TestingReport.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        approvedReports,
        rejectedReports,
        pendingReports,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
