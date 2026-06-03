/**
 * File: frontend/src/pages/AdminDiscounts.jsx
 * Purpose: React page component representing the AdminDiscounts view.
 */
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminDiscountService } from '../services/adminDiscountService';
import { 
  Tag, Plus, Save, AlertCircle, CheckCircle, Percent, Banknote, 
  Package, Box, Globe, Users, TrendingUp, Filter, Trash2, Edit2, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function AdminDiscounts() {
  const [activeTab, setActiveTab] = useState('PRODUCT');
  const [discounts, setDiscounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Products list for reference
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'PRODUCT',
    discountType: 'PERCENTAGE',
    value: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: true,
    productId: '',
    couponCode: '',
    minQuantity: 0,
    country: '',
    customerGroup: 'New Customer',
    minOrderAmount: 0,
    usageLimit: '',
  });

  const TABS = [
    { id: 'PRODUCT', label: 'Product Discounts', icon: <Package size={16} /> },
    { id: 'COUPON', label: 'Coupons', icon: <Tag size={16} /> },
    { id: 'BULK', label: 'Bulk Orders', icon: <Box size={16} /> },
    { id: 'SEASONAL', label: 'Seasonal', icon: <Calendar size={16} /> },
    { id: 'COUNTRY', label: 'Country Based', icon: <Globe size={16} /> },
    { id: 'GROUP', label: 'Customer Groups', icon: <Users size={16} /> },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminDiscountService.getDiscounts();
      setDiscounts(res.data);
      const statRes = await adminDiscountService.getDiscountStats();
      setStats(statRes.data);
    } catch (err) {
      setError('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowForm(false);
    setEditingId(null);
  };

  const openForm = (rule = null) => {
    if (rule) {
      setFormData({
        name: rule.name,
        type: rule.type,
        discountType: rule.discountType,
        value: rule.value,
        startDate: rule.startDate ? new Date(rule.startDate).toISOString().split('T')[0] : '',
        endDate: rule.endDate ? new Date(rule.endDate).toISOString().split('T')[0] : '',
        status: rule.status,
        productId: rule.productId?._id || '',
        couponCode: rule.couponCode || '',
        minQuantity: rule.minQuantity || 0,
        country: rule.country || '',
        customerGroup: rule.customerGroup || 'New Customer',
        minOrderAmount: rule.minOrderAmount || 0,
        usageLimit: rule.usageLimit || '',
      });
      setEditingId(rule._id);
    } else {
      setFormData({
        name: '',
        type: activeTab,
        discountType: 'PERCENTAGE',
        value: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: true,
        productId: '',
        couponCode: '',
        minQuantity: 0,
        country: '',
        customerGroup: 'New Customer',
        minOrderAmount: 0,
        usageLimit: '',
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const submitData = { ...formData };
    if (!submitData.endDate) delete submitData.endDate;
    if (submitData.usageLimit === '') submitData.usageLimit = null;

    try {
      if (editingId) {
        await adminDiscountService.updateDiscount(editingId, submitData);
        setSuccess('Discount updated successfully');
      } else {
        await adminDiscountService.createDiscount(submitData);
        setSuccess('Discount created successfully');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save discount');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount rule?')) {
      try {
        await adminDiscountService.deleteDiscount(id);
        setSuccess('Discount deleted successfully');
        fetchData();
      } catch (err) {
        setError('Failed to delete discount');
      }
    }
  };

  // Filter discounts by active tab
  const filteredDiscounts = discounts.filter(d => d.type === activeTab);

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
  const pieData = stats?.byType.map((type, i) => ({
    name: type._id,
    value: type.count,
    color: COLORS[i % COLORS.length]
  })) || [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Discount Management</h1>
            <p className="text-gray-500 mt-1 font-medium">Create and manage pricing rules, coupons, and bulk discounts.</p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-md shadow-green-600/20"
          >
            <Plus size={18} />
            <span>Create {TABS.find(t => t.id === activeTab)?.label}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Tag size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Rules</p>
              <p className="text-2xl font-black text-gray-900">{stats?.total || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><CheckCircle size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active</p>
              <p className="text-2xl font-black text-gray-900">{stats?.active || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertCircle size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Expired</p>
              <p className="text-2xl font-black text-gray-900">{stats?.expired || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><TrendingUp size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Savings Given</p>
              <p className="text-2xl font-black text-gray-900">₹0</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tabs */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form or Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">
                  {showForm ? `${editingId ? 'Edit' : 'Create'} ${TABS.find(t=>t.id===activeTab)?.label}` : `Manage ${TABS.find(t=>t.id===activeTab)?.label}`}
                </h2>
              </div>
              
              {showForm ? (
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Rule Name / Description</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Summer Sale 2026"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                        required
                      />
                    </div>

                    {/* Conditional Fields based on Active Tab */}
                    {activeTab === 'COUPON' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                        <input
                          type="text"
                          name="couponCode"
                          value={formData.couponCode}
                          onChange={handleInputChange}
                          placeholder="e.g. WELCOME10"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900 uppercase"
                          required
                        />
                      </div>
                    )}

                    {activeTab === 'PRODUCT' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Target Product ID</label>
                        <input
                          type="text"
                          name="productId"
                          value={formData.productId}
                          onChange={handleInputChange}
                          placeholder="Paste Product Object ID"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                        />
                      </div>
                    )}

                    {activeTab === 'BULK' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Quantity</label>
                        <input
                          type="number"
                          name="minQuantity"
                          value={formData.minQuantity}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                          required
                        />
                      </div>
                    )}

                    {activeTab === 'COUNTRY' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Target Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="e.g. USA"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                          required
                        />
                      </div>
                    )}

                    {activeTab === 'GROUP' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Customer Group</label>
                        <select
                          name="customerGroup"
                          value={formData.customerGroup}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900 bg-white"
                        >
                          <option value="New Customer">New Customer</option>
                          <option value="Returning Customer">Returning Customer</option>
                          <option value="Wholesale Customer">Wholesale Customer</option>
                          <option value="VIP Customer">VIP Customer</option>
                        </select>
                      </div>
                    )}

                    {/* Common Discount Value Fields */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900 bg-white"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Discount Value</label>
                      <input
                        type="number"
                        name="value"
                        value={formData.value}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                        required
                      />
                    </div>

                    {(activeTab === 'COUPON' || activeTab === 'SEASONAL') && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">End Date (Optional)</label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Min. Order Amount (₹)</label>
                          <input
                            type="number"
                            name="minOrderAmount"
                            value={formData.minOrderAmount}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                          />
                        </div>
                      </>
                    )}

                    {activeTab === 'COUPON' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Usage Limit (Total)</label>
                        <input
                          type="number"
                          name="usageLimit"
                          value={formData.usageLimit}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="Leave blank for unlimited"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-900"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="status"
                        checked={formData.status}
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
                  <table className="w-full whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rule Details</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Conditions</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDiscounts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                            No active rules found for this category.
                          </td>
                        </tr>
                      ) : (
                        filteredDiscounts.map(d => (
                          <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-bold text-gray-900">{d.name}</p>
                              {d.couponCode && <p className="text-xs font-bold text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded mt-1">{d.couponCode}</p>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                              {d.discountType === 'PERCENTAGE' ? `${d.value}% OFF` : `₹${d.value} OFF`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {d.type === 'BULK' && `Min Qty: ${d.minQuantity}`}
                              {d.type === 'COUNTRY' && `Country: ${d.country}`}
                              {d.type === 'GROUP' && `Group: ${d.customerGroup}`}
                              {(d.type === 'COUPON' || d.type === 'SEASONAL') && (d.endDate ? `Ends: ${new Date(d.endDate).toLocaleDateString()}` : 'No expiry')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-[10px] uppercase tracking-wider font-bold rounded-full ${d.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {d.status ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button onClick={() => openForm(d)} className="text-blue-600 hover:text-blue-900 p-2">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(d._id)} className="text-red-600 hover:text-red-900 p-2 ml-1">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Live Calculator Widget */}
            <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-6 rounded-2xl text-white shadow-lg">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-stone-100">
                <Banknote size={16} className="text-green-400" />
                Live Calculator Preview
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-stone-300">
                  <span>Product Total</span>
                  <span>₹1,000.00</span>
                </div>
                <div className="flex justify-between items-center text-green-400 font-medium">
                  <span>Discount Applied</span>
                  <span>- ₹100.00</span>
                </div>
                <div className="flex justify-between items-center text-stone-300">
                  <span>Shipping (USA)</span>
                  <span>+ ₹800.00</span>
                </div>
                <div className="pt-3 border-t border-stone-700 flex justify-between items-center font-bold text-lg">
                  <span>Final Amount</span>
                  <span>₹1,700.00</span>
                </div>
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold flex items-center gap-2 mb-6 text-gray-900">
                <PieChart size={16} className="text-blue-500" />
                Rule Distribution
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      {entry.name}
                    </div>
                    <span>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
