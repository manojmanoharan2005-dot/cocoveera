/**
 * File: frontend/src/layouts/AuthLayout.jsx
 * Purpose: Source code file for the Cocoveera project.
 */
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthLayout = ({ children }) => {
  return (
    <div 
      className="min-h-screen text-stone-100 flex flex-col justify-between font-sans relative overflow-hidden bg-stone-900"
      style={{
        backgroundImage: "url('/bg-auth.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Blurry dark overlay */}
      <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-sm z-0" />

      {/* Background decoration elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />


      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center px-6 pt-32 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {children || <Outlet />}
        </motion.div>
      </main>

    </div>
  );
};

export default AuthLayout;
