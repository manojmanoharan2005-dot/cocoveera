import React, { useState, useTransition, useEffect } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship } from 'lucide-react';

export const TransitionRoutes = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Only transition if the actual pathname or search params change
    if (location.pathname !== displayLocation.pathname || location.search !== displayLocation.search) {
      startTransition(() => {
        setDisplayLocation(location);
      });
    }
  }, [location, displayLocation.pathname, displayLocation.search]);

  return (
    <>
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#2F7D32] border-t-transparent border-l-transparent rounded-full animate-spin"></div>
              
              <motion.div
                animate={{
                  y: [-2, 2, -2],
                  rotate: [-5, 5, -5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-[#2F7D32]"
              >
                <Ship className="w-8 h-8" />
              </motion.div>
            </div>
            <p className="text-[12px] sm:text-[13px] font-extrabold uppercase tracking-[0.25em] text-[#2F7D32] font-sans">
              Loading...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes location={displayLocation}>
        {children}
      </Routes>
    </>
  );
};

export default TransitionRoutes;
