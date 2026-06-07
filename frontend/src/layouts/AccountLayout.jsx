/**
 * File: frontend/src/layouts/AccountLayout.jsx
 * Purpose: Source code file for the Cocoveera project.
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../dashboards/Header';
import Sidebar from '../dashboards/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Store, ShoppingBag, User, X, LogOut, Heart, MapPin, Settings, Truck, FileText, MessageSquare, Bell, HelpCircle } from 'lucide-react';

const ShoppingCart = ({ className }) => <ShoppingBag className={className} />;

const AccountLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  
  // Get global state for cart/wishlist counts from AuthContext user object
  const cartCount = user?.cart?.length || 0; 
  const wishlistCount = user?.wishlist?.length || 0;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/account/orders')) return 'My Orders';
    if (path.includes('/account/cart')) return 'Cart';
    if (path.includes('/account/saved')) return 'Wishlist';
    if (path.includes('/account/address')) return 'Saved Addresses';
    if (path.includes('/account/support')) return 'Help & Support';
    if (path.includes('/account/settings')) return 'Settings';
    if (path.includes('/account/profile')) return 'Profile';
    if (path.includes('/account/checkout') || path.includes('/account/payment')) return '';
    return 'Marketplace'; // Default
  };

  const activeTab = getActiveTab();

  const handleSetActiveTab = (tabName) => {
    switch (tabName) {
      case 'Marketplace': navigate('/dashboard'); break;
      case 'My Orders': navigate('/account/orders'); break;
      case 'Cart': navigate('/account/cart'); break;
      case 'Wishlist': navigate('/account/saved'); break;
      case 'Saved Addresses': navigate('/account/address'); break;
      case 'Help & Support': navigate('/account/support'); break;
      case 'Settings': navigate('/account/settings'); break;
      case 'Profile': navigate('/account/profile'); break;
      default: navigate('/dashboard');
    }
  };

  const handleMobileNav = (tabName) => {
    if (tabName === 'Home') navigate('/');
    else handleSetActiveTab(tabName);
  };

  const mobileDrawerItems = [
    { name: 'Marketplace', label: 'Marketplace', icon: Store, path: '/dashboard' },
    { name: 'My Orders', label: 'My Orders', icon: ShoppingBag, path: '/account/orders' },
    { name: 'Wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, path: '/account/saved' },
    { name: 'Cart', label: 'Your Cart', icon: ShoppingCart, badge: cartCount, path: '/account/cart' },
    { name: 'Saved Addresses', label: 'Saved Addresses', icon: MapPin, path: '/account/address' },
    { name: 'Help & Support', label: 'Help Center', icon: HelpCircle, path: '/account/support' },
    { name: 'Settings', label: 'Settings', icon: Settings, path: '/account/settings' },
  ];

  const displayName = user?.companyName && user.companyName !== 'N/A' ? user.companyName : (user?.name || 'Partner');
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#1A1A1A] flex flex-col font-sans">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        setActiveTab={handleSetActiveTab}
        onNotificationClick={() => {}}
        showSearchAndFilters={false}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onFilterClick={() => {}}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      <div className="flex-grow w-full px-6 lg:px-8 py-7 flex gap-7 items-start relative">
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          onLogoutClick={logout}
        />

        <main className="flex-grow w-full overflow-hidden min-h-[70vh]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 bg-white h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <span className="text-[10px] font-bold text-[#2E7D32] tracking-wider uppercase">B2B Trade Portal</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-stone-400 hover:text-[#1A1A1A]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div 
                  className="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-200 transition-colors"
                  onClick={() => {
                    handleSetActiveTab('Profile');
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold border border-[#2E7D32]/25">
                    {userInitials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{displayName}</h4>
                  </div>
                </div>

                <nav className="flex flex-col space-y-1">
                  {mobileDrawerItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;
                    const buttonContent = (
                      <>
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4.5 h-4.5" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#2E7D32]/10 text-[#2E7D32]'}`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    );

                    const className = `w-full text-left font-poppins text-xs font-bold py-3 px-4 rounded-[16px] transition-all duration-200 active:scale-[0.98] flex items-center justify-between ${
                      isActive ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50 active:bg-stone-100'
                    }`;

                    if (item.path) {
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={className}
                        >
                          {buttonContent}
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          handleSetActiveTab(item.name);
                          setMobileMenuOpen(false);
                        }}
                        className={className}
                      >
                        {buttonContent}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left font-poppins text-xs font-bold py-3 px-4 rounded-[16px] text-red-650 hover:bg-red-50 transition-colors flex items-center space-x-3 border-t border-stone-100 mt-6"
              >
                <LogOut className="w-4.5 h-4.5 text-red-500" />
                <span>Logout</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default AccountLayout;
