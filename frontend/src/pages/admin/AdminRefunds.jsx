import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Search, DollarSign, Clock, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRefunds, resAnalytics] = await Promise.all([
        apiClient.get('/refunds'),
        apiClient.get('/refunds/analytics')
      ]);
      setRefunds(resRefunds.data.data);
      setAnalytics(resAnalytics.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this refund? This will trigger the payment gateway.')) return;
    try {
      await apiClient.patch(`/refunds/${id}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving refund');
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  const filteredRefunds = refunds.filter(r => 
    r._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Refund Management</h1>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-500 text-sm">Total Refunds</p>
            <h3 className="text-2xl font-bold">{analytics.total}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-500 text-sm">Completed</p>
            <h3 className="text-2xl font-bold text-green-600">{analytics.completed}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200">
            <p className="text-stone-500 text-sm">Success Rate</p>
            <h3 className="text-2xl font-bold text-blue-600">{analytics.successRate}%</h3>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold">Refund Requests</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search refunds..." 
              className="pl-9 pr-4 py-2 border rounded-lg text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="p-4">Refund ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map(refund => (
                <tr key={refund._id} className="border-t">
                  <td className="p-4 font-mono text-xs">{refund._id}</td>
                  <td className="p-4">{refund.user?.name}</td>
                  <td className="p-4 uppercase text-xs font-bold">{refund.gatewayName}</td>
                  <td className="p-4 font-bold text-green-700">Rs. {refund.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      refund.status === 'completed' ? 'bg-green-100 text-green-700' :
                      refund.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {refund.status === 'requested' || refund.status === 'pending_validation' ? (
                      <button 
                        onClick={() => handleApprove(refund._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs font-bold transition"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-stone-400 text-xs">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRefunds.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-500">No refunds found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRefunds;
