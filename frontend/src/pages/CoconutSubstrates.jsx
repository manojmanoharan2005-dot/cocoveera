/**
 * File: frontend/src/pages/CoconutSubstrates.jsx
 * Purpose: Premium Corporate Global Network & Distribution Export Page for Cocoveera.
 * Designed like leading international exporters (Sai Cocopeat, Maersk, DP World, Flexport, UPL, Olam Agri).
 */

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  Anchor,
  Users,
  Compass,
  Package,
  ArrowRight,
  Download,
  Ship,
  Sparkles,
  ChevronRight,
  Layers,
  Container,
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlobalMap from '../components/GlobalMap';
import SEO from '../components/SEO';

const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    flag: '🇺🇸',
    port: 'Los Angeles Port',
    secondaryPorts: ['Los Angeles Port', 'Houston Port'],
    region: 'North America',
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'canada',
    country: 'Canada',
    flag: '🇨🇦',
    port: 'Toronto Port',
    secondaryPorts: ['Toronto Port'],
    region: 'North America',
    products: ['Cocopeat Blocks', 'Coir Pith'],
  },
  {
    id: 'uk',
    country: 'UK',
    flag: '🇬🇧',
    port: 'London Port',
    secondaryPorts: ['London Port'],
    region: 'Europe',
    products: ['Cocopeat Blocks', 'Coco Chips'],
  },
  {
    id: 'netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    port: 'Rotterdam Port',
    secondaryPorts: ['Rotterdam Port'],
    region: 'Europe',
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    port: 'Hamburg Port',
    secondaryPorts: ['Hamburg Port'],
    region: 'Europe',
    products: ['Grow Bags', 'Coco Chips'],
  },
  {
    id: 'spain',
    country: 'Spain',
    flag: '🇪🇸',
    port: 'Valencia Port',
    secondaryPorts: ['Valencia Port'],
    region: 'Europe',
    products: ['Grow Bags', 'Coir Pith'],
  },
  {
    id: 'uae',
    country: 'UAE',
    flag: '🇦🇪',
    port: 'Jebel Ali Port',
    secondaryPorts: ['Jebel Ali Port'],
    region: 'Middle East',
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'saudi',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    port: 'Jeddah Port',
    secondaryPorts: ['Jeddah Port'],
    region: 'Middle East',
    products: ['Cocopeat Blocks', 'Coir Pith'],
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    port: 'Singapore Port',
    secondaryPorts: ['Singapore Port'],
    region: 'Asia Pacific',
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'skorea',
    country: 'South Korea',
    flag: '🇰🇷',
    port: 'Busan Port',
    secondaryPorts: ['Busan Port'],
    region: 'Asia Pacific',
    products: ['Grow Bags', 'Coco Chips'],
  },
  {
    id: 'japan',
    country: 'Japan',
    flag: '🇯🇵',
    port: 'Tokyo Port',
    secondaryPorts: ['Tokyo Port'],
    region: 'Asia Pacific',
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    port: 'Melbourne Port',
    secondaryPorts: ['Melbourne Port'],
    region: 'Asia Pacific',
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'nz',
    country: 'New Zealand',
    flag: '🇳🇿',
    port: 'Auckland Port',
    secondaryPorts: ['Auckland Port'],
    region: 'Oceania',
    products: ['Cocopeat Blocks', 'Coco Husk Chips'],
  },
];

const STATS = [
  { icon: Globe, val: '28+', label: 'Countries Served' },
  { icon: Anchor, val: '20+', label: 'Major Ports' },
  { icon: Users, val: '85+', label: 'Export Partners' },
  { icon: Compass, val: '5', label: 'Continents' },
  { icon: Package, val: '250K+', label: 'Containers Exported' },
];

