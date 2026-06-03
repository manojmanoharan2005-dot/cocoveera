/**
 * File: backend/config/db.js
 * Purpose: Configuration settings and initialization for external services or databases.
 */
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cocoveera', {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4, helps fix 'getaddrinfo ENOTFOUND' on Windows
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
