import mongoose from 'mongoose';

const CurrencyRateSchema = new mongoose.Schema({
  currency: {
    type: String, // e.g., 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'JPY', 'SGD'
    required: true,
  },
  rate: {
    type: Number, // Conversion rate (e.g., 1 INR = 0.012 USD)
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const CurrencyHistorySchema = new mongoose.Schema({
  currency: String,
  oldRate: Number,
  newRate: Number,
  date: {
    type: Date,
    default: Date.now,
  },
  adminUser: {
    type: String,
    default: 'System', // 'Admin Name' or 'System' if auto updated
  },
});

const CurrencySettingsSchema = new mongoose.Schema(
  {
    baseCurrency: {
      type: String,
      default: 'INR',
      required: true,
    },
    rates: [CurrencyRateSchema],
    history: [CurrencyHistorySchema],
    autoUpdate: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CurrencySettings', CurrencySettingsSchema);
