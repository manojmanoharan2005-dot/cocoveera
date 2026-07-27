/**
 * File: backend/models/Notification.js
 * Purpose: Defines database schema for customer notifications.
 */
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'info',
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
