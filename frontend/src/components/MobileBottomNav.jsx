import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FlaskConical, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  
  // 1. Loading check: prevent navigation flashing during initial authentication verification
  if (loading) return null;

  // 2. Strict Authentication check: Mobile bottom navigation must NOT appear before login
  // Only display for authenticated users who have an active, validated session
  if (!isAuthenticated || !user) return null;

  // 3. Hide on desktop (>=768px handled by md:hidden in CSS)
  // Hide on admin routes, auth pages, or sensitive workflows
  const hiddenRoutes = ['/admin', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) return null;

  // Determine active states for the 4 primary tabs
  const isHomeActive = 
    location.pathname === '/' || 
    location.pathname === '/dashboard' || 
    location.pathname === '/products' || 
    location.pathname.startsWith('/product/') || 
    location.pathname.startsWith('/products/') || 
    location.pathname.startsWith('/productview/') || 
    location.pathname.startsWith('/dashboard/product');

  const isQualityActive = 
    location.pathname === '/testing-reports' || 
    location.pathname === '/production-process' || 
    location.pathname === '/quality-testing';

  const isCartActive = 
    location.pathname === '/cart' || 
    location.pathname.startsWith('/checkout');

  const isAccountActive = 
    location.pathname === '/mobile' || 
    location.pathname.startsWith('/profile') || 
    location.pathname.startsWith('/orders') || 
    location.pathname.startsWith('/quotes') || 
    location.pathname.startsWith('/settings') || 
    location.pathname.startsWith('/address') || 
    location.pathname.startsWith('/payments');

  const navItems = [
    { 
      name: 'Home', 
      icon: Home, 
      path: '/dashboard', 
      isActive: isHomeActive 
    },
    { 
      name: 'Quality Test', 
      icon: FlaskConical, 
      path: '/testing-reports', 
      isActive: isQualityActive 
    },
    { 
      name: 'Cart', 
      icon: ShoppingCart, 
      path: '/cart', 
      badge: cartCount, 
      isActive: isCartActive 
    },
    { 
      name: 'Account', 
      icon: User, 
      path: '/mobile', 
      isActive: isAccountActive 
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from being covered by floating bottom nav */}
      <div className="h-20 md:hidden w-full shrink-0 pointer-events-none" aria-hidden="true" />
      
      {/* Floating Pill Mobile Navigation */}
      <div 
        className="md:hidden fixed z-[9999] pointer-events-auto transition-all duration-300 left-3 right-3 xs:left-4 xs:right-4 max-w-[390px] sm:max-w-md mx-auto"
        style={{ 
          bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))', 
        }}
      >
        <nav 
          className="w-full bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-2 py-1.5 flex items-center justify-between"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const { isActive } = item;
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="flex-1 flex flex-col items-center justify-center min-w-0 py-0.5 relative group cursor-pointer select-none"
              >
                <div className="relative flex items-center justify-center">
                  <div 
                    className={`w-10 h-7 xs:w-11 xs:h-7.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'bg-[#2E7D32]/12 text-[#2E7D32]' : 'text-stone-400 group-hover:bg-stone-100/60 group-hover:text-stone-600'
                    }`}
                  >
                    <item.icon 
                      className={`w-4.5 h-4.5 transition-transform duration-200 ${
                        isActive ? 'scale-105 stroke-[#2E7D32]' : 'scale-100 stroke-stone-400 group-hover:stroke-stone-600'
                      }`} 
                      strokeWidth={isActive ? 2.4 : 1.8} 
                    />
                  </div>
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[8px] font-black min-w-[15px] h-[15px] rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-[9px] xs:text-[9.5px] leading-tight tracking-tight mt-1 whitespace-nowrap transition-all duration-200 ${
                    isActive ? 'font-black text-[#2E7D32]' : 'font-semibold text-stone-400 group-hover:text-stone-600'
                  }`}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default MobileBottomNav;
