import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

// --- Premium Design Tokens ---
const colors = {
  primary: '#2E7D32',
  dark: '#1B5E20',
  light: '#A5D6A7',
  gold: '#D4AF37',
  sunlight: '#FFD54F',
  earth: '#8D6E63',
  ocean: '#0277BD',
  sky: '#81D4FA'
};

const sceneTimings = [
  2500, // 0: Welcome (2.5s)
  3500, // 1: Farm (3.5s)
  3000, // 2: Manufacturing (3s)
  3000, // 3: Transportation (3s)
  3500, // 4: Ocean (3.5s)
  3000, // 5: Delivery (3s)
  0,    // 6: Final
];

const backgrounds = [
  'bg-[#F8F9FA]', // 0: Welcome (Creamy white)
  'bg-gradient-to-b from-[#4FC3F7] via-[#81D4FA] to-[#A5D6A7]', // 1: Farm (Sunrise Sky to Grass)
  'bg-gradient-to-br from-[#ECEFF1] to-[#CFD8DC]', // 2: Factory (Metallic grey)
  'bg-gradient-to-b from-[#81D4FA] via-[#B3E5FC] to-[#78909C]', // 3: Transport (Day sky to asphalt)
  'bg-gradient-to-b from-[#FFB74D] via-[#FF8A65] to-[#0288D1]', // 4: Ocean (Sunset to deep ocean)
  'bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]', // 5: Delivery (Fresh greenhouse)
  'bg-[#F8F9FA]', // 6: Final
];

const variants = {
  enter: { opacity: 0, scale: 1.05, filter: 'blur(15px)' },
  center: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, filter: 'blur(15px)', transition: { duration: 0.8, ease: [0.7, 0, 0.84, 0] } },
};

// ==========================================
// REUSABLE HIGH-QUALITY SVGS & COMPONENTS
// ==========================================

const Logo = ({ className }) => (
  <img src="/logo.webp" alt="Cocoveera Logo" className={className} />
);

const PremiumCheckmark = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(46,125,50,0.4)]">
    <defs>
      <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4CAF50" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#checkGrad)" strokeWidth="6" strokeDasharray="283" strokeDashoffset="283" opacity="0.2" />
    <motion.circle 
      cx="50" cy="50" r="45" fill="none" stroke="url(#checkGrad)" strokeWidth="6" 
      initial={{ strokeDashoffset: 283 }} 
      animate={{ strokeDashoffset: 0 }} 
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
    />
    <motion.path 
      d="M30 50 L45 65 L70 35" 
      fill="none" 
      stroke="url(#checkGrad)" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      filter="url(#glow)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
    />
  </svg>
);

