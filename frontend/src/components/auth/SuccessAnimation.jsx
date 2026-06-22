import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const SuccessAnimation = ({ onComplete, type = 'login' }) => {
  const [shouldRender, setShouldRender] = useState(true);

  // local storage check
  useEffect(() => {
    const lastPlayedStr = localStorage.getItem('cocoveera_animation_last_played');
    const now = Date.now();
    const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

    // Clear old legacy key if it exists
    localStorage.removeItem('cocoveera_animation_played');

    // Always play for new registrations, otherwise check the 2-week cooldown
    if (type !== 'register' && lastPlayedStr && (now - parseInt(lastPlayedStr, 10) < TWO_WEEKS_MS)) {
      // Skip if played within the last 2 weeks (for logins/checkouts)
      setShouldRender(false);
      onComplete();
    } else {
      // Play animation and update timestamp
      localStorage.setItem('cocoveera_animation_last_played', now.toString());
    }
  }, [onComplete, type]);

  // Timer logic
  useEffect(() => {
    if (!shouldRender) return;

    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete, shouldRender]);

  if (!shouldRender) return null;

  const content = (
    <div className="fixed inset-0 z-[99999] bg-stone-950/40 backdrop-blur-md flex items-center justify-center font-poppins px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-stone-200/80 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center max-w-sm w-full relative overflow-hidden"
      >
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring', delay: 0.2, bounce: 0.5 }}
          className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-6 shadow-sm border border-[#2E7D32]/20 relative z-10"
        >
          <CheckCircle className="w-10 h-10 text-[#2E7D32]" />
        </motion.div>
        
        <h2 className="text-2xl font-black text-stone-900 text-center tracking-tight mb-2 relative z-10">
          {type === 'register' ? 'Account Created!' : 'Login Successful'}
        </h2>
        <p className="text-stone-500 font-medium text-sm text-center relative z-10">
          Welcome to Cocoveera. <br /> You are being redirected...
        </p>

        <motion.div 
          className="w-full h-1.5 bg-stone-100 rounded-full mt-8 overflow-hidden relative z-10"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.5, ease: "linear" }}
            className="h-full bg-gradient-to-r from-[#2E7D32] to-[#4ade80]"
          />
        </motion.div>
        
        {/* Decorative background element */}
        <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] rounded-full bg-[#2E7D32]/5 blur-[60px] pointer-events-none" />
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default SuccessAnimation;
