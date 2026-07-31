/**
 * File: frontend/src/components/Navbar.jsx
 * Purpose: Reusable React UI component for the frontend.
 * Mobile: Premium spacing, large tap targets, breathable drawer layout.
 */
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, Globe, Mail, ShieldCheck, Heart, ShoppingCart, User } from 'lucide-react';

import SustainabilityTicker from './SustainabilityTicker';

const Navbar = () => {
  const { user, token, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setLangDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Global Network', path: '/global-network' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
    { name: 'Production Process', path: '/production-process' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/85 backdrop-blur-lg shadow-md border-b border-white/20' : 'bg-white shadow-sm'}`}>

      {/* ── TOP STRIP ── */}
      <div
        className={`bg-primary text-white text-[11px] font-medium transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-10 py-2 opacity-100'
        }`}
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 flex justify-between items-center h-full">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center w-full sm:w-auto">
            <a href="mailto:supportdesk@cocoveera.com" className="flex items-center gap-1.5 hover:text-green-200 transition-colors">
              <Mail className="w-3 h-3" />
              supportdesk@cocoveera.com
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-green-300" />
            <span>Worldwide Shipping &amp; Export Cleared</span>
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="bg-white shadow-[0_3px_12px_rgba(0,0,0,0.04)] border-b border-stone-200/60 transition-all duration-500">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 flex items-center h-[60px] gap-4 sm:gap-8">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.webp"
              alt="Cocoveera"
              className="h-8 sm:h-10 object-contain transition-transform duration-300 hover:scale-105"
            />
            <span className="font-poppins font-extrabold text-base sm:text-lg tracking-wide hidden sm:block">
              <span className="text-[#8B4513]">COCO</span>
              <span className="text-[#2E7D32]">VEERA</span>
            </span>
          </Link>

          {/* CENTER NAV – hidden below xl */}
          <div className="hidden xl:flex flex-1 items-center justify-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `font-poppins text-xs uppercase tracking-wider whitespace-nowrap relative py-0.5 transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#2E7D32] after:transition-transform after:duration-300 ${
                    isActive
                      ? 'text-[#2E7D32] font-bold after:scale-x-100'
                      : 'text-[#4A3A1F] font-semibold hover:text-[#2E7D32] after:scale-x-0 hover:after:scale-x-100'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* RIGHT ACTIONS – desktop */}
          <div className="hidden xl:flex items-center gap-4 flex-shrink-0">
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#4A3A1F] hover:text-[#2E7D32] transition-colors"
              >
                <Globe className="w-4 h-4 text-[#2E7D32]" />
                <span>{language}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {langDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-[#FAF2DD] border border-[#E0D0AB] rounded-xl shadow-lg py-1 z-50">
                  {[
                    { code: 'EN', label: 'English' },
                    { code: 'ES', label: 'Español' },
                    { code: 'DE', label: 'Deutsch' },
                    { code: 'FR', label: 'Français' },
                  ].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code); setLangDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-xs text-[#4A3A1F] hover:bg-[#E8D7B0]/50 hover:text-[#2E7D32] transition-colors font-semibold"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 text-xs font-bold text-[#4A3A1F] hover:text-[#2E7D32] bg-white/50 px-3 py-1.5 rounded-xl border border-[#E0D0AB] transition-colors"
                >
                  <User className="w-4 h-4 text-[#2E7D32]" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-700 hover:text-red-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-[#4A3A1F] hover:text-[#2E7D32] transition-colors px-2 py-0.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white font-poppins text-xs font-bold px-4 py-1.5 rounded-xl transition-all duration-300 shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="xl:hidden ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#4A3A1F] hover:bg-[#E8D7B0]/50 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5 text-[#2E7D32]" /> : <Menu className="w-5 h-5 text-[#4A3A1F]" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {isOpen && (
          <div className="xl:hidden border-t border-[#E8D7B0]/60 bg-[#FAF2DD] px-5 pt-5 pb-6 flex flex-col gap-1.5 animate-slide-down">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `py-3 px-4 rounded-xl font-poppins font-bold text-xs uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#2E7D32] bg-[#2E7D32]/10'
                      : 'text-[#4A3A1F] hover:text-[#2E7D32] hover:bg-[#E8D7B0]/40'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="border-t border-[#E8D7B0] mt-4 pt-5 flex flex-col gap-3">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center border border-[#E0D0AB] text-[#4A3A1F] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:text-[#2E7D32] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center border-2 border-[#2E7D32] text-[#2E7D32] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#2E7D32] hover:text-white transition-all"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center border border-[#2E7D32] text-[#2E7D32] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#2E7D32] hover:text-white transition-all"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── SUSTAINABILITY ANNOUNCEMENT TICKER ── */}
      <SustainabilityTicker />
    </header>
  );
};

export default Navbar;
