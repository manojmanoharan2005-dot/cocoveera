/**
 * File: frontend/src/pages/account/OrderSuccess.jsx
 * Purpose: React page component representing the OrderSuccess view.
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Download, Package, ArrowRight, Calendar, CreditCard, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { convertCurrency } from '../../utils/currencyConverter';
import { useAuth } from '../../context/AuthContext';

const OrderSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const orderInfo = {
    id: state.orderId || 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    paymentId: state.paymentId || 'N/A',
    amount: state.amount || 0,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    method: 'Razorpay'
  };

  return (
    <div className="w-full py-10 px-4">
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-stone-200 shadow-sm flex flex-col items-center max-w-2xl mx-auto">
        
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-full flex items-center justify-center shadow-lg shadow-[#2E7D32]/20">
            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
        </motion.div>

        <h1 className="text-3xl font-black text-stone-900 mb-2 font-poppins">Order Placed Successfully!</h1>
        <p className="text-[#2E7D32] font-black uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Payment Successful
        </p>

        {/* Order Details Summary */}
        <div className="w-full bg-stone-50 rounded-3xl p-6 border border-stone-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Order ID
            </span>
            <span className="text-sm font-black text-stone-900 truncate" title={orderInfo.id}>{orderInfo.id}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Payment ID
            </span>
            <span className="text-sm font-black text-stone-900 truncate" title={orderInfo.paymentId}>{orderInfo.paymentId}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" /> Amount Paid
            </span>
            <span className="text-lg font-black text-[#2E7D32] leading-none">{convertCurrency(orderInfo.amount, user?.currency || 'INR').formatted}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Date & Time
            </span>
            <span className="text-sm font-black text-stone-900">{orderInfo.date}, {orderInfo.time}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate(`/track/${orderInfo.id}`)}
              className="w-full py-4.5 bg-[#2E7D32] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#1B5E20] transition-colors shadow-[0_8px_25px_rgb(46,125,50,0.3)] hover:shadow-[0_12px_30px_rgb(46,125,50,0.4)] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Package className="w-4 h-4" /> Track Order
            </button>
            
            <button 
              className="w-full py-4.5 bg-white text-stone-700 text-xs font-black uppercase tracking-widest rounded-2xl border-2 border-stone-200 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" /> Download Invoice
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/marketplace')}
            className="text-sm font-black text-[#2E7D32] hover:text-[#1B5E20] transition-colors flex items-center justify-center gap-2 w-full pt-4 uppercase tracking-widest"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
