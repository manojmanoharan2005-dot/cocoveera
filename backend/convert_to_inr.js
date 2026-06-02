import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShippingRate from './models/ShippingRate.js';
import ContainerCharge from './models/ContainerCharge.js';
import ExportCharge from './models/ExportCharge.js';

dotenv.config();

const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cocoveera';
const EXCHANGE_RATE = 84;

const convert = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to DB');

    // Update Shipping Rates
    const rates = await ShippingRate.find({ currency: 'USD' });
    for (const r of rates) {
      r.shippingCost = Math.round(r.shippingCost * EXCHANGE_RATE);
      r.currency = 'INR';
      await r.save();
    }
    console.log(`Updated ${rates.length} shipping rates to INR.`);

    // Update Container Charges
    const containers = await ContainerCharge.find({ currency: 'USD' });
    for (const c of containers) {
      c.baseFreightCost = Math.round(c.baseFreightCost * EXCHANGE_RATE);
      c.portHandlingCharges = Math.round(c.portHandlingCharges * EXCHANGE_RATE);
      c.documentationCharges = Math.round(c.documentationCharges * EXCHANGE_RATE);
      c.customClearanceCharges = Math.round(c.customClearanceCharges * EXCHANGE_RATE);
      c.currency = 'INR';
      await c.save();
    }
    console.log(`Updated ${containers.length} container charges to INR.`);

    // Update Export Charges
    const exports = await ExportCharge.find({ currency: 'USD' });
    for (const e of exports) {
      e.amount = Math.round(e.amount * EXCHANGE_RATE);
      e.currency = 'INR';
      await e.save();
    }
    console.log(`Updated ${exports.length} export charges to INR.`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

convert();
