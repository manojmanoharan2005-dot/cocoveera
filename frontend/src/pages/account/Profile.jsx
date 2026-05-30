import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, MapPin, Shield, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div className="p-8 text-center text-stone-500 font-bold">Loading Profile...</div>;
  }

  const userInitials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">My Profile</h1>
          <p className="text-stone-500 font-semibold text-sm">View your personal and corporate details.</p>
        </div>
        <button 
          onClick={() => navigate('/account/settings')}
          className="flex items-center gap-2 bg-white border border-stone-200 text-stone-700 hover:text-[#2E7D32] hover:border-[#2E7D32] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          Edit Settings
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-4xl shadow-md flex-shrink-0 border-4 border-[#F0FAF0]">
          {userInitials}
        </div>
        
        <div className="flex-grow space-y-5 text-center md:text-left w-full">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900">{user.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="text-[10px] text-[#2E7D32] font-bold uppercase tracking-wider bg-[#2E7D32]/10 py-1 px-3 rounded-full border border-[#2E7D32]/15 shadow-sm">
                {user.companyName || 'Global Importer'}
              </span>
              <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest bg-stone-100 py-1 px-3 rounded-full">
                {user.role === 'admin' ? 'Administrator' : 'B2B Client'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0FAF0] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5 break-all">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0FAF0] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5">{user.phone || 'Not Provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0FAF0] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Company Name</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5">{user.companyName || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0FAF0] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Country</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5">{user.country || 'N/A'}</p>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
