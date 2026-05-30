import React, { useState, useEffect } from 'react';
import { useAuth, apiClient } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Building2, Lock, Save, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth(); // login function updates the auth state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    country: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/users/profile');
        if (res.data.success) {
          const profile = res.data.data;
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            companyName: profile.companyName || '',
            country: profile.country || '',
            password: '',
            confirmPassword: ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        companyName: formData.companyName,
        country: formData.country,
      };

      if (formData.password) {
        payload.password = formData.password;
        // Request OTP
        const resOtp = await apiClient.post('/users/profile/request-password-otp');
        if (resOtp.data.success) {
          setPendingPayload(payload);
          setShowOtpModal(true);
          setMessage({ text: 'OTP sent to your email. Please verify to change password.', type: 'success' });
          setSaving(false);
          return;
        }
      }

      await saveProfile(payload);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
      setSaving(false);
    }
  };

  const saveProfile = async (payload, otpCode = null) => {
    try {
      if (otpCode) {
        payload.otp = otpCode;
      }
      const res = await apiClient.put('/users/profile', payload);
      if (res.data.success) {
        setMessage({ text: 'Profile updated successfully', type: 'success' });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setShowOtpModal(false);
        setOtp('');
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
      setOtpLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
       setMessage({ text: 'Please enter a valid 6-digit OTP', type: 'error' });
       return;
    }
    setOtpLoading(true);
    saveProfile(pendingPayload, otp);
  };

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-bold">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Account Settings</h1>
        <p className="text-stone-500 font-semibold text-sm">Manage your profile details and security preferences.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#F0FAF0] text-[#2E7D32]'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input 
                type="email" name="email" value={formData.email} disabled
                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-500 cursor-not-allowed" 
                title="Email cannot be changed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">Business Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" /> Company Name
              </label>
              <input 
                type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Country
              </label>
              <input 
                type="text" name="country" value={formData.country} onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">Security & Password</h2>
          <p className="text-xs text-stone-500 font-semibold mb-4">Leave blank if you do not wish to change your password.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> New Password
              </label>
              <input 
                type="password" name="password" value={formData.password} onChange={handleChange} minLength={6}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Confirm New Password
              </label>
              <input 
                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} minLength={6}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-[#2E7D32] text-white font-bold rounded-xl hover:bg-[#1B5E20] transition-colors flex items-center gap-2 shadow-lg shadow-[#2E7D32]/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl mx-4">
            <h3 className="text-xl font-black text-stone-900 mb-2">Verify Password Change</h3>
            <p className="text-sm text-stone-500 font-semibold mb-6">We've sent a 6-digit verification code to your email. Please enter it below to confirm your password change.</p>
            
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
                  OTP Code
                </label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-bold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowOtpModal(false)}
                  disabled={otpLoading}
                  className="flex-1 px-4 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-colors disabled:opacity-70"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="flex-1 px-4 py-3 bg-[#2E7D32] text-white font-bold rounded-xl hover:bg-[#1B5E20] transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
