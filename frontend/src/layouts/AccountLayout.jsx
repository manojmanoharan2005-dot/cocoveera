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
    if (path.includes('/account/orders')) return 'Orders';
    if (path.includes('/account/cart')) return 'Cart';
    if (path.includes('/account/saved')) return 'Wishlist';
    if (path.includes('/account/address')) return 'Addresses';
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
      case 'Orders': navigate('/account/orders'); break;
      case 'Cart': navigate('/account/cart'); break;
      case 'Wishlist': navigate('/account/saved'); break;
      case 'Addresses': navigate('/account/address'); break;
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
    { name: 'Orders', label: 'Orders', icon: ShoppingBag, path: '/account/orders' },
    { name: 'Wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount, path: '/account/saved' },
    { name: 'Cart', label: 'Your Cart', icon: ShoppingCart, badge: cartCount, path: '/account/cart' },
    { name: 'Addresses', label: 'Address', icon: MapPin, path: '/account/address' },
    { name: 'Help & Support', label: 'Help Center', icon: HelpCircle, path: '/account/support' },
    { name: 'Settings', label: 'Settings', icon: Settings, path: '/account/settings' },
  ];

  const displayName = user?.companyName && user.companyName !== 'N/A' ? user.companyName : (user?.name || 'Partner');
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div 
      className="min-h-screen text-[#1A1A1A] flex flex-col font-sans relative bg-stone-50"
    >
      <div className="relative z-10 flex flex-col flex-grow w-full">
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
      </div>

      {/* Mobile Sidebar Drawer Removed */}


    </div>
  );
};

export default AccountLayout;
