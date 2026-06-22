import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Package,
  Upload,
  Download
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminTesting() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'packages'
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [packages, setPackages] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Package Form State
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    price: '',
    description: '',
    deliveryDays: 3,
    active: true
  });

  // Report Upload State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'orders') {
        const res = await apiClient.get('/testing/admin/orders');
        if (res.data.success) setOrders(res.data.data);
      } else {
        const res = await apiClient.get('/testing/admin/packages');
        if (res.data.success) setPackages(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // --- Package Logic ---
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPackage) {
        await apiClient.put(`/testing/admin/packages/${selectedPackage._id}`, packageFormData);
      } else {
        await apiClient.post('/testing/admin/packages', packageFormData);
      }
      setShowPackageForm(false);
      setSelectedPackage(null);
      fetchData();
    } catch (err) {
      alert('Failed to save package');
    }
  };

  const openPackageForm = (pkg = null) => {
    if (pkg) {
      setSelectedPackage(pkg);
      setPackageFormData({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        deliveryDays: pkg.deliveryDays,
        active: pkg.active
      });
    } else {
      setSelectedPackage(null);
      setPackageFormData({ name: '', price: '', description: '', deliveryDays: 3, active: true });
    }
    setShowPackageForm(true);
  };

  // --- Order Logic ---
  const updateOrderStatus = async (id, status) => {
    try {
      await apiClient.put(`/testing/admin/orders/${id}/status`, { testingStatus: status });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/testing/admin/orders/${selectedOrder._id}/report`, { reportUrl });
      setShowUploadForm(false);
      setSelectedOrder(null);
      setReportUrl('');
      fetchData();
    } catch (err) {
      alert('Failed to upload report');
    }
  };

  return (
    <AdminLayout activeTab="Testing">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-poppins font-black text-stone-900">Testing Management</h1>
            <p className="text-sm text-stone-500 font-semibold mt-1">Manage testing packages and customer orders</p>
          </div>
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-lg font-poppins text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-white shadow-sm text-[#2E7D32]' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Testing Orders
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-6 py-2 rounded-lg font-poppins text-xs font-bold transition-all ${
                activeTab === 'packages' ? 'bg-white shadow-sm text-[#2E7D32]' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Packages
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-8 h-8 text-[#2E7D32] animate-spin mb-4" />
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Loading...</p>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="bg-white rounded-[24px] border border-stone-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-poppins font-bold text-stone-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-stone-500 text-sm font-semibold">
                        No testing orders found.
                      </td>
                    </tr>
                  ) : orders.map(order => (
                    <tr key={order._id} className="hover:bg-stone-50/50">
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold font-mono text-stone-600 mb-1">{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm font-bold text-stone-900">{order.productId?.name || 'N/A'}</p>
                        <p className="text-[10px] text-stone-500 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-stone-900">{order.userId?.name}</p>
                        <p className="text-[10px] text-stone-500">{order.userId?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-stone-700">
                        {order.packageId?.name || 'N/A'} (₹{order.amountPaid})
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          order.testingStatus === 'Report Available' ? 'bg-green-100 text-green-700' :
                          order.testingStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.testingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {order.testingStatus === 'Testing Requested' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'In Progress')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {(order.testingStatus === 'In Progress' || order.testingStatus === 'Testing Requested') && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowUploadForm(true);
                            }}
                            className="bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 text-[#2E7D32] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Upload Report
                          </button>
                        )}
                        {order.reportUrl && (
                          <a
                            href={order.reportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-stone-200/60 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-poppins font-bold text-stone-900">Testing Packages</h2>
              <button
                onClick={() => openPackageForm()}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2 rounded-xl text-xs font-bold font-poppins transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Package
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <div key={pkg._id} className="border border-stone-200 rounded-2xl p-5 hover:border-[#2E7D32] transition-colors relative">
                  {!pkg.active && (
                    <span className="absolute top-4 right-4 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      Inactive
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-4">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-poppins font-bold text-stone-900 text-lg">{pkg.name}</h3>
                  <p className="text-2xl font-black text-[#2E7D32] my-2">₹{pkg.price}</p>
                  <p className="text-xs text-stone-500 font-semibold mb-4 line-clamp-3">{pkg.description}</p>
                  <p className="text-xs text-stone-400 font-bold mb-4">Delivery: {pkg.deliveryDays} Days</p>
                  
                  <button
                    onClick={() => openPackageForm(pkg)}
                    className="w-full border border-stone-200 hover:bg-stone-50 text-stone-600 font-poppins text-xs font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Report Modal */}
        {showUploadForm && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
              <h3 className="font-poppins font-black text-lg text-stone-900 mb-2">Upload Testing Report</h3>
              <p className="text-xs font-semibold text-stone-500 mb-6">Order ID: {selectedOrder._id.slice(-8).toUpperCase()}</p>
              
              <form onSubmit={handleReportUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Report URL (PDF link)</label>
                  <input
                    type="url"
                    required
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] outline-none transition-all bg-stone-50 focus:bg-white"
                    placeholder="https://example.com/report.pdf"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 border-2 border-stone-200 text-stone-600 hover:bg-stone-50 font-poppins text-xs font-bold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-bold py-3 rounded-xl transition-all"
                  >
                    Save Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Package Form Modal */}
        {showPackageForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="font-poppins font-black text-lg text-stone-900 mb-6">
                {selectedPackage ? 'Edit Package' : 'Create Package'}
              </h3>
              
              <form onSubmit={handlePackageSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Package Name</label>
                  <input
                    type="text"
                    required
                    value={packageFormData.name}
                    onChange={(e) => setPackageFormData({...packageFormData, name: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-[#2E7D32] outline-none bg-stone-50 focus:bg-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={packageFormData.price}
                      onChange={(e) => setPackageFormData({...packageFormData, price: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-[#2E7D32] outline-none bg-stone-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Delivery Days</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={packageFormData.deliveryDays}
                      onChange={(e) => setPackageFormData({...packageFormData, deliveryDays: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-[#2E7D32] outline-none bg-stone-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea
                    rows="4"
                    value={packageFormData.description}
                    onChange={(e) => setPackageFormData({...packageFormData, description: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-[#2E7D32] outline-none bg-stone-50 focus:bg-white resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={packageFormData.active}
                    onChange={(e) => setPackageFormData({...packageFormData, active: e.target.checked})}
                    className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                  />
                  <label htmlFor="active" className="text-sm font-bold text-stone-700">Active (Visible to customers)</label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPackageForm(false)}
                    className="flex-1 border-2 border-stone-200 text-stone-600 hover:bg-stone-50 font-poppins text-xs font-bold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-bold py-3 rounded-xl transition-all"
                  >
                    Save Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
