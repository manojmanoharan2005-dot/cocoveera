/*
  migrate_addresses_and_balance.js

  Safe migration script for:
  1) Moving embedded `addresses` from User documents into a new `addresses` collection.
  2) Optionally unsetting `balance` fields across specified collections.

  Usage (dry-run):
    node migrate_addresses_and_balance.js

  To execute writes (DEStructive) add --confirm:
    node migrate_addresses_and_balance.js --confirm --unsetCollections users,orders

  Notes:
  - Reads Mongo URI from process.env.MONGO_URI or .env using dotenv.
  - Requires network access to your MongoDB and the same models shape as the codebase.
  - Always run without --confirm first to review the planned changes.
*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from '../models/User.js';
import AddressModel from '../models/Address.js';

dotenv.config();

const MONGO = process.env.MONGO_URI || process.env.MONGO || 'mongodb://localhost:27017/cocoveera';
const args = process.argv.slice(2);
const CONFIRM = args.includes('--confirm');
const unsetArg = args.find(a => a.startsWith('--unsetCollections='));
const UNSET_COLLECTIONS = unsetArg ? unsetArg.split('=')[1].split(',') : [];

async function connect() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function migrateAddresses() {
  console.log('Scanning users for embedded addresses...');
  const users = await UserModel.find({ addresses: { $exists: true, $ne: [] } }).lean();
  console.log(`Found ${users.length} users with embedded addresses.`);

  const planned = [];
  for (const u of users) {
    const userId = u._id;
    const addrs = u.addresses || [];
    for (const a of addrs) {
      const doc = {
        user: userId,
        label: a.label || a.type || 'address',
        line1: a.line1 || a.street || '',
        line2: a.line2 || '',
        city: a.city || a.town || '',
        state: a.state || '',
        postalCode: a.postalCode || a.zip || '',
        country: a.country || a.countryCode || '',
        phone: a.phone || u.phone || '',
        metadata: a.metadata || {},
        createdAt: a.createdAt || new Date(),
      };
      planned.push({ userId, doc });
    }
  }

  console.log(`Planned to create ${planned.length} Address documents.`);
  if (!CONFIRM) {
    console.log('Dry run mode (no writes). Re-run with --confirm to execute migration.');
    return;
  }

  console.log('Executing address migration...');
  const created = [];
  for (const p of planned) {
    const createdDoc = await AddressModel.create(p.doc);
    created.push(createdDoc._id);
  }

  console.log(`Created ${created.length} Address docs.`);

  // Optionally remove embedded addresses from users
  console.log('Removing embedded addresses from users...');
  await UserModel.updateMany({ addresses: { $exists: true } }, { $unset: { addresses: '' } });
  console.log('Removed embedded addresses from users.');
}

async function unsetBalanceFields() {
  if (UNSET_COLLECTIONS.length === 0) {
    console.log('No collections specified to unset balance. Skipping.');
    return;
  }

  console.log(`Will unset 'balance' field from collections: ${UNSET_COLLECTIONS.join(',')}`);
  if (!CONFIRM) {
    console.log('Dry run mode (no writes). Re-run with --confirm to execute unset operations.');
    return;
  }

  for (const col of UNSET_COLLECTIONS) {
    console.log(`Unsetting balance on collection: ${col}`);
    const coll = mongoose.connection.collection(col);
    const res = await coll.updateMany({ balance: { $exists: true } }, { $unset: { balance: '' } });
    console.log(`Collection ${col}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }
}

(async () => {
  try {
    await connect();
    console.log('Connected to MongoDB');

    await migrateAddresses();
    await unsetBalanceFields();

    console.log('Migration script finished.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
