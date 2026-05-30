import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Edit2, ShieldCheck, MapPin, Truck, CreditCard, Banknote, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchProfile } = useAuth();
  
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingRules, setShippingRules] = useState([]);
  const [shippingCharge, setShippingCharge] = useState(0);
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: user?.country || 'India',
  });

  const isIndia = formData.country.toLowerCase() === 'india';

  // Automatically adjust default payment method when country changes
  React.useEffect(() => {
    if (isIndia) {
      if (!['cod', 'razorpay'].includes(paymentMethod)) setPaymentMethod('razorpay');
    } else {
      if (!['wire', 'paypal', 'stripe'].includes(paymentMethod)) setPaymentMethod('wire');
    }
  }, [isIndia]);

  // Load Razorpay Script dynamically
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const directCheckoutItem = location.state?.product ? {
    product: location.state.product,
    quantity: location.state.quantity,
  } : null;

  const cartItems = directCheckoutItem ? [directCheckoutItem] : (user?.cart || []);
  
  // Computations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);
  
  const totalWeightKg = cartItems.reduce((acc, item) => {
    const weight = item.product?.weightKg || 5; // Fallback to 5kg if missing
    return acc + (weight * item.quantity);
  }, 0);

  // Fetch shipping rules
  React.useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await apiClient.get('/orders/shipping-rules');
        if (res.data.success) {
          setShippingRules(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch shipping rules", err);
      }
    };
    fetchRules();
  }, []);

  // Calculate shipping cost
  React.useEffect(() => {
    if (!shippingRules.length) return;
    
    // Find rule for country, or fallback to 'Global' if it exists
    let rule = shippingRules.find(r => r.country.toLowerCase() === formData.country.toLowerCase());
    if (!rule) {
      rule = shippingRules.find(r => r.country.toLowerCase() === 'global');
    }

    if (rule) {
      // Check free shipping threshold
      if (rule.freeShipping?.enabled && subtotal >= rule.freeShipping.minAmount) {
        setShippingCharge(0);
        return;
      }

      // Determine tier
      if (totalWeightKg <= 5) {
        setShippingCharge(rule.weightRules.upTo5kg);
      } else if (totalWeightKg <= 20) {
        setShippingCharge(rule.weightRules.upTo20kg);
      } else {
        setShippingCharge(rule.weightRules.over20kg);
      }
    } else {
      // No rule found - block checkout or set a high default
      setShippingCharge(0); 
    }
  }, [formData.country, shippingRules, subtotal, totalWeightKg]);

  // Dummy discount 15% for illustration as per reference
  const discount = Math.round(subtotal * 0.15);
  const total = subtotal - discount + shippingCharge;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Next = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      alert("Please fill in all Account Details.");
      return;
    }
    setActiveStep(2);
  };

  const handleStep2Next = () => {
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zip.trim() || !formData.country.trim()) {
      alert("Please fill in all Delivery Address fields.");
      return;
    }
    setActiveStep(3);
  };

  const getStepWrapperStyle = (step) => {
    if (activeStep === step) {
      return "bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-100/50 overflow-hidden transition-all duration-500 transform relative z-10";
    } else if (activeStep > step) {
      return "bg-white/80 rounded-2xl border border-stone-100/50 overflow-hidden hover:bg-white transition-all duration-500 relative z-10 cursor-pointer";
    } else {
      return "bg-transparent rounded-2xl border-none overflow-hidden opacity-50 transition-all duration-500 relative z-10 grayscale-[0.5]";
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      const items = cartItems.map(c => ({
        product: c.product._id,
        quantity: c.quantity,
        price: c.product.price
      }));

      const shippingAddress = {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip,
        country: formData.country
      };

      // 1. Create the order in DB
      const orderRes = await apiClient.post('/orders', {
        items,
        shippingAddress,
        paymentGateway: paymentMethod,
        shippingCharge
      });

      if (!orderRes.data.success) throw new Error("Failed to create order");
      const createdOrder = orderRes.data.data;

      // Clear cart
      if (!directCheckoutItem) {
        await apiClient.delete('/users/cart');
      }
      await fetchProfile();

      // 2. Handle specific payment gateways
      if (paymentMethod === 'cod' || paymentMethod === 'wire') {
        // Simple completion for offline methods
        navigate('/account/orders');
        return;
      }

      if (paymentMethod === 'razorpay') {
        // Initiate Razorpay
        const initRes = await apiClient.post('/payments/initiate', {
          orderId: createdOrder._id,
          gateway: 'razorpay'
        });

        if (!initRes.data.success) throw new Error("Failed to initiate Razorpay");

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_live_SSGOmOhJxOiqbl", // In production, serve from env
          amount: initRes.data.amount,
          currency: initRes.data.currency,
          name: "Cocoveera",
          description: "Premium Export Order",
          image: "https://res.cloudinary.com/dyrfiop7d/image/upload/v1779801371/cocoveera/branding/ewo6ljdta2dklg9kvbrs.jpg",
          order_id: initRes.data.id,
          handler: async function (response) {
            try {
              await apiClient.post('/payments/confirm', {
                orderId: createdOrder._id,
                paymentId: response.razorpay_payment_id,
                gateway: 'razorpay',
                status: 'success'
              });
              navigate('/account/orders');
            } catch (err) {
              alert("Payment confirmation failed.");
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: user?.email,
            contact: formData.phone
          },
          theme: { color: "#2E7D32" }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
           alert("Payment failed: " + response.error.description);
        });
        rzp.open();
      } else if (paymentMethod === 'stripe' || paymentMethod === 'paypal') {
        alert(`${paymentMethod.toUpperCase()} integration is configured in backend but requires frontend checkout UI logic to be built out. Order placed as Pending.`);
        navigate('/account/orders');
      }

    } catch (err) {
      console.error("Order placement failed:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (amt) => convertCurrency(amt, user?.currency || 'INR').formatted;

  const StepHeader = ({ step, title, summary, isCompleted, isActive }) => (
    <div 
      className={`flex items-start md:items-center justify-between p-5 md:p-7 ${isCompleted ? 'cursor-pointer group' : ''}`}
      onClick={() => isCompleted && setActiveStep(step)}
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          {isActive && <div className="absolute inset-0 bg-[#2E7D32] blur-md opacity-20 rounded-full" />}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            isCompleted 
              ? 'bg-[#E8F5E9] text-[#2E7D32] ring-4 ring-white' 
              : isActive 
                ? 'bg-[#2E7D32] text-white shadow-lg shadow-[#2E7D32]/40 ring-4 ring-[#2E7D32]/10 scale-110' 
                : 'bg-stone-100 text-stone-400 ring-4 ring-white'
          }`}>
            {isCompleted ? <Check className="w-5 h-5 text-[#2E7D32]" /> : step}
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className={`text-base md:text-lg font-extrabold tracking-tight transition-colors duration-300 ${isActive ? 'text-stone-900' : isCompleted ? 'text-stone-800' : 'text-stone-400'}`}>
            {title}
          </h2>
          {isCompleted && !isActive && summary && (
            <p className="text-xs font-semibold text-stone-500 mt-1 line-clamp-1 max-w-[200px] md:max-w-xs">{summary}</p>
          )}
        </div>
      </div>
      {isCompleted && !isActive && (
        <button 
          className="text-[10px] font-bold text-stone-500 bg-stone-100 group-hover:bg-[#E8F5E9] group-hover:text-[#2E7D32] px-4 py-2 rounded-full transition-colors uppercase tracking-wider hidden sm:block"
          onClick={(e) => { e.stopPropagation(); setActiveStep(step); }}
        >
          Modify
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24">
      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8">
        
        {/* Header Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Secure Checkout</h1>
          <p className="text-stone-500 font-medium mt-2">Complete your premium export order</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* LEFT: Accordion Steps */}
          <div className="w-full lg:w-[60%] relative space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-[36px] top-[50px] bottom-[50px] w-[2px] bg-stone-200 z-0 hidden sm:block rounded-full"></div>
          
          {/* STEP 1: Account Details */}
          <div className={getStepWrapperStyle(1)}>
            <StepHeader 
              step={1} 
              title="Account Details" 
              summary={`${user?.name} | ${user?.phone || user?.email}`} 
              isCompleted={activeStep > 1} 
              isActive={activeStep === 1} 
            />
            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 md:p-7 pt-0 mt-2 ml-0 sm:ml-12 border-t border-stone-100">
                    <p className="text-sm font-medium text-stone-500 mb-6">You are securely logged in as <span className="font-bold text-stone-900">{user?.email}</span></p>
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">First Name</label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Last Name</label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                    </div>
                    <button onClick={handleStep1Next} className="mt-8 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#144d18] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_8px_20px_rgb(46,125,50,0.25)] hover:shadow-[0_8px_25px_rgb(46,125,50,0.35)] transition-all transform active:scale-95">
                      Continue to Delivery
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 2: Delivery Address */}
          <div className={getStepWrapperStyle(2)}>
            <StepHeader 
              step={2} 
              title="Delivery Address" 
              summary={`${formData.firstName} ${formData.lastName}, ${formData.city}`} 
              isCompleted={activeStep > 2} 
              isActive={activeStep === 2} 
            />
            <AnimatePresence>
              {activeStep === 2 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 md:p-7 pt-0 mt-2 ml-0 sm:ml-12 border-t border-stone-100">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Street Address</label>
                        <input name="address" value={formData.address} onChange={handleChange} placeholder="House No, Building, Street Area" className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">City</label>
                          <input name="city" value={formData.city} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">State</label>
                          <input name="state" value={formData.state} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Pincode / ZIP</label>
                          <input name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Country</label>
                          <input name="country" value={formData.country} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                        </div>
                      </div>
                    </div>
                    <button onClick={handleStep2Next} className="mt-8 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#144d18] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_8px_20px_rgb(46,125,50,0.25)] hover:shadow-[0_8px_25px_rgb(46,125,50,0.35)] transition-all transform active:scale-95">
                      Deliver Here
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 3: Order Summary */}
          <div className={getStepWrapperStyle(3)}>
            <StepHeader 
              step={3} 
              title="Order Summary" 
              summary={`${cartItems.length} items`} 
              isCompleted={activeStep > 3} 
              isActive={activeStep === 3} 
            />
            <AnimatePresence>
              {activeStep === 3 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 md:p-7 pt-0 mt-2 ml-0 sm:ml-12 border-t border-stone-100">
                    {cartItems.length === 0 ? (
                      <p className="text-sm text-stone-500 font-semibold">Your cart is empty.</p>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="flex gap-5 p-4 rounded-xl hover:bg-stone-50/80 transition-colors border border-transparent hover:border-stone-100">
                            <img src={item.product?.images?.[0] || 'https://via.placeholder.com/80'} alt={item.product?.name} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
                            <div className="flex-1 flex flex-col justify-center">
                              <h3 className="text-base font-extrabold text-stone-900 line-clamp-1">{item.product?.name || 'Unknown Product'}</h3>
                              <p className="text-xs text-stone-500 font-medium mt-1">Quantity: <span className="font-bold text-stone-900">{item.quantity}</span></p>
                              <div className="mt-3 flex items-center gap-3">
                                <span className="text-lg font-black text-stone-900">{formatPrice(item.product?.price || 0)}</span>
                                <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-md tracking-wide">15% OFF</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex items-center gap-4 mt-6">
                          <div className="bg-white p-2.5 rounded-full shadow-sm border border-stone-100">
                            <Mail className="w-5 h-5 text-stone-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Order Updates Will Be Sent To</p>
                            <p className="text-sm font-bold text-stone-900 mt-0.5">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => setActiveStep(4)} 
                      disabled={cartItems.length === 0}
                      className="mt-8 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#144d18] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_8px_20px_rgb(46,125,50,0.25)] hover:shadow-[0_8px_25px_rgb(46,125,50,0.35)] transition-all transform active:scale-95 disabled:opacity-50"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 4: Payment Method */}
          <div className={getStepWrapperStyle(4)}>
            <StepHeader 
              step={4} 
              title="Payment Method" 
              isCompleted={false} 
              isActive={activeStep === 4} 
            />
            <AnimatePresence>
              {activeStep === 4 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 md:p-7 pt-0 mt-2 ml-0 sm:ml-12 border-t border-stone-100">
                    <div className="space-y-4">
                      {isIndia ? (
                        <>
                          <label className={`flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'razorpay' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-5 h-5 accent-[#2E7D32]" />
                            <div className="flex-1">
                              <p className="text-sm md:text-base font-bold text-stone-900">Pay Online (Razorpay)</p>
                              <p className="text-xs text-stone-500 font-medium mt-1">UPI, Cards, Netbanking securely via Razorpay.</p>
                            </div>
                            <CreditCard className={`w-6 h-6 ${paymentMethod === 'razorpay' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                          <label className={`flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-[#2E7D32]" />
                            <div className="flex-1">
                              <p className="text-sm md:text-base font-bold text-stone-900">Cash on Delivery</p>
                              <p className="text-xs text-stone-500 font-medium mt-1">Pay when your order is delivered to your location.</p>
                            </div>
                            <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                        </>
                      ) : (
                        <>
                          <label className={`flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'wire' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="wire" checked={paymentMethod === 'wire'} onChange={() => setPaymentMethod('wire')} className="w-5 h-5 accent-[#2E7D32]" />
                            <div className="flex-1">
                              <p className="text-sm md:text-base font-bold text-stone-900">International Wire Transfer</p>
                              <p className="text-xs text-stone-500 font-medium mt-1">Standard SWIFT bank transfer for export orders.</p>
                            </div>
                            <Banknote className={`w-6 h-6 ${paymentMethod === 'wire' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                          <label className={`flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'paypal' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="w-5 h-5 accent-[#2E7D32]" />
                            <div className="flex-1">
                              <p className="text-sm md:text-base font-bold text-stone-900">PayPal Express</p>
                              <p className="text-xs text-stone-500 font-medium mt-1">Checkout securely via your PayPal account.</p>
                            </div>
                            <CreditCard className={`w-6 h-6 ${paymentMethod === 'paypal' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                          <label className={`flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'stripe' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="w-5 h-5 accent-[#2E7D32]" />
                            <div className="flex-1">
                              <p className="text-sm md:text-base font-bold text-stone-900">Credit / Debit Card</p>
                              <p className="text-xs text-stone-500 font-medium mt-1">Secure card processing powered by Stripe.</p>
                            </div>
                            <ShieldCheck className={`w-6 h-6 ${paymentMethod === 'stripe' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Safe Delivery Policy */}
          <div className="bg-stone-100/50 rounded-2xl p-5 border border-stone-200/50 flex items-start gap-4 mt-8 ml-0 sm:ml-12 relative z-10">
            <div className="bg-[#2E7D32]/10 text-[#2E7D32] p-2.5 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-900">Safe Delivery Policy</p>
              <p className="text-xs font-medium text-stone-500 mt-1 leading-relaxed">Products are handled with care. Please ensure someone is available to receive and store items safely.</p>
            </div>
          </div>
          
        </div>

        {/* RIGHT: Price Details Sidebar */}
        <div className="w-full lg:w-[40%] sticky top-28">
          <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-stone-100 overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-100 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Price Summary</h3>
                <p className="text-xs text-stone-500 font-medium mt-1">Review your premium order</p>
              </div>
              <div className="bg-white p-2.5 rounded-full shadow-sm border border-stone-100">
                <Banknote className="w-5 h-5 text-[#2E7D32]" />
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div className="space-y-4 text-sm font-semibold text-stone-500">
                <div className="flex justify-between items-center">
                  <span>Total Price ({cartItems.length} items)</span>
                  <span className="text-stone-900 font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Discount</span>
                  <span className="text-[#2E7D32] font-bold">- {formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  {shippingCharge === 0 ? (
                    <span className="text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide">FREE</span>
                  ) : (
                    <span className="text-stone-900 font-bold">{formatPrice(shippingCharge)}</span>
                  )}
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t-2 border-dashed border-stone-200 py-6 my-6">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Total Amount</span>
                  <span className="text-4xl font-black text-stone-900 tracking-tight">{formatPrice(total)}</span>
                  <span className="text-xs font-bold text-[#2E7D32] mt-2 inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> YOU SAVE {formatPrice(discount)}</span>
                </div>
              </div>

              {activeStep === 4 ? (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#144d18] text-white font-black uppercase tracking-widest text-sm py-4.5 rounded-2xl shadow-[0_8px_25px_rgb(46,125,50,0.3)] hover:shadow-[0_12px_30px_rgb(46,125,50,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-14"
                >
                  {isProcessing ? 'Processing Securely...' : 'Complete Payment'}
                </button>
              ) : (
                <div className="h-14 flex items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Complete steps to pay</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Checkout;
