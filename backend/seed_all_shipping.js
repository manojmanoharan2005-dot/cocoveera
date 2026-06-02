import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Country from './models/Country.js';
import State from './models/State.js';
import Port from './models/Port.js';
import ShippingMethod from './models/ShippingMethod.js';
import ShippingRate from './models/ShippingRate.js';
import ContainerCharge from './models/ContainerCharge.js';
import ExportCharge from './models/ExportCharge.js';
import ShippingZone from './models/ShippingZone.js';

dotenv.config();

const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cocoveera';

const countriesData = [
  { name: 'India', code: 'IN', currency: 'INR', isDomestic: true },
  { name: 'USA', code: 'US', currency: 'USD', isDomestic: false },
  { name: 'Germany', code: 'DE', currency: 'EUR', isDomestic: false },
  { name: 'UK', code: 'GB', currency: 'GBP', isDomestic: false },
  { name: 'Australia', code: 'AU', currency: 'AUD', isDomestic: false },
  { name: 'Canada', code: 'CA', currency: 'CAD', isDomestic: false },
  { name: 'Japan', code: 'JP', currency: 'JPY', isDomestic: false },
  { name: 'Netherlands', code: 'NL', currency: 'EUR', isDomestic: false },
  { name: 'UAE', code: 'AE', currency: 'AED', isDomestic: false },
  { name: 'Singapore', code: 'SG', currency: 'SGD', isDomestic: false },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD', isDomestic: false }
];

const indianStates = [
  { name: 'Andhra Pradesh', code: 'AP' }, { name: 'Arunachal Pradesh', code: 'AR' },
  { name: 'Assam', code: 'AS' }, { name: 'Bihar', code: 'BR' },
  { name: 'Chhattisgarh', code: 'CG' }, { name: 'Goa', code: 'GA' },
  { name: 'Gujarat', code: 'GJ' }, { name: 'Haryana', code: 'HR' },
  { name: 'Himachal Pradesh', code: 'HP' }, { name: 'Jharkhand', code: 'JH' },
  { name: 'Karnataka', code: 'KA' }, { name: 'Kerala', code: 'KL' },
  { name: 'Madhya Pradesh', code: 'MP' }, { name: 'Maharashtra', code: 'MH' },
  { name: 'Manipur', code: 'MN' }, { name: 'Meghalaya', code: 'ML' },
  { name: 'Mizoram', code: 'MZ' }, { name: 'Nagaland', code: 'NL' },
  { name: 'Odisha', code: 'OR' }, { name: 'Punjab', code: 'PB' },
  { name: 'Rajasthan', code: 'RJ' }, { name: 'Sikkim', code: 'SK' },
  { name: 'Tamil Nadu', code: 'TN' }, { name: 'Telangana', code: 'TG' },
  { name: 'Tripura', code: 'TR' }, { name: 'Uttar Pradesh', code: 'UP' },
  { name: 'Uttarakhand', code: 'UK' }, { name: 'West Bengal', code: 'WB' },
  { name: 'Delhi', code: 'DL' }
];

const portsData = [
  { name: 'Kochi Port (Cochin)', type: 'seaport', countryCode: 'IN' },
  { name: 'Chennai Port', type: 'seaport', countryCode: 'IN' },
  { name: 'Mumbai Port (Nhava Sheva)', type: 'seaport', countryCode: 'IN' },
  { name: 'Port of Los Angeles', type: 'seaport', countryCode: 'US' },
  { name: 'Port of New York', type: 'seaport', countryCode: 'US' },
  { name: 'Port of Hamburg', type: 'seaport', countryCode: 'DE' },
  { name: 'London Gateway', type: 'seaport', countryCode: 'GB' },
  { name: 'Port of Sydney', type: 'seaport', countryCode: 'AU' },
  { name: 'Port of Vancouver', type: 'seaport', countryCode: 'CA' },
  { name: 'Port of Tokyo', type: 'seaport', countryCode: 'JP' },
  { name: 'Port of Rotterdam', type: 'seaport', countryCode: 'NL' },
  { name: 'Jebel Ali Port', type: 'seaport', countryCode: 'AE' },
  { name: 'Port of Singapore', type: 'seaport', countryCode: 'SG' },
  { name: 'Port of Auckland', type: 'seaport', countryCode: 'NZ' }
];

