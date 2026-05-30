import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, User, MapPin, Truck, ShieldCheck, ArrowLeft, Building2, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isIndia = user?.country?.toLowerCase() === 'india';
  
  const [selectedMethod, setSelectedMethod] = useState(isIndia ? 'razorpay' : 'bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed

  useEffect(() => {
    if (isIndia) {
      if (selectedMethod !== 'razorpay') setSelectedMethod('razorpay');
    } else {
      if (!['bank', 'stripe', 'paypal'].includes(selectedMethod)) {
        setSelectedMethod('bank');
      }
    }
  }, [isIndia]);

  const steps = [
    { num: 1, label: 'Account Details', icon: User },
    { num: 2, label: 'Shipping Address', icon: MapPin },
    { num: 3, label: 'Order Summary', icon: Truck },
    { num: 4, label: 'Payment', icon: ShieldCheck }
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Simulate success
      setPaymentStatus('success');
      setTimeout(() => navigate('/account/order-success'), 1000);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Checkout Header / Stepper */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-stone-900 mb-6 text-center">Secure Checkout</h1>
        <div className="flex items-center justify-center max-w-3xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const currentStep = 4;
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

      <div className="bg-white rounded-[24px] p-6 md:p-10 border border-stone-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-stone-900">4. Payment Method</h2>
          <span className="text-2xl font-black text-[#2E7D32]">$8,080.00</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Payment Methods */}
          <div className="space-y-4">
            {isIndia ? (
              <>
                {/* Razorpay */}
                <label className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${
                  selectedMethod === 'razorpay' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="razorpay"
                      checked={selectedMethod === 'razorpay'}
                      onChange={() => setSelectedMethod('razorpay')}
                      className="w-4 h-4 text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                    <div className="w-10 h-10 bg-[#02042B] rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <span className="text-white font-black text-xs">RZP</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">Razorpay</p>
                      <p className="text-xs text-stone-500 font-semibold">Cards, UPI, NetBanking.</p>
                    </div>
                  </div>
                </label>
              </>
            ) : (
              <>
                {/* Bank Transfer */}
                <label className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${
                  selectedMethod === 'bank' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="bank"
                      checked={selectedMethod === 'bank'}
                      onChange={() => setSelectedMethod('bank')}
                      className="w-4 h-4 text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <Building2 className="w-5 h-5 text-stone-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">Bank Wire Transfer (T/T)</p>
                      <p className="text-xs text-stone-500 font-semibold">0% processing fee. Best for B2B.</p>
                    </div>
                  </div>
                </label>

                {/* Stripe / Credit Card */}
                <label className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${
                  selectedMethod === 'stripe' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="stripe"
                      checked={selectedMethod === 'stripe'}
                      onChange={() => setSelectedMethod('stripe')}
                      className="w-4 h-4 text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <CreditCard className="w-5 h-5 text-stone-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">Credit Card (Stripe)</p>
                      <p className="text-xs text-stone-500 font-semibold">2.9% processing fee.</p>
                    </div>
                  </div>
                </label>

                {/* PayPal */}
                <label className={`block cursor-pointer border-2 rounded-2xl p-4 transition-all ${
                  selectedMethod === 'paypal' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="paypal"
                      checked={selectedMethod === 'paypal'}
                      onChange={() => setSelectedMethod('paypal')}
                      className="w-4 h-4 text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                    <div className="w-10 h-10 bg-[#003087] rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <span className="text-white font-black italic text-xs">PayPal</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">PayPal</p>
                      <p className="text-xs text-stone-500 font-semibold">Pay via PayPal balance or cards.</p>
                    </div>
                  </div>
                </label>
              </>
            )}
          </div>

          {/* Payment Details Panel */}
          <div>
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 h-full">
              {selectedMethod === 'bank' && (
                <div>
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">Wire Transfer Details</h3>
                  <p className="text-sm font-semibold text-stone-600 mb-4">Please transfer the total amount to the following bank account. Your order will not ship until the funds have cleared in our account.</p>
                  
                  <div className="space-y-3 mb-6 bg-white p-4 rounded-xl border border-stone-200 text-sm font-bold text-stone-900">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Bank Name:</span>
                      <span>HDFC Bank, India</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Account Name:</span>
                      <span>Cocoveera Exports Pvt Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Account No:</span>
                      <span>50200012345678</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">SWIFT/BIC:</span>
                      <span>HDFCXXXXXXX</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedMethod === 'stripe' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CreditCard className="w-12 h-12 text-stone-300 mb-4" />
                  <p className="text-sm font-bold text-stone-900 mb-2">Pay securely with Stripe</p>
                  <p className="text-xs font-semibold text-stone-500">You will be redirected to the Stripe checkout page to complete your payment.</p>
                </div>
              )}

              {selectedMethod === 'razorpay' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-[#02042B] rounded-xl flex items-center justify-center mb-4"><span className="text-white font-black text-sm">RZP</span></div>
                  <p className="text-sm font-bold text-stone-900 mb-2">Pay securely with Razorpay</p>
                  <p className="text-xs font-semibold text-stone-500">Proceed to open the Razorpay payment gateway overlay.</p>
                </div>
              )}

              {selectedMethod === 'paypal' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-[#003087] rounded-xl flex items-center justify-center mb-4"><span className="text-white font-black italic text-sm">PayPal</span></div>
                  <p className="text-sm font-bold text-stone-900 mb-2">Pay with PayPal</p>
                  <p className="text-xs font-semibold text-stone-500">You will be redirected to PayPal to complete your payment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {paymentStatus === 'failed' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold text-center">
            Payment failed. Please try again or select a different payment method.
          </div>
        )}

        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => navigate('/account/order-summary')} 
            disabled={isProcessing}
            className="text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Summary
          </button>
          
          <button 
            onClick={handlePayment} 
            disabled={isProcessing}
            className="px-8 py-3.5 bg-[#2E7D32] text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-[#1B5E20] transition-colors shadow-lg shadow-[#2E7D32]/20 flex items-center justify-center gap-2 min-w-[200px] disabled:opacity-70"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : paymentStatus === 'success' ? (
              <><Check className="w-4 h-4" /> Payment Complete</>
            ) : (
              <>Pay $8,080.00 <ShieldCheck className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
