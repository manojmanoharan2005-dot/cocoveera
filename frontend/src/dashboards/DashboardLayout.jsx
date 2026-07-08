/**
 * File: frontend/src/dashboards/DashboardLayout.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const cartCount = user?.cart?.length || 0;
  const wishlistCount = user?.wishlist?.length || 0;

  // Determine active tab purely from pathname
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/orders')) return 'Orders';
    if (path.includes('/cart')) return 'Cart';
    if (path.includes('/saved') || path.includes('/wishlist')) return 'Wishlist';
    if (path.includes('/address')) return 'Addresses';
    if (path.includes('/support')) return 'Help & Support';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/profile')) return 'Profile';
    return 'Marketplace';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen text-[#1A1A1A] flex flex-col font-sans relative bg-stone-50">
      <div className="relative z-10 flex flex-col flex-grow w-full">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartCount}
          activeTab={activeTab}
          onNotificationClick={() => {}}
          showSearchAndFilters={activeTab === 'Marketplace'}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onFilterClick={() => setFilterDrawerOpen(true)}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <div className="flex-grow w-full px-6 lg:px-8 py-7 flex gap-7 items-start relative">
          <Sidebar
            user={user}
            activeTab={activeTab}
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onLogoutClick={logout}
          />

          <main className="flex-grow w-full min-w-0 min-h-[70vh]">
            <Outlet context={{
              searchQuery,
              setSearchQuery,
              sortBy,
              setSortBy,
              filterDrawerOpen,
              setFilterDrawerOpen,
              user,
              cartCount,
              wishlistCount
            }} />
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
