import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

import path from 'path';

// Load backend .env explicitly
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const users = await User.find().select('email name role isVerified isBlocked createdAt').lean();
    console.log(`Total users: ${users.length}`);

    // Show any duplicate emails
    const emailCount = {};
    users.forEach(u => {
      const e = (u.email || '').toLowerCase();
      emailCount[e] = (emailCount[e] || 0) + 1;
    });

    const duplicates = Object.entries(emailCount).filter(([email, cnt]) => email && cnt > 1);
    if (duplicates.length) {
      console.log('Duplicate emails found:');
      duplicates.forEach(([email, cnt]) => console.log(`${email} => ${cnt}`));
    } else {
      console.log('No duplicate emails found');
    }

    // Print up to 20 recent users
    console.log('\nRecent users (up to 20):');
    users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
      .forEach(u => console.log(`${u._id} | ${u.email} | ${u.name} | role:${u.role} | verified:${u.isVerified} | blocked:${u.isBlocked} | created:${u.createdAt}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err.message || err);
    process.exit(2);
  }
}

main();
