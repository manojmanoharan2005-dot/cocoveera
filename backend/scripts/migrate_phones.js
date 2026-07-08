import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env before importing models
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';

const migratePhones = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocoveera';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for Migration');

    const users = await User.find({}).sort({ createdAt: -1 });
    const phoneSet = new Set();
    let updatedCount = 0;

    for (const user of users) {
      if (user.phone) {
        if (phoneSet.has(user.phone)) {
          console.log(`Duplicate phone found: ${user.phone} for user ${user.email}`);
          const newPhone = `${user.phone}_dup_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          user.phone = newPhone;
          await user.save();
          console.log(`Updated phone to: ${newPhone}`);
          updatedCount++;
        } else {
          phoneSet.add(user.phone);
        }
      }
    }

    console.log(`Migration completed successfully. Updated ${updatedCount} duplicate phone numbers.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migratePhones();
