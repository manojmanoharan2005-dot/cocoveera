/**
 * File: frontend/src/pages/CoconutSubstrates.jsx
 * Purpose: Luxurious B2B Corporate Global Network & Distribution Page for Cocoveera.
 * Designed like premier international exporters (Sai Cocopeat, Maersk, Flexport, DP World, Olam Agri).
 */

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Anchor,
  ArrowRight,
  Sprout
} from 'lucide-react';
import { motion } from 'framer-motion';
import ExportShowcase from '../components/ExportShowcase';
import GlobalMap, { DESTINATIONS } from '../components/GlobalMap';
import SEO from '../components/SEO';

const CoconutSubstrates = () => {
  const [selectedDestId, setSelectedDestId] = useState('usa');
  const mapSectionRef = useRef(null);

  const handleSelectDestination = (dest) => {
    setSelectedDestId(dest.id);
  };

  const scrollToMap = () => {
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-stone-900 selection:bg-[#2E7D32]/20">
      <SEO
        title="Global Network & Distribution | Cocoveera"
        description="Cocoveera exports premium cocopeat and coir substrates to commercial growers and distribution partners across five continents."
        url="/substrates"
      />

      {/* =========================================================================
          HERO SECTION
      ========================================================================= */}
      <section className="relative w-full pt-6 pb-16 lg:pt-8 lg:pb-24 overflow-hidden bg-[#FAF9F6]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT / TOP CONTENT */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 space-y-6 sm:space-y-8 text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-bold tracking-widest uppercase">
                <Sprout className="w-3.5 h-3.5" />
                <span>SUPPLY CHAIN</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.1] tracking-tight">
                Global Network &<br />
                <span className="text-[#2E7D32]">Distribution</span>
              </h1>

              {/* Description */}
              <p className="text-stone-600 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-xl">
                Cocoveera exports premium cocopeat and coir substrates to commercial growers and distribution partners across five continents.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={scrollToMap}
                  className="w-full sm:w-auto bg-[#2E7D32] hover:bg-[#236327] text-white font-semibold text-base px-8 py-4 rounded-[20px] shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <span>Explore Export Network</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* RIGHT / BOTTOM HERO EXPORT SHOWCASE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-6 relative flex justify-center items-center"
            >
              <ExportShowcase />
            </motion.div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          GLOBAL SUPPLY CHAIN SECTION
          Title: Global Supply Chain Network
          Subtitle: Our Global Presence
          Legend: Green (Manufacturing HQ), Orange (Export Destinations)
          Heights: Desktop 650px, Laptop 550px, Mobile 320px
      ========================================================================= */}
      <section ref={mapSectionRef} className="py-12 lg:py-16 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        {/* Beautiful Dotted Vector Map */}
        <GlobalMap onSelectDestination={handleSelectDestination} activeDestId={selectedDestId} />
      </section>





      {/* =========================================================================
          FINAL CTA SECTION
          Dark green premium banner (#2E7D32)
          Growing Together, Shipping Globally
          Container background pattern, rounded corners
      ========================================================================= */}
      <section className="pb-16 lg:pb-[120px] px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="bg-[#2E7D32] rounded-[20px] p-10 sm:p-16 text-white relative overflow-hidden shadow-lg">
          {/* Subtle container background pattern opacity overlay */}
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80')`,
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Growing Together,<br />Shipping Globally
            </h2>
            <p className="text-white/90 text-sm sm:text-base font-normal leading-relaxed">
              Connect with our international export sales division for customized container pricing, product specifications, and direct FCL shipping schedules to your port.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 bg-white hover:bg-stone-100 text-[#2E7D32] font-bold text-base px-8 py-4 rounded-[20px] shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-5 h-5 text-[#2E7D32]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoconutSubstrates;
