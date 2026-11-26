/**
 * File: frontend/src/components/ExportShowcase.jsx
 * Purpose: Responsive Export Countries Showcase for Cocoveera.
 * Features an intelligent mobile-first single swipeable card carousel on mobile (< 768px)
 * and an Apple/Tesla-style interactive dual-row showcase on desktop (>= 768px).
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Anchor, Globe2 } from 'lucide-react';

const ROW_1_DATA = [
  {
    id: 'usa',
    code: 'US',
    country: 'USA',
    flag: '🇺🇸',
    port: 'Los Angeles Port',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'uk',
    code: 'GB',
    country: 'UK',
    flag: '🇬🇧',
    port: 'London Port',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'netherlands',
    code: 'NL',
    country: 'Netherlands',
    flag: '🇳🇱',
    port: 'Rotterdam Port',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'germany',
    code: 'DE',
    country: 'Germany',
    flag: '🇩🇪',
    port: 'Hamburg Port',
    image: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'spain',
    code: 'ES',
    country: 'Spain',
    flag: '🇪🇸',
    port: 'Valencia Port',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'uae',
    code: 'AE',
    country: 'UAE',
    flag: '🇦🇪',
    port: 'Jebel Ali Port',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
  },
];

const ROW_2_DATA = [
  {
    id: 'saudi',
    code: 'SA',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    port: 'Jeddah Port',
    image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'singapore',
    code: 'SG',
    country: 'Singapore',
    flag: '🇸🇬',
    port: 'Singapore Port',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'skorea',
    code: 'KR',
    country: 'South Korea',
    flag: '🇰🇷',
    port: 'Busan Port',
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'japan',
    code: 'JP',
    country: 'Japan',
    flag: '🇯🇵',
    port: 'Tokyo Port',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'australia',
    code: 'AU',
    country: 'Australia',
    flag: '🇦🇺',
    port: 'Melbourne Port',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vietnam',
    code: 'VN',
    country: 'Vietnam',
    flag: '🇻🇳',
    port: 'Hai Phong Port',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'nz',
    code: 'NZ',
    country: 'New Zealand',
    flag: '🇳🇿',
    port: 'Auckland Port',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80',
  },
];

const ALL_COUNTRIES = [...ROW_1_DATA, ...ROW_2_DATA];

const DesktopCountryCard = ({ item }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-[170px] sm:w-[180px] flex-shrink-0 bg-white rounded-[18px] border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group select-none cursor-pointer"
    >
      {/* Top Image + Flag Badge */}
      <div className="relative h-[110px] w-full overflow-hidden bg-stone-100">
        <img
          src={item.image}
          alt={item.country}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-800 flex items-center gap-1 shadow-xs border border-white/60">
          <span className="text-xs">{item.flag}</span>
          <span>{item.code} {item.country}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3">
        <h4 className="font-poppins font-extrabold text-stone-900 text-sm tracking-tight leading-snug">
          {item.country}
        </h4>
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mt-2">
          PRIMARY PORT
        </span>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 bg-stone-50 px-2 py-1 rounded-[10px] border border-stone-100 mt-1">
          <Anchor className="w-3 h-3 text-[#2E7D32] flex-shrink-0" />
          <span className="truncate">{item.port}</span>
        </div>
      </div>
    </motion.div>
  );
};

