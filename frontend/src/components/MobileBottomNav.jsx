import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Package, FlaskConical, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // Hide on desktop (>=768px handled by md:hidden)
  // Hide on admin routes
  // Hide on checkout/product view where specific action bars exist at the bottom
  const hiddenRoutes = ['/admin', '/checkout', '/product/', '/productview/', '/mobile'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.includes(route));

  // ONLY SHOW ON PRIVATE PAGES
  const isPrivatePage = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/account');

  if (shouldHide || !isPrivatePage || loading) return null;

  const cartCount = user?.cart?.length || 0;

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Quality Test', icon: FlaskConical, path: '/testing-reports' },
    { name: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
    { name: 'Account', icon: User, path: '/mobile' },
  ];

  return (
    <>
      {/* Global padding added dynamically to body when this component mounts, 
          but adding an invisible spacer here is safer for the React tree */}
      <div className="h-[72px] md:hidden w-full shrink-0" aria-hidden="true" />
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-stone-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[9999] px-2 flex items-center justify-between" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          const isActive = 
            location.pathname === item.path || 
            (item.name === 'Account' && location.pathname.startsWith('/account') && location.pathname !== '/cart' && location.pathname !== '/testing-reports');
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                isActive ? 'text-[#2E7D32]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <item.icon 
                  className={`w-[22px] h-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#2E7D32] text-white text-[8px] font-black min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${
                isActive ? 'font-extrabold text-[#2E7D32]' : 'font-semibold text-gray-500'
              }`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};

export default MobileBottomNav;
