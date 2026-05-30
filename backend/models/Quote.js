import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify the quantity required'],
      min: [1, 'Quantity must be at least 1 unit'],
    },
    unitType: {
      type: String,
      enum: ['Tons', 'Containers', 'Pallets', 'Pieces'],
      default: 'Tons',
    },
    specificationsRequested: {
      ph: String,
      ec: String,
      moisture: String,
      notes: String,
    },
    shippingAddress: {
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'converted', 'rejected'],
      default: 'pending',
    },
    replyMessage: {
      type: String,
      default: '',
    },
    pricingProposed: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Quote', QuoteSchema);
