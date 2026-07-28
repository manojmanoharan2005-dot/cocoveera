/**
 * File: frontend/src/dashboards/DashboardLayout.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, apiClient } from '../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Prefetch dashboard data as soon as the user logs in / hits layout
  useEffect(() => {
    if (user) {
      // 1. Prefetch profile (Addresses and wishlist)
      queryClient.prefetchQuery(['profile'], async () => {
        const res = await apiClient.get('/users/profile');
        return res.data.data;
      }, {
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000
      });

      // 2. Prefetch orders (Initial page)
      queryClient.prefetchQuery(['orders', 1, 'all', ''], async () => {
        const res = await apiClient.get('/orders/myorders', {
          params: { page: 1, limit: 5, search: '', dateFilter: 'all' }
        });
        return res.data;
      }, {
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000
      });

      // 3. Prefetch quotes (Initial page)
      queryClient.prefetchQuery(['quotes', 1, '', 'all', ''], async () => {
        const res = await apiClient.get('/quotes/myquotes', {
          params: { page: 1, limit: 5, search: '', status: '', dateFilter: 'all' }
        });
        return res.data;
      }, {
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000
      });
    }
  }, [user, queryClient]);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const drawerRef = useRef(null);
  const lastActiveElement = useRef(null);

  // Resize listener to close drawer and reset state
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close drawer on route change & browser back/forward
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePopState = () => {
      setSidebarOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Accessibility focus restore & focus trap
  useEffect(() => {
    if (sidebarOpen) {
      lastActiveElement.current = document.activeElement;
      if (drawerRef.current) {
        drawerRef.current.focus();
      }
    } else {
      if (lastActiveElement.current) {
        lastActiveElement.current.focus();
      }
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleFocusTrap = (e) => {
      if (!drawerRef.current) return;
      const focusableElements = drawerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleFocusTrap);
    return () => window.removeEventListener('keydown', handleFocusTrap);
  }, [sidebarOpen]);

  // Touch gesture support: Swipe left to close drawer
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchMove = (e) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = () => {
    const diffX = touchStart.current.x - touchEnd.current.x;
    const diffY = touchStart.current.y - touchEnd.current.y;
    // Swipe left (swipe from right to left to close the drawer)
    if (diffX > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      setSidebarOpen(false);
    }
  };

  // Edge swipe to open drawer from the left
  useEffect(() => {
    let edgeTouchStart = { x: 0, y: 0 };
    let edgeTouchEnd = { x: 0, y: 0 };

    const handleWindowTouchStart = (e) => {
      if (sidebarOpen) return;
      const touch = e.touches[0];
      edgeTouchStart = { x: touch.clientX, y: touch.clientY };
      edgeTouchEnd = { x: touch.clientX, y: touch.clientY };
    };

    const handleWindowTouchMove = (e) => {
      if (sidebarOpen) return;
      const touch = e.touches[0];
      edgeTouchEnd = { x: touch.clientX, y: touch.clientY };
    };

    const handleWindowTouchEnd = () => {
      if (sidebarOpen) return;
      const diffX = edgeTouchEnd.x - edgeTouchStart.x;
      const diffY = edgeTouchEnd.y - edgeTouchStart.y;
      // Swipe right from screen edge (< 30px from left edge)
      if (edgeTouchStart.x < 30 && diffX > 60 && Math.abs(diffX) > Math.abs(diffY)) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('touchstart', handleWindowTouchStart, { passive: true });
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleWindowTouchStart);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [sidebarOpen]);

  const cartCount = user?.cart?.length || 0;
  const wishlistCount = user?.wishlist?.length || 0;

  // Determine active tab purely from pathname
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/orders')) return 'Orders';
    if (path.includes('/cart')) return 'Cart';
    if (path.includes('/checkout')) return 'Checkout';
    if (path.includes('/saved') || path.includes('/wishlist')) return 'Wishlist';
    if (path.includes('/testing-reports')) return 'Testing Reports';
    if (path.includes('/how-to-use')) return 'How to Use';
    if (path.includes('/address')) return 'Address Management';
    if (path.includes('/support')) return 'Help & Support';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/mobile')) return 'Account';
    if (path.includes('/quotes')) return 'Quotes';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/product/') || path.includes('/productview/')) return 'Product Details';
    return 'Marketplace';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row text-[#1A1A1A] font-sans overflow-x-hidden lg:overflow-hidden bg-stone-50">
      {/* Desktop Sidebar (Only rendered if on desktop breakpoint >= 1024px) */}
      {isDesktop && (
        <div className="p-4 sm:p-5 md:p-6 pr-0 shrink-0 h-screen flex flex-col justify-center">
          <Sidebar
            user={user}
            activeTab={activeTab}
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onLogoutClick={logout}
          />
        </div>
      )}

      {/* Main Right Side Area */}
      <div className="flex-grow flex flex-col min-h-0 lg:h-screen lg:overflow-hidden min-w-0">
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
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="w-full h-full flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-stone-200 border-t-[#2E7D32] rounded-full animate-spin" />
                <p className="text-stone-400 text-xs font-bold mt-4 animate-pulse">Loading content...</p>
              </div>
            }>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={() => {
                    const path = location.pathname;
                    if (path.includes('/quotes')) return { x: 30, opacity: 0 };
                    if (path.includes('/orders') && location.state?.fromPayment) return { opacity: 0 };
                    if (path.includes('/orders')) return { scale: 0.97, opacity: 0 };
                    if (path.includes('/payment')) return { y: 30, opacity: 0 };
                    return { opacity: 0 };
                  }}
                  animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full h-full"
                >
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
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Drawer (Only rendered if on mobile < 1024px) */}
      {!isDesktop && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${
              sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer Container */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            tabIndex="-1"
            className={`fixed top-0 left-0 h-screen w-80 max-w-[85vw] z-50 bg-[#F7FAF7] shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out will-change-transform outline-none ${
              sidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Sidebar
              user={user}
              activeTab={activeTab}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              onLogoutClick={logout}
              isMobileDrawer={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
