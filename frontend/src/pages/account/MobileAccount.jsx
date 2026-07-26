import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Package, 
  Heart, 
  ShoppingCart, 
  HelpCircle,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Edit2,
  MessageSquare
} from 'lucide-react';

const MobileAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of Cocoveera?')) {
      logout();
      navigate('/');
    }
  };

  const displayName = user?.companyName && user.companyName !== 'N/A' 
    ? user.companyName 
    : (user?.name || 'Partner');

  const userInitials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const quickActions = [
    { name: 'Orders', icon: Package, path: '/orders' },
    { name: 'Wishlist', icon: Heart, path: '/saved' },
    { name: 'Cart', icon: ShoppingCart, path: '/cart' },
    { name: 'Help Center', icon: HelpCircle, path: '/support' },
  ];

  const menuItems = [
    { name: 'My Quotes', icon: MessageSquare, path: '/quotes' },
    { name: 'My Orders', icon: Package, path: '/orders' },
    { name: 'Shipping Address', icon: MapPin, path: '/address' },

    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Privacy Policy', icon: Shield, path: '/privacy-policy' },
    { name: 'Terms & Conditions', icon: FileText, path: '/terms-conditions' },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col font-sans lg:hidden"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-4 flex items-center border-b border-stone-100">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-extrabold text-stone-900 ml-2 font-poppins">My Account</h1>
      </div>

      <div className="px-4 py-6 space-y-8 flex-grow pb-24">
        {/* Profile Card */}
        <div className="bg-[#2E7D32]/5 rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden border border-[#2E7D32]/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-xl shadow-lg shadow-[#2E7D32]/30 flex-shrink-0 z-10">
            {userInitials}
          </div>
          <div className="z-10 flex-grow">
            <h2 className="text-[17px] font-extrabold text-stone-900">{displayName}</h2>
            <p className="text-[12px] font-semibold text-[#6B7280] mt-0.5">{user?.email}</p>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="absolute top-4 right-4 p-2 bg-white rounded-full text-[#2E7D32] shadow-sm hover:shadow-md transition-all z-10"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          {/* Decorative background circle */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#2E7D32]/10 rounded-full blur-3xl" />
        </div>

        {/* Quick Actions (2-column grid) */}
        <div>
          <h3 className="text-[14px] font-extrabold text-stone-900 mb-4 font-poppins">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="bg-white border border-stone-200 rounded-[16px] p-4 flex flex-col items-center justify-center gap-2 hover:border-[#2E7D32] hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] group-hover:scale-110 transition-transform">
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[12px] font-bold text-stone-800">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account Menu */}
        <div>
          <h3 className="text-[14px] font-extrabold text-stone-900 mb-4 font-poppins">Account Settings</h3>
          <div className="bg-white border border-stone-200 rounded-[24px] overflow-hidden shadow-sm">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.path !== '#' && navigate(item.path)}
                className={`w-full flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors ${
                  idx !== menuItems.length - 1 ? 'border-b border-stone-100' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-bold text-stone-800">{item.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-600 rounded-[20px] py-4 flex items-center justify-center gap-2 font-bold text-[14px] hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out Securely</span>
        </button>
      </div>
    </motion.div>
  );
};

export default MobileAccount;
