import mongoose from 'mongoose';

const StateSchema = new mongoose.Schema(
  {
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

StateSchema.index({ country: 1, name: 1 }, { unique: true });

export default mongoose.model('State', StateSchema);
