import mongoose from 'mongoose';

const TestingPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deliveryDays: {
      type: Number,
      required: true,
      default: 3,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('TestingPackage', TestingPackageSchema);
