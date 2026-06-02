import React, { useState, useEffect } from 'react';
import { adminSettingsService } from '../services/adminSettingsService';
import AdminLayout from '../layouts/AdminLayout';
import { 
  DollarSign, RefreshCw, Save, Activity, Globe, Clock, History, AlertCircle, CheckCircle, TrendingUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function AdminCurrencyManagement() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewAmount, setPreviewAmount] = useState(1000);

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

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

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
      setSuccess('Currency rates synced successfully via automated API');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync rates');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  // Mock analytics data
  const usageData = [];

  const historyData = (settings?.history || []).slice(-15).map((h, i) => ({
    name: `T-${i}`,
    rate: h.newRate,
    currency: h.currency
  }));

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Currency Management</h1>
            <p className="text-gray-500 mt-1 font-medium">Configure global exchange rates and automated sync protocols.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={!settings?.autoUpdate || syncing}
              className="flex items-center space-x-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-xl font-bold hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed border border-green-200 shadow-sm"
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              <span>Sync Live Rates</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-md shadow-green-600/20"
            >
              <Save size={18} />
              <span>Save Rates</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 shadow-sm">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3 shadow-sm">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><DollarSign size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Base Currency</p>
              <p className="text-2xl font-black text-gray-900">{settings?.baseCurrency}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Globe size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Currencies</p>
              <p className="text-2xl font-black text-gray-900">{settings?.rates.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Clock size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Last Updated</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{new Date(settings?.lastUpdated).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Activity size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Exchange Status</p>
              <p className="text-lg font-black text-green-600">{settings?.autoUpdate ? 'Auto Syncing' : 'Manual Mode'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Exchange Rate Management Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Exchange Rate Matrix</h2>
              <label className="flex items-center space-x-3 cursor-pointer bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <input
                  type="checkbox"
                  checked={settings?.autoUpdate}
                  onChange={handleToggleAutoUpdate}
                  className="w-5 h-5 border border-gray-300 rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700 font-bold text-sm">Enable Auto Update</span>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Currency</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rate (1 {settings?.baseCurrency})</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settings?.rates.map((rate, idx) => (
                    <tr key={rate.currency} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                            {rate.currency.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">{rate.currency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                        {rate.currency === 'USD' ? '$' : rate.currency === 'EUR' ? '€' : rate.currency === 'GBP' ? '£' : rate.currency === 'JPY' ? '¥' : rate.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="number"
                            step="0.000001"
                            value={rate.rate}
                            onChange={(e) => handleRateChange(idx, e.target.value)}
                            disabled={settings?.autoUpdate}
                            className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg text-right font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${rate.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Modules */}
          <div className="space-y-8">
            {/* Live Preview Widget */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign size={120} />
              </div>
              <h2 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
                <Activity size={18} /> Live Currency Preview
              </h2>
              <div className="relative z-10 space-y-4">
                <div>
                  <label className="text-sm font-medium text-green-100 block mb-1">Enter {settings?.baseCurrency} Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={previewAmount}
                      onChange={(e) => setPreviewAmount(e.target.value)}
                      className="w-full bg-white text-green-900 font-black text-xl rounded-xl py-3 pl-8 pr-4 outline-none focus:ring-4 focus:ring-white/30"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {settings?.rates.filter(r => ['USD', 'EUR', 'GBP', 'AED'].includes(r.currency)).map(rate => (
                    <div key={rate.currency} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                      <p className="text-xs text-green-100 font-medium">{rate.currency}</p>
                      <p className="text-lg font-bold">{(previewAmount * rate.rate).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Most Used Currency Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" /> Usage Distribution
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History size={18} className="text-gray-500" /> Rate Change History
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 border-r border-gray-100 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['dataMin - 0.01', 'dataMax + 0.01']} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#22c55e', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="overflow-y-auto max-h-64 pr-2 space-y-3">
              {(settings?.history || []).slice().reverse().map((record, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">{record.currency}</p>
                    <p className="text-xs text-gray-500 font-medium">By {record.adminUser} • {new Date(record.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 line-through">{record.oldRate}</p>
                    <p className="text-sm font-black text-green-600">{record.newRate}</p>
                  </div>
                </div>
              ))}
              {(settings?.history || []).length === 0 && (
                <div className="text-center text-gray-500 py-12 font-medium">No history recorded yet.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
