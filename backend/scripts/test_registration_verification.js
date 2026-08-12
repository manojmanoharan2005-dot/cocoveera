import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';

const runTest = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocoveera';
    console.log('Connecting to DB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to DB.');

    // 1. Check indexes
    const collection = mongoose.connection.db.collection('users');
    const indexes = await collection.indexes();
    console.log('Indexes on users collection:', indexes.map(i => i.name));

    const phoneIdx = indexes.find(i => i.name === 'phone_1' || (i.key && i.key.phone));
    if (phoneIdx) {
      console.error('ERROR: phone_1 index still exists!');
      process.exit(1);
    } else {
      console.log('SUCCESS: phone_1 index does not exist.');
    }

    const testEmail1 = `test_user_no_phone_1_${Date.now()}@example.com`;
    const testEmail2 = `test_user_no_phone_2_${Date.now()}@example.com`;

    // 2. Insert User 1 without phone
    console.log(`Attempting registration for ${testEmail1}...`);
    const u1 = await User.create({
      name: 'Test User One',
      email: testEmail1,
      password: 'password123',
      country: 'United States',
      currency: 'USD'
    });
    console.log('Registered User 1 successfully:', u1._id);

    // 3. Insert User 2 without phone (Verifying duplicate key { phone: "" } error does not occur)
    console.log(`Attempting registration for ${testEmail2}...`);
    const u2 = await User.create({
      name: 'Test User Two',
      email: testEmail2,
      password: 'password123',
      country: 'United Kingdom',
      currency: 'GBP'
    });
    console.log('Registered User 2 successfully without phone field:', u2._id);

    // Verify phone is undefined on inserted doc
    const rawDoc1 = await collection.findOne({ _id: u1._id });
    const rawDoc2 = await collection.findOne({ _id: u2._id });

    console.log('User 1 raw doc contains phone field?:', 'phone' in rawDoc1);
    console.log('User 2 raw doc contains phone field?:', 'phone' in rawDoc2);

    // Clean up test users
    await collection.deleteOne({ _id: u1._id });
    await collection.deleteOne({ _id: u2._id });
    console.log('Cleaned up test users.');

    console.log('ALL MONGO REGISTRATION VERIFICATION TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
};

runTest();
