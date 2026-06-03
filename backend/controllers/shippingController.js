import Country from '../models/Country.js';
import State from '../models/State.js';
import Port from '../models/Port.js';
import ShippingMethod from '../models/ShippingMethod.js';
import ShippingZone from '../models/ShippingZone.js';
import ShippingRate from '../models/ShippingRate.js';
import ContainerCharge from '../models/ContainerCharge.js';
import ExportCharge from '../models/ExportCharge.js';
import Order from '../models/Order.js';

const exchangeRatesToINR = {
  INR: 1,
  USD: 1 / 0.012,
  EUR: 1 / 0.011,
  GBP: 1 / 0.0094,
};

const toINR = (amount, currency) => {
  if (!amount) return 0;
  const rate = exchangeRatesToINR[currency?.toUpperCase()] || 1;
  return amount * rate;
};

const resourceMap = {
  countries: Country,
  states: State,
  ports: Port,
  shippingmethods: ShippingMethod,
  shippingzones: ShippingZone,
  shippingrates: ShippingRate,
  containercharges: ContainerCharge,
  exportcharges: ExportCharge,
};

const populateMap = {
  states: ['country', 'country'],
  ports: ['country', 'country'],
  shippingzones: ['originCountry destinationCountry states ports', 'originCountry destinationCountry states ports'],
  shippingrates: ['originCountry destinationCountry shippingMethod', 'originCountry destinationCountry shippingMethod'],
  containercharges: ['country destinationCountry', 'country destinationCountry'],
  exportcharges: ['country', 'country'],
};

const getModel = (resource) => resourceMap[String(resource || '').toLowerCase()];

const withPopulate = async (query, resource) => {
  const populate = populateMap[resource]?.[0];
  if (!populate) return query;
  return query.populate(populate);
};

export const listResource = async (req, res) => {
  try {
    const model = getModel(req.params.resource);
    if (!model) return res.status(404).json({ success: false, message: 'Unknown shipping resource' });

    const activeOnly = req.query.active === 'true';
    const filter = activeOnly ? { status: 'active' } : {};
    let query = model.find(filter).sort('-createdAt');
    const populate = populateMap[req.params.resource]?.[0];
    if (populate) query = query.populate(populate);

    const data = await query;
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const model = getModel(req.params.resource);
    if (!model) return res.status(404).json({ success: false, message: 'Unknown shipping resource' });
    const doc = await model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const model = getModel(req.params.resource);
    if (!model) return res.status(404).json({ success: false, message: 'Unknown shipping resource' });
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const model = getModel(req.params.resource);
    if (!model) return res.status(404).json({ success: false, message: 'Unknown shipping resource' });
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShippingRules = async (req, res) => {
  try {
    const [countries, rates, methods, zones, containerCharges, exportCharges] = await Promise.all([
      Country.find({ status: 'active' }).sort('name'),
      ShippingRate.find({ status: 'active' }).populate('originCountry destinationCountry shippingMethod').sort('-createdAt'),
      ShippingMethod.find({ status: 'active' }).sort('name'),
      ShippingZone.find({ status: 'active' }).populate('originCountry destinationCountry states ports').sort('-createdAt'),
      ContainerCharge.find({ status: 'active' }).populate('country destinationCountry').sort('-createdAt'),
      ExportCharge.find({ status: 'active' }).populate('country').sort('-createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        countries,
        shippingRates: rates,
        shippingMethods: methods,
        shippingZones: zones,
        containerCharges,
        exportCharges,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calculateShippingQuote = async (req, res) => {
  try {
    const {
      originCountry,
      destinationCountry,
      shippingMethod,
      containerType,
      weightKg = 0,
      itemsTotal = 0,
      currency = 'INR',
      port,
    } = req.body;

    const origin = await Country.findById(originCountry);
    const destination = await Country.findById(destinationCountry);
    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'Origin or destination country not found' });
    }

    const methodDoc = shippingMethod ? await ShippingMethod.findById(shippingMethod) : null;

    const rate = await ShippingRate.findOne({
      originCountry: origin._id,
      destinationCountry: destination._id,
      ...(methodDoc ? { shippingMethod: methodDoc._id } : {}),
      status: 'active',
    }).populate('shippingMethod');

    const containerCharge = containerType
      ? await ContainerCharge.findOne({
          country: origin._id,
          destinationCountry: destination._id,
          containerType,
          status: 'active',
        })
      : null;

    const exportChargeDocs = await ExportCharge.find({
      status: 'active',
      $or: [{ country: destination._id }, { country: null }],
    });

    const shippingCost = rate ? toINR(Number(rate.shippingCost || 0), rate.currency) : 0;
    const transitTimeDays = rate ? Number(rate.transitTimeDays || 0) : 0;
    const containerCost = containerCharge
      ? toINR(Number(containerCharge.baseFreightCost || 0) + Number(containerCharge.portHandlingCharges || 0) + Number(containerCharge.documentationCharges || 0) + Number(containerCharge.customClearanceCharges || 0), containerCharge.currency)
      : 0;
    const exportCharges = exportChargeDocs.reduce((sum, item) => sum + toINR(Number(item.amount || 0), item.currency), 0);
    const tax = Math.round((Number(itemsTotal) + shippingCost + containerCost + exportCharges) * 0.18 * 100) / 100;
    const total = Math.round((Number(itemsTotal) + shippingCost + containerCost + exportCharges + tax) * 100) / 100;
    const now = new Date();
    const estimatedDispatchDate = new Date(now);
    const estimatedArrivalDate = new Date(now);
    estimatedArrivalDate.setDate(estimatedArrivalDate.getDate() + transitTimeDays + (containerType ? 5 : 2));

    res.json({
      success: true,
      data: {
        originCountry: origin,
        destinationCountry: destination,
        shippingMethod: methodDoc || rate?.shippingMethod || null,
        containerType,
        port: port || null,
        itemsTotal: Number(itemsTotal),
        shippingCost,
        containerCost,
        exportCharges,
        tax,
        grandTotal: total,
        transitTimeDays,
        estimatedDispatchDate,
        estimatedArrivalDate,
        currency,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShippingAnalytics = async (req, res) => {
  try {
    const [countries, orders, shippingOrders, rates, containerCharges] = await Promise.all([
      Country.countDocuments({ status: 'active' }),
      Order.find({}),
      ShippingOrder.find({}).populate('destinationCountry shippingMethod'),
      ShippingRate.find({ status: 'active' }),
      ContainerCharge.find({ status: 'active' }),
    ]);

    const domesticOrders = orders.filter((order) => String(order.shippingAddress?.country || '').toLowerCase() === 'india').length;
    const internationalOrders = Math.max(0, orders.length - domesticOrders);
    const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const averageShippingCost = shippingOrders.length ? shippingOrders.reduce((sum, item) => sum + Number(item.shippingCost || 0), 0) / shippingOrders.length : 0;

    res.json({
      success: true,
      data: {
        domesticOrders,
        internationalOrders,
        revenue,
        topCountries: shippingOrders.slice(0, 5).map((item) => item.destinationCountry?.name || 'Unknown'),
        averageShippingCost: Math.round(averageShippingCost * 100) / 100,
        containerUtilization: shippingOrders.length ? Math.round((shippingOrders.filter((item) => item.containerType).length / shippingOrders.length) * 100) : 0,
        countriesServed: countries,
        activeRates: rates.length,
        activeContainerCharges: containerCharges.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
