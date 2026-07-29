/**
 * File: frontend/src/components/Footer.jsx
 * Purpose: Official Footer navigation component with dynamic category fetching,
 *          verified corporate navigation, social links, and contact details.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '../utils/config';

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.data || data)
    .catch(() => []);

const FALLBACK_CATEGORIES = [
  'Cocopeat Blocks',
  'Grow Bags',
  'Coco Cubes',
  'Coir Briquettes',
  'Coir Fiber Bale',
  'Coco Chips',
  'Open Top Grow Bags',
  'Substrate Bags',
  'Erosion Control Products',
];

const SUPPORT_LINKS = [
  { label: 'About Us', path: '/about' },
  { label: 'Our Products', path: '/products' },
  { label: 'How to Use (Guide)', path: '/how-to-use' },
  { label: 'Quality Assurance', path: '/quality-testing' },
  { label: 'Certifications', path: '/about#certifications' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Request a Quote', path: '/contact' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms & Conditions', path: '/terms-conditions' },
];

const Footer = () => {
  const { data: dbCategories = [] } = useSWR(`${API_URL}/categories`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000,
  });

  const categoryItems =
    Array.isArray(dbCategories) && dbCategories.length > 0
      ? dbCategories
          .filter((cat) => cat && cat.isActive !== false)
          .map((cat) => (typeof cat === 'string' ? cat : cat.name))
      : FALLBACK_CATEGORIES;

  return (
    <footer className="bg-[#1a2a1a] text-stone-300 pt-14 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-10">
        
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
              {
                Icon: Linkedin,
                href: 'https://www.linkedin.com/in/cocoveera🌿-support-desk-b51229422?utm_source=share_via&utm_content=profile&utm_medium=member_android',
              },
              { Icon: Facebook, href: 'https://facebook.com' },
              { Icon: Twitter, href: 'https://twitter.com' },
              { Icon: Instagram, href: 'https://instagram.com' },
            ].map(({ Icon, href }, idx) => (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-all duration-300 text-stone-400 hover:text-white"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Products (Dynamic from Backend) */}
        <div>
          <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-5">
            Products
          </h4>
          <ul className="space-y-3 text-xs">
            {categoryItems.map((catName) => (
              <li key={catName}>
                <Link
                  to={`/products?category=${encodeURIComponent(catName)}`}
                  className="text-stone-400 hover:text-primary-light hover:translate-x-1 transition-all inline-block duration-200"
                >
                  {catName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Support */}
        <div>
          <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-5">
            Support
          </h4>
          <ul className="space-y-3 text-xs">
            {SUPPORT_LINKS.map((item) => (
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
          <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-5">
            Contact Us
          </h4>
          <ul className="space-y-4 text-xs">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
              <span className="text-stone-400 leading-relaxed">
                96/1, Vikas Layout, Kalluri Nagar,<br />
                Anna Nagar, Peelamedu, Coimbatore,<br />
                Tamil Nadu – 641004, India
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary-light flex-shrink-0" />
              <a
                href="mailto:supportdesk@cocoveera.com"
                className="text-stone-400 hover:text-primary-light transition-colors"
              >
                supportdesk@cocoveera.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 border-t border-white/10 mt-10 sm:mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-stone-500 font-semibold uppercase tracking-wider gap-4">
        <p>© 2026 Cocoveera Private Limited. All rights reserved.</p>
        <div className="flex space-x-6">
          <Link to="/privacy-policy" className="hover:text-primary-light transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-conditions" className="hover:text-primary-light transition-colors">
            Terms & Conditions
          </Link>
          <Link to="/contact" className="hover:text-primary-light transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
