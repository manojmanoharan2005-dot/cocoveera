/**
 * File: frontend/src/components/Navbar.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, Globe, Mail, Phone, ShieldCheck, Heart, ShoppingCart, User } from 'lucide-react';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Production Process', path: '/quality-testing' },
    { name: 'Global Network', path: '/substrates' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/85 backdrop-blur-lg shadow-md border-b border-white/20' : 'bg-white shadow-sm'}`}>

      {/* ── TOP STRIP ── */}
      <div
        className={`bg-primary text-white text-[11px] font-medium transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-10 py-2 opacity-100'
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex justify-between items-center h-full">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center w-full sm:w-auto">
            <a href="mailto:export@cocoveera.com" className="flex items-center gap-1.5 hover:text-green-200 transition-colors">
              <Mail className="w-3 h-3" />
              export@cocoveera.com
            </a>
            <a href="tel:+914842869900" className="flex items-center gap-1.5 hover:text-green-200 transition-colors">
              <Phone className="w-3 h-3" />
              +91 484 286 9900
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-green-300" />
            <span>Worldwide Shipping &amp; Export Cleared</span>
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className={`bg-transparent transition-all duration-500 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-8">

          {/* LOGO – fixed width so nav links never overlap it */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.webp"
              alt="Cocoveera"
              className={`object-contain transition-all duration-300 ${isScrolled ? 'h-9' : 'h-12'}`}
            />
            <span className="font-poppins font-extrabold text-base tracking-wide hidden sm:block">
              <span className="text-[#8B4513]">COCO</span>
              <span className="text-[#2E7D32]">VEERA</span>
            </span>
          </Link>

          {/* CENTER NAV – flex-1 so it takes remaining space, hidden below xl */}
          <div className="hidden xl:flex flex-1 items-center justify-center gap-5">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `font-poppins text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-stone-600 hover:text-primary'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="hidden xl:flex items-center gap-4 flex-shrink-0">
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-primary transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-secondary" />
                <span>{language}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langDropdown && (
                <div className="absolute right-0 mt-2 w-28 bg-white border border-stone-100 rounded-xl shadow-lg py-1 z-50">
                  {[
                    { code: 'EN', label: 'English' },
                    { code: 'ES', label: 'Español' },
                    { code: 'DE', label: 'Deutsch' },
                    { code: 'FR', label: 'Français' },
                  ].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code); setLangDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-accent hover:text-primary transition-colors font-medium"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-3 w-32 h-8">
                <div className="w-full h-full bg-stone-100 rounded-lg animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link to="/saved" className="relative p-1.5 text-stone-600 hover:text-primary transition-colors">
                  <Heart className="w-5 h-5" />
                  {user?.wishlist?.length > 0 && (
                    <span className="absolute top-0 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                      {user.wishlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-1.5 text-stone-600 hover:text-primary transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {user?.cart?.length > 0 && (
                    <span className="absolute top-0 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                      {user.cart.length}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 pl-2 border-l border-stone-200 ml-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white flex items-center justify-center font-poppins font-black text-xs shadow-md">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[11px] font-semibold uppercase tracking-wide text-stone-600 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-primary text-primary hover:bg-primary hover:text-white font-poppins text-[11px] font-bold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 hover:shadow-[0_0_15px_rgba(46,125,50,0.4)]"
                >
                  Register
                </Link>
              </>
            )}

            {/* Brochure CTA */}
            <a
              href="/cocoveera-brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary-dark text-white font-poppins text-[11px] font-bold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap active:scale-95 hover:shadow-[0_0_15px_rgba(46,125,50,0.5)]"
            >
              Brochure
            </a>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="xl:hidden ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {isOpen && (
          <div className="xl:hidden border-t border-stone-100 bg-white px-6 py-5 flex flex-col gap-1 animate-slide-down">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 px-3 rounded-lg font-poppins font-semibold text-xs uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-stone-700 hover:text-primary hover:bg-stone-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="border-t border-stone-100 mt-3 pt-4 flex flex-col gap-3">
              {loading ? (
                <div className="flex flex-col gap-3">
                  <div className="h-10 bg-stone-100 rounded-lg animate-pulse w-full"></div>
                  <div className="h-10 bg-stone-100 rounded-lg animate-pulse w-full"></div>
                </div>
              ) : user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-stone-50 border border-stone-200 text-stone-700 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide hover:border-primary hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" /> My Dashboard
                  </Link>
                  <Link
                    to="/saved"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 border border-stone-200 text-stone-700 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide hover:border-primary hover:text-primary transition-colors"
                  >
                    <Heart className="w-4 h-4" /> Wishlist ({user?.wishlist?.length || 0})
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center border border-stone-200 text-stone-700 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide hover:border-primary hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center border border-primary text-primary py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-primary hover:text-white transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
              <a
                href="/cocoveera-brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-primary text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wide shadow"
              >
                Brochure
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
