/**
 * File: frontend/src/dashboards/ProfileCard.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React from 'react';

export const ProfileCard = ({ user, setActiveTab }) => {
  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="flex flex-col items-center text-center p-5 bg-[#F7F9F7] rounded-[24px] border border-stone-100 relative group overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Premium Circular Avatar */}
      <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center border border-[#2E7D32]/20 text-2xl font-poppins font-extrabold shadow-sm transition-transform duration-500 group-hover:scale-105">
        {userInitials.slice(0, 2)}
      </div>

      {/* Name & Role Details */}
      <h4 className="font-poppins font-extrabold text-stone-900 text-sm mt-3 tracking-wide truncate max-w-full">
        {user?.name || 'Partner Account'}
      </h4>

      {/* Company Name Badge */}
      <span className="text-[9px] text-[#2E7D32] font-bold uppercase tracking-wider bg-[#2E7D32]/10 py-1 px-3.5 rounded-full mt-2 border border-[#2E7D32]/15 shadow-sm">
        {user?.companyName || 'Global Importer'}
      </span>

      {/* Role Tag */}
      <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-widest mt-1">
        {user?.role === 'admin' ? 'Administrator' : 'B2B Client Representative'}
      </span>

      {/* Action Button */}
      <button 
        onClick={() => setActiveTab('Profile')}
        className="text-[10px] text-[#6B7280] font-bold hover:text-[#2E7D32] transition-colors mt-4 py-1 px-3 border border-stone-200 bg-white rounded-full shadow-sm hover:shadow transition-all duration-300"
      >
        View Profile
      </button>
    </div>
  );
};

export default ProfileCard;
