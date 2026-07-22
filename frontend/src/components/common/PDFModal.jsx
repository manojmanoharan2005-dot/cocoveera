import React, { useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PDFModal = ({ isOpen, onClose, pdfUrl, quoteNumber, title = "Document Viewer" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-stone-200 overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-[#2E7D32] w-5 h-5" />
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                {title} - #{quoteNumber}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Iframe */}
          <div className="flex-grow bg-stone-100 relative">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title={`${title}_${quoteNumber}`}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PDFModal;