const ExportShowcase = () => {
  // Desktop state
  const [indexRow1, setIndexRow1] = useState(0);
  const [indexRow2, setIndexRow2] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mobile state
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const maxIndex1 = ROW_1_DATA.length - 4;
  const maxIndex2 = ROW_2_DATA.length - 4;

  // Desktop Auto-slide
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIndexRow1((prev) => (prev >= maxIndex1 ? 0 : prev + 1));
      setIndexRow2((prev) => (prev >= maxIndex2 ? 0 : prev + 1));
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex1, maxIndex2]);

  // Mobile Auto-slide
  useEffect(() => {
    if (isPaused) return;

    const mobileTimer = setInterval(() => {
      setMobileIndex((prev) => (prev >= ALL_COUNTRIES.length - 1 ? 0 : prev + 1));
    }, 3800);

    return () => clearInterval(mobileTimer);
  }, [isPaused]);

  // Desktop handlers
  const handleDesktopNext = () => {
    setIndexRow1((prev) => (prev >= maxIndex1 ? 0 : prev + 1));
    setIndexRow2((prev) => (prev >= maxIndex2 ? 0 : prev + 1));
  };

  const handleDesktopPrev = () => {
    setIndexRow1((prev) => (prev <= 0 ? maxIndex1 : prev - 1));
    setIndexRow2((prev) => (prev <= 0 ? maxIndex2 : prev - 1));
  };

  // Mobile navigation
  const handleMobileNext = () => {
    setMobileIndex((prev) => (prev >= ALL_COUNTRIES.length - 1 ? 0 : prev + 1));
  };

  const handleMobilePrev = () => {
    setMobileIndex((prev) => (prev <= 0 ? ALL_COUNTRIES.length - 1 : prev - 1));
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchEndXRef.current - touchStartXRef.current;
    if (diff > 45) {
      handleMobilePrev();
    } else if (diff < -45) {
      handleMobileNext();
    }
    setTimeout(() => setIsPaused(false), 2000);
  };

  const cardWidthWithGap = 194; // 180px width + 14px gap
  const currentMobileCountry = ALL_COUNTRIES[mobileIndex];

  return (
    <div className="w-full">
      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE CAROUSEL (< 768px): Polished, Single-Card Swipe Layout
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="block md:hidden relative w-full rounded-[24px] bg-white border border-stone-200/80 shadow-lg overflow-hidden p-4 select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Info Bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#2E7D32] text-[10px] font-bold tracking-wider uppercase">
            <Globe2 className="w-3 h-3 text-[#2E7D32]" />
            <span>GLOBAL DESTINATIONS</span>
          </div>
          <span className="text-[11px] font-bold text-stone-500">
            {mobileIndex + 1} / {ALL_COUNTRIES.length}
          </span>
        </div>

        {/* Swipeable Card Container */}
        <div className="relative w-full">
          {/* Navigation Chevron Buttons */}
          <button
            onClick={handleMobilePrev}
            aria-label="Previous Country"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow-md border border-stone-200 flex items-center justify-center text-stone-700 hover:text-[#2E7D32] active:scale-90 transition-all z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleMobileNext}
            aria-label="Next Country"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow-md border border-stone-200 flex items-center justify-center text-stone-700 hover:text-[#2E7D32] active:scale-90 transition-all z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Animated Active Card */}
          <div className="w-full max-w-[340px] mx-auto bg-stone-50/60 rounded-[20px] border border-stone-200/90 overflow-hidden shadow-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMobileCountry.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full"
              >
                {/* Hero Port Image */}
                <div className="relative h-[160px] xs:h-[180px] w-full overflow-hidden bg-stone-100">
                  <img
                    src={currentMobileCountry.image}
                    alt={currentMobileCountry.country}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Flag & Country Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-stone-900 flex items-center gap-1.5 shadow-md border border-white/70">
                    <span className="text-base">{currentMobileCountry.flag}</span>
                    <span>{currentMobileCountry.code}</span>
                    <span className="text-stone-300">|</span>
                    <span>{currentMobileCountry.country}</span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-poppins font-black text-stone-900 text-lg tracking-tight">
                      {currentMobileCountry.country}
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      DIRECT ROUTE
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mt-2.5">
                    PRIMARY DESTINATION PORT
                  </span>

                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200/80 mt-1.5">
                    <Anchor className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span className="truncate">{currentMobileCountry.port}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Dynamic Indicator Dots */}
        <div className="flex items-center justify-center gap-1 mt-4 px-2 overflow-x-auto hide-scrollbar">
          {ALL_COUNTRIES.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => setMobileIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                mobileIndex === idx
                  ? 'w-5 h-1.5 bg-[#2E7D32]'
                  : 'w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP DUAL-ROW SHOWCASE (>= 768px): Preserved Exact Layout
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="hidden md:block relative w-full rounded-[28px] bg-white border border-stone-200/80 shadow-xl overflow-hidden p-4 sm:p-6"
      >
        {/* Subtle Side Fade Gradients */}
        <div className="absolute top-0 bottom-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />

        {/* Floating Navigation Controls */}
        <button
          onClick={handleDesktopPrev}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl border border-stone-200 flex items-center justify-center text-stone-700 hover:text-[#2E7D32] hover:scale-110 active:scale-95 transition-all duration-300 z-30 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleDesktopNext}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl border border-stone-200 flex items-center justify-center text-stone-700 hover:text-[#2E7D32] hover:scale-110 active:scale-95 transition-all duration-300 z-30 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* TOP ROW CAROUSEL */}
        <div className="relative overflow-hidden py-2 px-1">
          <motion.div
            animate={{ x: -(indexRow1 * cardWidthWithGap) }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-3.5"
          >
            {ROW_1_DATA.map((item) => (
              <DesktopCountryCard key={item.id} item={item} />
            ))}
          </motion.div>

          {/* Row 1 Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3 mb-4">
            {Array.from({ length: maxIndex1 + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndexRow1(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  indexRow1 === idx
                    ? 'w-6 bg-[#2E7D32]'
                    : 'w-2 bg-stone-200 hover:bg-stone-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM ROW CAROUSEL */}
        <div className="relative overflow-hidden py-2 px-1">
          <motion.div
            animate={{ x: -(indexRow2 * cardWidthWithGap) }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-3.5"
          >
            {ROW_2_DATA.map((item) => (
              <DesktopCountryCard key={item.id} item={item} />
            ))}
          </motion.div>

          {/* Row 2 Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {Array.from({ length: maxIndex2 + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndexRow2(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  indexRow2 === idx
                    ? 'w-6 bg-[#2E7D32]'
                    : 'w-2 bg-stone-200 hover:bg-stone-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportShowcase;
