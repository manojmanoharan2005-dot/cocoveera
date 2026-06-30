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
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-[#2E7D32] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(46,125,50,0.4)]">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white font-poppins tracking-tight mb-3">
                Welcome to Cocoveera
              </h1>
              <p className="text-[#F8F5F0] text-lg font-medium opacity-90">
                Registration Successful. Let's begin your journey.
              </p>
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
          <SceneWrapper key="scene-3" bgColor="#8D6E63">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="relative w-full max-w-md h-40 mb-8 overflow-hidden rounded-2xl bg-black/10 flex items-center">
                <motion.div
                  animate={{ x: [0, -1000] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                  className="absolute bottom-4 w-[200%] border-b-2 border-white/20 border-dashed"
                />
                <motion.div
                  animate={{ y: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="relative z-10 mx-auto"
                >
                  <Truck className="w-24 h-24 text-white drop-shadow-2xl" strokeWidth={1.5} />
                </motion.div>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={`tree-${i}`}
                    initial={{ x: 500 }}
                    animate={{ x: -200 }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: "linear" }}
                    className="absolute bottom-6 w-4 h-12 bg-[#2E7D32]/40 rounded-t-full"
                    style={{ left: `${i * 20}%` }}
                  />
                ))}
              </div>
              <h2 className="text-3xl font-black text-white font-poppins mb-2">Transported Safely</h2>
              <p className="text-[#F8F5F0] opacity-90 font-medium text-lg">Heading to the Export Port.</p>
            </motion.div>
          </SceneWrapper>
        );

      case 4:
        return (
          <SceneWrapper key="scene-4" bgColor="#0277BD">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center w-full relative"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Navigation className="w-96 h-96 text-white animate-pulse" />
              </div>

              <div className="relative w-48 h-40 mb-8 flex items-center justify-center z-10">
                <motion.div
                  animate={{ y: [-3, 3, -3], rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <Ship className="w-28 h-28 text-white drop-shadow-xl" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                  animate={{ x: [-20, 20, -20] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-0 w-[150%] h-8 bg-gradient-to-t from-white/20 to-transparent rounded-full blur-sm"
                />
              </div>
              <h2 className="text-3xl font-black text-white font-poppins mb-2 relative z-10">Ocean Export</h2>
              <p className="text-[#F8F5F0] opacity-90 font-medium text-lg relative z-10">Exported Worldwide across the globe.</p>
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
