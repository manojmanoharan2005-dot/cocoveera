import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, User, LogOut, Globe, Mail, Phone, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserDropdown(false);
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
    <header className="fixed top-0 left-0 w-full z-50 border-b border-primary/10 bg-white">
      {/* 1. TOP CONTACT STRIP (Fades and shrinks on scroll) */}
      <div
        className={`bg-primary text-white px-6 text-xs font-semibold transition-all duration-300 ${
          isScrolled ? 'h-0 py-0 opacity-0 overflow-hidden' : 'py-2.5 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary-light" />
              <a href="mailto:export@cocoveera.com" className="hover:text-primary-light transition-colors">export@cocoveera.com</a>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary-light" />
              <a href="tel:+914842869900" className="hover:text-primary-light transition-colors">+91 484 286 9900</a>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-light" />
            <span>Worldwide Shipping & Export Cleared</span>
          </div>
        </div>
      </div>

      {/* 2. STICKY NAVBAR (Shrinks height and adds shadow on scroll) */}
      <nav
        className={`bg-white transition-all duration-300 ${
          isScrolled ? 'py-2 shadow-soft' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo with shrinking transition */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo.jpg"
              alt="Cocoveera Logo"
              className={`object-contain transition-all duration-300 ${
                isScrolled ? 'h-10' : 'h-14'
              }`}
            />
            {/* Soft text combo in case logo details are small */}
            <span className="font-poppins font-extrabold text-lg tracking-wider hidden sm:flex items-center">
              <span className="text-[#8B4513]">COCO</span>
              <span className="text-[#2E7D32]">VEERA</span>
            </span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `font-poppins text-xs font-bold uppercase tracking-wider hover:text-primary transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-stone-650'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selection */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center space-x-1 text-xs font-bold text-stone-605 hover:text-primary focus:outline-none"
              >
                <Globe className="w-4 h-4 text-secondary" />
                <span>{language}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langDropdown && (
                <div className="absolute right-0 mt-2 w-28 bg-white border border-stone-100 rounded-lg shadow-lg py-1 z-50">
                  {['EN', 'ES', 'DE', 'FR'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-xs text-stone-705 hover:bg-accent-dark hover:text-primary transition-all font-semibold"
                    >
                      {lang === 'EN' && 'English'}
                      {lang === 'ES' && 'Español'}
                      {lang === 'DE' && 'Deutsch'}
                      {lang === 'FR' && 'Français'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account Status / Logins */}
            {/* Logins */}
            <div className="flex items-center space-x-3.5">
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-wider text-stone-605 hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white border border-primary text-primary hover:bg-primary hover:text-white font-poppins text-xs font-bold px-4 py-2 rounded-lg transition-all"
              >
                Register
              </Link>
            </div>

            {/* Request Quote action */}
            <Link
              to="/products"
              className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold px-5 py-2.5 rounded-lg shadow-soft hover:shadow-md transition-all"
            >
              Request Quote
            </Link>
          </div>

          {/* Mobile Toggles */}
          <div className="lg:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 focus:outline-none text-stone-855"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-stone-100 shadow-xl py-6 px-6 z-50 flex flex-col space-y-4 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-stone-705 font-poppins font-bold uppercase tracking-wider py-1 hover:text-primary transition-colors text-xs"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-stone-100" />
            
            <div className="flex flex-col space-y-3 pt-2">
              <Link
                to="/login"
                className="w-full text-center border border-stone-200 text-stone-707 py-2.5 rounded-lg font-bold text-xs uppercase"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full text-center bg-white border border-primary text-primary py-2.5 rounded-lg font-bold text-xs uppercase"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>

            <Link
              to="/products"
              className="w-full text-center bg-primary text-white py-3 rounded-lg font-bold text-xs uppercase shadow"
              onClick={() => setIsOpen(false)}
            >
              Request Quote
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
