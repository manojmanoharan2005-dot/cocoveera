/**
 * File: frontend/src/components/Footer.jsx
 * Purpose: Official Footer navigation component with dynamic category fetching,
 *          verified corporate navigation, social links, and contact details.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Linkedin, Phone } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '../utils/config';

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

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
  { label: 'Production Process', path: '/production-process' },
  { label: 'Global Network', path: '/global-network' },
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
                href: 'https://www.linkedin.com/company/cocoveera/',
                label: 'LinkedIn',
              },
              {
                Icon: WhatsAppIcon,
                href: 'https://wa.me/916382801974',
                label: 'WhatsApp',
              },
            ].map(({ Icon, href, label }, idx) => (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-all duration-300 text-stone-400 hover:text-white"
              >
                <Icon className="w-4 h-4" />
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
              <Phone className="w-4 h-4 text-primary-light flex-shrink-0" />
              <a
                href="https://wa.me/916382801974"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-primary-light transition-colors font-medium"
              >
                +91 63828 01974
              </a>
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