const seedAll = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;

    // Drop old collections to avoid unique index conflicts
    const collectionsToDrop = ['states', 'shippingzones', 'shippingrates', 'containercharges', 'exportcharges', 'ports'];
    for (const c of collectionsToDrop) {
      try { await db.collection(c).drop(); } catch (e) {}
    }

    // 1. Countries
    console.log('Seeding 11 Countries...');
    const countryMap = {};
    for (const c of countriesData) {
      const doc = await Country.findOneAndUpdate({ code: c.code }, { $set: c }, { upsert: true, new: true });
      countryMap[c.code] = doc._id;
    }
    const indiaId = countryMap['IN'];

    // 2. States
    console.log('Seeding 29 Indian States...');
    const stateIds = [];
    for (const s of indianStates) {
      const doc = await State.create({ country: indiaId, name: s.name, code: s.code, status: 'active' });
      stateIds.push(doc._id);
    }

    // 3. Ports
    console.log('Seeding 14 Ports...');
    const portMap = {};
    for (const p of portsData) {
      const doc = await Port.create({ name: p.name, code: p.countryCode, country: countryMap[p.countryCode], status: 'active' });
      portMap[p.name] = doc._id;
    }

    // 4. Shipping Methods
    console.log('Seeding Shipping Methods...');
    const seaFcl = await ShippingMethod.findOneAndUpdate({ name: 'Sea Freight (FCL)' }, { $set: { category: 'international', mode: 'container', status: 'active' } }, { upsert: true, new: true });
    const seaLcl = await ShippingMethod.findOneAndUpdate({ name: 'Sea Freight (LCL)' }, { $set: { category: 'international', mode: 'lcl', status: 'active' } }, { upsert: true, new: true });
    const airFreight = await ShippingMethod.findOneAndUpdate({ name: 'Air Freight' }, { $set: { category: 'international', mode: 'air', status: 'active' } }, { upsert: true, new: true });
    const roadFreight = await ShippingMethod.findOneAndUpdate({ name: 'Domestic Road Transport' }, { $set: { category: 'domestic', mode: 'road', status: 'active' } }, { upsert: true, new: true });

    // 5. Shipping Rates & 6. Container Charges
    console.log('Seeding Shipping Rates & Container Charges...');
    for (const c of countriesData) {
      if (c.code === 'IN') {
        await ShippingRate.create({ originCountry: indiaId, destinationCountry: indiaId, shippingMethod: roadFreight._id, shippingCost: 1500, transitTimeDays: 5, currency: 'INR' });
        continue;
      }

      // Rates
      let cost = 150; let transit = 25;
      if (['US', 'CA'].includes(c.code)) { cost = 450; transit = 35; }
      if (['DE', 'GB', 'NL'].includes(c.code)) { cost = 350; transit = 28; }
      if (['AU', 'NZ'].includes(c.code)) { cost = 280; transit = 22; }
      if (['AE', 'SG'].includes(c.code)) { cost = 120; transit = 12; }
      if (c.code === 'JP') { cost = 250; transit = 18; }

      await ShippingRate.create({ originCountry: indiaId, destinationCountry: countryMap[c.code], shippingMethod: seaFcl._id, shippingCost: cost, transitTimeDays: transit, currency: 'USD' });
      await ShippingRate.create({ originCountry: indiaId, destinationCountry: countryMap[c.code], shippingMethod: seaLcl._id, shippingCost: cost * 0.4, transitTimeDays: transit + 3, currency: 'USD' });
      await ShippingRate.create({ originCountry: indiaId, destinationCountry: countryMap[c.code], shippingMethod: airFreight._id, shippingCost: cost * 3.5, transitTimeDays: 4, currency: 'USD' });

      // Containers
      const cTypes = ['20FT FCL', '40FT FCL', 'LCL'];
      for (const t of cTypes) {
        let base = t === '20FT FCL' ? cost * 8 : t === '40FT FCL' ? cost * 14 : cost * 2.5;
        await ContainerCharge.create({
          country: indiaId, destinationCountry: countryMap[c.code], containerType: t,
          baseFreightCost: base, portHandlingCharges: 180, documentationCharges: 95, customClearanceCharges: 300, currency: 'USD'
        });
      }
    }

    // 7. Export Charges
    console.log('Seeding Export Charges...');
    const exportFees = [
      { name: 'Phytosanitary Certificate', feeType: 'certificate', amount: 85 },
      { name: 'Certificate of Origin', feeType: 'certificate', amount: 50 },
      { name: 'Fumigation Certificate', feeType: 'certificate', amount: 120 },
      { name: 'Customs Handling Fee', feeType: 'customs_handling', amount: 200 },
      { name: 'Bill of Lading (B/L) Fee', feeType: 'export_documentation', amount: 65 },
      { name: 'Terminal Handling Charge (THC)', feeType: 'other', amount: 150 }
    ];
    for (const f of exportFees) {
      await ExportCharge.create({ ...f, currency: 'USD', status: 'active' });
    }

    // 8. Shipping Zones
    console.log('Seeding Shipping Zones...');
    await ShippingZone.create({ name: 'Domestic India', originCountry: indiaId, destinationCountry: indiaId, states: stateIds, ports: [portMap['Kochi Port (Cochin)'], portMap['Chennai Port'], portMap['Mumbai Port (Nhava Sheva)']] });
    
    for (const c of countriesData.filter(x => !x.isDomestic)) {
      const zonePorts = Object.values(portMap).filter(id => {
        // Find port by ID
        const portObj = portsData.find(p => countryMap[p.countryCode].toString() === id.toString());
        return portObj && portObj.countryCode === c.code;
      });
      await ShippingZone.create({ name: `India to ${c.name} Lane`, originCountry: indiaId, destinationCountry: countryMap[c.code], states: [], ports: zonePorts });
    }

    console.log('ALL MODULES SEEDED SUCCESSFULLY WITH REAL DATA!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAll();
