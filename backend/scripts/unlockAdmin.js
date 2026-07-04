import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

const unlock = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    
    const admin = await User.findOne({ email: 'coirsystemadmin@gmail.com' });
    if (admin) {
      admin.failedLoginAttempts = 0;
      admin.failedKeyAttempts = 0;
      admin.lockUntil = null;
      await admin.save();
      console.log('Admin account successfully unlocked!');
    } else {
      console.log('Admin account not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

unlock();
