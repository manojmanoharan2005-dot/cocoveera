/**
 * File: frontend/src/components/Footer.jsx
 * Purpose: Redesigned official Cocoveera main footer featuring brand summary,
 *          verified quick links, dynamic product categories, operating hours,
 *          official contact information, social links, and bottom copyright bar.
 *          Fully responsive across mobile (320px–430px), tablet, and desktop breakpoints.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Linkedin, Phone, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '../utils/config';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
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
  'Growbags',
  'Briquettes',
  'Coco Cubes',
  'Substrate Bags',
  'Coir Fiber Bales',
  'Blueberry Discs',
  'Open Top Grow Bags',
  'Erosion Control Blankets',
  'Curled Coir Ropes'
];

const QUICK_LINKS = [
  { label: 'About Us', path: '/about' },
  { label: 'Our Products', path: '/products' },
  { label: 'Production Process', path: '/production-process' },
  { label: 'Global Network', path: '/global-network' },
  { label: 'Quality & Testing', path: '/production-process' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Certifications', path: '/about#certifications' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Request a Quote', path: '/contact' }
];

const Footer = () => {
  const { data: dbCategories = [] } = useSWR(`${API_URL}/categories`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000,
  });

  const categoryItems =
    Array.isArray(dbCategories) && dbCategories.length > 0
      ? dbCategories
          .filter((cat) => cat && cat.name && !cat.name.toLowerCase().includes('demo') && !cat.name.toLowerCase().includes('test'))
          .map((cat) => (typeof cat === 'string' ? cat : cat.name))
      : FALLBACK_CATEGORIES;

  return (
    <footer className="bg-[#142014] text-stone-300 border-t border-white/10 overflow-x-hidden">
      {/* Top Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 pt-10 xs:pt-12 sm:pt-16 pb-10 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Column 1: About Cocoveera (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <img src="/logo.webp" alt="Cocoveera" className="h-9 xs:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              <span className="font-poppins font-extrabold text-lg xs:text-xl tracking-wider text-white">
                <span className="text-[#C68B59]">COCO</span>
                <span className="text-primary-light">VEERA</span>
              </span>
            </Link>

            <p className="text-stone-400 text-xs sm:text-[13px] leading-relaxed">
              Cocoveera is an international manufacturer and bulk exporter of premium organic coconut coir substrates, coco peat blocks, grow bags, and customized growing media. Powered by sustainable coconut husk processing in Coimbatore, India, we support commercial greenhouse growers, berry cultivators, and agricultural enterprises worldwide.
            </p>

            <div className="pt-1 space-y-2">
              <span className="text-[10px] xs:text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                Connect With Us
              </span>
              <div className="flex items-center space-x-3">
                <a
                  href="https://www.linkedin.com/company/cocoveera/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary-dark border border-white/10 flex items-center justify-center transition-all duration-300 text-stone-300 hover:text-white active:scale-95 shadow-xs"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/916383469877"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#25D366] border border-white/10 flex items-center justify-center transition-all duration-300 text-stone-300 hover:text-white active:scale-95 shadow-xs"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
                <a
                  href="mailto:supportdesk@cocoveera.com"
                  aria-label="Email Us"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary-dark border border-white/10 flex items-center justify-center transition-all duration-300 text-stone-300 hover:text-white active:scale-95 shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-light"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-stone-400 hover:text-primary-light hover:translate-x-1 transition-all inline-flex items-center gap-1.5 duration-200 py-0.5"
                  >
                    <ArrowRight className="w-3 h-3 text-stone-600 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Product Range (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-light"></span>
              Product Range
            </h4>
            <ul className="space-y-2.5 text-xs">
              {categoryItems.slice(0, 8).map((catName) => (
                <li key={catName}>
                  <Link
                    to={`/products?category=${encodeURIComponent(catName)}`}
                    className="text-stone-400 hover:text-primary-light hover:translate-x-1 transition-all inline-flex items-center gap-1.5 duration-200 py-0.5"
                  >
                    <ArrowRight className="w-3 h-3 text-stone-600 shrink-0" />
                    <span>{catName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Operating Hours & Contact (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-poppins font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-light"></span>
              Contact &amp; Hours
            </h4>

            {/* Operating Hours Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white font-semibold text-xs">Operating Hours</p>
                  <p className="text-stone-400 text-[11px] xs:text-[11.5px] mt-0.5 leading-snug">
                    Monday – Saturday: 9:00 AM – 6:00 PM IST
                  </p>
                  <p className="text-stone-500 text-[11px]">Sunday: Closed</p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 bg-primary/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full border border-primary/30 font-medium">
                    <ShieldCheck className="w-3 h-3 shrink-0" /> Response Within 24 Hours
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Details */}
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
                <span className="text-stone-400 leading-relaxed text-[11px] xs:text-[11.5px]">
                  96/1, Vikas Layout, Kalluri Nagar, Anna Nagar, Peelamedu, Coimbatore, Tamil Nadu – 641004, India
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-light shrink-0" />
                <a
                  href="tel:+916383469877"
                  className="text-stone-300 hover:text-primary-light transition-colors font-medium text-xs xs:text-[12px]"
                >
                  +91 63834 69877
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-light shrink-0" />
                <a
                  href="mailto:supportdesk@cocoveera.com"
                  className="text-stone-300 hover:text-primary-light transition-colors text-xs xs:text-[12px] truncate"
                >
                  supportdesk@cocoveera.com
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Visually Distinct Bottom Copyright Bar */}
      <div className="bg-[#0b140b] border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-stone-400 gap-3">
          <p className="text-center sm:text-left">
            © 2026 Cocoveera Private Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 xs:gap-4 sm:gap-6 font-medium">
            <Link to="/privacy-policy" className="hover:text-primary-light transition-colors">
              Privacy Policy
            </Link>
            <span className="text-stone-700 hidden sm:inline" aria-hidden="true">•</span>
            <Link to="/terms-conditions" className="hover:text-primary-light transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-stone-700 hidden sm:inline" aria-hidden="true">•</span>
            <Link to="/contact" className="hover:text-primary-light transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
