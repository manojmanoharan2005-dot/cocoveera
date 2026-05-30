import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ShoppingCart, User } from 'lucide-react';

export const ProfileHeader = ({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  cartCount, 
  setActiveTab,
  onNotificationClick 
}) => {
  const navigate = useNavigate();

  return (
    <header className="w-full h-16 bg-white border-b border-stone-100 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
      {/* Logo Section */}
      <div 
        onClick={() => navigate('/')} 
        className="flex items-center space-x-2.5 cursor-pointer select-none"
      >
        <div className="p-1.5 bg-[#2E7D32] rounded-lg">
          <img src="/logo.jpg" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
        </div>
        <div>
          <h3 className="font-poppins font-extrabold text-stone-900 text-sm tracking-wide leading-none">COCOVEERA</h3>
          <p className="text-[8px] text-[#6B7280] font-bold uppercase tracking-widest mt-0.5">Marketplace Portal</p>
        </div>
      </div>

      {/* Middle Search Bar */}
      <div className="relative w-full max-w-md mx-6 hidden md:block">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search bulk substrate products, grow bags, equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-50 border border-stone-200/80 rounded-full py-1.5 pl-10 pr-4 text-xs font-medium text-stone-850 placeholder:text-stone-400 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-all shadow-inner"
        />
      </div>

      {/* Right Actions Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button 
          onClick={onNotificationClick}
          className="p-2 text-[#6B7280] hover:text-[#2E7D32] hover:bg-stone-50 rounded-full transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full border-2 border-white"></span>
        </button>

        {/* Cart Trigger */}
        <button 
          onClick={() => setActiveTab('Cart')}
          className="p-2 text-[#6B7280] hover:text-[#2E7D32] hover:bg-stone-50 rounded-full transition-colors relative"
          title="Container Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#2E7D32] text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {cartCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar Link */}
        <div 
          onClick={() => setActiveTab('Profile')}
          className="flex items-center space-x-2.5 cursor-pointer pl-3 border-l border-stone-200"
          title="Account Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-poppins font-extrabold text-xs border border-[#2E7D32]/25 shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left leading-none">
            <h4 className="text-xs font-extrabold text-stone-900">{user?.name || 'Representative'}</h4>
            <span className="text-[8px] text-[#6B7280] font-bold uppercase tracking-wider">{user?.companyName || 'B2B Partner'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
