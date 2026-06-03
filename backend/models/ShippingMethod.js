/**
 * File: backend/models/ShippingMethod.js
 * Purpose: Defines the database schema and model for ShippingMethod.
 */
import mongoose from 'mongoose';

const ShippingMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: { type: String, enum: ['domestic', 'international', 'both'], default: 'both' },
    mode: { type: String, enum: ['road', 'rail', 'sea', 'air', 'container', 'lcl', 'ftl', 'ptl', 'other'], default: 'other' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('ShippingMethod', ShippingMethodSchema);
