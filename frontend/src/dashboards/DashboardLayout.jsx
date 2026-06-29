/**
 * File: frontend/src/dashboards/DashboardLayout.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Store, 
  ShoppingBag, 
  User, 
  X, 
  LogOut,
  LayoutDashboard,
  Heart,
  MapPin,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';

// Helper component to use ShoppingBag as ShoppingCart
const ShoppingCart = ({ className }) => <ShoppingBag className={className} />;

export const DashboardLayout = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  cartCount, 
  wishlistCount, 
  searchQuery,
  setSearchQuery,
  onLogoutClick,
  sortBy,
  setSortBy,
  onFilterClick,
  children 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Mobile Bottom Nav actions
  const handleMobileNav = (tabName) => {
    if (tabName === 'Home') {
      navigate('/');
    } else {
      setActiveTab(tabName);
    }
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
    <div 
      className="min-h-screen text-[#1A1A1A] flex flex-col font-sans relative bg-stone-50"
    >
      {/* Removed the white overlay to show the background image clearly as requested */}
      <div className="relative z-10 flex flex-col flex-grow w-full">
        {/* 1. TOP HEADER */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartCount}
          setActiveTab={setActiveTab}
          onNotificationClick={() => alert('All shipments export cleared. Cargo vessels on schedule.')}
          showSearchAndFilters={activeTab === 'Marketplace'}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onFilterClick={onFilterClick}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* 2. DYNAMIC MAIN BODY */}
        <div className="flex-grow w-full px-6 lg:px-8 py-7 flex gap-7 items-start relative">
          {/* Desktop Sidebar */}
          <Sidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onLogoutClick={onLogoutClick}
          />

          {/* Main Content Area */}
          <main className="flex-grow w-full overflow-hidden min-h-[70vh]">
            {children}
          </main>
        </div>
      </div>

      {/* 3. MOBILE SIDEBAR DRAWER REMOVED */}


    </div>
  );
};

export default DashboardLayout;
