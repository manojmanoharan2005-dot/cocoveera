/**
 * File: frontend/src/pages/Home.jsx
 * Purpose: React page component representing the Home view.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/config';
import useSWR from 'swr';
import LazyVideo from '../components/LazyVideo';
import ImageWithFallback from '../components/common/ImageWithFallback';
import SEO from '../components/SEO';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Star,
  Award,
  Globe2,
  Truck,
  Leaf,
  ShieldCheck,
  FlaskConical,
  Package,
  Users,
  CheckCircle2,
  Play,
  X,
  Quote,
  MapPin,
  ExternalLink,
  Droplets,
  Zap,
  ThermometerSun,
  Activity,
  Layers,
  Lock,
} from 'lucide-react';
import GlobalMap from '../components/GlobalMap';

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

// ─── Counter Animation Hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 2000, startWhen = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startWhen]);
  return count;
}

// ─── StatCounter Component ─────────────────────────────────────────────────────
function StatCounter({ value, suffix, label, icon: Icon, started }) {
  const num = useCountUp(value, 1800, started);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-3xl font-poppins font-extrabold text-stone-900">
        {num}{suffix}
      </div>
      <div className="text-xs text-stone-500 font-medium mt-1">{label}</div>
    </div>
  );
}

// ─── Products Data ─────────────────────────────────────────────────────────────
const products = [
  {
    name: 'Coco Peat Blocks',
    tag: 'BEST SELLER',
    desc: 'Highly compressed low-EC blocks ideal for hydroponics, greenhouses and nurseries. Expands 8x on wetting.',
    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
    link: '/products',
  },
  {
    name: 'Grow Bags',
    tag: 'NEW PRODUCT',
    desc: 'High-quality grow bags for hydroponics and greenhouse cultivation with optimal air-to-water ratio.',
    img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80',
    link: '/products',
  },
  {
    name: 'Coco Chips',
    tag: '',
    desc: 'Best-quality coco chips for excellent drainage and moisture retention. Ideal for orchids and aeroponics.',
    img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
    link: '/products',
  },
  {
    name: 'Coir Pith',
    tag: '',
    desc: 'Fine quality coir pith with low EC and superior conditioning. Perfect for soil conditioning and mulching.',
    img: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=80',
    link: '/products',
  },
  {
    name: 'Coco Husk Chips',
    tag: '',
    desc: 'Premium coco husk chips for landscaping and growing media. Excellent water retention and aeration.',
    img: 'https://images.unsplash.com/photo-1444664597500-035db93e2323?auto=format&fit=crop&w=400&q=80',
    link: '/products',
  },
];

// ─── Why Choose Features ───────────────────────────────────────────────────────
const whyFeatures = [
  { icon: Award, title: 'Quality Assured', desc: 'Rigorous testing standards ensure premium quality at every batch.' },
  { icon: Leaf, title: 'Eco Friendly', desc: '100% natural coconut byproducts – sustainable and eco-certified.' },
  { icon: Truck, title: 'Global Shipping', desc: 'Seamless worldwide logistics with port-to-port container delivery.' },
  { icon: ShieldCheck, title: 'Certified Company', desc: 'ISO certified exporter with international trade compliance.' },
  { icon: Users, title: 'Trusted Globally', desc: 'Over 50+ happy customers across 15+ countries worldwide.' },
];

// ─── Quality Tests ─────────────────────────────────────────────────────────────
const qualityTests = [
  {
    name: 'pH Testing',
    icon: Activity,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    range: '5.5 – 6.8',
    desc: 'Precise pH measurement ensuring optimal nutrient uptake for all growing applications.',
  },
  {
    name: 'EC Testing',
    icon: Zap,
    img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=300&q=80',
    range: '< 0.5 mS/cm',
    desc: 'Low electrical conductivity testing to prevent salt damage in sensitive crops.',
  },
  {
    name: 'Moisture Testing',
    icon: Droplets,
    img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=300&q=80',
    range: '< 20%',
    desc: 'Controlled moisture levels for safe shipping and consistent product performance.',
  },
  {
    name: 'Wettability',
    icon: ThermometerSun,
    img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=300&q=80',
    range: '< 60 sec',
    desc: 'Rapid water absorption rate ensuring fast rehydration in growing operations.',
  },
  {
    name: 'Porosity',
    icon: Layers,
    img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=300&q=80',
    range: '> 65%',
    desc: 'High air-filled porosity index for optimal root zone oxygenation and drainage.',
  },
];

// ─── Production Steps ──────────────────────────────────────────────────────────
const productionSteps = [
  {
    num: '01',
    icon: Leaf,
    title: 'Raw Material Collection',
    desc: 'Fresh coconut husks are sourced from certified plantations across South India.',
  },
  {
    num: '02',
    icon: Droplets,
    title: 'Washing & Processing',
    desc: 'Multiple freshwater washing cycles reduce salt content and achieve target EC levels.',
  },
  {
    num: '03',
    icon: Package,
    title: 'Compression',
    desc: 'Processed coir is compressed into standard blocks, grow bags, and custom formats.',
  },
  {
    num: '04',
    icon: FlaskConical,
    title: 'Quality Testing',
    desc: 'Each batch is lab-tested for pH, EC, moisture, and wettability before dispatch.',
  },
  {
    num: '05',
    icon: Layers,
    title: 'Packaging',
    desc: 'Products are packaged in UV-resistant polypropylene bags or bulk bale formats.',
  },
  {
    num: '06',
    icon: Truck,
    title: 'Export',
    desc: 'Containerized shipments dispatched from Coimbatore to 15+ countries worldwide.',
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "Cocoveera's coco peat quality is simply outstanding. Our plants have shown remarkable growth with their buffered substrates.",
    author: 'John Williams',
    location: 'USA',
    rating: 4.8,
  },
  {
    quote: 'Reliable quality, timely delivery and great support. Highly recommended for all serious greenhouse operators.',
    author: 'Maria Gonzalez',
    location: 'Spain',
    rating: 4.2,
  },
  {
    quote: 'We have been importing from Cocoveera for years. Fully and professional team, consistent quality every shipment.',
    author: 'David Müller',
    location: 'Germany',
    rating: 3.8,
  },
  {
    quote: 'The most consistent coconut products we have ever used. Our middle have never looked better after switching.',
    author: 'Ahmed Al Mansoori',
    location: 'UAE',
    rating: 4.6,
  },
];

// ─── Fetcher for SWR ────────────────────────────────────────────────────────
const fetcher = url => axios.get(url).then(res => res.data.data);

// ─── Helper: Optimize Cloudinary Image ──────────────────────────────────────
const optimizeImage = (url) => {
  if (!url) return '';
  // Inject transformation if it's a cloudinary URL and doesn't already have one
  if (url.includes('cloudinary.com') && !url.includes('/upload/f_auto,q_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
  }
  return url;
};

// ─── Home Component ────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const yHeroImage = useTransform(scrollY, [0, 1000], [0, 150]);
  const yHeroText = useTransform(scrollY, [0, 1000], [0, -100]);

  const [statsStarted, setStatsStarted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef = useRef(null);
  const productRef = useRef(null);

  // Hero Video States & Ref
  const [heroVideoError, setHeroVideoError] = useState(false);
  const [heroVideoLoaded, setHeroVideoLoaded] = useState(false);
  const [shouldLoadHeroVideo, setShouldLoadHeroVideo] = useState(false);
  const heroVideoContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadHeroVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    const currentContainer = heroVideoContainerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.disconnect();
      }
    };
  }, []);

  const { data: dbCategories = [], isLoading } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 600000 }
  );

  const sortedCategories = dbCategories;



  // Intersection observer for stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const scrollProducts = (dir) => {
    const el = productRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  // Auto-scroll products
  useEffect(() => {
    const interval = setInterval(() => {
      const el = productRef.current;
      if (!el) return;
      
      // If we've reached the end, scroll back to 0
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cocoveera",
    "url": "https://cocoveera.com",
    "logo": "https://cocoveera.com/favicon.webp",
    "description": "Premium organic coconut substrates, Coir peat blocks, Grow bags, and Coco Briquettes for bulk global export."
  };

  return (
    <div className="bg-white overflow-hidden">
      <SEO 
        title="Home"
        url="/"
        schema={orgSchema}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO — Premium Floating Video Card Canvas
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="pt-2 sm:pt-4 bg-white">
        <section 
          style={{ height: 'clamp(420px, 65vh, 720px)', minHeight: '420px', maxHeight: '720px' }}
          className="relative mx-3 sm:mx-5 lg:mx-[20px] xl:mx-auto xl:max-w-[calc(100%-40px)] mt-[18px] mb-6 rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] overflow-hidden bg-stone-100 shadow-md border border-stone-200/60 flex items-center justify-center"
        >
          
          {/* ── 1. HIGH-DEFINITION BACKGROUND VIDEO & INSTANT IMAGE LAYER ── */}
          <div ref={heroVideoContainerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none flex items-center justify-center">
            {/* Instant Background Image Layer */}
            <img
              src="/hero-product.webp"
              alt="Cocoveera Products"
              style={{
                objectPosition: 'center 42%',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                filter: 'brightness(1.05) contrast(1.12) saturate(1.15)'
              }}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {!heroVideoError && (
              <motion.video
                style={{
                  objectPosition: 'center 42%',
                  imageRendering: 'auto',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  filter: 'brightness(1.05) contrast(1.12) saturate(1.15)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: heroVideoLoaded ? 1 : 0 }}
                transition={{ opacity: { duration: 0.4, ease: "easeOut" } }}
                src="/company-trail-video.mp4"
                poster="/hero-product.webp"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setHeroVideoLoaded(true)}
                onCanPlay={() => setHeroVideoLoaded(true)}
                onError={() => setHeroVideoError(true)}
                ref={(el) => {
                  if (el && el.paused) {
                    el.play().catch(() => {});
                  }
                }}
                onTimeUpdate={(e) => {
                  const video = e.target;
                  if (video.duration > 0 && video.currentTime >= video.duration - 0.25) {
                    video.currentTime = 0.1;
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}
          </div>

          {/* ── 2. ULTRA-SUBTLE ULTRA-CLEAR GRADIENT OVERLAY (70% REDUCED HAZE) ── */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 15%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0) 60%)'
            }}
          />

          {/* ── 3. FLOATING EXPERIENCE BADGE ── */}
          <div 
            style={{ boxShadow: '0 18px 40px rgba(0,0,0,0.25)' }}
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[150px] md:h-[150px] bg-[#2E7D32] text-white rounded-[18px] sm:rounded-[20px] border-2 border-white flex flex-col items-center justify-center text-center p-2.5 sm:p-3 z-30 transition-all duration-300 hover:-translate-y-1.5 cursor-default select-none pointer-events-auto"
          >
            <span className="font-poppins font-extrabold text-[38px] sm:text-[46px] md:text-[50px] leading-none tracking-tight text-white mb-0.5">
              +2
            </span>
            <span className="text-[10px] sm:text-[11px] md:text-[12px] font-semibold tracking-wide text-white/90 leading-tight uppercase">
              Years of
            </span>
            <span className="text-[12px] sm:text-[13px] md:text-[14px] font-extrabold tracking-wide text-white leading-tight uppercase">
              Excellence
            </span>
          </div>
        </section>
      </div>

      {/* ── FEATURE CARDS STRIP BELOW HERO ── */}
      <section className="bg-white border-b border-stone-200 py-6 sm:py-8 px-6 sm:px-10 lg:px-16 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: '100% Natural', sub: 'Eco-Friendly' },
            { label: 'Strict Quality', sub: 'Assurance' },
            { label: 'Global Shipping', sub: 'Worldwide' },
            { label: 'Sustainable', sub: 'Future' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-stone-50/90 p-3.5 rounded-xl border border-stone-200/70 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-stone-800">{b.label}</div>
                <div className="text-[10px] sm:text-xs text-stone-500 font-medium">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: OUR PRODUCTS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest block mb-2">OUR PRODUCTS</span>
              <h2 className="text-4xl font-poppins font-extrabold text-stone-900">
                High Quality Coco<br />Products For Every Need
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 border border-stone-200 hover:border-primary hover:text-primary text-stone-600 font-poppins text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              VIEW ALL PRODUCTS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Scrollable Products Carousel */}
          <div className="relative">
            <div
              ref={productRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none' }}
            >
              {isLoading ? (
                // Skeleton Loaders
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skel-${i}`} className="w-[85vw] xs:w-[75vw] sm:w-[260px] md:w-[280px] snap-start bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-soft flex-shrink-0 flex flex-col">
                    <div className="h-48 w-full bg-stone-200 animate-pulse"></div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="h-4 bg-stone-200 animate-pulse rounded w-2/3 mb-4"></div>
                      <div className="h-3 bg-stone-200 animate-pulse rounded w-full mb-2"></div>
                      <div className="h-3 bg-stone-200 animate-pulse rounded w-4/5 mb-4"></div>
                      <div className="mt-auto h-4 bg-stone-200 animate-pulse rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : sortedCategories.map((dbCat, i) => {
                const displayImg = optimizeImage(dbCat.image);
                const link = `/products?category=${encodeURIComponent(dbCat.name)}`;
                const desc = dbCat.description || `Explore our premium range of ${dbCat.name} engineered for global growers.`;
                
                return (
                  <motion.div
                    key={dbCat._id || i}
                    onClick={() => navigate(link)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(link);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.5 }}
                    whileHover={{ y: -8, scale: 1.02, rotateX: 2, rotateY: -2, boxShadow: "0 0 40px rgba(46,125,50,0.25)" }}
                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                    className="w-[85vw] xs:w-[75vw] sm:w-[260px] md:w-[280px] snap-start bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-soft transition-all duration-300 group flex-shrink-0 flex flex-col relative cursor-pointer"
                  >
                    {/* Glass reflection highlight */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
                    <div className="relative h-48 w-full overflow-hidden flex items-center justify-center p-3 bg-stone-50 flex-shrink-0">
                      <div className="h-full aspect-square rounded-[1.5rem] overflow-hidden flex items-center justify-center relative">
                        <ImageWithFallback 
                          src={displayImg} 
                          alt={dbCat.name} 
                          className="w-full h-full object-contain mix-blend-multiply brightness-[1.05] contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {dbCat.tag && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                          {dbCat.tag}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-poppins font-bold text-stone-900 text-sm mb-2 leading-tight">{dbCat.name}</h3>
                      <p className="text-stone-500 text-xs leading-relaxed mb-4 flex-grow line-clamp-3">{desc}</p>
                      <div
                        className="inline-flex items-center gap-1 text-primary font-bold text-xs group-hover:gap-2 transition-all duration-200 mt-auto"
                      >
                        VIEW CATEGORY <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => scrollProducts(-1)}
              className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollProducts(1)}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: ABOUT / ROOTED IN NATURE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 sm:px-6 bg-accent overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Left: image with play button */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <LazyVideo 
              src="/company-trail-video.mp4"
              poster="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=700&q=80"
              className="rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-[4/3] w-full"
              muted
              loop
              autoPlay
              playsInline
            />
            {/* Floating Experience Badge */}
            <div 
              style={{ boxShadow: '0 18px 40px rgba(0,0,0,0.18)' }}
              className="absolute -bottom-[25px] -right-[25px] w-[150px] h-[150px] bg-[#2E7D32] text-white rounded-[20px] border-2 border-white flex flex-col items-center justify-center text-center p-3 z-20 transition-all duration-300 hover:-translate-y-1.5 cursor-default select-none"
            >
              <span className="font-poppins font-extrabold text-[50px] leading-none tracking-tight text-white mb-0.5">
                +2
              </span>
              <span className="text-[12px] font-semibold tracking-wide text-white/90 leading-tight uppercase">
                Years of
              </span>
              <span className="text-[14px] font-extrabold tracking-wide text-white leading-tight uppercase">
                Excellence
              </span>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              WHO WE ARE
            </span>
            <h2 className="text-4xl font-poppins font-extrabold text-stone-900 leading-tight">
              Rooted In Nature,<br />
              <span className="text-primary">Growing A Better</span> Tomorrow
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Cocoveera is a global substrate manufacturer and exporter committed to providing premium quality, sustainable and eco-friendly growing solutions to farmers and businesses around the world.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
              {[
                { icon: Award, label: 'Premium Quality' },
                { icon: Leaf, label: 'Sustainable Practice' },
                { icon: Globe2, label: 'Global Production' },
                { icon: ShieldCheck, label: 'Sustainable Living' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-soft">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-stone-800">{f.label}</span>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-poppins text-sm font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg mt-4"
            >
              KNOW MORE ABOUT US <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: GLOBAL NETWORK (GLOBAL SUPPLY CHAIN)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto">
          <GlobalMap />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: STATS BAR (COMPANY STATISTICS)
      ═══════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="bg-white border-y border-stone-100 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <StatCounter value={15} suffix="+" label="Countries Served" icon={Globe2} started={statsStarted} />
            <StatCounter value={50} suffix="+" label="Happy Customers" icon={Users} started={statsStarted} />
            <StatCounter value={80} suffix="+" label="Shipments Delivered" icon={Truck} started={statsStarted} />
            <StatCounter value={99} suffix="%" label="Quality Consistency" icon={Award} started={statsStarted} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: WHY CHOOSE COCOVEERA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 sm:px-6 bg-accent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest block mb-2">WHY CHOOSE</span>
            <h2 className="text-4xl font-poppins font-extrabold text-stone-900">Why Choose COCOVEERA?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {whyFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 text-center shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 border border-stone-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-poppins font-bold text-stone-900 text-sm mb-2">{f.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: QUALITY TESTING (LOCKED PREVIEW / COMING SOON)
      ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: QUALITY TESTING (LOCKED PREVIEW / COMING SOON)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 sm:px-6 bg-white relative overflow-hidden group cursor-not-allowed select-none">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden">
          
          {/* UNDERLYING SECTION CONTENT (INACTIVE & 90% VISIBLE WITH LIGHT 2.5px BLUR) */}
          <div 
            style={{ filter: 'blur(2.5px) saturate(0.95)', opacity: 0.9 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center pointer-events-none select-none"
          >
            {/* Left: Content */}
            <div className="space-y-6">
              <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest block">QUALITY TESTING</span>
              <h2 className="text-4xl font-poppins font-extrabold text-stone-900 leading-tight">
                Tested. Verified.<br />
                <span className="text-primary">Trusted Worldwide.</span>
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed max-w-md">
                Every batch undergoes rigorous quality testing in our state-of-the-art laboratory to meet international standards and deliver consistency.
              </p>
              {/* Test type pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                {qualityTests.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-accent border border-stone-200 rounded-full px-4 py-2">
                    <t.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-stone-700">{t.name}</span>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{t.range}</span>
                  </div>
                ))}
              </div>
              {/* Disabled View Test Reports button (preserved & pointer-events-none) */}
              <button
                disabled
                aria-disabled="true"
                tabIndex={-1}
                className="inline-flex items-center gap-2 bg-primary text-white font-poppins text-sm font-bold px-6 py-3 rounded-xl shadow-lg opacity-75 cursor-not-allowed pointer-events-none"
              >
                VIEW TEST REPORTS <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Test images grid */}
            <div className="grid grid-cols-3 gap-3">
              {qualityTests.slice(0, 5).map((t, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl overflow-hidden ${i === 0 ? 'col-span-2 row-span-1' : ''}`}
                >
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div>
                      <div className="text-white font-bold text-xs">{t.name}</div>
                      <div className="text-white/70 text-[10px]">Testing</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ELEGANT & MINIMAL FLOATING LOCK OVERLAY */}
          <div className="absolute inset-0 bg-white/[0.12] backdrop-blur-[2px] rounded-3xl flex items-center justify-center p-4 z-20 cursor-not-allowed">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center text-center space-y-2 pointer-events-none select-none"
            >
              {/* Floating Green Lock Circle */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-12 h-12 bg-[#2E7D32] text-white rounded-full flex items-center justify-center shadow-xl shadow-green-900/30 border-2 border-white/80"
              >
                <Lock className="w-5 h-5 text-white" />
              </motion.div>

              {/* Gentle Pulsing COMING SOON Label */}
              <motion.div
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="text-[#2E7D32] font-poppins font-black text-xs sm:text-sm tracking-[0.2em] uppercase pt-1"
              >
                COMING SOON
              </motion.div>

              {/* Small Subtitle */}
              <p className="text-stone-800 font-poppins font-bold text-xs sm:text-sm tracking-tight opacity-90 drop-shadow-xs">
                Quality Testing Portal
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8: PRODUCTION PROCESS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 sm:px-6 bg-accent border-t border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest block mb-2">OUR PRODUCTION PROCESS</span>
            <h2 className="text-4xl font-poppins font-extrabold text-stone-900">
              From Nature To<br />Your Success
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-4 relative">
            {/* Connecting line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden lg:block" />

            {productionSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative w-24 h-24 rounded-2xl bg-white border-2 border-primary/20 shadow-soft flex flex-col items-center justify-center mb-4 hover:border-primary hover:shadow-premium transition-all duration-300 z-10">
                  <step.icon className="w-8 h-8 text-primary mb-1" />
                  <span className="text-[10px] font-bold text-primary">{step.num}</span>
                </div>
                <h4 className="font-poppins font-bold text-stone-800 text-xs mb-1 leading-tight">{step.title}</h4>
                <p className="text-stone-500 text-[10px] leading-relaxed hidden md:block">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 9: CONTAINER / LOADING SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-0 bg-[#1a3d1a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6BBE45_1px,transparent_1px)] [background-size:30px_30px]" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-5"
          >
            <span className="text-primary-light font-poppins text-xs font-bold uppercase tracking-widest">CONTAINER LOADING CAPACITY</span>
            <h2 className="text-4xl font-poppins font-extrabold text-white leading-tight">
              Optimized Loading.<br />
              <span className="text-primary-light">Trusted Worldwide</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              We ensure maximum loading optimization and value for every container with efficient loading for best effective shipping.
            </p>
          </motion.div>

          {/* Right: Container cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {/* 20FT Container */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="text-primary-light font-poppins font-extrabold text-lg mb-1">20FT CONTAINER</div>
              <div className="text-white/60 text-xs mb-4 font-medium">Standard Shipping</div>
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-white/70 text-xs">Load Capacity</span>
                  <span className="text-primary-light font-bold text-xs">85%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-light w-[85%] rounded-full" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-white/70">
                <div className="flex justify-between"><span>Load Capacity</span><span className="text-white font-bold">16–18 Tons</span></div>
                <div className="flex justify-between"><span>Avg Pallets</span><span className="text-white font-bold">9–11 Units</span></div>
              </div>
            </div>

            {/* 40FT Container */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="text-primary-light font-poppins font-extrabold text-lg mb-1">40FT CONTAINER</div>
              <div className="text-white/60 text-xs mb-4 font-medium">High Volume Shipping</div>
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-white/70 text-xs">Load Capacity</span>
                  <span className="text-primary-light font-bold text-xs">92%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-light w-[92%] rounded-full" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-white/70">
                <div className="flex justify-between"><span>Load Capacity</span><span className="text-white font-bold">18–22 Tons</span></div>
                <div className="flex justify-between"><span>Avg Pallets</span><span className="text-white font-bold">18–22 Units</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 10: TESTIMONIALS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 px-5 sm:px-6 bg-accent border-t border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`bg-white rounded-2xl p-6 border shadow-soft hover:shadow-premium transition-all duration-300 ${
                  activeTestimonial === i ? 'border-primary shadow-premium' : 'border-stone-200'
                }`}
              >
                {/* Stars & Rating Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5 items-center">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFull = t.rating >= star;
                      const isHalf = !isFull && t.rating >= star - 0.5;
                      return (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            isFull
                              ? 'fill-amber-400 text-amber-400'
                              : isHalf
                              ? 'fill-amber-400/50 text-amber-400'
                              : 'fill-stone-200 text-stone-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                    {t.rating.toFixed(1)}
                  </span>
                </div>
                {/* Quote */}
                <p className="text-stone-600 text-xs leading-relaxed italic mb-5">
                  "{t.quote}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{t.author}</div>
                    <div className="text-[10px] text-stone-500 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {t.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 11: CTA BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 px-5 sm:px-6 bg-gradient-to-br from-primary via-primary to-[#1B5E20] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />

        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-5 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary-light text-xs font-bold uppercase tracking-widest mb-3">READY TO PARTNER WITH US?</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-extrabold text-white leading-tight">
              Ready To Grow Together?
            </h2>
            <p className="text-white/75 text-sm leading-relaxed mt-4 max-w-xl mx-auto">
              Let's build a sustainable future with premium coconut coir substrates. Contact our export team today.
            </p>
          </motion.div>
          <div className="flex justify-center pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-stone-50 font-poppins text-sm font-bold px-8 py-3.5 rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              CONTACT US <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
