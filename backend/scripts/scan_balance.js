/*
  scan_balance.js

  Scans all collections in the MongoDB and reports counts of documents
  that contain a 'balance' field. No writes performed.

  Usage:
    node backend/scripts/scan_balance.js
*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO = process.env.MONGO_URI || process.env.MONGO || 'mongodb://localhost:27017/cocoveera';

async function connect() {
  await mongoose.connect(MONGO);
}

(async () => {
  try {
    await connect();
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    for (const c of cols) {
      const name = c.name;
      const coll = db.collection(name);
      try {
        const cnt = await coll.countDocuments({ balance: { $exists: true } });
        if (cnt > 0) {
          console.log(`Collection ${name}: ${cnt} documents contain 'balance'`);
          const sample = await coll.find({ balance: { $exists: true } }).limit(3).toArray();
          console.log('Sample docs:', sample.map(d => ({ _id: d._id, balance: d.balance })));}
        else {
          console.log(`Collection ${name}: 0`);
        }
      } catch (err) {
        console.warn(`Skipping collection ${name} due to error:`, err.message);
      }
    }
    await mongoose.disconnect();
    console.log('Scan complete.');
    process.exit(0);
  } catch (err) {
    console.error('Scan failed:', err);
    process.exit(1);
  }
})();
