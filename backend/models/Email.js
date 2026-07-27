/**
 * File: backend/models/Email.js
 * Purpose: Defines database schema for logging sent emails.
 */
import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

EmailSchema.index({ to: 1, createdAt: -1 });

export default mongoose.model('Email', EmailSchema);
