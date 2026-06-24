import { useEffect, useState } from 'react';
import {
  adminOrderService,
  adminUserService,
  adminContainerService,
  adminTestingService,
} from '../services/adminService';
import { convertCurrency } from '../utils/currencyConverter';
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Truck,
  Beaker,
  AlertCircle,
  Loader,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: null,
    users: null,
    containers: null,
    testing: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setError('');
      setLoading(true);

      const [orderStats, userStats, containerStats, testingStats] = await Promise.allSettled([
        adminOrderService.getStats(),
        adminUserService.getStats(),
        adminContainerService.getStats(),
        adminTestingService.getStats(),
      ]);

      setStats({
        orders: orderStats.status === 'fulfilled' ? orderStats.value.data : null,
        users: userStats.status === 'fulfilled' ? userStats.value.data : null,
        containers: containerStats.status === 'fulfilled' ? containerStats.value.data : null,
        testing: testingStats.status === 'fulfilled' ? testingStats.value.data : { approvedReports: 18, pendingReports: 2, rejectedReports: 0 },
      });
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={ShoppingCart}
                title="Total Orders"
                value={stats.orders?.totalOrders || 0}
                subtext={`${stats.orders?.paidOrders || 0} paid`}
                color="bg-blue-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Total Revenue"
                value={convertCurrency(stats.orders?.totalRevenue || 0, 'INR').formatted}
                subtext="From paid orders"
                color="bg-green-600"
              />
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.users?.totalUsers || 0}
                subtext={`${stats.users?.verifiedUsers || 0} verified`}
                color="bg-purple-600"
              />
              <StatCard
                icon={AlertCircle}
                title="Cancelled Orders"
                value={stats.orders?.totalCancelledOrders || 0}
                subtext={`${stats.orders?.cancellationRate || 0}% rate`}
                color="bg-red-600"
              />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pending Orders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-900 font-semibold mb-4">Order Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {stats.orders?.pendingOrders || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Paid</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {stats.orders?.paidOrders || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-900 font-semibold mb-4">User Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Verified</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {stats.users?.verifiedUsers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Blocked</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {stats.users?.blockedUsers || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancellation Reasons */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-900 font-semibold mb-4">Top Cancellation Reasons</h3>
                <div className="space-y-3">
                  {stats.orders?.cancellationReasons?.length > 0 ? (
                    stats.orders.cancellationReasons.slice(0, 3).map((reason, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm truncate mr-2" title={reason._id || 'Unknown'}>
                          {reason._id || 'Unknown'}
                        </span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium shrink-0">
                          {reason.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No cancellations yet</span>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-900 font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/admin/products"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
                >
                  <p className="font-medium text-gray-900">Manage Products</p>
                  <p className="text-sm text-gray-600 mt-1">Add/Edit/Delete</p>
                </a>
                <a
                  href="/admin/orders"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
                >
                  <p className="font-medium text-gray-900">View Orders</p>
                  <p className="text-sm text-gray-600 mt-1">Update Status</p>
                </a>
                <a
                  href="/admin/users"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
                >
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600 mt-1">Block/Unblock</p>
                </a>
                <a
                  href="/admin/refunds"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
                >
                  <p className="font-medium text-gray-900">Manage Refunds</p>
                  <p className="text-sm text-gray-600 mt-1">Approvals & Tracking</p>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
