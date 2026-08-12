import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const removePhoneIndex = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocoveera';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully.');

    const collection = mongoose.connection.db.collection('users');
    const indexes = await collection.indexes();
    console.log('Current indexes on users collection:', indexes.map(i => i.name));

    const phoneIndex = indexes.find(i => i.name === 'phone_1' || (i.key && i.key.phone));

    if (phoneIndex) {
      console.log(`Dropping index: ${phoneIndex.name}...`);
      await collection.dropIndex(phoneIndex.name);
      console.log(`Successfully dropped index: ${phoneIndex.name}`);
    } else {
      console.log('No phone index found on users collection.');
    }

    const updatedIndexes = await collection.indexes();
    console.log('Updated indexes on users collection:', updatedIndexes.map(i => i.name));

    process.exit(0);
  } catch (error) {
    console.error('Error removing phone index:', error);
    process.exit(1);
  }
};

removePhoneIndex();
