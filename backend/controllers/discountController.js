import Discount from '../models/Discount.js';

// @desc    Get all discounts
// @route   GET /api/admin/discounts
// @access  Private/Admin
export const getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().populate('productId', 'name price images').sort('-createdAt');
    res.status(200).json({ success: true, count: discounts.length, data: discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single discount
// @route   GET /api/admin/discounts/:id
// @access  Private/Admin
export const getDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id).populate('productId', 'name price images');
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found' });
    }
    res.status(200).json({ success: true, data: discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new discount
// @route   POST /api/admin/discounts
// @access  Private/Admin
export const createDiscount = async (req, res) => {
  try {
    // Basic uniqueness check for coupon codes
    if (req.body.type === 'COUPON' && req.body.couponCode) {
      const existing = await Discount.findOne({ couponCode: req.body.couponCode.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
    }
    
    req.body.createdBy = req.user ? req.user.name : 'Admin';
    const discount = await Discount.create(req.body);
    
    res.status(201).json({ success: true, data: discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update discount
// @route   PUT /api/admin/discounts/:id
// @access  Private/Admin
export const updateDiscount = async (req, res) => {
  try {
    let discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found' });
    }

    // Check uniqueness if updating coupon code
    if (req.body.couponCode && req.body.couponCode.toUpperCase() !== discount.couponCode) {
      const existing = await Discount.findOne({ couponCode: req.body.couponCode.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
    }

    discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete discount
// @route   DELETE /api/admin/discounts/:id
// @access  Private/Admin
export const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found' });
    }
    
    await Discount.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get discount stats
// @route   GET /api/admin/discounts/stats
// @access  Private/Admin
export const getDiscountStats = async (req, res) => {
  try {
    const total = await Discount.countDocuments();
    const active = await Discount.countDocuments({ status: true, $or: [{ endDate: { $exists: false } }, { endDate: { $gt: new Date() } }] });
    const expired = await Discount.countDocuments({ endDate: { $lt: new Date() } });
    
    const byType = await Discount.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Just some basic metrics for the KPI
    res.status(200).json({ 
      success: true, 
      data: {
        total,
        active,
        expired,
        byType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
