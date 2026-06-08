/**
 * File: frontend/src/pages/account/Checkout.jsx
 * Purpose: React page component representing the Checkout view.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Edit2, ShieldCheck, MapPin, Truck, CreditCard, Banknote, Mail, Sparkles, Ship, Package, CheckCircle2, Palmtree, Circle, Home } from 'lucide-react';
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
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [shippingRules, setShippingRules] = useState([]);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const defaultCountry = defaultAddr?.country || user?.country || 'India';

  const [shippingMode, setShippingMode] = useState(
    defaultCountry.trim().toLowerCase() === 'india' ? 'domestic' : 'international'
  );

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: defaultAddr?.phone || user?.phone || '',
    address: defaultAddr?.street || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    zip: defaultAddr?.zip || '',
    country: defaultCountry,
    port: '',
    shippingMethod: '',
    containerType: '',
  });

  const isIndia = formData.country.trim().toLowerCase() === 'india';

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
  
  const getPiecesForContainer = (cType, palletCount = 300) => {
    if (!cType) return 10 * palletCount;
    if (cType.includes('40FT')) return 22 * palletCount;
    return 10 * palletCount; // default 20FT
  };

  let totalPieces = 0;

  const subtotal = cartItems.reduce((acc, item) => {
    const cType = formData.containerType || item.containerType || '20FT FCL';
    const pieces = item.quantity * getPiecesForContainer(cType, item.product?.palletCount);
    totalPieces += pieces;
    const price = item.product?.price || 0;
    return acc + (price * pieces);
  }, 0);
  
  const totalWeightKg = cartItems.reduce((acc, item) => {
    const cType = formData.containerType || item.containerType || '20FT FCL';
    const pieces = item.quantity * getPiecesForContainer(cType, item.product?.palletCount);
    const weight = item.product?.weight || 0;
    return acc + (weight * pieces);
  }, 0);

  const totalVolumeCBM = cartItems.reduce((acc, item) => {
    const cType = formData.containerType || item.containerType || '20FT FCL';
    const pieces = item.quantity * getPiecesForContainer(cType, item.product?.palletCount);
    const volume = item.product?.volumeCBM || 0;
    return acc + (volume * pieces);
  }, 0);

  let recommendedContainer = '20FT Container';
  if (totalWeightKg > 28000 || totalVolumeCBM > 33) {
    if (totalWeightKg <= 26000 && totalVolumeCBM <= 67) {
       recommendedContainer = '40FT Container';
    } else {
       recommendedContainer = 'Multiple Containers Required';
    }
  }

  const totalContainerQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isWholeContainer = Number.isInteger(totalContainerQuantity) && totalContainerQuantity >= 1;
  const isValidOrderQuantity = isWholeContainer;

  // Fetch shipping rules
  React.useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await apiClient.get('/shipping/rules');
        if (res.data.success) {
          setShippingRules(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch shipping rules", err);
      }
    };
    fetchRules();
  }, []);

  // Calculate shipping cost and live quote
  React.useEffect(() => {
    const runQuote = async () => {
      if (!shippingRules?.countries?.length) return;
      const originCountry = shippingRules.countries.find((item) => item.code === 'IN' || item.name?.toLowerCase() === 'india');
      const destinationCountry = shippingRules.countries.find((item) => item.name?.toLowerCase() === formData.country.toLowerCase()) || shippingRules.countries.find((item) => item.name?.toLowerCase() === 'india');
      if (!originCountry || !destinationCountry) return;
      try {
        setShippingLoading(true);
        const res = await apiClient.post('/shipping/calculate', {
          originCountry: originCountry._id,
          destinationCountry: destinationCountry._id,
          shippingMethod: formData.shippingMethod || shippingRules.shippingMethods?.[0]?._id,
          containerType: formData.containerType || undefined,
          weightKg: totalWeightKg,
          itemsTotal: subtotal,
          currency: user?.currency || 'INR',
          port: formData.port,
        });
        if (res.data.success) {
          setShippingQuote(res.data.data);
          setShippingCharge(res.data.data.shippingCost + res.data.data.containerCost + res.data.data.exportCharges + res.data.data.tax);
        }
      } catch (err) {
        console.error('Quote error', err);
        setShippingQuote(null);
        setShippingCharge(0);
      } finally {
        setShippingLoading(false);
      }
    };
    runQuote();
  }, [formData.country, formData.port, formData.shippingMethod, formData.containerType, shippingRules, subtotal, totalWeightKg, user?.currency]);

  // Dummy discount 15% for illustration as per reference
  const discount = Math.round(subtotal * 0.15);
  const total = subtotal - discount + shippingCharge;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isAddressValid = () => {
    return !!(
      formData.address?.trim() &&
      formData.city?.trim() &&
      formData.state?.trim() &&
      formData.zip?.trim() &&
      formData.country?.trim()
    );
  };

  const step1Ref = React.useRef(null);
  const step2Ref = React.useRef(null);
  const step3Ref = React.useRef(null);

  React.useEffect(() => {
    const refs = { 1: step1Ref, 2: step2Ref, 3: step3Ref };
    if (refs[activeStep]?.current) {
      setTimeout(() => {
        const yOffset = -120; // Account for sticky top navbar
        const element = refs[activeStep].current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 350); 
    }
  }, [activeStep]);

  const handleSetStep = (step) => {
    if (step === 1) {
      setActiveStep(1);
    } else if (step === 2) {
      if (!isAddressValid()) {
        alert("Please fill in all Delivery Address fields.");
        return;
      }
      setActiveStep(2);
    } else if (step === 3) {
      if (!isAddressValid()) {
        alert("Please fill in all Delivery Address fields first.");
        setActiveStep(1);
        return;
      }
      if (cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
      }
      if (!isValidOrderQuantity) {
        alert("Checkout is available only for full container quantities. Please complete the remaining container capacity.");
        return;
      }
      setActiveStep(3);
    }
  };

  const handleStep2Next = () => {
    handleSetStep(2);
  };

  const isDomestic = shippingMode === 'domestic';

  const getStepWrapperStyle = (step) => {
    if (activeStep === step) {
      return "bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#2E7D32]/30 overflow-hidden transition-all duration-500 transform relative z-10";
    } else if (activeStep > step) {
      return "bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:bg-stone-50 transition-all duration-500 relative z-10 cursor-pointer";
    } else {
      return "bg-white/60 rounded-2xl shadow-sm border border-stone-100 overflow-hidden opacity-70 transition-all duration-500 relative z-10";
    }
  };

  const handleSuccess = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => {
      navigate('/account/orders');
    }, 4000);
  };

  const handlePlaceOrder = async () => {
    if (!isAddressValid()) {
      alert("Please fill in all Delivery Address fields.");
      setActiveStep(1);
      return;
    }
    if (!isValidOrderQuantity) {
      alert("Checkout is available only for full container quantities. Please complete the remaining container capacity.");
      return;
    }
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

      // Get the container type selected by the user
      const finalContainerType = formData.containerType || localStorage.getItem('preferredContainer') || recommendedContainer;

      const shippingDetails = {
        shippingMethod: shippingMode === 'domestic' ? 'road' : 'sea',
        portOfLoading: formData.port || 'Origin Port',
        portOfDischarge: formData.port || 'Destination Port',
        incoterms: shippingMode === 'domestic' ? 'DAP' : 'FOB',
        transitTime: 'TBD',
        containerType: finalContainerType
      };

      // 1. Create the order in DB
      const orderRes = await apiClient.post('/orders', {
        items,
        shippingAddress,
        paymentGateway: paymentMethod,
        containerType: finalContainerType,
        shippingCharge,
        shippingDetails,
        discount,
        tax: 0
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
        handleSuccess();
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
              handleSuccess();
            } catch (err) {
              alert("Payment confirmation failed.");
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: user?.email,
            contact: formData.phone
          },
          theme: { color: "#2E7D32" },
          modal: {
            ondismiss: async function() {
              try {
                await apiClient.post('/payments/confirm', {
                  orderId: createdOrder._id,
                  gateway: 'razorpay',
                  status: 'failed'
                });
                navigate('/account/orders');
              } catch (e) {
                navigate('/account/orders');
              }
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response){
           alert("Payment failed: " + response.error.description);
           try {
             await apiClient.post('/payments/confirm', {
               orderId: createdOrder._id,
               gateway: 'razorpay',
               status: 'failed'
             });
             navigate('/account/orders');
           } catch (e) {
             navigate('/account/orders');
           }
        });
        rzp.open();
      } else if (paymentMethod === 'stripe' || paymentMethod === 'paypal') {
        alert(`${paymentMethod.toUpperCase()} integration is configured in backend but requires frontend checkout UI logic to be built out. Order placed as Pending.`);
        handleSuccess();
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
      onClick={() => isCompleted && handleSetStep(step)}
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
          onClick={(e) => { e.stopPropagation(); handleSetStep(step); }}
        >
          Modify
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-36 relative">
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#F0FAF0] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
              {/* Sea / Ground line */}
              <div className="absolute bottom-10 w-full h-1 bg-green-200/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, delay: 0.5, ease: "linear" }}
                  className="w-full h-full bg-green-500"
                />
              </div>

              {/* The Palm Tree (Origin) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-10 left-[calc(50%-100px)] -ml-4"
              >
                <Palmtree className="w-8 h-8 text-green-700" />
              </motion.div>

              {/* The House (Destination) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute bottom-10 left-[calc(50%+100px)] -ml-4"
              >
                <Home className="w-8 h-8 text-stone-700" />
              </motion.div>

              {/* Package traveling */}
              <motion.div
                initial={{ x: -100, y: -20, opacity: 0 }}
                animate={{ 
                  x: [-100, 0, 100],
                  y: [-20, -20, -20],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, times: [0, 0.5, 1], ease: "linear" }}
                className="absolute bottom-10 left-1/2 -ml-3 z-30"
              >
                <div className="bg-orange-100 p-1 rounded border border-orange-200 shadow-sm">
                  <Package className="w-4 h-4 text-stone-700" />
                </div>
              </motion.div>

              {/* Truck (First leg) */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ 
                  x: [-100, 0, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, times: [0, 0.45, 0.5], ease: "linear" }}
                className="absolute bottom-10 left-1/2 -ml-6 z-20"
              >
                <Truck className="w-12 h-12 text-[#2E7D32]" />
              </motion.div>

              {/* Ship (Second leg) */}
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ 
                  x: [0, 0, 100],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, times: [0, 0.5, 1], ease: "linear" }}
                className="absolute bottom-10 left-1/2 -ml-6 z-20"
              >
                <Ship className="w-12 h-12 text-blue-600" />
              </motion.div>

              {/* Success Check */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.8, type: "spring", stiffness: 200, damping: 15 }}
                className="absolute inset-0 flex items-center justify-center z-40"
              >
                <div className="bg-white rounded-full p-4 shadow-2xl">
                  <CheckCircle2 className="w-20 h-20 text-[#2E7D32]" />
                </div>
              </motion.div>
            </div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }} className="text-2xl md:text-3xl font-black text-stone-900 mb-2 text-center px-4">Order Placed Successfully!</motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="text-stone-500 font-bold text-center px-4 text-sm md:text-base">Your cargo is being prepared for shipping...</motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8">
        
        {/* Header Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Secure Checkout</h1>
          <p className="text-stone-500 font-medium mt-2">Complete your premium export order</p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-10 items-start">
          
          {/* LEFT: Accordion Steps */}
          <div className="w-full lg:w-[60%] relative space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-[36px] top-[50px] bottom-[50px] w-[2px] bg-stone-200 z-0 hidden sm:block rounded-full"></div>
          
          {/* STEP 1: Delivery Address */}
          <div ref={step1Ref} className={getStepWrapperStyle(1)}>
            <StepHeader 
              step={1} 
              title="Delivery Address" 
              summary={`${formData.firstName} ${formData.lastName}, ${formData.city}`} 
              isCompleted={activeStep > 1} 
              isActive={activeStep === 1} 
            />
            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 md:p-7 pt-0 mt-2 ml-0 sm:ml-12 border-t border-stone-100">
                    <div className="space-y-5">
                      <div className="bg-stone-50/60 rounded-2xl border border-stone-100 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Shipping Mode</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className={`p-3 rounded-xl border cursor-pointer transition ${shippingMode === 'domestic' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 bg-white'}`}>
                            <input type="radio" checked={shippingMode === 'domestic'} onChange={() => { setShippingMode('domestic'); setFormData((p) => ({ ...p, country: 'India', port: '', shippingMethod: 'road' })); }} className="sr-only" />
                            <p className="font-bold text-sm text-stone-900">Domestic India</p>
                            <p className="text-xs text-stone-500">State, city, pincode</p>
                          </label>
                          <label className={`p-3 rounded-xl border cursor-pointer transition ${shippingMode === 'international' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 bg-white'}`}>
                            <input type="radio" checked={shippingMode === 'international'} onChange={() => { setShippingMode('international'); setFormData((p) => ({ ...p, port: '', shippingMethod: 'sea' })); }} className="sr-only" />
                            <p className="font-bold text-sm text-stone-900">International Export</p>
                            <p className="text-xs text-stone-500">Country, port, method</p>
                          </label>
                        </div>
                      </div>
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
                          {isDomestic ? (
                            <input name="state" value={formData.state} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                          ) : (
                            <input name="state" value={formData.state} onChange={handleChange} placeholder="Province / Region" className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                          )}
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {!isDomestic && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Port</label>
                            <input name="port" value={formData.port} onChange={handleChange} placeholder="Chennai Port, Mumbai Port..." className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Shipping Method</label>
                          <select name="shippingMethod" value={formData.shippingMethod} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none">
                            <option value="">Auto-select</option>
                            {shippingRules?.shippingMethods?.filter(m => (shippingMode === 'domestic' ? m.category === 'domestic' : m.category === 'international')).map(m => (
                                <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {!isDomestic && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Container Type</label>
                          <select name="containerType" value={formData.containerType} onChange={handleChange} className="w-full bg-stone-50/50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all outline-none">
                            <option value="">No container / auto</option>
                            <option value="20FT FCL">20FT FCL</option>
                            <option value="40FT FCL">40FT FCL</option>
                            <option value="LCL">LCL</option>
                          </select>
                        </div>
                      )}

                      <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Live Shipping Quote</p>
                          <p className="text-xs font-bold text-stone-500">{shippingLoading ? 'Updating...' : shippingQuote ? 'Ready' : 'Waiting'}</p>
                        </div>
                        {shippingQuote ? (
                          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-stone-600">
                            <div>Shipping: <span className="font-black text-stone-900">{formatPrice(shippingQuote.shippingCost)}</span></div>
                            <div>Container: <span className="font-black text-stone-900">{formatPrice(shippingQuote.containerCost)}</span></div>
                            <div>Export: <span className="font-black text-stone-900">{formatPrice(shippingQuote.exportCharges)}</span></div>
                            <div>Tax: <span className="font-black text-stone-900">{formatPrice(shippingQuote.tax)}</span></div>
                            <div className="col-span-2">Transit: <span className="font-black text-stone-900">{shippingQuote.transitTimeDays} days</span></div>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-500">Select destination details to calculate freight, export fees, and ETA.</p>
                        )}
                      </div>
                    </div>
                    <button onClick={handleStep2Next} className="mt-8 hidden lg:block bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#144d18] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_8px_20px_rgb(46,125,50,0.25)] hover:shadow-[0_8px_25px_rgb(46,125,50,0.35)] transition-all transform active:scale-95">
                      Deliver Here
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 2: Order Summary */}
          <div ref={step2Ref} className={getStepWrapperStyle(2)}>
            <StepHeader 
              step={2} 
              title="Order Summary" 
              summary={`${cartItems.length} items`} 
              isCompleted={activeStep > 2} 
              isActive={activeStep === 2} 
            />
            <AnimatePresence>
              {activeStep === 2 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 md:p-7 pt-0 mt-2 ml-0 sm:ml-12 border-t border-stone-100">
                    {cartItems.length === 0 ? (
                      <p className="text-sm text-stone-500 font-semibold">Your cart is empty.</p>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="flex gap-5 p-4 rounded-xl hover:bg-stone-50/80 transition-colors border border-transparent hover:border-stone-100">
                            <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1592424006909-5a1ff1461ff4?auto=format&fit=crop&q=80&w=200'} alt={item.product?.name} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
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
                        <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-100 flex items-center gap-3 sm:gap-4 mt-6">
                          <div className="bg-white p-2.5 rounded-full shadow-sm border border-stone-100 shrink-0">
                            <Mail className="w-5 h-5 text-stone-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-stone-500 font-bold uppercase tracking-widest truncate">Order Updates Will Be Sent To</p>
                            <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {!isValidOrderQuantity && cartItems.length > 0 && (
                      <div className="mt-6 flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-red-700">Full Container Requirement Not Met</p>
                          <p className="text-xs font-semibold text-red-600 mt-1">
                            Your current total is {totalContainerQuantity.toFixed(2)} Containers. Checkout is available only for full container quantities. Please add {(1 - (totalContainerQuantity % 1)).toFixed(2)} more to complete the next full container.
                          </p>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => handleSetStep(3)} 
                      disabled={cartItems.length === 0 || !isValidOrderQuantity}
                      className="mt-8 hidden lg:block bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#144d18] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_8px_20px_rgb(46,125,50,0.25)] hover:shadow-[0_8px_25px_rgb(46,125,50,0.35)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 3: Payment Method */}
          <div ref={step3Ref} className={getStepWrapperStyle(3)}>
            <StepHeader 
              step={3} 
              title="Payment Method" 
              isCompleted={false} 
              isActive={activeStep === 3} 
            />
            <AnimatePresence>
              {activeStep === 3 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 md:p-7 pt-0 mt-2 ml-0 sm:ml-12 border-t border-stone-100">
                    <div className="space-y-4">
                      {isIndia ? (
                        <>
                          <label className={`flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'razorpay' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 sm:w-5 sm:h-5 accent-[#2E7D32] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-bold text-stone-900 leading-tight">Pay Online (Razorpay)</p>
                              <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-1 leading-snug">UPI, Cards, Netbanking securely via Razorpay.</p>
                            </div>
                            <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${paymentMethod === 'razorpay' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                          <label className={`flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 sm:w-5 sm:h-5 accent-[#2E7D32] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-bold text-stone-900 leading-tight">Cash on Delivery (COD)</p>
                              <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-1 leading-snug">Pay with cash upon delivery of your order.</p>
                            </div>
                            <Banknote className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${paymentMethod === 'cod' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                        </>
                      ) : (
                        <>
                          <label className={`flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'wire' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="wire" checked={paymentMethod === 'wire'} onChange={() => setPaymentMethod('wire')} className="w-4 h-4 sm:w-5 sm:h-5 accent-[#2E7D32] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-bold text-stone-900 leading-tight">International Wire Transfer</p>
                              <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-1 leading-snug">Standard SWIFT bank transfer for export orders.</p>
                            </div>
                            <Banknote className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${paymentMethod === 'wire' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                          <label className={`flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'paypal' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="w-4 h-4 sm:w-5 sm:h-5 accent-[#2E7D32] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-bold text-stone-900 leading-tight">PayPal Express</p>
                              <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-1 leading-snug">Checkout securely via your PayPal account.</p>
                            </div>
                            <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${paymentMethod === 'paypal' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
                          </label>
                          <label className={`flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'stripe' ? 'border-[#2E7D32] bg-[#F0FAF0] shadow-sm' : 'border-transparent bg-stone-50 hover:bg-stone-100 hover:border-stone-200'}`}>
                            <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="w-4 h-4 sm:w-5 sm:h-5 accent-[#2E7D32] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-bold text-stone-900 leading-tight">Credit / Debit Card</p>
                              <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-1 leading-snug">Secure card processing powered by Stripe.</p>
                            </div>
                            <ShieldCheck className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${paymentMethod === 'stripe' ? 'text-[#2E7D32]' : 'text-stone-400'}`} />
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
                  <span>Total Containers</span>
                  <span className="text-stone-900 font-bold">{totalContainerQuantity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Pieces</span>
                  <span className="text-stone-900 font-bold">{Math.round(totalPieces).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Price</span>
                  <span className="text-stone-900 font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Weight</span>
                  <span className="text-stone-900 font-bold">{totalWeightKg.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Volume</span>
                  <span className="text-stone-900 font-bold">{totalVolumeCBM.toFixed(2)} CBM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recommendation</span>
                  <span className="text-[#2E7D32] font-bold">{recommendedContainer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Discount</span>
                  <span className="text-[#2E7D32] font-bold">- {formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  {shippingLoading ? (
                    <span className="text-stone-400 font-bold text-[11px]">Calculating...</span>
                  ) : shippingCharge === 0 ? (
                    <span className="text-stone-500 font-bold text-[11px]">Pending Calculation</span>
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

              {activeStep === 3 ? (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !isValidOrderQuantity}
                  className="hidden lg:flex w-full bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#144d18] text-white font-black uppercase tracking-widest text-sm py-4.5 rounded-2xl shadow-[0_8px_25px_rgb(46,125,50,0.3)] hover:shadow-[0_12px_30px_rgb(46,125,50,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center h-14"
                >
                  {isProcessing ? 'Processing Securely...' : 'Complete Payment'}
                </button>
              ) : (
                <div className="hidden lg:flex h-14 items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Complete steps to pay</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 lg:hidden flex gap-3 items-center backdrop-blur-md bg-white/95">
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-stone-500 text-[9px] font-extrabold uppercase tracking-wider block mb-0.5">Total Amount</span>
          <span className="text-sm font-poppins font-black text-[#2E7D32] leading-none">{formatPrice(total)}</span>
        </div>
        <div className="flex gap-2 flex-[2]">
          {activeStep === 1 && (
            <button
              type="button"
              onClick={handleStep2Next}
              className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-[11px] font-black py-3.5 rounded-xl shadow-md shadow-[#2E7D32]/20 flex items-center justify-center disabled:opacity-50 transition-colors uppercase tracking-widest"
            >
              Deliver Here
            </button>
          )}
          {activeStep === 2 && (
            <button
              type="button"
              onClick={() => handleSetStep(3)}
              disabled={cartItems.length === 0 || !isValidOrderQuantity}
              className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-[11px] font-black py-3.5 rounded-xl shadow-md shadow-[#2E7D32]/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
            >
              Continue
            </button>
          )}
          {activeStep === 3 && (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isProcessing || !isValidOrderQuantity}
              className="flex-1 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white font-poppins text-[11px] font-black py-3.5 rounded-xl shadow-md shadow-[#2E7D32]/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
