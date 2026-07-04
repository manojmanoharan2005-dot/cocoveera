/**
 * File: frontend/src/components/Footer.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a2a1a] text-stone-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Col 1: Brand */}
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center space-x-2 mb-5">
            <img src="/logo.webp" alt="Cocoveera" className="h-10 object-contain" />
            <span className="font-poppins font-extrabold text-lg tracking-wider">
              <span className="text-[#A26B3D]">COCO</span>
              <span className="text-primary-light">VEERA</span>
            </span>
          </Link>
          <p className="text-stone-400 text-xs leading-relaxed mb-5">
            Premium coconut substrate manufacturer and exporter powering professional horticulture and commercial greenhouse cultivation worldwide.
          </p>
          {/* Social Links */}
          <div className="flex space-x-3">
            {[
              { Icon: Linkedin, href: '#' },
              { Icon: Facebook, href: '#' },
              { Icon: Twitter, href: '#' },
              { Icon: Instagram, href: '#' },
            ].map(({ Icon, href }, idx) => (
              <a
                key={idx}
                href={href}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-all duration-300 text-stone-400 hover:text-white"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Products */}
        <div>
          <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-5">Products</h4>
          <ul className="space-y-3 text-xs">
            {[
              { label: 'Coco Peat Blocks', path: '/products' },
              { label: 'Grow Bags', path: '/products' },
              { label: 'Coco Chips', path: '/products' },
              { label: 'Coir Pith', path: '/products' },
              { label: 'Coco Husk Chips', path: '/products' },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="text-stone-400 hover:text-primary-light hover:translate-x-1 transition-all inline-block duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Support */}
        <div>
          <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-5">Support</h4>
          <ul className="space-y-3 text-xs">
            {[
              { label: 'About Us', path: '/about' },
              { label: 'Quality Testing', path: '/quality-testing' },
              { label: 'Global Network', path: '/substrates' },
              { label: 'Notifications', path: '/notifications' },
              { label: 'Authentications', path: '/login' },
              { label: 'Privacy Policy', path: '/privacy-policy' },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="text-stone-400 hover:text-primary-light hover:translate-x-1 transition-all inline-block duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Contact Us */}
        <div>
          <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-5">Contact Us</h4>
          <ul className="space-y-4 text-xs">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
              <span className="text-stone-400 leading-relaxed">
                Cocoveera Plaza,<br />Industrial Port Zone,<br />Cochin, India
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary-light flex-shrink-0" />
              <a href="tel:+914842869900" className="text-stone-400 hover:text-primary-light transition-colors">
                +91 484 286 9900
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary-light flex-shrink-0" />
              <a href="tel:+914842869900" className="text-stone-400 hover:text-primary-light transition-colors">
                +91 484 286 9901
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary-light flex-shrink-0" />
              <a href="mailto:export@cocoveera.com" className="text-stone-400 hover:text-primary-light transition-colors">
                export@cocoveera.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary-light flex-shrink-0" />
              <a href="mailto:info@cocoveera.com" className="text-stone-400 hover:text-primary-light transition-colors">
                info@cocoveera.com
              </a>
            </li>
          </ul>
        </div>


      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-stone-500 font-semibold uppercase tracking-wider gap-4">
        <p>© 2026 Cocoveera Private Limited. All rights reserved.</p>
        <div className="flex space-x-6">
          <Link to="/privacy-policy" className="hover:text-primary-light transition-colors">Privacy Policy</Link>
          <Link to="/terms-conditions" className="hover:text-primary-light transition-colors">Terms & Conditions</Link>
          <a href="#" className="hover:text-primary-light transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