const RealisticCoconutTree = ({ scale = 1, delay = 0, windForce = 5 }) => (
  <motion.div 
    className="absolute bottom-0 origin-bottom" 
    style={{ transform: `scale(${scale})` }}
    animate={{ rotate: [0, windForce, -windForce/2, 0] }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <svg width="200" height="400" viewBox="0 0 200 400" className="overflow-visible">
      <defs>
        <linearGradient id="trunk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5D4037" />
          <stop offset="50%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#3E2723" />
        </linearGradient>
        <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#81C784" />
          <stop offset="50%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <radialGradient id="coconut" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#AED581" />
          <stop offset="80%" stopColor="#558B2F" />
          <stop offset="100%" stopColor="#33691E" />
        </radialGradient>
      </defs>
      
      {/* Trunk with curve */}
      <path d="M90,400 Q110,200 95,50 L105,50 Q120,200 110,400 Z" fill="url(#trunk)" />
      
      {/* Trunk Texture Lines */}
      {[...Array(15)].map((_, i) => (
        <path key={i} d={`M${92 + Math.sin(i)*5},${380 - i*22} Q100,${375 - i*22} ${108 + Math.cos(i)*5},${378 - i*22}`} fill="none" stroke="#3E2723" strokeWidth="1.5" opacity="0.6" />
      ))}

      {/* Leaves Group - Animated for wind */}
      <motion.g 
        originX="100" originY="50"
        animate={{ rotate: [0, windForce*2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay*0.5 }}
      >
        {/* Back Leaves */}
        <path d="M100,50 Q50,0 20,40 Q60,30 100,50 Z" fill="url(#leaf)" />
        <path d="M100,50 Q150,0 180,40 Q140,30 100,50 Z" fill="url(#leaf)" />
        <path d="M100,50 Q40,30 10,80 Q60,60 100,50 Z" fill="url(#leaf)" />
        
        {/* Coconuts */}
        <circle cx="90" cy="65" r="12" fill="url(#coconut)" />
        <circle cx="110" cy="60" r="14" fill="url(#coconut)" />
        <circle cx="100" cy="75" r="11" fill="url(#coconut)" />
        <circle cx="85" cy="55" r="10" fill="url(#coconut)" />

        {/* Front Leaves */}
        <path d="M100,50 Q160,30 190,80 Q140,60 100,50 Z" fill="url(#leaf)" />
        <path d="M100,50 Q70,90 40,140 Q80,100 100,50 Z" fill="url(#leaf)" />
        <path d="M100,50 Q130,90 160,140 Q120,100 100,50 Z" fill="url(#leaf)" />
        <path d="M100,50 Q100,10 100,-20 Q110,20 100,50 Z" fill="url(#leaf)" />
        <path d="M100,50 Q80,10 60,-10 Q90,20 100,50 Z" fill="url(#leaf)" />
        <path d="M100,50 Q120,10 140,-10 Q110,20 100,50 Z" fill="url(#leaf)" />
      </motion.g>
    </svg>
  </motion.div>
);

const CloudLayer = ({ y, duration, delay, scale, opacity }) => (
  <motion.div
    className="absolute"
    style={{ top: y, scale, opacity, left: '-20%' }}
    animate={{ x: ['0vw', '120vw'] }}
    transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
  >
    <svg width="200" height="100" viewBox="0 0 200 100">
      <path d="M50,60 a20,20 0 0,1 0,-40 a30,30 0 0,1 60,-10 a25,25 0 0,1 40,20 a20,20 0 0,1 0,40 z" fill="#FFFFFF" />
    </svg>
  </motion.div>
);

const Bird = ({ delay, y, duration }) => (
  <motion.div
    className="absolute z-20"
    style={{ top: y, left: '-5%' }}
    animate={{ x: ['0vw', '110vw'], y: [0, -20, 10, -10, 0] }}
    transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
  >
    <motion.svg width="30" height="20" viewBox="0 0 30 20"
      animate={{ scaleY: [1, -0.5, 1] }}
      transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M0,10 Q7,0 15,10 Q22,0 30,10 Q22,5 15,12 Q7,5 0,10 Z" fill="#333" opacity="0.8" />
    </motion.svg>
  </motion.div>
);

// ==========================================
// SCENES
// ==========================================

// SCENE 1: WELCOME
const SceneWelcome = () => (
  <motion.div className="relative flex flex-col items-center justify-center w-full h-full text-center z-10">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-[#F8F9FA] to-[#E0E0E0] opacity-80" />
    
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="relative z-10 flex flex-col items-center bg-white/40 p-12 rounded-[40px] backdrop-blur-2xl border border-white/60 shadow-[0_30px_60px_rgba(0,0,0,0.05)]"
    >
      {/* Animated Glow Behind Logo */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4AF37] rounded-full blur-[80px] -z-10"
      />
      
      <div className="w-32 h-32 mb-8 relative">
        <PremiumCheckmark />
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute inset-0 flex items-center justify-center -z-10"
        >
          <Logo className="w-16 h-16 opacity-20" />
        </motion.div>
      </div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="text-4xl md:text-5xl font-extrabold text-stone-900 mb-3 tracking-tight font-poppins"
      >
        Welcome to <span className="text-[#2E7D32]">Cocoveera</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="text-lg md:text-xl text-stone-500 font-medium"
      >
        Your premium export journey begins here.
      </motion.p>
    </motion.div>

    {/* Floating environmental leaves */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-4 h-4 bg-[#2E7D32] rounded-full opacity-20 blur-[1px]"
        style={{ borderRadius: '0 50% 50% 50%', left: `${10 + Math.random()*80}%` }}
        initial={{ y: '110vh', rotate: 0 }}
        animate={{ y: '-10vh', x: Math.sin(i)*100, rotate: 360 }}
        transition={{ duration: 10 + Math.random()*5, repeat: Infinity, ease: 'linear', delay: Math.random()*5 }}
      />
    ))}
  </motion.div>
);

// SCENE 2: COCONUT FARM
const SceneFarm = () => (
  <motion.div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-end pb-32">
    {/* Sun & Light Rays */}
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="absolute top-24 right-32"
    >
      <div className="w-32 h-32 bg-[#FFD54F] rounded-full blur-[2px] shadow-[0_0_100px_#FFD54F]" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 -inset-x-32 -inset-y-32"
        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,213,79,0.2) 20deg, transparent 40deg, rgba(255,213,79,0.2) 60deg, transparent 80deg)', borderRadius: '50%', filter: 'blur(10px)' }}
      />
    </motion.div>

    {/* Clouds */}
    <CloudLayer y="10%" duration={40} delay={0} scale={1.5} opacity={0.6} />
    <CloudLayer y="25%" duration={55} delay={15} scale={1} opacity={0.4} />
    <CloudLayer y="15%" duration={45} delay={25} scale={1.2} opacity={0.5} />

    {/* Birds */}
    <Bird y="20%" duration={12} delay={1} />
    <Bird y="15%" duration={15} delay={4} />
    <Bird y="25%" duration={10} delay={8} />

    {/* Distant Mountains */}
    <div className="absolute bottom-[20%] w-full h-[30%] opacity-40 z-0">
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,300 L0,150 Q100,50 250,150 T500,100 T750,180 T1000,100 L1000,300 Z" fill="#689F38" />
        <path d="M0,300 L0,200 Q150,100 300,220 T600,150 T900,240 T1000,180 L1000,300 Z" fill="#33691E" opacity="0.6" />
      </svg>
    </div>

    {/* Ground / Grass */}
    <div className="absolute bottom-0 w-full h-[25%] bg-gradient-to-t from-[#2E7D32] to-[#7CB342] z-10" />

    {/* Trees */}
    <div className="absolute bottom-[10%] w-full flex justify-between px-10 z-20">
      <RealisticCoconutTree scale={0.7} delay={0} windForce={4} />
      <RealisticCoconutTree scale={1.1} delay={1.5} windForce={6} />
      <RealisticCoconutTree scale={0.8} delay={0.7} windForce={3} />
      <RealisticCoconutTree scale={1.3} delay={2.2} windForce={7} />
      <RealisticCoconutTree scale={0.9} delay={1.1} windForce={5} />
    </div>

    {/* Text Overlay */}
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="relative z-30 bg-white/70 backdrop-blur-xl px-10 py-5 rounded-[24px] border border-white/50 shadow-2xl mb-12"
    >
      <h2 className="text-3xl font-poppins font-extrabold text-[#1B5E20]">Sustainable Sourcing</h2>
      <p className="text-stone-600 font-medium mt-1">Sourced from premium South Indian plantations.</p>
    </motion.div>
  </motion.div>
);

