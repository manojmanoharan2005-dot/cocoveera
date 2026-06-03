/**
 * File: frontend/src/pages/account/OrderSuccess.jsx
 * Purpose: React page component representing the OrderSuccess view.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
  const navigate = useNavigate();
  
  // Dummy order info
  const orderInfo = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    amount: 8080,
    container: '20FT FCL'
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-stone-200 shadow-sm text-center flex flex-col items-center">
        
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-[#F0FAF0] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#2E7D32]" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Order Confirmed!</h1>
        <p className="text-stone-500 font-semibold mb-8 text-sm max-w-sm">
          Thank you for your purchase. Your order has been successfully placed and is being processed for export.
        </p>

        {/* Order Details Summary */}
        <div className="w-full bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-8 grid grid-cols-2 md:grid-cols-3 gap-6 text-left">
          <div>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Order Number</p>
            <p className="text-sm font-black text-stone-900">{orderInfo.id}</p>
          </div>
          <div>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Total Amount</p>
            <p className="text-sm font-black text-[#2E7D32]">${orderInfo.amount.toLocaleString()}</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Container</p>
            <p className="text-sm font-black text-stone-900">{orderInfo.container}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate(`/account/track/${orderInfo.id}`)}
              className="w-full py-4 bg-[#2E7D32] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#1B5E20] transition-colors shadow-lg shadow-[#2E7D32]/20 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" /> Track Order
            </button>
            
            <button 
              className="w-full py-4 bg-stone-100 text-stone-700 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Invoice
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors flex items-center justify-center gap-1.5 w-full pt-4"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
