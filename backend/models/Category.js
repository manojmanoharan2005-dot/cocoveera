/**
 * File: backend/models/Category.js
 * Purpose: Defines the database schema and model for Category.
 */
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
CategorySchema.index({ displayOrder: 1, name: 1 });

// Auto-generate slug before saving
CategorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

export default mongoose.model('Category', CategorySchema);
