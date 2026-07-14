/**
 * File: frontend/src/dashboards/Sidebar.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  ShoppingBag,
  Heart,
  ShoppingCart,
  MapPin,
  Settings,
  LogOut,
  FileText,
  MessageSquare,
  Bell,
  HelpCircle,
  Truck
} from 'lucide-react';

export const Sidebar = ({
  user,
  activeTab,
  cartCount,
  wishlistCount,
  onLogoutClick
}) => {
  const menuItems = [
    { name: 'Marketplace', label: 'Marketplace', icon: Store, path: '/dashboard' },
    { name: 'Orders', label: 'Orders', icon: ShoppingBag, path: '/orders' },
    { name: 'Wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, path: '/wishlist' },
    { name: 'Cart', label: 'Cart', icon: ShoppingCart, badge: cartCount, path: '/cart' },
    { name: 'Testing Reports', label: 'Quality Testing', icon: FileText, path: '/testing-reports' },
    { name: 'Addresses', label: 'Address', icon: MapPin, path: '/address' },
    { name: 'Help & Support', label: 'Help Center', icon: HelpCircle, path: '/support' },
    { name: 'Settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const displayName = user?.companyName && user.companyName !== 'N/A' 
    ? user.companyName 
    : (user?.name || 'Partner');

  const userInitials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 48, opacity: 0 });
  const itemRefs = useRef({});

  useEffect(() => {
    const updatePosition = () => {
      const activeEl = itemRefs.current[activeTab];
      if (activeEl) {
        setIndicatorStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };
    
    // Initial measurement
    updatePosition();
    
    // Catch any layout shifts
    const t = setTimeout(updatePosition, 50);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updatePosition);
    };
  }, [activeTab, cartCount, wishlistCount]);

  return (
    <aside className="w-[256px] shrink-0 bg-white border border-stone-200/70 rounded-[28px] overflow-hidden h-fit sticky top-24 shadow-[0_8px_32px_rgba(0,0,0,0.07)] hidden md:flex flex-col">
      {/* Brand strip */}
      <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] px-5 py-3 flex items-center gap-3">
        <img
          src="/logo.webp"
          alt="Cocoveera Logo"
          className="w-11 h-11 object-contain rounded-[10px] bg-white/10 p-0.5 flex-shrink-0"
        />
        <div>
          <span className="font-poppins font-black text-[14px] tracking-wide block leading-none">
            <span className="text-[#D4A843]">COCO</span><span className="text-white">VEERA</span>
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col px-3 py-2 gap-0.5 relative z-0">
        {/* Single persistent animated background */}
        <motion.div
          className="absolute left-3 right-3 bg-gradient-to-r from-[#2E7D32] to-[#43A047] rounded-[14px] shadow-md shadow-[#2E7D32]/20 pointer-events-none -z-10"
          initial={false}
          animate={{
            y: indicatorStyle.top,
            height: indicatorStyle.height,
            opacity: indicatorStyle.opacity
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          style={{ top: 0 }}
        />

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          const buttonContent = (
            <>
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15'
                    : 'bg-stone-100 group-hover:bg-[#2E7D32]/10'
                }`}>
                  <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-[#6B7280] group-hover:text-[#2E7D32]'
                  }`} />
                </div>
                <span className="relative z-10">{item.label}</span>
              </div>

              {item.badge > 0 && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full relative z-10 transition-all ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#2E7D32]/10 text-[#2E7D32]'
                }`}>
                  {item.badge}
                </span>
              )}
            </>
          );

          const className = `w-full text-left font-poppins text-[11.5px] font-bold py-2.5 px-4 rounded-[14px] transition-all duration-200 flex items-center justify-between relative group ${
            isActive
              ? 'text-white'
              : 'text-[#4B5563] hover:bg-[#F0FAF0] hover:text-[#2E7D32]'
          }`;

          if (item.path) {
            return (
              <Link
                key={item.name}
                to={item.path}
                className={className}
                ref={el => itemRefs.current[item.name] = el}
              >
                {buttonContent}
              </Link>
            );
          }

          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={className}
              ref={el => itemRefs.current[item.name] = el}
            >
              {buttonContent}
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-stone-100 mx-1 my-2" />

        {/* Logout */}
        <button
          onClick={onLogoutClick}
          className="w-full text-left font-poppins text-[11.5px] font-bold py-2.5 px-4 rounded-[14px] text-red-500 hover:bg-red-50 transition-all flex items-center gap-3 group"
        >
          <div className="w-7 h-7 rounded-[10px] bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-all">
            <LogOut className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span>Logout</span>
        </button>
      </nav>

      {/* User Profile Card at bottom */}
      <div className="mx-3 mb-3 mt-1 p-3 bg-[#F7F9F7] rounded-[18px] border border-stone-200/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-xs shadow-md shadow-[#2E7D32]/20 flex-shrink-0">
          {userInitials}
        </div>
        <div className="min-w-0">
          <p className="text-[11.5px] font-extrabold text-stone-900 truncate leading-none">
            {displayName}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