const CoconutSubstrates = () => {
  const [selectedDestId, setSelectedDestId] = useState('usa');
  const navigate = useNavigate();
  const mapSectionRef = useRef(null);
  const cardRefs = useRef({});

  const handleSelectDestination = (dest) => {
    setSelectedDestId(dest.id);
    const cardEl = cardRefs.current[dest.id];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const scrollToMap = () => {
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-stone-900 selection:bg-[#2E7D32]/20">
      <SEO
        title="Global Network & Distribution"
        description="Cocoveera exports premium cocopeat and coir substrates to commercial growers and distributors across five continents."
        url="/substrates"
      />

      {/* =========================================================================
          1. HERO SECTION (HEIGHT: 650px–750px, LUXURIOUS SPACIOUS CORPORATE)
      ========================================================================= */}
      <section className="relative w-full h-[650px] sm:h-[700px] lg:h-[750px] overflow-hidden flex items-center justify-center bg-stone-900">
        {/* Background Full-Width High Quality Export Logistics Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />

        {/* Soft White Overlay (75%) */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />

        {/* Content Wrapper */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-extrabold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
              SUPPLY CHAIN
            </div>

            {/* Heading (Desktop ~60px, Mobile ~40px) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-poppins font-black text-stone-900 leading-[1.08] tracking-tight">
              Global Network &<br />
              <span className="text-[#2E7D32]">Distribution</span>
            </h1>

            {/* Short Paragraph (Desktop ~18px, Mobile ~16px) */}
            <p className="text-stone-700 text-base sm:text-lg lg:text-[18px] font-medium leading-relaxed max-w-xl">
              Cocoveera exports premium cocopeat and coir substrates to commercial growers and distributors across five continents.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={scrollToMap}
                className="bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-poppins font-extrabold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <span>Explore Export Network</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/contact"
                className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-poppins font-extrabold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5 text-[#2E7D32]" />
                <span>Download Brochure</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Side Large Elegant Cargo Logistics Card/Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-stone-200/90 shadow-2xl space-y-6">
              <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32]">
                  <Ship className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-poppins font-extrabold text-stone-900 text-xl">Worldwide Ocean Freight</h3>
                  <p className="text-xs text-stone-500 font-semibold">Direct FCL Shipments from Tuticorin & Cochin Ports</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Standard Container</div>
                  <div className="font-extrabold text-stone-900 text-lg">20FT FCL</div>
                  <div className="text-xs text-[#2E7D32] font-semibold mt-1">16–18 Tons Load</div>
                </div>

                <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">High Volume</div>
                  <div className="font-extrabold text-stone-900 text-lg">40FT HC</div>
                  <div className="text-xs text-[#2E7D32] font-semibold mt-1">22–26 Tons Load</div>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-stone-200 p-4 rounded-2xl flex items-center justify-between text-xs text-stone-600 font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
                  ISO & Phytosanitary Certified Exporter
                </span>
                <span className="text-[#2E7D32] font-bold">100% Trackable</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          2. MASSIVE GLOBAL SUPPLY CHAIN MAP SECTION (SPACING: 120px)
      ========================================================================= */}
      <section ref={mapSectionRef} className="py-20 lg:py-[120px] px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-[#2E7D32] font-poppins text-xs font-extrabold uppercase tracking-widest">
            EXPORT INFRASTRUCTURE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-poppins font-black text-stone-900 tracking-tight leading-tight">
            Global Supply Chain Network
          </h2>
          <p className="text-stone-600 text-base sm:text-lg font-medium leading-relaxed">
            Standardized container shipment routing connecting our Coimbatore manufacturing facility to key international port terminals.
          </p>
        </div>

        {/* Massive Map Component */}
        <GlobalMap onSelectDestination={handleSelectDestination} activeDestId={selectedDestId} />
      </section>

      {/* =========================================================================
          3. BEAUTIFUL COUNTRY CARDS SECTION
          Desktop: 3 per row | Laptop: 2 per row | Tablet: 2 per row | Mobile: Swipeable
      ========================================================================= */}
      <section className="pb-20 lg:pb-[120px] px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#2E7D32] font-poppins text-xs font-extrabold uppercase tracking-widest block mb-1">
              KEY MARKETS
            </span>
            <h3 className="text-2xl sm:text-3xl font-poppins font-black text-stone-900 tracking-tight">
              Export Destination Hubs
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-bold hidden sm:inline-block">
            Select a destination to inspect logistics details →
          </span>
        </div>

        {/* Responsive Grid / Swipeable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestId === dest.id;

            return (
              <motion.div
                key={`dest-card-${dest.id}`}
                ref={(el) => (cardRefs.current[dest.id] = el)}
                onClick={() => setSelectedDestId(dest.id)}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className={`rounded-[24px] p-8 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#2E7D32] shadow-[0_16px_40px_rgba(46,125,50,0.12)] ring-2 ring-[#2E7D32]/20'
                    : 'bg-[#FAF9F6] border-stone-200/80 hover:border-stone-300 hover:bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className="space-y-6">
                  {/* Header: Flag, Country & Badge */}
                  <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{dest.flag}</span>
                      <h4 className="font-poppins font-black text-stone-900 text-xl">{dest.country}</h4>
                    </div>
                    <span className="text-[11px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/20">
                      Export Destination
                    </span>
                  </div>

                  {/* Primary Seaport */}
                  <div>
                    <label className="text-xs font-extrabold text-stone-400 uppercase tracking-wider block mb-2">
                      Primary Seaport
                    </label>
                    <div className="flex items-center gap-2.5 text-sm font-extrabold text-stone-800 bg-white border border-stone-200 p-3.5 rounded-2xl shadow-xs">
                      <Anchor className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                      <span>{dest.port}</span>
                    </div>
                  </div>

                  {/* Supplied Products */}
                  <div>
                    <label className="text-xs font-extrabold text-stone-400 uppercase tracking-wider block mb-2">
                      Products
                    </label>
                    <ul className="space-y-2">
                      {dest.products.map((prod, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-stone-700 font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                          <span>{prod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* View Details Link */}
                <div className="pt-6 mt-6 border-t border-stone-200/70 flex items-center justify-between text-xs font-extrabold text-[#2E7D32]">
                  <span>View Export Details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. EXPORT STATISTICS (CLEAN PREMIUM CARDS, NO HEAVY BORDERS)
      ========================================================================= */}
      <section className="pb-20 lg:pb-[120px] px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="bg-stone-50 rounded-[32px] p-8 sm:p-12 lg:p-16 border border-stone-200/60 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#2E7D32] font-poppins text-xs font-extrabold uppercase tracking-widest block mb-1">
              GLOBAL FOOTPRINT
            </span>
            <h3 className="text-2xl sm:text-3xl font-poppins font-black text-stone-900">
              Export Operations at a Glance
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {STATS.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-xs flex flex-col items-center text-center group transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center mb-4 group-hover:bg-[#2E7D32] transition-colors">
                    <IconComponent className="w-6 h-6 text-[#2E7D32] group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-poppins font-black text-stone-900 tracking-tight mb-1">
                    {stat.val}
                  </div>
                  <div className="text-xs font-bold text-stone-500 leading-tight">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BOTTOM CORPORATE CALL TO ACTION
      ========================================================================= */}
      <section className="pb-20 lg:pb-[120px] px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto text-center">
        <div className="bg-[#1a3d1a] rounded-[32px] p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-[#81C784] font-poppins text-xs font-extrabold uppercase tracking-widest block">
              PARTNER WITH COCOVEERA
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-poppins font-black leading-tight">
              Ready to Order Container Substrates?
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-medium leading-relaxed">
              Connect with our international export desk for customized container quotes, EC/pH specifications, and shipping schedules.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 bg-[#4CAF50] hover:bg-[#388E3C] text-white font-poppins font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Connect with Shipping Desk</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoconutSubstrates;
