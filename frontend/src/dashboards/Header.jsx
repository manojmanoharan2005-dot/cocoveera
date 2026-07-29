/**
 * File: frontend/src/dashboards/Header.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ShoppingCart, ChevronDown, LogOut, Settings, SlidersHorizontal, User, Check, Menu, Heart, Package, ArrowLeft, MoreVertical, Share2, HelpCircle, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import { useWishlist } from '../context/WishlistContext';

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
  const { wishlistCount } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
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
    <>
      {/* ========================================================================= */}
      {/* MOBILE TOP NAVIGATION (< 1024px) - Clean 3-Row Professional Ecommerce Header */}
      {/* ========================================================================= */}
      <header className="lg:hidden w-full bg-white border-b border-stone-200 sticky top-0 z-[100] px-4 pt-4 pb-3 shadow-xs select-none pt-[env(safe-area-inset-top,0px)]">
        {/* ROW 1: Hamburger Menu | Centered Logo | Wishlist Icon */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left: Hamburger Menu */}
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6 text-stone-800" />
            </button>
          ) : (
            <div className="w-10 h-10 shrink-0" />
          )}

          {/* Center: Cocoveera Logo (slightly larger) */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
            title="Cocoveera Home"
          >
            <img
              src="/logo.webp"
              alt="Cocoveera Logo"
              className="w-10 h-10 object-contain rounded-xl"
            />
            <span className="font-poppins font-black text-lg tracking-wide leading-none">
              <span className="text-[#7B4F1E]">COCO</span><span className="text-[#2E7D32]">VEERA</span>
            </span>
          </div>

          {/* Right: Wishlist Icon */}
          <button
            onClick={() => navigate('/wishlist')}
            className="relative w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-xl transition-all shrink-0"
            title="Wishlist"
          >
            <Heart className="w-6 h-6 text-stone-800" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#2E7D32] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>
        </div>

        {/* ROW 2: Full Width Search Bar (48px height, 14px rounded, mt-3) */}
        {showSearchAndFilters && (
          <div className="relative w-full mt-3">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search coir products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] bg-[#F7F9F7] border border-stone-200 rounded-[14px] pl-11 pr-4 text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2E7D32] focus:bg-white focus:shadow-[0_0_0_3px_rgba(46,125,50,0.08)] transition-all"
            />
          </div>
        )}

        {/* ROW 3: Two Equal Buttons [ Filter ] [ Sort ] (Width: 50%, Height: 44px, Gap: 12px, Rounded: 12px) */}
        {showSearchAndFilters && (
          <div className="flex items-center gap-3 w-full mt-3">
            {/* Filter Button (50% Width, 44px Height) */}
            <button
              type="button"
              onClick={onFilterClick}
              className="flex-1 h-[44px] bg-white border border-stone-200 hover:border-[#2E7D32] text-stone-800 font-poppins font-black text-xs rounded-[12px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#2E7D32]" />
              <span>Filter</span>
            </button>

            {/* Sort Button & Dropdown (50% Width, 44px Height) */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full h-[44px] bg-white border border-stone-200 hover:border-[#2E7D32] text-stone-800 font-poppins font-black text-xs rounded-[12px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <span>Sort: {sortBy}</span>
                <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/10" onClick={() => setSortDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+6px)] right-0 w-full bg-white border border-stone-200 rounded-[14px] shadow-xl py-1 z-50 overflow-hidden"
                    >
                      {['Featured', 'Rating'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center justify-between ${
                            sortBy === option 
                              ? 'bg-[#F0FAF0] text-[#2E7D32]' 
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {option}
                          {sortBy === option && <Check className="w-4 h-4 text-[#2E7D32]" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* DESKTOP TOP NAVIGATION (>= 1024px) - Unchanged Exact Branding & Layout    */}
      {/* ========================================================================= */}
      <header className="hidden lg:flex w-full h-16 bg-white/95 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-[100] px-4 md:px-6 items-center justify-between gap-4 shadow-sm shadow-stone-100/80 select-none">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 select-none shrink-0 group cursor-pointer"
            title="Cocoveera Home"
          >
            <img
              src="/logo.webp"
              alt="Cocoveera Logo"
              className="w-10 h-10 object-contain rounded-[10px] transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <span className="font-poppins font-black text-[15px] tracking-wide block leading-none">
                <span className="text-[#7B4F1E]">COCO</span><span className="text-[#2E7D32]">VEERA</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search & Filters */}
        <AnimatePresence mode="wait">
          {showSearchAndFilters ? (
            <motion.div
              key="search-bar-desktop"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 flex-grow max-w-[580px] mx-auto"
            >
              {/* Search Input */}
              <div className="relative flex-grow">
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
                className="flex items-center gap-1.5 text-stone-700 bg-white border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] py-2 px-3 rounded-[12px] text-[11.5px] font-bold transition-all duration-200 h-10 shrink-0 shadow-sm hover:shadow-md cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              {/* Sort dropdown */}
              <div className="relative flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center justify-between bg-white border border-stone-200 hover:border-[#2E7D32] hover:shadow-sm rounded-[12px] px-3.5 h-10 min-w-[140px] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-bold">Sort:</span>
                    <span className="text-[11.5px] text-stone-900 font-extrabold">{sortBy}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-[#2E7D32] transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {sortDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40 cursor-pointer" onClick={() => setSortDropdownOpen(false)} />
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
              key="internal-header-desktop"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center flex-grow max-w-full px-4"
            >
              <h1 className="font-poppins font-extrabold text-base text-stone-900 tracking-tight truncate">
                {activeTab}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className="relative w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#2E7D32] hover:bg-[#F0FAF0] rounded-[10px] transition-all active:scale-95 cursor-pointer"
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
            className="relative w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#2E7D32] hover:bg-[#F0FAF0] rounded-[10px] transition-all active:scale-95 cursor-pointer"
            title="My Orders"
          >
            <Package className="w-4.5 h-4.5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-stone-200 mx-1" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1 focus:outline-none group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-xs shadow-md shadow-[#2E7D32]/20 transition-transform duration-300 group-hover:scale-105">
                {userInitials}
              </div>
              <div className="leading-none text-left">
                <h4 className="text-[11.5px] font-extrabold text-stone-900 truncate max-w-[100px]">
                  {displayName}
                </h4>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Premium Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[90] cursor-pointer" onClick={() => setDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-stone-200/80 rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.18)] py-2 z-[100]"
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
                        className="w-full text-left px-3 py-2.5 text-[11.5px] text-stone-700 hover:bg-[#F0FAF0] hover:text-[#2E7D32] rounded-[12px] transition-colors flex items-center gap-2.5 font-bold cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                        className="w-full text-left px-3 py-2.5 text-[11.5px] text-stone-700 hover:bg-[#F0FAF0] hover:text-[#2E7D32] rounded-[12px] transition-colors flex items-center gap-2.5 font-bold cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-stone-400" />
                        <span>Settings</span>
                      </button>
                    </div>
                    <div className="px-2 pt-1 border-t border-stone-100">
                      <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full text-left px-3 py-2.5 text-[11.5px] text-red-500 hover:bg-red-50 rounded-[12px] transition-colors flex items-center gap-2.5 font-bold cursor-pointer"
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
    </>
  );
};

export default React.memo(Header);
