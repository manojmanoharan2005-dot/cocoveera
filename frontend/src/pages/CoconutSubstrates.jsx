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
  Download,
  ArrowUpRight,
  Sprout
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlobalMap, { DESTINATIONS } from '../components/GlobalMap';
import SEO from '../components/SEO';
import { useEffect } from 'react';

const CoconutSubstrates = () => {
  const [selectedDestId, setSelectedDestId] = useState('usa');
  const mapSectionRef = useRef(null);

  // Hero Video States & Ref
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    const currentRef = videoContainerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, []);

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
          Desktop & Laptop: Split Layout
          Mobile: Stack vertically (Heading -> Description -> Buttons -> Hero image with product bag overlap)
      ========================================================================= */}
      <section className="relative w-full pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-[#FAF9F6]">
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

                <a
                  href="/cocoveera-brochure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-base px-8 py-4 rounded-[20px] shadow-sm transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Download Brochure</span>
                  <Download className="w-5 h-5 text-[#2E7D32]" />
                </a>
              </div>
            </motion.div>

            {/* RIGHT / BOTTOM HERO VISUAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-6 relative flex justify-center items-center"
            >
              <div className="relative w-full max-w-2xl rounded-[20px] overflow-hidden shadow-md border border-stone-200/80 bg-white">
                {/* Large container ship video with fallback image */}
                <div ref={videoContainerRef} className="relative h-[320px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden p-3 flex items-center justify-center">
                  {!videoError ? (
                    <motion.video
                      style={{
                        filter: 'brightness(1.05) contrast(1.08) saturate(1.05)',
                        maskImage: 'radial-gradient(ellipse 92% 92% at 50% 50%, black 75%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 92% 92% at 50% 50%, black 75%, transparent 100%)',
                      }}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ 
                        opacity: isVideoLoaded ? 1 : 0,
                        y: [0, -7, 0]
                      }}
                      transition={{ 
                        opacity: { duration: 0.8, ease: "easeOut" },
                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                      }}
                      src={shouldLoadVideo ? "/company-trail-video.mp4" : undefined}
                      poster="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      onLoadedData={() => setIsVideoLoaded(true)}
                      onError={() => setVideoError(true)}
                      onTimeUpdate={(e) => {
                        const video = e.target;
                        if (video.duration > 0 && video.currentTime >= video.duration - 0.25) {
                          video.currentTime = 0.1;
                        }
                      }}
                      className="w-full h-full object-cover rounded-[16px] pointer-events-none shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
                      alt="Cocoveera Container Ship & Shipping Containers"
                      className="w-full h-full object-cover rounded-[16px]"
                    />
                  )}
                  {/* Soft white overlay with natural lighting */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent pointer-events-none" />
                </div>

                {/* Premium Cocoveera Grow Bag Floating / Overlapping slightly */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-44 sm:w-56 lg:w-64 bg-white/95 backdrop-blur-md rounded-[20px] p-4 shadow-lg border border-stone-100 flex flex-col items-center text-center"
                >
                  <div className="w-full h-32 sm:h-40 rounded-[14px] overflow-hidden mb-3 bg-stone-100 flex items-center justify-center">
                    <img
                      src="/hero-product.webp"
                      alt="Premium Cocoveera Grow Bag"
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#2E7D32] tracking-wider uppercase mb-0.5">
                    Cocoveera Grow Bag
                  </span>
                  <p className="text-[11px] text-stone-500 font-medium">100% Organic Substrate</p>
                </motion.div>
              </div>
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
      <section ref={mapSectionRef} className="py-16 lg:py-[120px] px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            {/* Small subtitle */}
            <span className="text-[#2E7D32] text-xs font-bold uppercase tracking-widest block mb-2">
              Our Global Presence
            </span>
            {/* Large title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight">
              Global Supply Chain Network
            </h2>
          </div>

          {/* Legend - hidden on mobile screens below 768px */}
          <div className="hidden md:flex items-center gap-6 bg-white px-5 py-3 rounded-[20px] border border-stone-200/80 shadow-sm text-xs font-semibold text-stone-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2E7D32] animate-pulse" />
              <span>Manufacturing HQ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span>Export Destinations</span>
            </div>
          </div>
        </div>

        {/* Beautiful Dotted Vector Map */}
        <GlobalMap onSelectDestination={handleSelectDestination} activeDestId={selectedDestId} />
      </section>


      {/* =========================================================================
          EXPORT DESTINATIONS SECTION
          Responsive Grid:
          • Desktop (1440px+): 5 cards in row
          • Laptop (1025px–1439px): 3 cards in row
          • Tablet (768px–1024px): 2 cards in row
          • Mobile (360px–767px): Horizontal swipe
      ========================================================================= */}
      <section className="pb-16 lg:pb-[120px] px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#2E7D32] text-xs font-bold uppercase tracking-widest block mb-1">
              EXPORT DESTINATIONS
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Primary International Hubs
            </h3>
          </div>
        </div>

        {/* Grid for Tablet/Laptop/Desktop, Horizontal Scroll on Mobile */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory">
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestId === dest.id;

            return (
              <motion.div
                key={`card-${dest.id}`}
                onClick={() => setSelectedDestId(dest.id)}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`group min-w-[280px] md:min-w-0 flex-shrink-0 md:flex-shrink rounded-[20px] p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between snap-start ${
                  isSelected
                    ? 'bg-white border-[#2E7D32] shadow-md ring-2 ring-[#2E7D32]/20'
                    : 'bg-white border-stone-200/80 hover:border-stone-300 hover:shadow-lg'
                }`}
              >
                <div className="space-y-4">
                  {/* Country Image with 16:9 aspect ratio & 1.08x smooth scale */}
                  <div className="w-full aspect-[16/9] rounded-[14px] overflow-hidden bg-stone-100 relative shadow-inner">
                    <img
                      src={dest.image}
                      alt={dest.country}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08] group-hover:brightness-105"
                      loading="lazy"
                    />
                    {/* Soft Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent pointer-events-none" />

                    {/* Floating Glassmorphism Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold text-stone-900 shadow-sm flex items-center gap-1.5 border border-white/40">
                      <span>{dest.flag}</span>
                      <span>{dest.country}</span>
                    </div>
                  </div>

                  {/* Country Title */}
                  <h4 className="font-extrabold text-stone-900 text-lg flex items-center justify-between">
                    <span>{dest.country}</span>
                  </h4>

                  {/* Primary Port */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      Primary Port
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 bg-[#FAF9F6] p-2.5 rounded-[12px] border border-stone-100">
                      <Anchor className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
                      <span>{dest.port}</span>
                    </div>
                  </div>
                </div>

                {/* View Details Link */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#2E7D32]">
                  <span>View Details</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
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
