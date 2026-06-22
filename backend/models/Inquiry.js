import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  inquiryId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
  },
  company: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  inquiryType: {
    type: String,
    required: true,
    enum: [
      'Product Inquiry',
      'Bulk Order Inquiry',
      'Container Load Planning',
      'Pricing Request',
      'Sample Request',
      'Distributor Partnership',
      'OEM / Private Label',
      'Logistics Support',
      'General Inquiry'
    ],
  },
  productCategory: {
    type: String,
  },
  productName: {
    type: String,
  },
  requiredQuantity: {
    type: String,
  },
  unitType: {
    type: String,
    enum: ['Pieces', 'Pallets', 'Containers', 'Tons', ''],
  },
  monthlyRequirement: {
    type: String,
  },
  targetMarket: {
    type: String,
  },
  expectedOrderFrequency: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  files: [{
    type: String, // Cloudinary URLs
  }],
  status: {
    type: String,
    enum: ['New', 'Assigned', 'In Progress', 'Replied', 'Closed'],
    default: 'New',
  },
  emailStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed'],
    default: 'Pending',
  }
}, { timestamps: true });

// Auto-generate Inquiry ID before saving
inquirySchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const currentYear = new Date().getFullYear();
    // Find the highest inquiryId for the current year
    const lastInquiry = await this.constructor.findOne(
      { inquiryId: new RegExp(`^CCV-${currentYear}-`) },
      'inquiryId'
    ).sort({ inquiryId: -1 });

    let nextNumber = 1;
    if (lastInquiry && lastInquiry.inquiryId) {
      const parts = lastInquiry.inquiryId.split('-');
      if (parts.length === 3) {
        nextNumber = parseInt(parts[2], 10) + 1;
      }
    }

    this.inquiryId = `CCV-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
