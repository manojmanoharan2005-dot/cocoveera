import ShippingRule from '../models/ShippingRule.js';
import CurrencySettings from '../models/CurrencySettings.js';

// --- SHIPPING RULES CONTROLLERS ---

export const getShippingRules = async (req, res) => {
  try {
    const rules = await ShippingRule.find();
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShippingRule = async (req, res) => {
  try {
    const existingRule = await ShippingRule.findOne({ country: req.body.country });
    if (existingRule) {
      return res.status(400).json({ success: false, message: 'Shipping rule for this country already exists.' });
    }
    const rule = await ShippingRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShippingRule = async (req, res) => {
  try {
    const rule = await ShippingRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Shipping rule not found' });
    }
    res.status(200).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteShippingRule = async (req, res) => {
  try {
    const rule = await ShippingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Shipping rule not found' });
    }
    await ShippingRule.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Shipping rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- CURRENCY SETTINGS CONTROLLERS ---

const initializeCurrencySettings = async () => {
  let settings = await CurrencySettings.findOne();
  if (!settings) {
    const defaultRates = [
      { currency: 'USD', rate: 0.012, isActive: true },
      { currency: 'EUR', rate: 0.011, isActive: true },
      { currency: 'GBP', rate: 0.0095, isActive: true },
      { currency: 'AED', rate: 0.044, isActive: true },
      { currency: 'AUD', rate: 0.018, isActive: true },
      { currency: 'CAD', rate: 0.016, isActive: true },
      { currency: 'JPY', rate: 1.87, isActive: true },
      { currency: 'SGD', rate: 0.016, isActive: true },
    ];
    settings = await CurrencySettings.create({
      baseCurrency: 'INR',
      rates: defaultRates,
      history: [],
      autoUpdate: false,
    });
  }
  return settings;
};

export const getCurrencySettings = async (req, res) => {
  try {
    const settings = await initializeCurrencySettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCurrencySettings = async (req, res) => {
  try {
    let settings = await CurrencySettings.findOne();
    if (!settings) {
      settings = await initializeCurrencySettings();
    }
    
    // Log history for changed rates
    if (req.body.rates) {
      const historyEntries = [];
      req.body.rates.forEach(newRateObj => {
        const oldRateObj = settings.rates.find(r => r.currency === newRateObj.currency);
        if (oldRateObj && oldRateObj.rate !== newRateObj.rate) {
          historyEntries.push({
            currency: newRateObj.currency,
            oldRate: oldRateObj.rate,
            newRate: newRateObj.rate,
            date: new Date(),
            adminUser: req.user ? req.user.name : 'Admin',
          });
        }
      });
      if (historyEntries.length > 0) {
        settings.history.push(...historyEntries);
      }
      settings.rates = req.body.rates;
    }

    if (req.body.baseCurrency) settings.baseCurrency = req.body.baseCurrency;
    if (typeof req.body.autoUpdate !== 'undefined') settings.autoUpdate = req.body.autoUpdate;
    settings.lastUpdated = Date.now();

    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncCurrencyRates = async (req, res) => {
  try {
    let settings = await CurrencySettings.findOne();
    if (!settings) {
      settings = await initializeCurrencySettings();
    }

    if (!settings.autoUpdate) {
      return res.status(400).json({ success: false, message: 'Auto update is disabled.' });
    }

    const historyEntries = [];
    const newRates = settings.rates.map(rate => {
      const newRateValue = rate.rate + (Math.random() * 0.001 - 0.0005);
      historyEntries.push({
        currency: rate.currency,
        oldRate: rate.rate,
        newRate: newRateValue,
        date: new Date(),
        adminUser: 'System Auto-Sync',
      });
      return {
        ...rate.toObject(),
        rate: newRateValue
      };
    });

    settings.history.push(...historyEntries);
    settings.rates = newRates;
    settings.lastUpdated = Date.now();
    await settings.save();

    res.status(200).json({ success: true, data: settings, message: 'Currency rates synced successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

