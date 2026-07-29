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

  return (
    <aside className={isMobileDrawer ? "w-full h-full bg-white flex flex-col justify-between select-none overflow-hidden" : "hidden lg:flex w-[272px] shrink-0 bg-gradient-to-b from-white via-[#F7FAF7] to-[#EEF5EE] border border-stone-200/80 rounded-[28px] overflow-hidden h-full shadow-[0_10px_35px_rgba(46,125,50,0.08)] flex-col justify-between select-none"}>
      {/* 1. Header */}
      <div className={isMobileDrawer 
        ? "bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] px-5 h-[95px] flex items-center justify-between shrink-0 shadow-sm" 
        : "bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shrink-0 shadow-sm"
      }>
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.webp"
            alt="Cocoveera Logo"
            className={isMobileDrawer 
              ? "w-[52px] h-[52px] object-contain rounded-xl bg-white/10 p-1 flex-shrink-0 shadow-inner" 
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
              ? "text-[10px] font-bold text-emerald-100 uppercase tracking-widest block mt-0.5"
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
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-w-[48px] min-h-[48px]"
              aria-label="Close Drawer"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation (flex-grow: 1, scrollable) */}
      <div className={isMobileDrawer 
        ? "flex-grow flex flex-col justify-start py-4 px-4 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
          onClick={() => {
            if (onClose) onClose();
            onLogoutClick();
          }}
          className={isMobileDrawer
            ? "w-full text-left font-poppins text-base font-medium h-[56px] px-4 rounded-[16px] bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-between group border border-red-100/60 shadow-xs min-h-[48px]"
            : "w-full text-left font-poppins text-[11.5px] font-bold py-2 px-3 rounded-[12px] text-red-500 hover:bg-red-50 transition-all flex items-center justify-between group border border-transparent hover:border-red-100 min-h-[44px]"
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
        <div className={isMobileDrawer
          ? "p-4 bg-white rounded-[18px] border border-stone-200/70 shadow-sm flex items-center justify-between cursor-default select-none mb-1"
          : "p-2.5 bg-white rounded-[16px] border border-stone-200/70 shadow-sm flex items-center gap-2.5 cursor-default select-none"
        }>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className={isMobileDrawer
                ? "w-11 h-11 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white flex items-center justify-center font-poppins font-bold text-sm shadow-md shadow-[#2E7D32]/20"
                : "w-8.5 h-8.5 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white flex items-center justify-center font-poppins font-black text-xs shadow-md shadow-[#2E7D32]/20"
              }>
                {userInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0 flex-grow">
              <p className={isMobileDrawer ? "text-sm font-bold text-stone-900 truncate leading-tight" : "text-[11.5px] font-extrabold text-stone-900 truncate leading-none mb-1"}>
                {displayName}
              </p>
              <p className={isMobileDrawer ? "text-xs font-medium text-stone-500 truncate mt-0.5" : "hidden"}>
                {user?.email || 'verified@cocoveera.com'}
              </p>
              {!isMobileDrawer && (
                <div className="flex items-center gap-1 text-[9.5px] font-bold text-stone-400 uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3 text-[#2E7D32] shrink-0" />
                  <span className="truncate">Verified Buyer</span>
                </div>
              )}
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
  );
};

export default React.memo(Sidebar);
