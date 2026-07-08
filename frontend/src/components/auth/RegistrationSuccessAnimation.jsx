import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, Ship, Package, Navigation, Factory, Sprout, ArrowRight } from 'lucide-react';

const sceneDuration = 1100;
const totalScenes = 7;

export const RegistrationSuccessAnimation = ({ onComplete }) => {
  const [scene, setScene] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    localStorage.setItem('cocoveera_registration_animation_played', 'true');
  }, []);

  useEffect(() => {
    if (isSkipped || scene === totalScenes - 1) return;

    const timer = setTimeout(() => {
      setScene(prev => prev + 1);
    }, scene === 6 ? 2000 : sceneDuration);

    return () => clearTimeout(timer);
  }, [scene, isSkipped]);

  const handleComplete = () => {
    setIsSkipped(true);
    onComplete();
  };

  const skipButton = (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      onClick={handleComplete}
      className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-poppins font-bold transition-all border border-white/20"
    >
      Skip <ArrowRight className="w-3.5 h-3.5" />
    </motion.button>
  );

  const renderScene = () => {
    switch (scene) {
      case 0:
        return (
          <SceneWrapper key="scene-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="relative mb-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 1.2 }}
                  className="w-36 h-36 bg-gradient-to-br from-[#2E7D32] to-[#689F38] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(46,125,50,0.6)] border-[6px] border-white/10"
                >
                  <span className="text-[75px] drop-shadow-lg">🌴</span>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", bounce: 0.8 }}
                  className="absolute -bottom-2 -right-2 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#1A1A1A] shadow-xl"
                >
                  <CheckCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
                className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-white font-poppins tracking-tight mb-4"
              >
                Welcome to Cocoveera
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-[#F8F5F0]/80 text-xl md:text-2xl font-medium tracking-wide"
              >
                Registration Successful. Let's begin.
              </motion.p>
            </motion.div>
          </SceneWrapper>
        );
      
      case 1:
        return (
          <SceneWrapper key="scene-1" bgColor="#2E7D32">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative w-48 h-48 mb-8">
                <motion.div
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute bottom-0 left-4"
                >
                  <Sprout className="w-24 h-32 text-[#8D6E63] fill-[#2E7D32]" strokeWidth={1} />
                </motion.div>
                <motion.div
                  animate={{ rotate: [2, -2, 2] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute bottom-0 right-4"
                >
                  <Sprout className="w-20 h-28 text-[#8D6E63] fill-[#2E7D32]" strokeWidth={1} />
                </motion.div>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 80, opacity: [0, 1, 0] }}
                    transition={{ delay: i * 0.3, duration: 1, repeat: Infinity }}
                    className="absolute top-1/4 left-1/2 w-3 h-3 bg-[#8D6E63] rounded-full"
                  />
                ))}
              </div>
              <h2 className="text-3xl font-black text-white font-poppins mb-2">Premium Coconuts</h2>
              <p className="text-[#F8F5F0] opacity-90 font-medium text-lg">Harvested with care at the source.</p>
            </motion.div>
          </SceneWrapper>
        );
      
      case 2:
        return (
          <SceneWrapper key="scene-2" bgColor="#37474F">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                <Factory className="w-32 h-32 text-[#F8F5F0]" strokeWidth={1.5} />
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`steam-${i}`}
                    initial={{ y: 0, opacity: 0.8, scale: 1 }}
                    animate={{ y: -50, opacity: 0, scale: 2 }}
                    transition={{ delay: i * 0.4, duration: 1.5, repeat: Infinity }}
                    className="absolute top-0 right-1/4 w-4 h-4 bg-white/20 rounded-full blur-md"
                  />
                ))}
                <div className="absolute -bottom-4 w-full h-2 bg-[#8D6E63]/30 overflow-hidden rounded-full">
                  <motion.div
                    animate={{ x: [-20, 160] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-8 h-full bg-[#8D6E63] rounded-sm"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white font-poppins mb-2 text-center">Modern Manufacturing</h2>
              <p className="text-[#F8F5F0] opacity-90 font-medium text-lg text-center max-w-sm">Processed to International Quality Standards.</p>
            </motion.div>
          </SceneWrapper>
        );

      case 3:
        return (
          <SceneWrapper key="scene-3" bgColor="#2d3748">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center justify-center w-full relative overflow-hidden"
            >
              {/* Parallax Background Mountains */}
              <div className="absolute top-0 w-full h-full opacity-10 flex justify-around pointer-events-none">
                 <div className="w-0 h-0 border-l-[150px] border-r-[150px] border-b-[200px] border-l-transparent border-r-transparent border-b-white mt-10"></div>
                 <div className="w-0 h-0 border-l-[250px] border-r-[250px] border-b-[300px] border-l-transparent border-r-transparent border-b-white -mt-10"></div>
                 <div className="w-0 h-0 border-l-[150px] border-r-[150px] border-b-[200px] border-l-transparent border-r-transparent border-b-white mt-20"></div>
              </div>

              <div className="relative w-full max-w-2xl h-64 mb-8 flex items-end justify-center z-10 mt-10">
                {/* Road */}
                <div className="absolute bottom-0 w-[200%] h-14 bg-stone-800 rounded-t-xl overflow-hidden shadow-2xl border-t border-stone-700">
                  <motion.div
                    animate={{ x: [0, -800] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute top-1/2 w-full border-b-[6px] border-yellow-400 border-dashed opacity-50"
                  />
                </div>
                
                {/* Realistic CSS Semi-Truck */}
                <div className="relative z-20 pb-12 flex items-end justify-center">
                  
                  {/* Truck Body (Bouncing) */}
                  <motion.div
                    animate={{ y: [-1, 2, -1] }}
                    transition={{ repeat: Infinity, duration: 0.3, ease: "easeInOut" }}
                    className="relative w-[280px] h-[120px] flex items-end"
                  >
                    {/* Trailer */}
                    <div className="w-[180px] h-[110px] bg-white rounded-l-xl border-l-4 border-t-4 border-stone-200 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center relative z-10">
                      <div className="absolute inset-2 border-2 border-stone-100 rounded-lg"></div>
                      <span className="font-poppins font-black text-stone-200 text-3xl tracking-[0.2em] -rotate-90 md:rotate-0">COCOVEERA</span>
                    </div>
                    {/* Cab */}
                    <div className="w-[90px] h-[90px] bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-tr-3xl rounded-br-xl shadow-xl relative z-10 ml-2">
                       {/* Window */}
                       <div className="absolute top-3 right-2 w-10 h-10 bg-gradient-to-br from-sky-200 to-sky-400 rounded-tr-2xl rounded-bl-md border-r-[3px] border-t-[3px] border-white/30"></div>
                       {/* Grill */}
                       <div className="absolute bottom-2 right-0 w-4 h-12 bg-stone-300 rounded-l-md flex flex-col justify-between py-1 px-0.5">
                         <div className="w-full h-1 bg-stone-500 rounded-full"></div>
                         <div className="w-full h-1 bg-stone-500 rounded-full"></div>
                         <div className="w-full h-1 bg-stone-500 rounded-full"></div>
                         <div className="w-full h-1 bg-stone-500 rounded-full"></div>
                       </div>
                       {/* Exhaust */}
                       <div className="absolute bottom-20 left-2 w-2 h-14 bg-stone-300 rounded-t-sm border border-stone-400"></div>
                    </div>
                  </motion.div>

                  {/* Wheels (Spinning) */}
                  {/* Trailer Rear Wheel 1 */}
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }} className="absolute bottom-[36px] left-6 w-14 h-14 bg-stone-900 rounded-full border-[4px] border-stone-400 flex items-center justify-center border-dashed z-30 shadow-lg">
                    <div className="w-6 h-6 bg-stone-300 rounded-full border-2 border-stone-400"></div>
                  </motion.div>
                  {/* Trailer Rear Wheel 2 */}
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }} className="absolute bottom-[36px] left-24 w-14 h-14 bg-stone-900 rounded-full border-[4px] border-stone-400 flex items-center justify-center border-dashed z-30 shadow-lg">
                    <div className="w-6 h-6 bg-stone-300 rounded-full border-2 border-stone-400"></div>
                  </motion.div>
                  {/* Cab Front Wheel */}
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }} className="absolute bottom-[36px] right-8 w-14 h-14 bg-stone-900 rounded-full border-[4px] border-stone-400 flex items-center justify-center border-dashed z-30 shadow-lg">
                    <div className="w-6 h-6 bg-stone-300 rounded-full border-2 border-stone-400"></div>
                  </motion.div>

                  {/* Wind lines for speed effect */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`wind-${i}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: -250, opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.3, delay: i * 0.2 }}
                      className="absolute w-20 h-1 bg-white/40 rounded-full z-0"
                      style={{ top: `${40 + i * 20}px`, left: '-50px' }}
                    />
                  ))}
                  
                  {/* Exhaust Smoke */}
                  <motion.div
                    animate={{ y: -40, x: -60, opacity: 0, scale: 3 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                    className="absolute top-0 left-[180px] w-6 h-6 bg-white/30 rounded-full blur-md z-0"
                  />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white font-poppins mb-3 z-10 tracking-tight">Highway Transport</h2>
              <p className="text-white/80 font-medium text-xl z-10">Fast dispatch to global export hubs.</p>
            </motion.div>
          </SceneWrapper>
        );

      case 4:
        return (
          <SceneWrapper key="scene-4" bgColor="#006064">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center w-full relative overflow-hidden h-full"
            >
              {/* Sky Elements / Clouds */}
              <motion.div 
                animate={{ x: [100, -100] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear", repeatType: "mirror" }}
                className="absolute top-20 right-20 text-[60px] opacity-20 filter blur-[2px]"
              >
                ☁️
              </motion.div>
              <motion.div 
                animate={{ x: [-100, 100] }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear", repeatType: "mirror" }}
                className="absolute top-32 left-20 text-[80px] opacity-10 filter blur-[4px]"
              >
                ☁️
              </motion.div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

              <div className="relative w-full max-w-2xl h-80 mb-8 flex items-center justify-center z-10 mt-10">
                
                {/* Back Ocean Waves */}
                <motion.div
                  animate={{ x: [-50, 0, -50], y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute bottom-4 w-[200%] h-32 bg-[#00838F] rounded-[100%] opacity-60 blur-xl z-0"
                />
                
                {/* Realistic CSS Cargo Ship */}
                <motion.div
                  animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-20 pb-16 w-[350px] h-[160px]"
                >
                  {/* Cargo Containers */}
                  <div className="absolute bottom-16 flex items-end justify-start w-[260px] gap-1 mb-1 left-8 z-10">
                    <div className="w-12 h-16 bg-red-600 border border-black/20 shadow-inner grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-red-700"/><div className="bg-red-700"/><div className="bg-red-700"/><div className="bg-red-700"/></div>
                    <div className="w-12 h-20 bg-blue-600 border border-black/20 shadow-inner grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-blue-700"/><div className="bg-blue-700"/><div className="bg-blue-700"/><div className="bg-blue-700"/></div>
                    <div className="w-12 h-14 bg-amber-500 border border-black/20 shadow-inner grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-amber-600"/><div className="bg-amber-600"/><div className="bg-amber-600"/><div className="bg-amber-600"/></div>
                    <div className="w-12 h-24 bg-[#2E7D32] border border-black/20 shadow-inner grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-green-700"/><div className="bg-green-700"/><div className="bg-green-700"/><div className="bg-green-700"/></div>
                    <div className="w-12 h-16 bg-purple-600 border border-black/20 shadow-inner grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-purple-700"/><div className="bg-purple-700"/><div className="bg-purple-700"/><div className="bg-purple-700"/></div>
                  </div>
                  
                  {/* Ship Bridge/Cabin */}
                  <div className="absolute bottom-16 right-4 w-20 h-24 bg-stone-200 border-l border-t border-r border-stone-300 rounded-t-lg flex flex-col items-center pt-3 gap-2 z-10 shadow-lg">
                    {/* Windows */}
                    <div className="w-16 h-4 bg-sky-800 rounded-sm opacity-80"></div>
                    <div className="w-16 h-4 bg-sky-800 rounded-sm opacity-80"></div>
                    {/* Radar / Mast */}
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-1 bg-stone-400 absolute -top-4 rounded-full"></motion.div>
                    <div className="w-2 h-8 bg-stone-400 absolute -top-8"></div>
                    {/* Chimney */}
                    <div className="w-6 h-10 bg-stone-800 absolute -top-10 left-2 rounded-t-sm"></div>
                  </div>

                  {/* Smoke from Chimney */}
                  <motion.div
                    animate={{ y: -50, x: -30, opacity: 0, scale: 2 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                    className="absolute top-[-30px] right-14 w-8 h-8 bg-stone-400/40 rounded-full blur-md z-0"
                  />

                  {/* Ship Hull */}
                  <div className="absolute bottom-2 w-full h-16 bg-stone-800 rounded-b-3xl rounded-tl-md rounded-tr-[4rem] shadow-2xl overflow-hidden z-20 border-b-2 border-stone-900">
                    <div className="absolute bottom-0 w-full h-5 bg-red-900 flex items-center justify-between px-4">
                       <span className="text-[10px] font-mono text-white/50 tracking-widest">IMO 9811000</span>
                    </div>
                  </div>
                  
                  {/* Bow Water Splash */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute bottom-0 right-0 w-16 h-10 bg-white/60 rounded-full blur-md z-30"
                  />
                </motion.div>

                {/* Front Ocean Waves */}
                <motion.div
                  animate={{ x: [0, -50, 0], y: [5, -5, 5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-0 w-[200%] h-24 bg-[#0097A7] rounded-[100%] opacity-90 blur-md z-30"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white font-poppins mb-3 relative z-40 tracking-tight">Global Logistics</h2>
              <p className="text-white/80 font-medium text-xl relative z-40">Sailing across oceans to your destination.</p>
            </motion.div>
          </SceneWrapper>
        );

      case 5:
        return (
          <SceneWrapper key="scene-5" bgColor="#F8F5F0">
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-32 h-32 mb-8">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="relative z-10"
                >
                  <Package className="w-32 h-32 text-[#2E7D32]" strokeWidth={1} />
                </motion.div>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 200, 
                      y: (Math.random() - 0.5) * 200,
                      opacity: [0, 1, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-sm ${['bg-[#2E7D32]', 'bg-[#8D6E63]', 'bg-amber-400'][i % 3]}`}
                  />
                ))}
              </div>
              <h2 className="text-3xl font-black text-[#2E7D32] font-poppins mb-2">Delivered Safely</h2>
              <p className="text-stone-600 font-medium text-lg">Straight to your Business.</p>
            </motion.div>
          </SceneWrapper>
        );

      case 6:
        return (
          <SceneWrapper key="scene-6" bgColor="#FFFFFF">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center w-full h-full relative"
            >
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src="/logo.webp" 
                alt="Cocoveera" 
                className="w-32 h-32 object-contain mb-8 shadow-2xl rounded-3xl z-10 border border-stone-100"
              />
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-black text-[#2E7D32] font-poppins mb-2 tracking-tight z-10"
              >
                Nature to Nurture
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-stone-500 font-bold tracking-widest uppercase text-sm mb-12 z-10"
              >
                Premium Coconut Growing Solutions
              </motion.p>
              
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={handleComplete}
                className="relative z-10 group bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white px-10 py-4 rounded-2xl font-poppins font-bold text-lg shadow-[0_10px_40px_rgba(46,125,50,0.3)] hover:shadow-[0_10px_50px_rgba(46,125,50,0.5)] transition-all flex items-center gap-2 overflow-hidden"
              >
                <motion.div 
                  animate={{ opacity: [0, 0.5, 0] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-white/20"
                />
                <span className="relative z-10">Start Shopping</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`leaf-${i}`}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.5 }}
                  className="absolute opacity-10"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `scale(${0.5 + Math.random()})`
                  }}
                >
                  <Sprout className="w-16 h-16 text-[#2E7D32]" />
                </motion.div>
              ))}
            </motion.div>
          </SceneWrapper>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="fixed inset-0 z-[99999] bg-stone-900 overflow-hidden font-sans">
      {skipButton}
      <AnimatePresence mode="wait">
        {renderScene()}
      </AnimatePresence>
      
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 z-50">
        <motion.div 
          className="h-full bg-white/50"
          initial={{ width: '0%' }}
          animate={{ width: `${((scene + 1) / totalScenes) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

const SceneWrapper = ({ children, bgColor = '#1A1A1A' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0 flex items-center justify-center p-8"
    style={{ backgroundColor: bgColor }}
  >
    {children}
  </motion.div>
);

export default RegistrationSuccessAnimation;
