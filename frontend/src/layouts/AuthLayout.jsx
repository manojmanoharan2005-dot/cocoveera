/**
 * File: frontend/src/layouts/AuthLayout.jsx
 * Purpose: Source code file for the Cocoveera project.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthLayout = ({ children }) => {
  return (
    <div 
      className="min-h-screen text-stone-100 flex flex-col justify-between font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-auth.png")' }}
    >
      {/* Blurry dark overlay */}
      <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-sm z-0" />

      {/* Background decoration elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px] pointer-events-none z-0" />
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

    </div>
  );
};

export default AuthLayout;
