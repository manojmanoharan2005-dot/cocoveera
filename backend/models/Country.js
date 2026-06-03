/**
 * File: backend/models/Country.js
 * Purpose: Defines the database schema and model for Country.
 */
import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    currency: { type: String, required: true, trim: true, uppercase: true },
    flag: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDomestic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CountrySchema.index({ status: 1, name: 1 });

export default mongoose.model('Country', CountrySchema);
