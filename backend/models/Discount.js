import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['PRODUCT', 'COUPON', 'BULK', 'SEASONAL', 'COUNTRY', 'GROUP', 'FREE_SHIPPING'],
      required: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      default: 'PERCENTAGE',
    },
    value: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: true,
    },
    // Sub-schema fields depending on type
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    minQuantity: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      trim: true,
    },
    customerGroup: {
      type: String,
      enum: ['New Customer', 'Returning Customer', 'Wholesale Customer', 'VIP Customer'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    bannerImage: {
      type: String,
    },
    reason: {
      type: String,
    },
    createdBy: {
      type: String,
      default: 'Admin',
    }
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
DiscountSchema.index({ type: 1, status: 1 });
DiscountSchema.index({ couponCode: 1 }, { unique: true, partialFilterExpression: { couponCode: { $type: "string" } } });

export default mongoose.model('Discount', DiscountSchema);
