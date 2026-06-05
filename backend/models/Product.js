/**
 * File: backend/models/Product.js
 * Purpose: Defines the database schema and model for Product.
 */
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    specifications: {
      ph: { type: String, default: '5.5 - 6.5' },
      ec: { type: String, default: '< 0.5 mS/cm' },
      moisture: { type: String, default: '< 20%' },
      compressionRatio: { type: String, default: '5:1' },
      fiberLength: { type: String, default: 'Under 2cm' },
      expansionVolume: { type: String, default: '15 Liters/kg' },
      sandContent: { type: String, default: '< 2%' },
    },
    packageSize: {
      type: String,
      required: [true, 'Please specify packaging (e.g. 5kg Blocks, 650g Briquettes)'],
    },
    weight: {
      type: Number,
      required: [true, 'Please specify product weight in KG'],
      default: 5,
    },
    length: {
      type: Number,
      default: 30, // cm
    },
    width: {
      type: Number,
      default: 30, // cm
    },
    height: {
      type: Number,
      default: 12, // cm
    },
    volumeCBM: {
      type: Number,
      default: 0.0108,
    },
    palletCount: {
      type: Number,
      default: 300,
    },
    price: {
      type: Number,
      required: [true, 'Please specify unit price (INR)'],
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please specify stock (units/tons available)'],
      default: 100,
    },
    images: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    benefits: {
      type: [String],
      default: [],
    },
    applications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
ProductSchema.index({ category: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ isPublished: 1 });

// Auto-generate slug before saving
ProductSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

export default mongoose.model('Product', ProductSchema);
