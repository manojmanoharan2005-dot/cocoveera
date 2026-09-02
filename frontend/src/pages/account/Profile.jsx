/**
 * File: frontend/src/pages/account/Profile.jsx
 * Purpose: Authenticated User Profile Page showing complete customer information collected during registration.
 */
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Building2, MapPin, ShieldCheck, 
  Edit3, Globe, CreditCard, Calendar, Clock, CheckCircle2, 
  Award, Shield, FileText, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetchProfile) {
      fetchProfile().catch(() => {});
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
          Loading profile...
        </p>
      </div>
    );
  }

  const userInitials = user?.name 
    ? String(user.name).split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'U';

  const formatPhone = (phone) => {
    if (!phone) return null;
    const p = phone.replace(/\D/g, '');
    if (!p) return phone;
    if (p.length === 12 && p.startsWith('91')) return `+91 ${p.slice(2, 7)} ${p.slice(7)}`;
    if (p.length === 11 && p.startsWith('1')) return `+1 (${p.slice(1, 4)}) ${p.slice(4, 7)}-${p.slice(7)}`;
    if (p.length >= 10) return phone.startsWith('+') ? phone : `+${p}`;
    return phone;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Extract address info safely
  const defaultAddr = user.defaultShippingAddress || {};
  const primaryAddress = user.addresses?.[0] || {};
  const streetAddr = defaultAddr.addressLine1 || primaryAddress.street || '';
  const streetAddr2 = defaultAddr.addressLine2 || '';
  const city = defaultAddr.city || primaryAddress.city || '';
  const state = defaultAddr.state || primaryAddress.state || '';
  const zip = defaultAddr.postalCode || primaryAddress.zip || '';
  const country = defaultAddr.country || primaryAddress.country || user.country || '';

  const hasFullAddress = streetAddr || city || state || zip || country;

  // Format Customer ID
  const customerId = user._id ? `CUST-${String(user._id).slice(-8).toUpperCase()}` : 'CUST-MEMBER';

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-poppins">
            My Profile
          </h1>
          <p className="text-stone-500 font-bold text-xs mt-1">
            View your personal profile details and export trading identity.
          </p>
        </div>
        <button 
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 bg-white border border-stone-200 text-stone-700 hover:text-[#2E7D32] hover:border-[#2E7D32] hover:bg-[#F0FAF0] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-[#2E7D32]" />
          <span>Edit Settings</span>
        </button>
      </div>

      {/* SECTION 1: PROFILE OVERVIEW CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative overflow-hidden"
      >
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-3xl sm:text-4xl shadow-md shrink-0 border-4 border-[#F0FAF0]">
          {userInitials}
        </div>
        
        <div className="flex-grow space-y-4 text-center md:text-left w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-poppins">
              {user.name}
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#E8F5E9] text-[#2E7D32] border border-[#86efac]/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              {user.role === 'admin' ? 'Administrator' : 'Verified Buyer'}
            </span>
          </div>

          <p className="text-xs font-extrabold text-stone-500 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span>{user.email}</span>
            {user.country && (
              <>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1 text-stone-700 font-black">
                  <Globe className="w-3.5 h-3.5 text-[#2E7D32]" />
                  {user.country}
                </span>
              </>
            )}
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5 text-left">
              <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block">Customer ID</span>
              <span className="text-xs font-black text-stone-900 font-mono">{customerId}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5 text-left">
              <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block">Account Status</span>
              <span className="text-xs font-black text-[#2E7D32] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            {user.currency && (
              <div className="bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5 text-left">
                <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block">Currency</span>
                <span className="text-xs font-black text-stone-900 uppercase">{user.currency}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* GRID SECTIONS FOR DETAILED INFORMATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SECTION 2: PERSONAL INFORMATION */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-poppins font-black text-stone-900 text-base">
              Personal Information
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Full Name</span>
              <p className="font-extrabold text-stone-900 mt-0.5">{user.name}</p>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Email Address</span>
              <p className="font-extrabold text-stone-900 mt-0.5 break-all">{user.email}</p>
            </div>

            {user.phone && (
              <div>
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Contact Phone Number</span>
                <p className="font-extrabold text-stone-900 mt-0.5">{formatPhone(user.phone)}</p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Country / Region</span>
              <p className="font-extrabold text-stone-900 mt-0.5">{user.country || 'Not specified'}</p>
            </div>
          </div>
        </motion.div>

        {/* SECTION 3: BUSINESS & COMPANY INFORMATION */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-poppins font-black text-stone-900 text-base">
              Company & Business Details
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Company / Organization</span>
              <p className="font-extrabold text-stone-900 mt-0.5">
                {user.companyName && user.companyName !== 'N/A' ? user.companyName : 'Commercial Grower / Importer'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Buyer Classification</span>
              <p className="font-extrabold text-stone-900 mt-0.5">
                {user.role === 'admin' ? 'Administrator' : 'B2B Substrate Export Buyer'}
              </p>
            </div>

            {user.currency && (
              <div>
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Trading Currency</span>
                <p className="font-extrabold text-stone-900 mt-0.5 uppercase">{user.currency}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* SECTION 4: TRADE PREFERENCES */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-poppins font-black text-stone-900 text-base">
              Trade & Export Preferences
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Preferred Currency</span>
              <p className="font-extrabold text-stone-900 mt-0.5 uppercase">{user.currency || 'USD'}</p>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Primary Export Destination</span>
              <p className="font-extrabold text-stone-900 mt-0.5">{user.country || 'Global Export'}</p>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">Default Logistics Mode</span>
              <p className="font-extrabold text-stone-900 mt-0.5">FCL (Full Container Load) • 20FT / 40FT</p>
            </div>
          </div>
        </motion.div>

        {/* SECTION 5: REGISTERED ADDRESS INFORMATION */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-poppins font-black text-stone-900 text-base">
              Registered Address
            </h3>
          </div>

          {hasFullAddress ? (
            <div className="space-y-2 text-xs">
              {streetAddr && <p className="font-extrabold text-stone-900">{streetAddr}</p>}
              {streetAddr2 && <p className="font-semibold text-stone-600">{streetAddr2}</p>}
              {(city || state || zip) && (
                <p className="font-semibold text-stone-700">
                  {[city, state, zip].filter(Boolean).join(', ')}
                </p>
              )}
              {country && <p className="font-black text-[#2E7D32] uppercase">{country}</p>}
            </div>
          ) : (
            <div className="py-2 text-xs space-y-2">
              <p className="font-semibold text-stone-500">
                Primary country: <span className="font-bold text-stone-900">{user.country || 'Not specified'}</span>
              </p>
              <button 
                type="button"
                onClick={() => navigate('/address')}
                className="text-[11px] font-extrabold text-[#2E7D32] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Add delivery address details →</span>
              </button>
            </div>
          )}
        </motion.div>

      </div>

      {/* SECTION 6: ACCOUNT & SECURITY INFORMATION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-poppins font-black text-stone-900 text-base">
            Account & Security Status
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">
              Customer ID
            </span>
            <span className="font-mono font-black text-stone-900">{customerId}</span>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">
              Email Verification
            </span>
            <span className="font-extrabold text-[#2E7D32] flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Verified Email
            </span>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">
              Registration Date
            </span>
            <span className="font-extrabold text-stone-900">{formatDate(user.createdAt)}</span>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">
              Last Profile Sync
            </span>
            <span className="font-extrabold text-stone-900">{formatDate(user.updatedAt || new Date())}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
