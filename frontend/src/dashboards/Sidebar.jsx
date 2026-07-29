/**
 * File: frontend/src/dashboards/Sidebar.jsx
 * Purpose: Premium, responsive left navigation sidebar for user/admin dashboards.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  FileText,
  HelpCircle,
  ShieldCheck,
  X,
  BookOpen,
  MessageSquare
} from 'lucide-react';

import { useWishlist } from '../context/WishlistContext';

export const Sidebar = ({
  user,
  activeTab,
  cartCount,
  wishlistCount: propWishlistCount,
  onLogoutClick,
  isMobileDrawer = false,
  onClose
}) => {
  const { wishlistCount } = useWishlist();
  const effectiveWishlistCount = wishlistCount !== undefined ? wishlistCount : propWishlistCount;

  const menuItems = [
    { name: 'Marketplace', label: 'Marketplace', icon: Store, path: '/dashboard' },
    { name: 'Quotes', label: 'My Quotes', icon: MessageSquare, path: '/quotes' },
    { name: 'Orders', label: 'My Orders', icon: Package, path: '/orders' },
    { name: 'Wishlist', label: 'Wishlist', icon: Heart, badge: effectiveWishlistCount, path: '/wishlist' },
    { name: 'Testing Reports', label: 'Quality Testing', icon: FileText, path: '/testing-reports', isSoon: true },
    { name: 'How to Use', label: 'How to Use', icon: BookOpen, path: '/dashboard/how-to-use' },
    { name: 'Address Management', label: 'Address', icon: MapPin, path: '/address' },
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

  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 50, opacity: 0 });
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
    
    updatePosition();
    const t = setTimeout(updatePosition, 50);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updatePosition);
    };
  }, [activeTab, cartCount, wishlistCount]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onClose) onClose();
    onLogoutClick();
  };

  return (
    <>
      <aside className={isMobileDrawer ? "w-full h-full bg-white flex flex-col select-none overflow-hidden" : "hidden lg:flex w-[272px] shrink-0 bg-gradient-to-b from-white via-[#F7FAF7] to-[#EEF5EE] border border-stone-200/80 rounded-[28px] overflow-hidden h-full shadow-[0_10px_35px_rgba(46,125,50,0.08)] flex-col justify-between select-none"}>
        {/* 1. Header */}
        <div className={isMobileDrawer 
          ? "bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] px-5 h-[85px] flex items-center justify-between shrink-0 shadow-sm pt-[env(safe-area-inset-top,0px)]" 
          : "bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shrink-0 shadow-sm"
        }>
          <div className="flex items-center gap-3">
            <img
              src="/logo.webp"
              alt="Cocoveera Logo"
              className={isMobileDrawer 
                ? "w-10 h-10 object-contain rounded-xl bg-white/10 p-1 flex-shrink-0 shadow-inner" 
                : "w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl bg-white/10 p-1 flex-shrink-0 shadow-inner"
              }
            />
            <div className="flex flex-col justify-center">
              <span className={isMobileDrawer 
                ? "font-poppins font-black text-base tracking-wide leading-tight text-white" 
                : "font-poppins font-black text-sm sm:text-[15px] tracking-wide leading-none text-white"
              }>
                <span className="text-[#D4A843]">COCO</span>VEERA
              </span>
              <span className={isMobileDrawer
                ? "text-[9.5px] font-bold text-emerald-100 uppercase tracking-widest block mt-0.5"
                : "text-[9.5px] sm:text-[10px] font-bold text-emerald-100 uppercase tracking-widest block mt-1"
              }>
                Export Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isMobileDrawer && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />}
            {isMobileDrawer && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-w-[40px] min-h-[40px] cursor-pointer"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Navigation (flex-grow: 1, scrollable) */}
        <div className={isMobileDrawer 
          ? "flex-grow flex flex-col justify-start py-3 px-4 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          : "flex-grow flex flex-col justify-start py-2.5 px-3 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        }>
          <nav className={`flex flex-col relative z-0 ${isMobileDrawer ? 'gap-2' : 'gap-1'}`}>
            {/* Active Background Pill (only used for desktop smooth animated tab indicator) */}
            {!isMobileDrawer && (
              <motion.div
                className="absolute left-0 right-0 bg-gradient-to-r from-[#2E7D32] to-[#43A047] rounded-[14px] shadow-md shadow-[#2E7D32]/20 pointer-events-none -z-10"
                initial={false}
                animate={{
                  y: indicatorStyle.top,
                  height: indicatorStyle.height,
                  opacity: indicatorStyle.opacity
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                style={{ top: 0 }}
              />
            )}

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              const buttonContent = (
                <>
                  {/* Desktop Left Indicator */}
                  {!isMobileDrawer && isActive && (
                    <motion.div
                      layoutId="activeLeftIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-amber-400 rounded-r-full shadow-sm z-20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center gap-3.5 relative z-10">
                    {/* Soft Circular Icon Container */}
                    <div className={isMobileDrawer
                      ? `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                          isActive
                            ? 'bg-white/20 shadow-inner'
                            : 'bg-stone-100 text-stone-500 group-hover:bg-[#2E7D32]/10 group-hover:text-[#2E7D32]'
                        }`
                      : `w-7.5 h-7.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isActive
                            ? 'bg-white/20 shadow-inner'
                            : 'bg-stone-100/80 group-hover:bg-[#2E7D32]/10 group-hover:scale-105'
                        }`
                    }>
                      <Icon className={isMobileDrawer 
                        ? `w-[22px] h-[22px] transition-colors duration-200 ${isActive ? 'text-white' : 'text-stone-500 group-hover:text-[#2E7D32]'}` 
                        : `w-3.5 h-3.5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-stone-500 group-hover:text-[#2E7D32]'}`
                      } />
                    </div>
                    
                    <span className={isMobileDrawer
                      ? "relative z-10 font-poppins text-base font-medium tracking-normal"
                      : "relative z-10 font-poppins text-[12px] sm:text-[12.5px] font-bold tracking-tight"
                    }>
                      {item.label}
                    </span>
                  </div>

                  {/* Right Badges */}
                  <div className="relative z-10 flex items-center gap-1.5">
                    {item.badge > 0 && (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-all ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[#2E7D32]/10 text-[#2E7D32]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.isSoon && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-amber-400/30 text-amber-100 border border-amber-300/40'
                          : 'bg-amber-50 text-orange-600 border border-orange-300/70'
                      }`}>
                        SOON
                      </span>
                    )}
                  </div>
                </>
              );

              const className = isMobileDrawer
                ? `w-full text-left h-[56px] px-4 rounded-[16px] transition-all duration-200 flex items-center justify-between relative group min-h-[48px] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white shadow-md shadow-[#2E7D32]/20'
                      : 'bg-white text-stone-800 hover:bg-stone-50'
                  }`
                : `w-full text-left py-2 px-3 min-h-[44px] rounded-[14px] transition-all duration-200 flex items-center justify-between relative group ${
                    isActive
                      ? 'text-white'
                      : 'text-stone-700 hover:bg-[#EAF4EA]/70 hover:text-[#2E7D32]'
                  }`;

              if (item.path) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={className}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    ref={el => itemRefs.current[item.name] = el}
                  >
                    {buttonContent}
                  </Link>
                );
              }

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    if (onClose) onClose();
                  }}
                  className={className}
                  ref={el => itemRefs.current[item.name] = el}
                >
                  {buttonContent}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3. Bottom Section */}
        <div 
          className={isMobileDrawer
            ? "shrink-0 p-4 bg-white border-t border-stone-100 flex flex-col gap-3"
            : "shrink-0 mt-auto p-3 border-t border-stone-200/60 bg-white/50 backdrop-blur-sm flex flex-col gap-2.5"
          }
          style={{ paddingBottom: isMobileDrawer ? 'calc(1rem + env(safe-area-inset-bottom, 0px))' : 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Logout Button in its own rounded card */}
          <button
            onClick={handleLogoutClick}
            className={isMobileDrawer
              ? "w-full text-left font-poppins text-base font-medium h-[56px] px-4 rounded-[16px] bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-between group border border-red-100/60 shadow-xs min-h-[48px] cursor-pointer"
              : "w-full text-left font-poppins text-[11.5px] font-bold py-2 px-3 rounded-[12px] text-red-500 hover:bg-red-50 transition-all flex items-center justify-between group border border-transparent hover:border-red-100 min-h-[44px] cursor-pointer"
            }
          >
            <div className="flex items-center gap-3.5">
              <div className={isMobileDrawer 
                ? "w-10 h-10 rounded-full bg-red-100/80 flex items-center justify-center transition-all shrink-0" 
                : "w-6.5 h-6.5 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-all"
              }>
                <LogOut className={isMobileDrawer ? "w-[22px] h-[22px] text-red-600" : "w-3.5 h-3.5 text-red-500"} />
              </div>
              <span>Logout</span>
            </div>
          </button>

        {/* Premium Profile Card */}
        <div 
          onClick={() => {
            if (onClose) onClose();
            window.location.href = '/profile';
          }}
          className={isMobileDrawer
            ? "p-4 bg-white rounded-[16px] border border-[#E8E8E8] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200 flex items-center justify-between cursor-pointer select-none mb-1 group min-h-[72px]"
            : "p-3 bg-white rounded-[16px] border border-[#E8E8E8] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200 flex items-center gap-3 cursor-pointer select-none group min-h-[72px]"
          }
        >
          <div className="flex items-center gap-3 min-w-0 w-full">
            {/* Rounded Square Avatar with Light Green Background (#EAF7EE) & Verified Badge */}
            <div className="relative shrink-0">
              <div className={isMobileDrawer
                ? "w-11 h-11 rounded-[14px] bg-[#EAF7EE] flex items-center justify-center border border-[#2E7D32]/20 text-[#2E7D32] shadow-xs group-hover:bg-[#DDF2E3] transition-colors"
                : "w-10 h-10 rounded-[12px] bg-[#EAF7EE] flex items-center justify-center border border-[#2E7D32]/20 text-[#2E7D32] shadow-xs group-hover:bg-[#DDF2E3] transition-colors"
              }>
                {/* Silhouette Profile Icon */}
                <svg className="w-5 h-5 text-[#2E7D32]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Small Green Verified Badge on Bottom-Right */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2E7D32] rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* User Information */}
            <div className="min-w-0 flex-grow">
              <p className={isMobileDrawer 
                ? "text-sm font-poppins font-black text-stone-900 truncate leading-tight group-hover:text-[#2E7D32] transition-colors" 
                : "text-[12px] font-poppins font-black text-stone-900 truncate leading-tight mb-1 group-hover:text-[#2E7D32] transition-colors"
              }>
                {user?.name && user.name !== 'N/A' ? user.name.toUpperCase() : 'MANOJ KUMAR M'}
              </p>
              
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#2E7D32]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                <span className="truncate tracking-tight">Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center pt-0.5">
          <p className="text-[10px] font-bold text-stone-400 leading-tight uppercase tracking-wider">
            Proudly Made in India
          </p>
        </div>
      </div>
    </aside>

    {/* Logout Permission Modal */}
    {showLogoutModal && (
      <div className="fixed inset-0 z-[999999] bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-stone-150 text-center space-y-4 relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-xs">
            <LogOut className="w-7 h-7 text-red-600" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-poppins font-black text-stone-900 text-lg">
              Confirm Logout
            </h3>
            <p className="text-stone-500 font-medium text-xs max-w-xs mx-auto leading-relaxed">
              Are you sure you want to log out of your Cocoveera account?
            </p>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-poppins font-bold text-xs rounded-[14px] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-poppins font-black text-xs rounded-[14px] transition-all shadow-md shadow-red-600/20 cursor-pointer active:scale-95"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </>
);
};

export default React.memo(Sidebar);
