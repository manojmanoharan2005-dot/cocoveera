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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.5 }}
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
                  />
                )}
              </button>
            </div>

            {/* Form Scroll Area */}
            <div className="overflow-y-auto flex-grow p-6 md:p-8 bg-stone-900/40">
              {activeTab === 'login' ? (
                <div className="modal-form-override">
                  <LoginForm />
                </div>
              ) : (
                <div className="modal-form-override">
                  <RegisterForm />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
