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
      enum: [
        'Coir Pith Blocks',
        'Grow Bags',
        'Coir Discs',
        'Erosion Control',
        'Other Coir Products',
        'Hobby Gardening',
        'Custom Solutions',
      ],
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
    weightKg: {
      type: Number,
      default: 5,
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
