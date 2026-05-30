import mongoose from 'mongoose';

const ShippingRuleSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR', // To specify which currency the charge is listed in if not base
    },
    methods: {
      type: [String], // 'Standard', 'Express', 'Bulk Shipping'
      default: ['Standard', 'Express'],
    },
    weightRules: {
      upTo5kg: { type: Number, default: 0 },
      upTo20kg: { type: Number, default: 0 },
      over20kg: { type: Number, default: 0 },
    },
    freeShipping: {
      enabled: { type: Boolean, default: false },
      minAmount: { type: Number, default: 0 },
    },
    estimatedDeliveryDays: {
      type: String,
      default: '5-7 business days',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ShippingRule', ShippingRuleSchema);
