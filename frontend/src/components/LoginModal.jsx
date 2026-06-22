/**
 * File: frontend/src/components/LoginModal.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

export const LoginModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
            <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl bg-stone-950/40 border border-stone-850 hover:border-stone-700 hover:text-white text-stone-400 transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Tab Toggles */}
            <div className="flex border-b border-stone-800/80 bg-stone-950/50">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 text-center font-poppins text-xs font-bold uppercase tracking-wider transition-colors relative ${
                  activeTab === 'login' ? 'text-primary-light' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                Sign In
                {activeTab === 'login' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 text-center font-poppins text-xs font-bold uppercase tracking-wider transition-colors relative ${
                  activeTab === 'register' ? 'text-primary-light' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                Register Partner
                {activeTab === 'register' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Form Scroll Area */}
            <div className="overflow-y-auto flex-grow p-6 md:p-8 bg-stone-900/40">
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="modal-form-override"
                  >
                    <LoginForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="modal-form-override"
                  >
                    <RegisterForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
