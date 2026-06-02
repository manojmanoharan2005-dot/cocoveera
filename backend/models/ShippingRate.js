import mongoose from 'mongoose';

const ShippingRateSchema = new mongoose.Schema(
  {
    originCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    destinationCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    shippingMethod: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingMethod', required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    transitTimeDays: { type: Number, required: true, default: 0 },
    minOrderQuantity: { type: Number, default: 0 },
    maxOrderQuantity: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

ShippingRateSchema.index({ originCountry: 1, destinationCountry: 1, shippingMethod: 1 }, { unique: true });

export default mongoose.model('ShippingRate', ShippingRateSchema);
