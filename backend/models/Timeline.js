/**
 * File: backend/models/Timeline.js
 * Purpose: Defines database schema for tracking order workflow timeline events.
 */
import mongoose from 'mongoose';

const TimelineSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

TimelineSchema.index({ order: 1, timestamp: 1 });

export default mongoose.model('Timeline', TimelineSchema);
