import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Heart,
  ShoppingCart,
  Package,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// Base routes belonging strictly to the authenticated customer dashboard layout
const DASHBOARD_ROUTES = [
  '/dashboard',
  '/orders',
  '/cart',
  '/checkout',
  '/order-summary',
  '/payment',
  '/order-success',
  '/track',
  '/wishlist',
  '/saved',
  '/address',
  '/settings',
  '/profile',
  '/quotes',
  '/request-quote',
  '/payments',
  '/testing-reports',
  '/notifications',
  '/support',
  '/mobile',
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // 1. Loading check: prevent navigation flashing during initial authentication verification
  if (loading) return null;

  // 2. Strict Authentication check: Mobile bottom navigation must NOT appear before login
  // Only display for authenticated users who have an active, validated session
  if (!isAuthenticated || !user) return null;

  // 3. Strict Route check: Must ONLY render on authenticated dashboard pages.
  // Never render on public pages (Home, Products, About, Contact, Global Network, SEO landing pages, etc.)
  const isDashboardRoute = DASHBOARD_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  if (!isDashboardRoute) return null;

  // Determine active states for the 5 primary tabs within authenticated dashboard
  const isHomeActive =
    location.pathname === '/' ||
    (location.pathname === '/dashboard' && !location.search.includes('category'));

  const isWishlistActive =
    location.pathname === '/wishlist' ||
    location.pathname === '/saved';

  const isCartActive =
    location.pathname === '/cart' ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/order-summary');

  const isOrdersActive =
    location.pathname.startsWith('/orders') ||
    location.pathname.startsWith('/track');

  const isAccountActive =
    location.pathname === '/mobile' ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/quotes') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/address') ||
    location.pathname.startsWith('/payments');

  const navItems = [
    {
      name: 'Home',
      Icon: Home,
      path: '/dashboard',
      isActive: isHomeActive
    },
    {
      name: 'Wishlist',
      Icon: Heart,
      path: '/wishlist',
      badge: wishlistCount,
      isActive: isWishlistActive
    },
    {
      name: 'Cart',
      Icon: ShoppingCart,
      path: '/cart',
      badge: cartCount,
      isActive: isCartActive
    },
    {
      name: 'Orders',
      Icon: Package,
      path: '/orders',
      isActive: isOrdersActive
    },
    {
      name: 'Account',
      Icon: UserRound,
      path: '/mobile',
      isActive: isAccountActive
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from being covered by floating bottom nav */}
      <div className="h-20 md:hidden w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Floating Minimal Elevated Mobile Navigation */}
      <div
        className="md:hidden fixed z-[9999] pointer-events-auto transition-all duration-300 left-3 right-3 sm:left-4 sm:right-4 max-w-[414px] mx-auto"
        style={{
          bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <nav
          className="w-full bg-white/95 backdrop-blur-xl border border-stone-200/60 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] px-1 py-2 flex items-center justify-between"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const { isActive, Icon } = item;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="flex-1 flex flex-col items-center justify-center min-w-0 py-0.5 relative group cursor-pointer select-none"
              >
                <div className="relative flex items-center justify-center">
                  <Icon 
                    className={`w-[22px] h-[22px] transition-colors duration-200 ${
                      isActive ? 'stroke-[#2E7D32]' : 'stroke-stone-400 group-hover:stroke-stone-600'
                    }`} 
                    strokeWidth={isActive ? 1.85 : 1.5} 
                  />

                  {/* Live Item Count Badge (Cart / Wishlist) */}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#2E7D32] text-white text-[8px] font-bold min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white shadow-2xs leading-none px-0.5 pointer-events-none">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span 
                  className={`text-[10px] min-[360px]:text-[11px] leading-tight tracking-tight mt-1 whitespace-nowrap truncate max-w-full px-0.5 text-center transition-colors duration-200 ${
                    isActive 
                      ? 'font-semibold text-[#2E7D32]' 
                      : 'font-medium text-stone-400 group-hover:text-stone-600'
                  }`}
                >
                  {item.name}
                </span>

                {/* Subtle Active Indicator Dot */}
                <span 
                  className={`w-1 h-1 rounded-full transition-all duration-200 mt-0.5 ${
                    isActive ? 'bg-[#2E7D32] scale-100 opacity-100' : 'bg-transparent scale-0 opacity-0'
                  }`} 
                />
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default MobileBottomNav;
