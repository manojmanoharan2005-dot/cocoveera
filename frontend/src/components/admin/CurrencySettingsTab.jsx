import { useState, useEffect } from 'react';
import { adminSettingsService } from '../../services/adminSettingsService';
import { RefreshCw, Save, DollarSign } from 'lucide-react';

export default function CurrencySettingsTab({ setError, setSuccess }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminSettingsService.getCurrencySettings();
      setSettings(res.data);
    } catch (err) {
      setError('Failed to fetch currency settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRateChange = (index, value) => {
    const updatedRates = [...settings.rates];
    updatedRates[index].rate = parseFloat(value);
    setSettings({ ...settings, rates: updatedRates });
  };

  const handleToggleAutoUpdate = (e) => {
    setSettings({ ...settings, autoUpdate: e.target.checked });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await adminSettingsService.updateCurrencySettings({
        baseCurrency: settings.baseCurrency,
        rates: settings.rates,
        autoUpdate: settings.autoUpdate,
      });
      setSettings(res.data);
      setSuccess('Currency settings updated successfully');
    } catch (err) {
      setError('Failed to save currency settings');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminSettingsService.syncCurrencyRates();
      setSettings(res.data);
      setSuccess('Currency rates synced successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync rates');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading currency settings...</p>;
  }

  if (!settings) {
    return <p className="text-gray-500">No currency settings found.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Currency Management</h3>
          <p className="text-sm text-gray-500">Base Currency: <span className="font-bold text-gray-800">{settings.baseCurrency}</span></p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSync}
            disabled={!settings.autoUpdate || syncing}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>Sync Rates</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800">Exchange Rates</h4>
            <span className="text-xs text-gray-500">Last updated: {new Date(settings.lastUpdated).toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.rates.map((rate, idx) => (
              <div key={rate._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <DollarSign size={18} className="text-gray-400" />
                  <span className="font-medium text-gray-700">{settings.baseCurrency} to {rate.currency}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">=</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={rate.rate}
                    onChange={(e) => handleRateChange(idx, e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded text-right focus:ring-blue-500"
                    disabled={settings.autoUpdate}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
          <label className="flex items-center space-x-3 cursor-pointer mb-4 sm:mb-0">
            <input
              type="checkbox"
              checked={settings.autoUpdate}
              onChange={handleToggleAutoUpdate}
              className="w-5 h-5 border border-gray-300 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-800 font-medium block">Enable Auto Update</span>
              <span className="text-gray-500 text-xs">Locks manual editing and allows system to fetch live rates</span>
            </div>
          </label>
          <button
            type="submit"
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
