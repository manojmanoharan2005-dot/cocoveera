import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Package, 
  Heart, 
  ShoppingCart, 
  HelpCircle,
  MapPin,
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

  // Redirect to full desktop Profile page on larger screens (>= 1024px)
  useEffect(() => {
    const checkDesktop = () => {
      if (window.innerWidth >= 1024) {
        navigate('/profile', { replace: true });
      }
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of Cocoveera?')) {
      logout();
      navigate('/');
    }
  };

  const displayName = user?.name || user?.companyName || 'MANOJ KUMAR M';

  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'MK';

  const quickActions = [
    { name: 'Orders', icon: Package, path: '/orders' },
    { name: 'Wishlist', icon: Heart, path: '/wishlist' },
    { name: 'Cart', icon: ShoppingCart, path: '/cart' },
    { name: 'Help Center', icon: HelpCircle, path: '/support' },
  ];

  const menuItems = [
    { 
      name: 'My Quotes', 
      desc: 'Custom quote requests & pricing',
      icon: MessageSquare, 
      path: '/quotes' 
    },
    { 
      name: 'My Orders', 
      desc: 'Track shipments & purchase history',
      icon: Package, 
      path: '/orders' 
    },
    { 
      name: 'Shipping Address', 
      desc: 'Manage warehouse & delivery addresses',
      icon: MapPin, 
      path: '/address' 
    },
    { 
      name: 'Notifications', 
      desc: 'Order updates, invoices & alerts',
      icon: Bell, 
      path: '/notifications' 
    },
    { 
      name: 'Settings', 
      desc: 'Security, password & preferences',
      icon: Settings, 
      path: '/settings' 
    },
    { 
      name: 'Privacy Policy', 
      desc: 'Data safety & privacy standards',
      icon: Shield, 
      path: '/privacy-policy' 
    },
    { 
      name: 'Terms & Conditions', 
      desc: 'Customer terms & conditions',
      icon: FileText, 
      path: '/terms-conditions' 
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-xl mx-auto space-y-4 xs:space-y-5 lg:hidden"
    >
      {/* 1. Page Title Header (Mobile Header with Hamburger & Logo is rendered by DashboardLayout) */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <h1 className="text-xl xs:text-2xl font-poppins font-black text-stone-900 tracking-tight leading-none">
          My Account
        </h1>
        <span className="inline-flex items-center gap-1.5 text-[9.5px] xs:text-[10px] font-bold text-[#2E7D32] bg-[#2E7D32]/10 border border-[#2E7D32]/20 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
          Verified
        </span>
      </div>

      {/* 2. Profile Card – MANOJ KUMAR M & Safe Email Rendering */}
      <section 
        aria-label="User Profile"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 relative z-10">
          {/* Centered Avatar with Initials */}
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#2E7D32] text-white flex items-center justify-center font-poppins font-black text-base sm:text-lg shadow-xs shrink-0 select-none">
            {userInitials}
          </div>

          {/* User Name & Email - Balanced Flow, Clean Single-Line Email */}
          <div className="flex-1 min-w-0 pr-1">
            <h2 className="text-base xs:text-[17px] sm:text-lg font-poppins font-black text-stone-900 tracking-tight leading-snug break-words">
              {displayName}
            </h2>
            <p className="text-[11px] xs:text-xs text-stone-500 font-medium mt-0.5 truncate leading-normal block">
              {user?.email || 'manojmanoharan2005@gmail.com'}
            </p>
            {user?.companyName && user.companyName !== 'N/A' && user.companyName !== displayName && (
              <p className="text-[10px] font-semibold text-[#2E7D32] mt-0.5 truncate">
                {user.companyName}
              </p>
            )}
          </div>

          {/* Edit Profile Button - Positioned Neatly on Right, In-flow */}
          <button 
            type="button"
            onClick={() => navigate('/profile')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-50 hover:bg-[#2E7D32] text-stone-500 hover:text-white border border-stone-200/80 hover:border-[#2E7D32] transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-2xs cursor-pointer"
            title="Edit Profile"
            aria-label="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. Quick Actions – Premium Card Design */}
      <section aria-label="Quick Actions">
        <div className="flex items-center justify-between mb-2 xs:mb-2.5">
          <h3 className="text-xs xs:text-[13px] font-poppins font-extrabold text-stone-900 tracking-tight">
            Quick Actions
          </h3>
          <span className="text-[10px] xs:text-[11px] font-semibold text-stone-400">
            4 Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 xs:gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(action.path)}
              className="bg-white border border-stone-200/80 hover:border-[#2E7D32]/40 rounded-2xl p-3 xs:p-3.5 sm:p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 group active:scale-[0.98] cursor-pointer shadow-2xs min-h-[88px] xs:min-h-[94px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/15 flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white transition-all duration-200 group-hover:scale-105 shadow-2xs">
                <action.icon className="w-4.5 h-4.5 xs:w-5 xs:h-5" strokeWidth={2} />
              </div>
              <span className="text-[11.5px] xs:text-xs font-bold text-stone-800 group-hover:text-[#2E7D32] transition-colors leading-tight text-center">
                {action.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Account Settings – Refined List Design */}
      <section aria-label="Account Settings">
        <div className="flex items-center justify-between mb-2 xs:mb-2.5">
          <h3 className="text-xs xs:text-[13px] font-poppins font-extrabold text-stone-900 tracking-tight">
            Account Settings
          </h3>
          <span className="text-[10px] xs:text-[11px] font-semibold text-stone-400">
            Preferences &amp; Info
          </span>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl sm:rounded-[22px] overflow-hidden shadow-2xs divide-y divide-stone-100">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="w-full flex items-center justify-between p-3 xs:p-3.5 sm:p-4 bg-white hover:bg-[#FAFBF9] transition-colors group cursor-pointer text-left active:bg-stone-50 min-h-[52px]"
            >
              <div className="flex items-center gap-2.5 xs:gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 xs:w-8.5 xs:h-8.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-600 group-hover:bg-[#2E7D32]/10 group-hover:text-[#2E7D32] group-hover:border-[#2E7D32]/20 transition-all shrink-0">
                  <item.icon className="w-4 h-4 xs:w-4.5 xs:h-4.5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11.5px] xs:text-xs sm:text-[13px] font-bold text-stone-800 group-hover:text-[#2E7D32] transition-colors block leading-snug truncate">
                    {item.name}
                  </span>
                  {item.desc && (
                    <p className="text-[9.5px] xs:text-[10px] text-stone-400 font-medium leading-tight truncate mt-0.5">
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#2E7D32] transition-all transform group-hover:translate-x-0.5 shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* 5. Secure Log Out Button */}
      <section aria-label="Sign Out" className="pt-1">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-white border border-red-200/90 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-2xl py-3 xs:py-3.5 flex items-center justify-center gap-2 font-bold text-xs xs:text-[13px] transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out Securely</span>
        </button>
      </section>

      {/* 6. Generous Bottom Spacer ensuring floating bottom nav never covers content */}
      <div className="h-16 md:hidden w-full shrink-0 pointer-events-none" aria-hidden="true" />
    </motion.div>
  );
};

export default MobileAccount;
