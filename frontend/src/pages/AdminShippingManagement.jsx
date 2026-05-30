import React, { useState, useEffect } from 'react';
import { adminSettingsService } from '../services/adminSettingsService';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Truck, Plus, Save, MapPin, Package, CheckCircle, TrendingUp, AlertCircle, Edit2, Trash2, Box
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function AdminShippingManagement() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    country: '',
    currency: 'INR',
    methods: ['Standard'],
    weightRules: {
      upTo5kg: 0,
      upTo20kg: 0,
      over20kg: 0
    },
    freeShipping: {
      enabled: false,
      minAmount: 0
    },
    estimatedDeliveryDays: '5-7 business days',
    isActive: true,
  });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await adminSettingsService.getShippingRules();
      setRules(res.data);
    } catch (err) {
      setError('Failed to fetch shipping rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('weight_')) {
      const field = name.split('_')[1];
      setFormData(prev => ({ ...prev, weightRules: { ...prev.weightRules, [field]: parseFloat(value) || 0 } }));
    } else if (name === 'freeShippingEnabled') {
      setFormData(prev => ({ ...prev, freeShipping: { ...prev.freeShipping, enabled: checked } }));
    } else if (name === 'freeShippingMin') {
      setFormData(prev => ({ ...prev, freeShipping: { ...prev.freeShipping, minAmount: parseFloat(value) || 0 } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleMethodToggle = (method) => {
    setFormData(prev => {
      const methods = prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method];
      return { ...prev, methods };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await adminSettingsService.updateShippingRule(editingId, formData);
        setSuccess('Shipping rule updated successfully');
      } else {
        await adminSettingsService.createShippingRule(formData);
        setSuccess('Shipping rule created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      fetchRules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save shipping rule');
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      country: rule.country,
      currency: rule.currency || 'INR',
      methods: rule.methods || ['Standard'],
      weightRules: rule.weightRules || { upTo5kg: 0, upTo20kg: 0, over20kg: 0 },
      freeShipping: rule.freeShipping || { enabled: false, minAmount: 0 },
      estimatedDeliveryDays: rule.estimatedDeliveryDays,
      isActive: rule.isActive,
    });
    setEditingId(rule._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipping rule?')) {
      try {
        await adminSettingsService.deleteShippingRule(id);
        setSuccess('Shipping rule deleted successfully');
        fetchRules();
      } catch (err) {
        setError('Failed to delete shipping rule');
      }
    }
  };

  // Real analytics data will go here, set to empty for now
  const deliveryData = [];
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#64748b'];

  const revenueData = [];

  if (loading && rules.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Shipping & Logistics</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage global delivery rules, tracking, and logistics analytics.</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                country: '',
                currency: 'INR',
                methods: ['Standard'],
                weightRules: { upTo5kg: 0, upTo20kg: 0, over20kg: 0 },
                freeShipping: { enabled: false, minAmount: 0 },
                estimatedDeliveryDays: '5-7 business days',
                isActive: true,
              });
            }}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-md shadow-green-600/20"
          >
            <Plus size={18} />
            <span>Add Shipping Rule</span>
          </button>
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
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Box size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Shipments</p>
              <p className="text-2xl font-black text-gray-900">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Truck size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Delivery</p>
              <p className="text-2xl font-black text-gray-900">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><CheckCircle size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Delivered Orders</p>
              <p className="text-2xl font-black text-gray-900">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><MapPin size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Countries Served</p>
              <p className="text-2xl font-black text-gray-900">{rules.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Table Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Country Shipping Configurations</h2>
            </div>
            
            {showForm ? (
              <form onSubmit={handleSubmit} className="p-6 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Country / Region</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g. USA, UK, Global"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Delivery Days</label>
                    <input
                      type="text"
                      name="estimatedDeliveryDays"
                      value={formData.estimatedDeliveryDays}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Weight Based Rules (Base {formData.currency})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">0 - 5 kg</label>
                      <input
                        type="number"
                        name="weight_upTo5kg"
                        value={formData.weightRules.upTo5kg}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">5 - 20 kg</label>
                      <input
                        type="number"
                        name="weight_upTo20kg"
                        value={formData.weightRules.upTo20kg}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">20kg +</label>
                      <input
                        type="number"
                        name="weight_over20kg"
                        value={formData.weightRules.over20kg}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Free Shipping Rules</h3>
                    <label className="flex items-center space-x-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        name="freeShippingEnabled"
                        checked={formData.freeShipping.enabled}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-bold text-gray-700">Enable Free Shipping Threshold</span>
                    </label>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Minimum Order Amount ({formData.currency})</label>
                      <input
                        type="number"
                        name="freeShippingMin"
                        value={formData.freeShipping.minAmount}
                        onChange={handleInputChange}
                        disabled={!formData.freeShipping.enabled}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Supported Methods</h3>
                    <div className="space-y-2">
                      {['Standard', 'Express', 'Bulk Shipping'].map(method => (
                        <label key={method} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.methods.includes(method)}
                            onChange={() => handleMethodToggle(method)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-gray-900">Rule is Active</span>
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-md"
                    >
                      <Save size={18} />
                      <span>{editingId ? 'Update Rule' : 'Save Rule'}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Charges (0-5kg | 5-20kg | 20kg+)</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Methods</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Free Shipping</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rules.map((rule) => (
                      <tr key={rule._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-gray-900">{rule.country}</span>
                            {!rule.isActive && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{rule.estimatedDeliveryDays}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                          {rule.weightRules?.upTo5kg} / {rule.weightRules?.upTo20kg} / {rule.weightRules?.over20kg} {rule.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {rule.methods?.map(m => (
                              <span key={m} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded">{m}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                          {rule.freeShipping?.enabled ? `> ${rule.freeShipping.minAmount} ${rule.currency}` : 'Disabled'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button onClick={() => handleEdit(rule)} className="text-blue-600 hover:text-blue-900 p-2">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(rule._id)} className="text-red-600 hover:text-red-900 p-2 ml-1">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rules.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                          No shipping rules defined. Please add a rule.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Analytics Modules */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-purple-500" /> Top Delivered Countries
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deliveryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {deliveryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center text-xs font-bold text-gray-600">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-500" /> Shipping Revenue
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} width={40} />
                    <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
