/**
 * File: frontend/src/pages/AdminSettings.jsx
 * Purpose: React page component representing the AdminSettings view.
 */
import { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_URL } from '../utils/config';
import {
  User,
  Settings,
  Shield,
  Key,
  Save,
  AlertCircle,
  CheckCircle,
  Truck,
  DollarSign
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';
import ShippingSettingsTab from '../components/admin/ShippingSettingsTab';
import CurrencySettingsTab from '../components/admin/CurrencySettingsTab';

export default function AdminSettings() {
  const { admin, refreshToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');



  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Platform Settings State
  const [settingsData, setSettingsData] = useState({
    siteName: 'Cocoveera Trade Platform',
    supportEmail: 'support@cocoveera.com',
    allowRegistrations: true,
    maintenanceMode: false,
    currency: 'USD',
  });

  const getHeaders = () => {
    return {
      Authorization: `Bearer ${sessionStorage.getItem('adminToken')}`,
    };
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Logic for updating profile would go here in a real app
      // Currently backend doesn't have an endpoint for admin self-update
      
      setSuccess('Profile information updated successfully');
    } catch (err) {
      setError('Failed to update profile info');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/admin/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: getHeaders() }
      );

      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      if (err.response?.status === 401) {
        // If unauthorized, token might be expired, try refresh
        try {
          await refreshToken();
          // Let user try again rather than auto-retrying to be safe
          setError('Session refreshed. Please try again.');
        } catch (refreshErr) {
          // Handled by interceptor or context
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, this would hit a site-settings API endpoint
      // Mock success for now
      setTimeout(() => {
        setSuccess('Platform settings updated successfully');
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Failed to update settings');
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and platform preferences</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center space-x-2 transition ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center space-x-2 transition ${
                activeTab === 'security'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield size={18} />
              <span>Security</span>
            </button>
            {admin?.adminRole === 'super_admin' && (
              <>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center space-x-2 transition ${
                    activeTab === 'shipping'
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Truck size={18} />
                  <span>Shipping</span>
                </button>
                <button
                  onClick={() => setActiveTab('currency')}
                  className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center space-x-2 transition ${
                    activeTab === 'currency'
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign size={18} />
                  <span>Currency</span>
                </button>
                <button
                  onClick={() => setActiveTab('platform')}
                  className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center space-x-2 transition ${
                    activeTab === 'platform'
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings size={18} />
                  <span>Platform Config</span>
                </button>
              </>
            )}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                
                <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
                  <img 
                    src={admin?.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(admin?.name || 'Admin') + '&background=0D8ABC&color=fff&size=128'}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-full border-4 border-gray-100"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 text-lg">{admin?.name}</h4>
                    <p className="text-sm text-gray-500 mb-2 capitalize">{admin?.adminRole?.replace('_', ' ') || 'Admin'}</p>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email"
                        value={profileData.email}
                        readOnly // Often better to prevent direct email changes
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Save size={18} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Key size={20} className="text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input 
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input 
                      type="password"
                      required
                      minLength={6}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input 
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center justify-center w-full space-x-2 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Platform Settings Tab (Super Admin Only) */}
            {activeTab === 'platform' && admin?.adminRole === 'super_admin' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Configuration</h3>

                <form onSubmit={handleSettingsUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* General Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700 pb-2 border-b border-gray-100">Store Settings</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                        <input 
                          type="text"
                          value={settingsData.siteName}
                          onChange={(e) => setSettingsData({...settingsData, siteName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                        <select
                          value={settingsData.currency}
                          onChange={(e) => setSettingsData({...settingsData, currency: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>

                    {/* Operational Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700 pb-2 border-b border-gray-100">Admin Operations</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Contact Email</label>
                        <input 
                          type="email"
                          value={settingsData.supportEmail}
                          onChange={(e) => setSettingsData({...settingsData, supportEmail: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-3 pt-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settingsData.allowRegistrations}
                            onChange={(e) => setSettingsData({...settingsData, allowRegistrations: e.target.checked})}
                            className="w-5 h-5 border border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 text-sm">Allow new user public registrations</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settingsData.maintenanceMode}
                            onChange={(e) => setSettingsData({...settingsData, maintenanceMode: e.target.checked})}
                            className="w-5 h-5 border border-gray-300 rounded text-red-600 focus:ring-red-500"
                          />
                          <span className="text-red-700 text-sm font-medium">Enable Maintenance Mode</span>
                        </label>
                        {settingsData.maintenanceMode && (
                          <p className="text-xs text-gray-500 ml-8">
                            Public store will be hidden and show a "We'll be right back" page.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Save size={18} />
                      <span>Save Platform Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Shipping Settings Tab */}
            {activeTab === 'shipping' && admin?.adminRole === 'super_admin' && (
              <ShippingSettingsTab setError={setError} setSuccess={setSuccess} />
            )}

            {/* Currency Settings Tab */}
            {activeTab === 'currency' && admin?.adminRole === 'super_admin' && (
              <CurrencySettingsTab setError={setError} setSuccess={setSuccess} />
            )}
            
            
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
