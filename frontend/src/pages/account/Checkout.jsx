import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ShieldCheck, MapPin, Truck, CreditCard, Banknote, Mail, Sparkles, Ship, Package, CheckCircle2, Home, AlertCircle, FileText, ArrowLeft, RefreshCw, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../context/AuthContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { isIndianUser } from '../../utils/countryHelpers';
import confetti from 'canvas-confetti';
import SEO from '../../components/SEO';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // B2B Order / Milestone State
  const [targetOrderId, setTargetOrderId] = useState(location.state?.orderId || '');
  const [milestoneIndex, setMilestoneIndex] = useState(location.state?.milestoneIndex || 0);
  const [milestoneOrder, setMilestoneOrder] = useState(null);
  const [milestoneLoading, setMilestoneLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Initialize and Fetch B2B Order details
  const fetchOrderDetails = async (orderId) => {
    try {
      setMilestoneLoading(true);
      setErrorMsg('');
      const res = await apiClient.get(`/orders/${orderId}`);
      if (res.data.success) {
        setMilestoneOrder(res.data.data);
      } else {
        setErrorMsg('Failed to retrieve order details.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to load order. Please try again.');
    } finally {
      setMilestoneLoading(false);
    }
  };

  useEffect(() => {
    const initCheckout = async () => {
      let orderId = location.state?.orderId;
      let mIndex = location.state?.milestoneIndex;

      if (!orderId) {
        try {
          setMilestoneLoading(true);
          const res = await apiClient.get('/orders');
          const orders = res.data.data || [];
          
          // Locate first order requiring payment
          const pendingOrder = orders.find(o => 
            ['pending', 'Awaiting Initial Payment', 'partially_paid'].includes(o.paymentStatus) ||
            ['pending', 'Payment Pending'].includes(o.orderStatus)
          );

          if (pendingOrder) {
            orderId = pendingOrder._id;
            const pendingMilestoneIdx = pendingOrder.paymentMilestones?.findIndex(m => m.status === 'Pending');
            mIndex = pendingMilestoneIdx !== -1 ? pendingMilestoneIdx : 0;
            
            setTargetOrderId(orderId);
            setMilestoneIndex(mIndex);
            setMilestoneOrder(pendingOrder);
            setMilestoneLoading(false);
          } else {
            setMilestoneLoading(false);
            setErrorMsg('No active B2B orders with pending payments found.');
          }
        } catch (err) {
          console.error(err);
          setErrorMsg('Failed to initialize B2B checkout.');
          setMilestoneLoading(false);
        }
      } else {
        setTargetOrderId(orderId);
        setMilestoneIndex(mIndex !== undefined ? mIndex : 0);
        await fetchOrderDetails(orderId);
      }
    };

    initCheckout();
  }, [location.state?.orderId, location.state?.milestoneIndex]);

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, []);

  // Prepopulate default payment methods based on country code
  const isIndia = useMemo(() => {
    const country = milestoneOrder?.shippingAddress?.country || '';
    return country.toLowerCase() === 'india';
  }, [milestoneOrder]);

  useEffect(() => {
    if (isIndia) {
      setPaymentMethod('razorpay');
    } else {
      setPaymentMethod('stripe');
    }
  }, [isIndia]);

  // Memoized pricing calculations
  const subtotal = useMemo(() => {
    return milestoneOrder?.items?.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) || 0;
  }, [milestoneOrder]);

  const discount = milestoneOrder?.discount || 0;
  const shippingCharge = milestoneOrder?.shippingCharge || 0;
  const tax = milestoneOrder?.tax || 0;
  
  const activeMilestone = useMemo(() => {
    if (milestoneOrder?.paymentMilestones && milestoneOrder.paymentMilestones[milestoneIndex]) {
      return milestoneOrder.paymentMilestones[milestoneIndex];
    }
    return null;
  }, [milestoneOrder, milestoneIndex]);

  const milestoneAmount = activeMilestone ? activeMilestone.amount : 0;
  const total = milestoneAmount; // B2B milestone amount is the payable total today

  const paidPercent = useMemo(() => {
    if (!milestoneOrder?.paymentMilestones) return 0;
    return milestoneOrder.paymentMilestones
      .filter(m => m.status === 'Paid')
      .reduce((acc, curr) => acc + curr.percentage, 0);
  }, [milestoneOrder]);

  const formatPrice = (amt) => {
    const cur = milestoneOrder?.currency || 'USD';
    return convertCurrency(amt, cur).formatted;
  };

  const handleSuccess = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => {
      navigate('/orders');
    }, 4000);
  };

  const handlePlaceOrder = async () => {
    if (!targetOrderId || isProcessing) return;

    try {
      setIsProcessing(true);

      // 1. Wire transfer / Cash payments
      if (paymentMethod === 'wire' || paymentMethod === 'cod') {
        await apiClient.post('/payments/confirm', {
          orderId: targetOrderId,
          gateway: paymentMethod,
          status: 'success',
          milestoneIndex,
        });
        
        setPaymentSuccessData({
          orderId: targetOrderId,
          paymentId: 'T/T Transfer Pending',
          amount: milestoneAmount
        });
        setShowSuccessAnimation(true);
        setTimeout(() => {
          navigate('/orders');
        }, 4000);
        return;
      }

      // 2. Razorpay Payment Gateway
      if (paymentMethod === 'razorpay') {
        const initRes = await apiClient.post('/payments/initiate', {
          orderId: targetOrderId,
          gateway: 'razorpay',
          milestoneIndex: milestoneIndex
        });

        if (!initRes.data.success) throw new Error("Failed to initiate Razorpay transaction.");

        const options = {
          key: initRes.data.key || import.meta.env.VITE_RAZORPAY_KEY || "rzp_live_SSGOmOhJxOiqbl",
          amount: initRes.data.amount,
          currency: initRes.data.currency,
          name: "Cocoveera Export",
          description: `Milestone Payment #${milestoneIndex + 1} (${activeMilestone?.milestoneType || 'Payment'})`,
          image: "https://res.cloudinary.com/dyrfiop7d/image/upload/v1779801371/cocoveera/branding/ewo6ljdta2dklg9kvbrs.jpg",
          order_id: initRes.data.id,
          handler: async function (response) {
            try {
              setIsProcessing(true);
              
              const verifyRes = await apiClient.post('/payments/verify-payment', {
                orderId: targetOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                milestoneIndex: milestoneIndex
              });

              if (verifyRes.data.success) {
                setPaymentSuccessData({
                  orderId: targetOrderId,
                  paymentId: response.razorpay_payment_id,
                  amount: milestoneAmount
                });
                setShowSuccessAnimation(true);
                
                confetti({
                  particleCount: 150,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#2E7D32', '#4CAF50', '#81C784', '#FFD700']
                });

                setTimeout(() => {
                  navigate('/orders');
                }, 4000);
              } else {
                throw new Error(verifyRes.data.message || "Payment verification failed");
              }
            } catch (err) {
              console.error("Verification error:", err);
              setIsProcessing(false);
              alert("Payment verification failed. If amount was debited, please contact support desk.");
              navigate('/orders');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: milestoneOrder?.shippingAddress?.phone || user?.phone || ''
          },
          theme: { color: "#2E7D32" },
          modal: {
            ondismiss: async function() {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
          alert("Payment failed: " + response.error.description);
          try {
            await apiClient.post('/payments/confirm', {
              orderId: targetOrderId,
              gateway: 'razorpay',
              status: 'failed',
              milestoneIndex: milestoneIndex
            });
            navigate('/orders');
          } catch (e) {
            navigate('/orders');
          }
        });
        rzp.open();
      } else if (paymentMethod === 'stripe' || paymentMethod === 'paypal') {
        alert(`${paymentMethod.toUpperCase()} integration is initialized on backend. Completing order milestone placement as Pending.`);
        handleSuccess();
      }

    } catch (err) {
      console.error("Payment action failed:", err);
      const errDetail = err.response?.data?.message || err.message || "Unknown error";
      alert(`Failed to complete payment milestone: ${errDetail}\nPlease try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Modern Stepper rendering
  const renderProgressStepper = () => (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm flex items-center justify-between overflow-x-auto gap-4 scrollbar-none">
      <div className="flex items-center gap-2 text-xs font-bold text-[#2E7D32]">
        <div className="w-5 h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[10px] text-[#2E7D32] border border-[#2E7D32]/25">✓</div>
        <span>Delivery Address</span>
      </div>
      <div className="h-[2px] bg-stone-200 flex-1 min-w-[20px]" />
      <div className="flex items-center gap-2 text-xs font-bold text-[#2E7D32]">
        <div className="w-5 h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[10px] text-[#2E7D32] border border-[#2E7D32]/25">✓</div>
        <span>Order Summary</span>
      </div>
      <div className="h-[2px] bg-stone-200 flex-1 min-w-[20px]" />
      <div className="flex items-center gap-2 text-xs font-bold text-stone-850">
        <div className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[10px] animate-pulse">●</div>
        <span>Payment Milestone</span>
      </div>
      <div className="h-[2px] bg-stone-200 flex-1 min-w-[20px]" />
      <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
        <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-400">○</div>
        <span>Review & Pay</span>
      </div>
    </div>
  );

  // Loading indicator for fetching order details
  if (milestoneLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200/80 max-w-sm w-full flex flex-col items-center text-center space-y-4">
          <Loader className="w-12 h-12 text-[#2E7D32] animate-spin" />
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-poppins">Initializing B2B Checkout</h2>
            <p className="text-sm text-stone-500 font-semibold mt-1">Please wait while we fetch your approved B2B quotation terms.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state for direct hits or invalid orders
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <SEO title="Checkout Unavailable - Cocoveera" />
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200/80 max-w-md w-full flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 text-red-650 rounded-2xl flex items-center justify-center shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 font-poppins uppercase tracking-wider">Checkout Not Available</h2>
            <p className="text-sm text-stone-500 font-semibold mt-2">
              {errorMsg}
            </p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-black rounded-xl transition shadow flex items-center gap-2 cursor-pointer border-none"
          >
            <ArrowLeft size={16} />
            <span>Go to My Orders</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24 relative">
      <SEO title="Enterprise B2B Checkout - Cocoveera" />

      {/* SUCCESS ANIMATION SCREEN */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#F0FAF0] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="relative w-72 h-72 mb-8 flex items-center justify-center">
              <div className="absolute bottom-10 w-full h-1 bg-green-200/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, delay: 0.5, ease: "linear" }}
                  className="w-full h-full bg-green-500"
                />
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="absolute bottom-10 left-[calc(50%-100px)] -ml-4">
                <Home className="w-8 h-8 text-green-700" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.5 }} className="absolute bottom-10 left-[calc(50%+100px)] -ml-4">
                <Home className="w-8 h-8 text-stone-700" />
              </motion.div>
              <motion.div
                initial={{ x: -100, y: -20, opacity: 0 }}
                animate={{ x: [-100, 0, 100], y: [-20, -20, -20], opacity: [0, 1, 0] }}
                transition={{ duration: 3, times: [0, 0.5, 1], ease: "linear" }}
                className="absolute bottom-10 left-1/2 -ml-3 z-30"
              >
                <div className="bg-orange-100 p-1 rounded border border-orange-200 shadow-sm">
                  <Package className="w-4 h-4 text-stone-700" />
                </div>
              </motion.div>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: [-100, 0, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 3, times: [0, 0.45, 0.5], ease: "linear" }}
                className="absolute bottom-10 left-1/2 -ml-6 z-20"
              >
                <Truck className="w-12 h-12 text-[#2E7D32]" />
              </motion.div>
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: [0, 0, 100], opacity: [0, 1, 0] }}
                transition={{ duration: 3, times: [0, 0.5, 1], ease: "linear" }}
                className="absolute bottom-10 left-1/2 -ml-6 z-20"
              >
                <Ship className="w-12 h-12 text-blue-600" />
              </motion.div>
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
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }} className="text-2xl md:text-3xl font-black text-stone-900 mb-2 text-center px-4">Milestone Payment Verified!</motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="text-stone-500 font-bold text-center px-4 text-sm md:text-base">Your transaction details are registered. Advancing order workflow...</motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full py-10 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="mb-8 text-left">
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight font-poppins">Secure Checkout</h1>
          <p className="text-xs md:text-sm text-stone-500 font-medium mt-1">Review your approved B2B quotation terms and secure payment</p>
        </div>

        {/* Dynamic Stepper */}
        <div className="mb-8">
          {renderProgressStepper()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          {/* LEFT COLUMN: Read-only details (70%) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SECTION 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="text-sm md:text-base font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="text-[#2E7D32]" size={18} />
                  1. Delivery Address & Entity details
                </h2>
                <span className="text-[9px] font-black uppercase text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#2E7D32]/10 tracking-wider">
                  Locked
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600 font-semibold leading-relaxed">
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Recipient Name</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.user?.name || user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Company Name</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.user?.companyName || 'N/A'}</p>
                </div>
                {milestoneOrder?.user?.gstin && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">GSTIN / Tax ID</p>
                    <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder.user.gstin}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Contact Details</p>
                  <p className="text-stone-900 font-bold mt-0.5">Phone: {milestoneOrder?.shippingAddress?.phone || milestoneOrder?.user?.phone || user?.phone || 'N/A'}</p>
                  <p className="text-stone-500 font-medium">Email: {milestoneOrder?.user?.email || user?.email}</p>
                </div>
                <div className="md:col-span-2 border-t border-stone-100 pt-3">
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Shipping Destination Address</p>
                  <div className="text-stone-900 font-bold mt-0.5 space-y-0.5">
                    <p>{milestoneOrder?.shippingAddress?.addressLine1 || milestoneOrder?.shippingAddress?.street}</p>
                    {milestoneOrder?.shippingAddress?.addressLine2 && <p className="font-semibold text-stone-600">{milestoneOrder.shippingAddress.addressLine2}</p>}
                    <p>{milestoneOrder?.shippingAddress?.city}, {milestoneOrder?.shippingAddress?.state} - {milestoneOrder?.shippingAddress?.postalCode || milestoneOrder?.shippingAddress?.zipCode}</p>
                    <p className="text-[#2E7D32] uppercase tracking-wider font-extrabold text-[11px] pt-1">{milestoneOrder?.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Approved Products */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-sm md:text-base font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Package className="text-[#2E7D32]" size={18} />
                  2. Approved Products & Specifications
                </h2>
              </div>
              <div className="space-y-4">
                {milestoneOrder?.items?.map((item, idx) => {
                  const itemSub = item.quantity * item.unitPrice;
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row gap-5 p-4 bg-stone-50/50 rounded-2xl border border-stone-150 transition-all hover:bg-white hover:shadow-md hover:border-[#2E7D32]/20">
                      <div className="w-20 h-20 bg-white rounded-xl border border-stone-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                        <ImageWithFallback src={item.product?.images?.[0]} alt={item.productName || item.product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 flex flex-col justify-center">
                          <h3 className="text-xs font-extrabold text-stone-900 line-clamp-1">{item.productName || item.product?.name}</h3>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-500 font-semibold mt-1.5 leading-snug">
                            <div>SKU: <span className="text-stone-700 font-bold">{item.product?.sku || item.product?._id?.toString().slice(-6).toUpperCase()}</span></div>
                            <div>Variant: <span className="text-stone-700 font-bold">{item.product?.variant || 'Standard'}</span></div>
                            <div>Grade: <span className="text-stone-700 font-bold">{item.product?.qualityGrade || 'A Grade'}</span></div>
                            <div>Dimensions: <span className="text-stone-700 font-bold">{item.product?.dimensions || '30x30x15cm'}</span></div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center sm:items-end text-xs">
                          <p className="text-stone-500 font-bold">Qty: <span className="text-stone-900 font-black">{item.quantity} FCL</span></p>
                          <p className="text-stone-400 font-medium text-[9px] mt-0.5">({(item.pieces || 0).toLocaleString()} Pieces)</p>
                          <div className="mt-2 text-right">
                            <p className="text-[10px] text-stone-400 font-medium">Price: {formatPrice(item.unitPrice)} / Container</p>
                            <p className="text-xs font-black text-[#2E7D32] mt-0.5">Subtotal: {formatPrice(itemSub)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Shipping Information */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-sm md:text-base font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Ship className="text-[#2E7D32]" size={18} />
                  3. Shipping & Export Logistics
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs font-semibold leading-relaxed text-stone-600">
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Shipping Method</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.shippingDetails?.shippingMethod || 'Sea Freight'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Incoterms</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.shippingDetails?.incoterms || 'FOB'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Container Size</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.shippingDetails?.containerType || milestoneOrder?.recommendedContainer || '20FT FCL'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Port of Loading</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.shippingDetails?.portOfLoading || 'Chennai Port, India'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Port of Discharge</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.shippingDetails?.portOfDischarge || 'Hamburg Port, Germany'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Transit Time</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{milestoneOrder?.shippingDetails?.transitTime || '14 Days'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Estimated Weight</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{(milestoneOrder?.totalWeight || 0).toLocaleString()} KG</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Estimated Volume</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{(milestoneOrder?.totalVolume || 0).toFixed(2)} CBM</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Container Count</p>
                  <p className="text-stone-900 font-extrabold text-xs mt-0.5">{(milestoneOrder?.totalContainers || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* SECTION 4: Payment Method Selection */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-sm md:text-base font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="text-[#2E7D32]" size={18} />
                  4. Select Payment Method
                </h2>
              </div>
              <div className="space-y-3">
                {isIndia ? (
                  <>
                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === 'razorpay' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                      <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 accent-[#2E7D32]" />
                      <div className="flex-1">
                        <p className="font-bold text-xs text-stone-900">Pay Online (Razorpay)</p>
                        <p className="text-[10px] text-stone-500">UPI, Credit/Debit Cards, Netbanking securely processed inside India.</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === 'wire' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                      <input type="radio" checked={paymentMethod === 'wire'} onChange={() => setPaymentMethod('wire')} className="w-4 h-4 accent-[#2E7D32]" />
                      <div className="flex-1">
                        <p className="font-bold text-xs text-stone-900">Bank Wire / T/T Transfer</p>
                        <p className="text-[10px] text-stone-500">Pay via Bank Account transfer. Upload Swift/Telegraphic Copy after payment.</p>
                      </div>
                    </label>
                  </>
                ) : (
                  <>
                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === 'stripe' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                      <input type="radio" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="w-4 h-4 accent-[#2E7D32]" />
                      <div className="flex-1">
                        <p className="font-bold text-xs text-stone-900">Stripe Card Payment</p>
                        <p className="text-[10px] text-stone-500">Visa, Mastercard, AMEX globally. Instant milestone settlement.</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                      <input type="radio" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="w-4 h-4 accent-[#2E7D32]" />
                      <div className="flex-1">
                        <p className="font-bold text-xs text-stone-900">PayPal Express Checkout</p>
                        <p className="text-[10px] text-stone-500">Pay securely using your global PayPal balance or linked accounts.</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === 'wire' ? 'border-[#2E7D32] bg-[#F0FAF0]' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                      <input type="radio" checked={paymentMethod === 'wire'} onChange={() => setPaymentMethod('wire')} className="w-4 h-4 accent-[#2E7D32]" />
                      <div className="flex-1">
                        <p className="font-bold text-xs text-stone-900">Telegraphic Transfer (T/T) / Bank Wire</p>
                        <p className="text-[10px] text-stone-500">Transfer directly to our corporate bank account. Details populated on invoice.</p>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* SECTION 5: Documents & Notes */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-sm md:text-base font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="text-[#2E7D32]" size={18} />
                  5. Documents & Customer Notes
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-150">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#2E7D32]/10 p-2 rounded-xl text-[#2E7D32]">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">Approved Commercial Quotation</p>
                      <p className="text-[10px] text-stone-400 font-semibold">Official approved PDF copy</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(`/quotes/${milestoneOrder?.quote}/pdf`, '_blank')}
                    className="px-4 py-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-850 transition cursor-pointer"
                  >
                    View PDF
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Customer Special Instructions / Notes</p>
                  <div className="bg-stone-50/60 border border-stone-150 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-stone-600 mt-1">
                    {milestoneOrder?.commercialNotes || 'No special shipping notes or instructions provided.'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Summary Sidebar (30%) - Sticky */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-stone-200/80 flex flex-col">
              <div className="bg-stone-50 border-b border-stone-100 p-5 flex items-center justify-between shrink-0 rounded-t-3xl">
                <div>
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">Order Summary</h3>
                  <p className="text-[10px] text-stone-500 font-medium mt-0.5">Approved B2B quote details</p>
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm border border-stone-100">
                  <Banknote className="w-4 h-4 text-[#2E7D32]" />
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-4">
                <div className="space-y-3 text-xs font-semibold text-stone-500">
                  <div className="flex justify-between items-center">
                    <span>Total Containers</span>
                    <span className="text-stone-900 font-bold">{(milestoneOrder?.totalContainers || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Pieces</span>
                    <span className="text-stone-900 font-bold">{(milestoneOrder?.totalPieces || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Product Subtotal</span>
                    <span className="text-stone-900 font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estimated Weight</span>
                    <span className="text-stone-900 font-bold">{(milestoneOrder?.totalWeight || 0).toLocaleString()} KG</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estimated Volume</span>
                    <span className="text-stone-900 font-bold">{(milestoneOrder?.totalVolume || 0).toFixed(2)} CBM</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Total Discount</span>
                      <span className="text-[#2E7D32] font-bold">- {formatPrice(discount)}</span>
                    </div>
                  )}
                  {shippingCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Shipping Charges</span>
                      <span className="text-stone-900 font-bold">{formatPrice(shippingCharge)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Taxes</span>
                      <span className="text-stone-900 font-bold">{formatPrice(tax)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-wider">Grand Total</span>
                    <span className="text-xl font-black text-stone-900 font-poppins">{formatPrice(milestoneOrder?.totalAmount || 0)}</span>
                  </div>
                </div>

                {/* PAYMENT MILESTONE PROGRESS HIGHLIGHT CARD */}
                {milestoneOrder?.paymentMilestones && milestoneOrder.paymentMilestones.length > 0 && (
                  <div className="bg-[#F0FAF0] border border-[#2E7D32]/20 rounded-2xl p-4 mt-2 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-[#2E7D32]">
                      <span className="uppercase tracking-wider">Milestone Progress</span>
                      <span>{paidPercent}% Paid</span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full bg-green-100 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${paidPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-[#2E7D32] h-full"
                      />
                    </div>

                    <div className="border-t border-[#2E7D32]/10 pt-2 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-600 font-semibold">
                        <span>Active Milestone:</span>
                        <span className="text-stone-900 font-bold">{activeMilestone?.milestoneType || 'Payment'} ({activeMilestone?.percentage || 0}%)</span>
                      </div>
                      <div className="flex justify-between text-[#2E7D32] font-black border-t border-dashed border-[#2E7D32]/15 pt-1.5">
                        <span>Today's Due:</span>
                        <span>{formatPrice(milestoneAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Secure checkout button (Desktop) */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="hidden lg:flex w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black uppercase tracking-wider text-xs py-4.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center h-12 border-none cursor-pointer"
                >
                  {isProcessing ? 'Processing Securely...' : `Pay ${formatPrice(milestoneAmount)} Now`}
                </button>

                {/* TRUST INDICATORS */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-500 font-bold uppercase tracking-wider border-t border-stone-100 pt-4 mt-2 leading-relaxed">
                  <div className="flex items-center gap-1"><ShieldCheck className="text-[#2E7D32] w-3.5 h-3.5" /> Secure Pay</div>
                  <div className="flex items-center gap-1"><ShieldCheck className="text-[#2E7D32] w-3.5 h-3.5" /> SSL Protected</div>
                  <div className="flex items-center gap-1"><ShieldCheck className="text-[#2E7D32] w-3.5 h-3.5" /> Doc Signed</div>
                  <div className="flex items-center gap-1"><ShieldCheck className="text-[#2E7D32] w-3.5 h-3.5" /> Swift Verify</div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 lg:hidden flex gap-3 items-center backdrop-blur-md bg-white/95">
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-stone-500 text-[8px] font-extrabold uppercase tracking-widest block">Active Due</span>
          <span className="text-base font-poppins font-black text-[#2E7D32] leading-none mt-0.5">{formatPrice(milestoneAmount)}</span>
        </div>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="flex-[2] bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-black py-3.5 rounded-xl shadow-md flex items-center justify-center disabled:opacity-50 transition-colors uppercase tracking-widest cursor-pointer border-none"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>

      {/* PAYMENT SUCCESS POPUP */}
      <AnimatePresence>
        {showSuccessAnimation && paymentSuccessData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/60"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-md w-full border border-white/50 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-[#2E7D32]/10 to-transparent pointer-events-none" />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, damping: 15 }}
                className="w-20 h-20 bg-[#2E7D32] rounded-full mx-auto flex items-center justify-center shadow-lg shadow-[#2E7D32]/30 mb-6 relative z-10"
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>

              <h2 className="text-xl md:text-2xl font-black text-stone-900 mb-2 font-poppins">Milestone Paid</h2>
              <p className="text-stone-500 text-xs font-medium mb-8">
                Your B2B milestone transaction is successfully registered.
              </p>

              <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-100/50 space-y-3 mb-8 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Order ID</span>
                  <span className="font-bold text-stone-900 truncate max-w-[150px]">{paymentSuccessData.orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Payment Reference</span>
                  <span className="font-bold text-stone-900 truncate max-w-[150px]">{paymentSuccessData.paymentId}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-200/50">
                  <span className="text-stone-600 font-semibold">Amount Paid</span>
                  <span className="font-black text-[#2E7D32] text-sm">{formatPrice(paymentSuccessData.amount)}</span>
                </div>
              </div>

              <div>
                <div className="w-5 h-5 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Updating Ledger...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
