/**
 * File: frontend/src/pages/account/OrderSummary.jsx
 * Purpose: React page component representing the OrderSummary view.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, User, MapPin, Truck, ShieldCheck, ArrowLeft, Info } from 'lucide-react';

const OrderSummary = () => {
  const navigate = useNavigate();
  const [orderNotes, setOrderNotes] = useState('');

  const steps = [
    { num: 1, label: 'Account Details', icon: User },
    { num: 2, label: 'Shipping Address', icon: MapPin },
    { num: 3, label: 'Order Summary', icon: Truck },
    { num: 4, label: 'Payment', icon: ShieldCheck }
  ];

  return (
    <div className="w-full pb-10">
      
      {/* Checkout Header / Stepper */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-stone-900 mb-6 text-center">Secure Checkout</h1>
        <div className="flex items-center justify-center max-w-3xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const currentStep = 3;
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;
            
            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center relative z-10 w-24">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 transition-colors ${
                    isActive ? 'border-[#2E7D32] bg-[#2E7D32] text-white shadow-lg shadow-[#2E7D32]/30' : 
                    isCompleted ? 'border-[#2E7D32] bg-[#F0FAF0] text-[#2E7D32]' : 
                    'border-stone-200 bg-white text-stone-300'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5 font-bold" /> : <Icon className="w-4.5 h-4.5" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider text-center ${
                    isActive ? 'text-[#2E7D32]' : isCompleted ? 'text-stone-700' : 'text-stone-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 -mt-6 ${
                    isCompleted ? 'bg-[#2E7D32]' : 'bg-stone-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 md:p-10 border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-black text-stone-900 mb-6">3. Final Review</h2>
        
        {/* Products Review */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Products in Container (20FT FCL)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div>
                <p className="text-sm font-bold text-stone-900">Premium Coco Peat 5kg Blocks</p>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">5 Pallets &bull; $950 / Pallet</p>
              </div>
              <p className="text-sm font-black text-stone-900">$4,750</p>
            </div>
            <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div>
                <p className="text-sm font-bold text-stone-900">Coir Grow Bags (100cm x 15cm)</p>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">3 Pallets &bull; $710 / Pallet</p>
              </div>
              <p className="text-sm font-black text-stone-900">$2,130</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Notes */}
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Order Notes & Instructions</h3>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Special instructions for packing, delivery, or customs..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all outline-none resize-none h-32"
            />
            
            <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Delivery Estimate</p>
                <p className="text-sm font-semibold text-blue-800">Container expected to arrive at destination port in 4-6 weeks after payment confirmation.</p>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">Final Payment Summary</h3>
            
            <div className="space-y-3 mb-6 text-sm font-semibold text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal (8 Pallets)</span>
                <span className="text-stone-900">$6,880</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping (FOB India)</span>
                <span className="text-stone-900">$1,200</span>
              </div>
              <div className="flex justify-between text-[#2E7D32]">
                <span>Volume Discount</span>
                <span>-$0</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (0% Export)</span>
                <span className="text-stone-900">$0</span>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4 flex justify-between items-center">
              <span className="text-sm font-black text-stone-900 uppercase tracking-wider">Final Total</span>
              <span className="text-2xl font-black text-[#2E7D32]">$8,080</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
          <button type="button" onClick={() => navigate('/checkout')} className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Shipping
          </button>
          
          <button type="button" onClick={() => navigate('/payment')} className="px-8 py-3.5 bg-[#2E7D32] text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-[#1B5E20] transition-colors shadow-lg shadow-[#2E7D32]/20 flex items-center gap-2">
            Continue to Payment <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