// SCENE 3: MANUFACTURING
const SceneManufacturing = () => (
  <motion.div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
    {/* Factory Background */}
    <div className="absolute inset-0 bg-[#263238] opacity-10" />
    
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10 w-[80%] max-w-4xl h-[60%] bg-gradient-to-b from-[#ECEFF1] to-[#CFD8DC] rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border-4 border-white/50 overflow-hidden flex items-center justify-center"
    >
      {/* Factory Windows */}
      <div className="absolute top-0 w-full h-24 flex gap-4 p-6 opacity-30">
        {[...Array(6)].map((_, i) => <div key={i} className="flex-1 bg-white/50 rounded-b-xl shadow-inner" />)}
      </div>

      {/* Complex Conveyor Belt SVG Animation */}
      <div className="relative w-full h-64 mt-20">
        <svg viewBox="0 0 1000 300" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B0BEC5" />
              <stop offset="50%" stopColor="#78909C" />
              <stop offset="100%" stopColor="#455A64" />
            </linearGradient>
            <linearGradient id="belt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#212121" />
              <stop offset="100%" stopColor="#424242" />
            </linearGradient>
            <linearGradient id="cocoBlock" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#795548" />
              <stop offset="100%" stopColor="#4E342E" />
            </linearGradient>
          </defs>

          {/* Machine Body */}
          <rect x="100" y="50" width="800" height="200" fill="url(#metal)" rx="20" />
          <rect x="200" y="20" width="100" height="80" fill="#607D8B" rx="10" />
          <rect x="700" y="20" width="100" height="80" fill="#607D8B" rx="10" />

          {/* Glass Window */}
          <rect x="250" y="80" width="500" height="100" fill="#E1F5FE" opacity="0.6" rx="10" />
          <path d="M250 80 L750 180" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />

          {/* Rollers */}
          {[...Array(15)].map((_, i) => (
            <motion.circle 
              key={i} cx={270 + i*33} cy="160" r="12" fill="#546E7A"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: `${270 + i*33}px 160px` }}
            />
          ))}

          {/* Belt */}
          <path d="M250,148 L750,148 A12,12 0 0,1 750,172 L250,172 A12,12 0 0,1 250,148 Z" fill="url(#belt)" opacity="0.8" />

          {/* Moving Blocks */}
          {[...Array(3)].map((_, i) => (
            <motion.g 
              key={i}
              initial={{ x: 150 }}
              animate={{ x: 700 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i*1.33 }}
            >
              <rect x="0" y="118" width="50" height="30" fill="url(#cocoBlock)" rx="4" />
              {/* Quality Checkmark overlay flashes as it passes center */}
              <motion.path 
                d="M10 133 L20 143 L40 123" stroke="#76FF03" strokeWidth="4" fill="none"
                animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i*1.33, times: [0, 0.4, 0.45, 0.55, 0.6, 1] }}
              />
            </motion.g>
          ))}
        </svg>

        {/* Steam Particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-20 bg-white rounded-full blur-[10px]"
            style={{ left: `${30 + Math.random()*40}%`, width: 40+Math.random()*40, height: 40+Math.random()*40 }}
            initial={{ y: 0, opacity: 0, scale: 0.5 }}
            animate={{ y: -100, opacity: [0, 0.4, 0], scale: 2 }}
            transition={{ duration: 2+Math.random()*2, repeat: Infinity, delay: Math.random()*2 }}
          />
        ))}
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="mt-8 z-20 bg-white/80 backdrop-blur-md px-10 py-5 rounded-[24px] shadow-xl text-center border border-white"
    >
      <h2 className="text-3xl font-poppins font-extrabold text-stone-800">Advanced Manufacturing</h2>
      <p className="text-stone-500 font-medium mt-1">Washed, buffered, and compressed to perfection.</p>
    </motion.div>
  </motion.div>
);

// SCENE 4: TRANSPORTATION
const SceneTransportation = () => (
  <motion.div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-end">
    {/* Moving Road/Highway */}
    <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-b from-[#78909C] to-[#37474F] z-0 flex items-center shadow-inner" style={{ perspective: '1000px' }}>
      <motion.div 
        className="w-[200%] h-4 border-t-8 border-dashed border-white/50 absolute top-1/2"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>

    {/* Parallax Mountains */}
    <motion.div 
      className="absolute bottom-[40%] w-[200%] h-[30%] opacity-20 flex"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-1/2 h-full">
        <path d="M0,300 L200,100 L400,300 L700,50 L1000,300 Z" fill="#263238" />
      </svg>
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-1/2 h-full">
        <path d="M0,300 L200,100 L400,300 L700,50 L1000,300 Z" fill="#263238" />
      </svg>
    </motion.div>

    {/* Parallax Trees */}
    <motion.div 
      className="absolute bottom-[40%] w-[200%] h-[15%] z-10 flex items-end justify-around"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    >
      {[...Array(20)].map((_, i) => (
        <div key={i} className="w-12 h-32 bg-[#2E7D32] rounded-t-full relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-10 bg-[#5D4037]" />
        </div>
      ))}
    </motion.div>

    {/* The Truck */}
    <motion.div 
      className="relative z-30 mb-[15%]"
      initial={{ x: '-100vw' }}
      animate={{ x: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <motion.div 
        animate={{ y: [-2, 2, -2] }} 
        transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="600" height="250" viewBox="0 0 600 250" className="drop-shadow-2xl overflow-visible">
          {/* Shadow */}
          <ellipse cx="300" cy="245" rx="250" ry="10" fill="black" opacity="0.3" />
          
          {/* Trailer Container */}
          <rect x="50" y="20" width="380" height="180" fill="#F5F5F5" rx="5" />
          <rect x="50" y="20" width="380" height="180" fill="none" stroke="#E0E0E0" strokeWidth="2" rx="5" />
          
          {/* Container Ribs */}
          {[...Array(15)].map((_, i) => (
            <line key={i} x1={70 + i*22} y1="20" x2={70 + i*22} y2="200" stroke="#E0E0E0" strokeWidth="4" />
          ))}

          {/* Logo on Container */}
          <rect x="120" y="80" width="240" height="60" fill="white" rx="10" opacity="0.9" />
          <text x="240" y="118" fontFamily="Poppins" fontSize="28" fontWeight="900" fill="#2E7D32" textAnchor="middle">COCOVEERA</text>
          <text x="240" y="132" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill="#666" textAnchor="middle">PREMIUM EXPORTS</text>

          {/* Truck Cab */}
          <path d="M440 200 L440 80 Q440 60 460 60 L510 60 Q530 60 540 80 L570 140 Q580 160 580 180 L580 200 Z" fill="#2E7D32" />
          {/* Window */}
          <path d="M450 130 L450 70 Q450 65 460 65 L505 65 Q515 65 520 75 L545 130 Z" fill="#E1F5FE" />
          {/* Grill/Bumper */}
          <rect x="570" y="160" width="15" height="40" fill="#424242" rx="2" />
          <rect x="430" y="190" width="160" height="15" fill="#424242" rx="2" />
          {/* Headlight Ray */}
          <path d="M585 175 L800 120 L800 230 Z" fill="url(#headlightGrad)" opacity="0.6" />
          
          <defs>
            <linearGradient id="headlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Wheels (Rotating) */}
          {[100, 180, 260, 480, 540].map((cx, i) => (
            <motion.g 
              key={i}
              style={{ transformOrigin: `${cx}px 210px` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            >
              <circle cx={cx} cy="210" r="30" fill="#212121" />
              <circle cx={cx} cy="210" r="15" fill="#9E9E9E" />
              {/* Wheel spokes */}
              {[0, 60, 120, 180, 240, 300].map((angle, j) => (
                <line key={j} x1={cx} y1="195" x2={cx} y2="225" stroke="#E0E0E0" strokeWidth="3" transform={`rotate(${angle} ${cx} 210)`} />
              ))}
            </motion.g>
          ))}
        </svg>
      </motion.div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute top-20 z-40 bg-white/80 backdrop-blur-xl px-10 py-5 rounded-[24px] shadow-xl text-center border border-white/50"
    >
      <h2 className="text-3xl font-poppins font-extrabold text-[#0277BD]">Global Logistics</h2>
      <p className="text-stone-600 font-medium mt-1">Seamless port-to-port container dispatch.</p>
    </motion.div>
  </motion.div>
);

// SCENE 5: OCEAN EXPORT
const SceneOcean = () => (
  <motion.div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-end">
    {/* Sun setting */}
    <motion.div 
      initial={{ y: -50 }}
      animate={{ y: 50 }}
      transition={{ duration: 4, ease: "linear" }}
      className="absolute top-[20%] right-[10%] w-40 h-40 bg-[#FF5722] rounded-full blur-[10px] shadow-[0_0_100px_#FF5722]"
    />

    {/* Distant Port Cranes */}
    <motion.div 
      initial={{ x: 0 }} animate={{ x: -100 }} transition={{ duration: 10, ease: "linear" }}
      className="absolute bottom-[30%] left-[10%] flex gap-10 opacity-30 z-0"
    >
      {[...Array(3)].map((_, i) => (
        <svg key={i} width="100" height="200" viewBox="0 0 100 200">
          <path d="M20 200 L40 50 L80 50 L100 100" fill="none" stroke="#263238" strokeWidth="8" />
          <path d="M40 50 L100 20 L100 200" fill="none" stroke="#263238" strokeWidth="4" />
        </svg>
      ))}
    </motion.div>

    {/* Ocean Background */}
    <div className="absolute bottom-0 w-full h-[35%] bg-gradient-to-b from-[#0277BD] to-[#01579B] z-10 overflow-hidden">
      {/* Animated Waves */}
      {[...Array(4)].map((_, i) => (
        <motion.div 
          key={i}
          className="absolute w-[200%] h-full opacity-30"
          style={{ top: `${i * 15}%`, left: '-50%' }}
          animate={{ x: ['0%', '25%'], y: [-5, 5, -5] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,40 C150,80 300,0 600,40 C900,80 1050,0 1200,40 L1200,120 L0,120 Z" fill="#81D4FA" />
          </svg>
        </motion.div>
      ))}
    </div>

    {/* The Cargo Ship */}
    <motion.div 
      className="relative z-20 mb-[8%]"
      initial={{ x: '100vw' }}
      animate={{ x: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <motion.div 
        animate={{ y: [-5, 5, -5], rotate: [-1, 1, -1] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="800" height="300" viewBox="0 0 800 300" className="drop-shadow-2xl">
          {/* Hull */}
          <path d="M50,250 L150,150 L750,150 L700,250 Z" fill="#D32F2F" />
          <path d="M50,250 L150,150 L750,150 L700,250 Z" fill="url(#hullGrad)" opacity="0.5" />
          <text x="250" y="210" fontFamily="Poppins" fontSize="32" fontWeight="900" fill="white" letterSpacing="4">COCOVEERA</text>

          <defs>
            <linearGradient id="hullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
            <linearGradient id="contGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1976D2" />
              <stop offset="100%" stopColor="#0D47A1" />
            </linearGradient>
            <linearGradient id="contGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#388E3C" />
              <stop offset="100%" stopColor="#1B5E20" />
            </linearGradient>
          </defs>

          {/* Bridge/Cabin */}
          <rect x="600" y="50" width="100" height="100" fill="#FAFAFA" />
          <rect x="620" y="20" width="60" height="30" fill="#E0E0E0" />
          <rect x="610" y="60" width="20" height="20" fill="#81D4FA" />
          <rect x="640" y="60" width="20" height="20" fill="#81D4FA" />
          <rect x="670" y="60" width="20" height="20" fill="#81D4FA" />
          <rect x="650" y="10" width="10" height="10" fill="#FFC107" />

          {/* Containers Stacked */}
          {[...Array(6)].map((_, col) => (
            [...Array(4)].map((_, row) => {
              // Create a stepped stacking effect
              if (row > 2 && col > 4) return null; 
              const isCocoveera = Math.random() > 0.5;
              return (
                <g key={`${col}-${row}`} transform={`translate(${180 + col*70}, ${115 - row*35})`}>
                  <rect x="0" y="0" width="65" height="30" fill={isCocoveera ? "url(#contGrad2)" : "url(#contGrad1)"} rx="2" />
                  {isCocoveera && <text x="32.5" y="18" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">COCOVEERA</text>}
                </g>
              )
            })
          ))}

          {/* Radar rotating */}
          <motion.line 
            x1="650" y1="20" x2="680" y2="20" stroke="#424242" strokeWidth="4"
            style={{ transformOrigin: '650px 20px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </motion.div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute top-20 z-40 bg-white/90 backdrop-blur-xl px-10 py-5 rounded-[24px] shadow-xl text-center border border-white"
    >
      <h2 className="text-3xl font-poppins font-extrabold text-[#D32F2F]">International Export</h2>
      <p className="text-stone-600 font-medium mt-1">Shipping to 50+ countries worldwide.</p>
    </motion.div>
  </motion.div>
);

// SCENE 6: CUSTOMER DELIVERY
const SceneDelivery = () => (
  <motion.div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
    {/* Soft glowing background */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-[#E8F5E9] to-[#C8E6C9] opacity-90" />

    {/* Greenhouse Structure SVG */}
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative z-10 w-[80%] max-w-4xl h-[60%] flex items-end justify-center border-b-8 border-[#795548]"
    >
      <svg width="100%" height="100%" viewBox="0 0 1000 500" className="absolute bottom-0" preserveAspectRatio="none">
        {/* Glass Panels */}
        <path d="M100 500 L100 200 L500 50 L900 200 L900 500 Z" fill="#E8F5E9" opacity="0.6" stroke="#4CAF50" strokeWidth="10" />
        <path d="M300 500 L300 125 M500 500 L500 50 M700 500 L700 125" stroke="#4CAF50" strokeWidth="6" opacity="0.4" />
        <path d="M100 350 L900 350 M100 200 L900 200" stroke="#4CAF50" strokeWidth="6" opacity="0.4" />
      </svg>

      {/* Growing Plants inside */}
      <div className="absolute bottom-0 w-full flex justify-around px-32 pb-2">
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={i}
            className="flex flex-col items-center justify-end"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            style={{ transformOrigin: 'bottom' }}
            transition={{ type: "spring", stiffness: 50, damping: 10, delay: 1 + i*0.2 }}
          >
            {/* Grow Bag */}
            <div className="w-24 h-12 bg-white rounded-md border-2 border-stone-200 flex items-center justify-center relative z-10 shadow-sm">
              <span className="text-[8px] font-bold text-[#2E7D32]">COCOVEERA</span>
            </div>
            {/* The Plant */}
            <svg width="60" height="150" viewBox="0 0 60 150" className="absolute bottom-10 z-0 overflow-visible">
              <path d="M30,150 Q30,80 10,20" fill="none" stroke="#4CAF50" strokeWidth="4" />
              <path d="M30,150 Q30,80 50,40" fill="none" stroke="#4CAF50" strokeWidth="4" />
              <path d="M30,150 L30,0" fill="none" stroke="#2E7D32" strokeWidth="5" />
              {/* Leaves */}
              <circle cx="10" cy="20" r="12" fill="#81C784" />
              <circle cx="50" cy="40" r="10" fill="#81C784" />
              <circle cx="30" cy="0" r="15" fill="#4CAF50" />
              {/* Blooming Flower */}
              <motion.circle 
                cx="30" cy="0" r="8" fill="#FFEB3B"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 2.5 + i*0.2 }}
              />
            </svg>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Sparkles Overlay */}
    <div className="absolute inset-0 pointer-events-none z-20">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-[#FFD54F]"
          style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }}
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], rotate: 180 }}
          transition={{ duration: 2, repeat: Infinity, delay: Math.random()*3 }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
      ))}
    </div>

    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute top-20 z-40 bg-white/90 backdrop-blur-xl px-12 py-6 rounded-[30px] shadow-2xl text-center border border-white"
    >
      <h2 className="text-4xl font-poppins font-extrabold text-[#2E7D32]">Thriving Yields</h2>
      <p className="text-stone-600 font-medium mt-2 text-lg">Delivering exceptional results to global growers.</p>
    </motion.div>
  </motion.div>
);

// SCENE 7: FINAL
const SceneFinal = ({ onExplore }) => (
  <motion.div className="relative flex flex-col items-center justify-center w-full h-full text-center z-10 bg-[#F8F9FA]">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="relative flex flex-col items-center bg-white p-16 rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-stone-100 z-10"
    >
      {/* Intense Golden Glow */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37] rounded-full blur-[100px] -z-10"
      />
      
      <Logo className="h-32 object-contain mb-8 drop-shadow-xl" />
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-[#1B5E20] mb-3 tracking-tight font-poppins">
        Nature to Nurture
      </h1>
      <p className="text-xl md:text-2xl text-[#2E7D32] mb-12 font-medium">
        Premium Coconut Growing Solutions
      </p>
      
      <motion.button
        onClick={onExplore}
        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(46, 125, 50, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white font-black text-xl rounded-full shadow-[0_10px_30px_rgba(46,125,50,0.4)] transition-all overflow-hidden"
      >
        <span className="relative z-10 tracking-wide">Enter Dashboard</span>
        <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      </motion.button>
    </motion.div>
  </motion.div>
);


// ==========================================
// MAIN ONBOARDING COMPONENT
// ==========================================

export default function Onboarding() {
  const [currentScene, setCurrentScene] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    // Show skip button after a short delay
    const skipTimer = setTimeout(() => setShowSkip(true), 2500);

    const runScenes = () => {
      let delay = sceneTimings[currentScene];
      if (delay > 0) {
        timerRef.current = setTimeout(() => {
          setCurrentScene(prev => {
            if (prev < sceneTimings.length - 1) return prev + 1;
            return prev;
          });
        }, delay);
      } else if (currentScene === sceneTimings.length - 1) {
        // Auto redirect after sitting on final scene
        timerRef.current = setTimeout(() => {
          navigate('/dashboard');
        }, 8000);
      }
    };

    runScenes();

    return () => {
      clearTimeout(skipTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentScene, navigate]);

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const scenes = [
    <SceneWelcome key="0" />,
    <SceneFarm key="1" />,
    <SceneManufacturing key="2" />,
    <SceneTransportation key="3" />,
    <SceneOcean key="4" />,
    <SceneDelivery key="5" />,
    <SceneFinal key="6" onExplore={handleSkip} />
  ];

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 ${backgrounds[currentScene]}`}>
      
      {/* Global Particle System */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white/40 backdrop-blur-md"
            style={{
              width: Math.random() * 15 + 5 + 'px',
              height: Math.random() * 15 + 5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -150 - Math.random() * 100],
              x: Math.random() * 60 - 30,
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 6 + 6,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center w-full h-full"
        >
          {scenes[currentScene]}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSkip && currentScene < 6 && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute top-8 right-8 z-50 px-8 py-3 bg-white/30 hover:bg-white/60 text-stone-900 backdrop-blur-xl border border-white/50 rounded-full font-bold shadow-lg transition-all hover:scale-105"
          >
            Skip Animation
          </motion.button>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}
