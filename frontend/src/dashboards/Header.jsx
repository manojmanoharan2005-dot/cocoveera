/**
 * File: frontend/src/dashboards/Header.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ShoppingCart, ChevronDown, LogOut, Settings, SlidersHorizontal, User, Check, Menu, Heart, Package, ArrowLeft, MoreVertical, Share2, HelpCircle, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = ({
  searchQuery,
  setSearchQuery,
  cartCount,
  activeTab,
  onNotificationClick,
  showSearchAndFilters,
  sortBy,
  setSortBy,
  onFilterClick,
  onMenuClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const wishlistCount = user?.wishlist?.length || 0;
  const isProductPage = location.pathname.includes('/product/') || location.pathname.includes('/productview/');

  React.useEffect(() => {
    setDropdownOpen(false);
    setSortDropdownOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

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

  return (
    <header className="w-full h-16 bg-white/90 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-4 shadow-sm shadow-stone-100/80">
      
      {/* Left: Brand Logo & Mobile Menu Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-1.5 -ml-1 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5.5 h-5.5 text-stone-700" />
          </button>
        )}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 select-none shrink-0 group cursor-pointer"
          title="Cocoveera Home"
        >
          <img
            src="/logo.webp"
            alt="Cocoveera Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-[10px] transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <span className="font-poppins font-black text-[15px] tracking-wide block leading-none">
              <span className="text-[#7B4F1E]">COCO</span><span className="text-[#2E7D32]">VEERA</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center: Marketplace Search + Filter Controls OR Internal Page Title */}
      <AnimatePresence mode="wait">
        {showSearchAndFilters ? (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 flex-grow max-w-full md:max-w-[580px] mx-auto"
          >
            {/* Search Input */}
            <div className={`relative flex-grow transition-all duration-300 ${searchFocused ? 'flex-grow' : ''}`}>
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search coir products, grow bags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-[#F7F9F7] border border-stone-200 rounded-[12px] py-2.5 pl-9 pr-4 text-[11.5px] font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2E7D32] focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,125,50,0.08)] transition-all duration-200 h-10"
              />
            </div>

            {/* Filter button */}
            <button
              type="button"
              onClick={onFilterClick}
              className="flex items-center gap-1.5 text-stone-700 bg-white border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] py-2 px-2.5 sm:px-3 rounded-[12px] text-[11.5px] font-bold transition-all duration-200 h-10 shrink-0 shadow-sm hover:shadow-md"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {/* Sort dropdown */}
            <div className="relative flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center justify-between bg-white border border-stone-200 hover:border-[#2E7D32] hover:shadow-sm rounded-[12px] px-2.5 sm:px-3.5 h-10 min-w-[40px] sm:min-w-[140px] transition-all group"
              >
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-400 font-bold">Sort:</span>
                  <span className="text-[11.5px] text-stone-900 font-extrabold">{sortBy}</span>
                </div>
                <div className="sm:hidden flex items-center">
                  <span className="text-[11px] font-bold">{sortBy.split(' ')[0]}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-[#2E7D32] transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {sortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/5 sm:bg-transparent cursor-pointer" onClick={() => setSortDropdownOpen(false)} onTouchStart={() => setSortDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+8px)] right-0 w-[160px] bg-white border border-stone-200/80 rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.12)] py-1.5 z-50 overflow-hidden"
                    >
                      {['Featured', 'Rating'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[11.5px] font-bold transition-colors flex items-center justify-between ${
                            sortBy === option 
                              ? 'bg-[#F0FAF0] text-[#2E7D32]' 
                              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          }`}
                        >
                          {option}
                          {sortBy === option && <Check className="w-3.5 h-3.5 text-[#2E7D32]" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="internal-header"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="flex items-center flex-grow max-w-full px-2 sm:px-4"
          >
            <h1 className="font-poppins font-extrabold text-sm sm:text-base text-stone-900 tracking-tight truncate">
              {activeTab}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Wishlist */}
        <button
          onClick={() => navigate('/wishlist')}
          className="relative w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#2E7D32] hover:bg-[#F0FAF0] rounded-[10px] transition-all active:scale-95"
          title="Wishlist"
        >
          <Heart className="w-4.5 h-4.5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#2E7D32] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Orders */}
        <button
          onClick={() => navigate('/orders')}
          className="relative w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#2E7D32] hover:bg-[#F0FAF0] rounded-[10px] transition-all active:scale-95"
          title="My Orders"
        >
          <Package className="w-4.5 h-4.5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-stone-200 mx-0.5 sm:mx-1" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                navigate('/mobile');
              } else {
                setDropdownOpen(!dropdownOpen);
              }
            }}
            className="flex items-center gap-2 pl-1 focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-xs shadow-md shadow-[#2E7D32]/20 transition-transform duration-300 group-hover:scale-105">
              {userInitials}
            </div>
            <div className="hidden sm:block leading-none text-left">
              <h4 className="text-[11.5px] font-extrabold text-stone-900 truncate max-w-[100px]">
                {displayName}
              </h4>
            </div>
            <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Premium Dropdown (Desktop Only) */}
          <AnimatePresence>
            {dropdownOpen && window.innerWidth >= 1024 && (
              <>
                <div className="fixed inset-0 z-40 bg-black/5 sm:bg-transparent cursor-pointer" onClick={() => setDropdownOpen(false)} onTouchStart={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-56 bg-white border border-stone-200/80 rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.12)] py-2 z-50"
                >
                  {/* Profile summary */}
                  <div className="px-4 py-3.5 border-b border-stone-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-xs shadow-sm flex-shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-stone-900 truncate">{displayName}</p>
                      <p className="text-[9px] text-[#6B7280] font-bold mt-0.5 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="py-1 px-2">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                      className="w-full text-left px-3 py-2.5 text-[11.5px] text-stone-700 hover:bg-[#F0FAF0] hover:text-[#2E7D32] rounded-[12px] transition-colors flex items-center gap-2.5 font-bold"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                      className="w-full text-left px-3 py-2.5 text-[11.5px] text-stone-700 hover:bg-[#F0FAF0] hover:text-[#2E7D32] rounded-[12px] transition-colors flex items-center gap-2.5 font-bold"
                    >
                      <Settings className="w-3.5 h-3.5 text-stone-400" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="px-2 pt-1 border-t border-stone-100">
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2.5 text-[11.5px] text-red-500 hover:bg-red-50 rounded-[12px] transition-colors flex items-center gap-2.5 font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
