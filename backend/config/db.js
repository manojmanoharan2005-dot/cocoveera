/**
 * File: backend/config/db.js
 * Purpose: Configuration settings and initialization for external services or databases.
 */
import mongoose from 'mongoose';

const MAX_RETRIES = 5;
let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    console.log('[MongoDB] Using existing database connection');
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxPoolSize: 50,
    minPoolSize: 10,
    heartbeatFrequencyMS: 10000,
    autoIndex: process.env.NODE_ENV !== 'production' // Don't build indexes in production
  };

  const connectWithRetry = async (retryCount = 1) => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cocoveera', options);
      isConnected = conn.connections[0].readyState === 1;
      console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
      console.error(`[MongoDB] Connection Error: ${error.message}`);
      if (retryCount <= MAX_RETRIES) {
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`[MongoDB] Retrying connection in ${waitTime / 1000} seconds... (Attempt ${retryCount}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return connectWithRetry(retryCount + 1);
      } else {
        console.error('[MongoDB] Max retries reached. Could not connect to database.');
        process.exit(1);
      }
    }
  };

  // Connection Event Listeners
  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] Mongoose connection event: connected');
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Mongoose connection error event: ${err.message}`);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Mongoose connection event: disconnected. Mongoose will try to reconnect automatically.');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Mongoose connection event: reconnected');
    isConnected = true;
  });

  await connectWithRetry();
};
