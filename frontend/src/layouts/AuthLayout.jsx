import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="p-2 bg-stone-900 border border-stone-850 rounded-xl group-hover:border-primary/50 transition-colors">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-contain rounded-md" />
          </div>
          <span className="font-poppins font-extrabold text-lg tracking-wider">
            <span className="text-primary-light">COCO</span>
            <span className="text-secondary-light">VEERA</span>
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center space-x-2 text-xs text-stone-400 hover:text-white font-semibold transition-colors bg-stone-900/60 border border-stone-850 px-4 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-stone-500 font-semibold relative z-10 border-t border-stone-900">
        <div>
          <span>© 2026 Cocoveera. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-2 text-primary-light/65">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure AES-256 Encrypted Connection</span>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
