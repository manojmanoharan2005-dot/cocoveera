import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Eye, Download, Truck, RotateCcw, Package, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, Check, Loader2, Building2, CreditCard, X,
  UploadCloud, ShieldCheck, Copy, ExternalLink, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FixedSizeList as List } from 'react-window';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import SEO from '../../components/SEO';

// Lazy load common PDFModal component for inline invoice preview
const PDFModal = React.lazy(() => import('../../components/common/PDFModal'));
// Lazy load recommended products section to prevent blocking initial paint
const RecommendedProducts = React.lazy(() => import('../../components/common/RecommendedProducts'));

// Animated skeleton screen for perceived performance
const OrdersSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, idx) => (
      <div key={idx} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm animate-pulse border-l-4 border-l-stone-200">
        {/* Skeleton Header */}
        <div className="bg-[#F0F2F2] border-b border-stone-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-6 md:gap-12">
            <div className="flex flex-col space-y-1.5">
              <div className="h-2 bg-stone-200 rounded w-16" />
              <div className="h-3.5 bg-stone-300 rounded w-24" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <div className="h-2 bg-stone-200 rounded w-10" />
              <div className="h-3.5 bg-stone-300 rounded w-20" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <div className="h-2 bg-stone-200 rounded w-12" />
              <div className="h-3.5 bg-stone-300 rounded w-24" />
            </div>
          </div>
          <div className="flex flex-col space-y-1.5 md:items-end">
            <div className="h-2 bg-stone-200 rounded w-24" />
            <div className="h-3.5 bg-stone-300 rounded w-32" />
          </div>
        </div>
        {/* Skeleton Body */}
        <div className="p-4 md:p-6 space-y-6">
          <div className="h-5 bg-stone-300 rounded w-1/4" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-stone-200 rounded-lg" />
            <div className="flex-grow space-y-2.5">
              <div className="h-4 bg-stone-300 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/4" />
              <div className="h-8.5 bg-stone-200 rounded-full w-32 mt-4" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchProfile } = useAuth();
  
  // Highlight state for newly created/updated orders (Requirement 6 & 9)
  const [highlightedOrderId, setHighlightedOrderId] = useState(location.state?.newOrderId || location.state?.updatedOrderId || null);
  const [isNewOrderNotice, setIsNewOrderNotice] = useState(!!location.state?.animateEntry);

  useEffect(() => {
    if (location.state?.newOrderId || location.state?.updatedOrderId) {
      setHighlightedOrderId(location.state.newOrderId || location.state.updatedOrderId);
      setIsNewOrderNotice(!!location.state.animateEntry);
      
      const timer = setTimeout(() => {
        setHighlightedOrderId(null);
        setIsNewOrderNotice(false);
        // Clear history state without reloading
        window.history.replaceState({}, document.title);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Filtering & Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('all');
  const [limit] = useState(5);

  // Search input & debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelCustomReason, setCancelCustomReason] = useState('');

  // Inline PDF invoice preview state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState('');
  const [activeOrderNum, setActiveOrderNum] = useState('');
  
  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeOrderForPayment, setActiveOrderForPayment] = useState(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [selectedGateway, setSelectedGateway] = useState('razorpay');
  const [wireReference, setWireReference] = useState('');
  const [wireReceiptUrl, setWireReceiptUrl] = useState('');
  const [wireNotes, setWireNotes] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [errorState, setErrorState] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  const cancellationReasons = [
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Product no longer needed',
    'Shipping time is too long',
    'Want to modify the order',
    'Payment issue',
    'Other'
  ];

  // 300ms Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // React Query Fetch — staleTime 0 so payment updates always show immediately
  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ['orders', currentPage, dateFilter, debouncedSearch],
    async () => {
      setErrorState('');
      const res = await apiClient.get('/orders/myorders', {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
          dateFilter,
        }
      });
      return res.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 0,         // Never serve stale data — especially critical post-payment
      cacheTime: 5 * 60 * 1000,
      onError: (err) => {
        console.error('Failed to fetch orders:', err);
        setErrorState(err.response?.data?.message || 'Failed to load your orders.');
      }
    }
  );

  // Force immediate refetch when returning from a confirmed payment sync
  useEffect(() => {
    if (location.state?.syncConfirmed) {
      refetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const orders = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  const handlePreviewInvoice = (orderId, orderNumber) => {
    if (!orderId) {
      alert('Invoice PDF is not available yet.');
      return;
    }
    const token = sessionStorage.getItem('cocoveera_token') || '';
    const viewUrl = `${apiClient.defaults.baseURL}/orders/${orderId}/invoice?token=${encodeURIComponent(token)}&_t=${Date.now()}`;
    window.open(viewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    if (!orderId) return;
    try {
      const response = await apiClient.get(`/orders/${orderId}/invoice?_t=${Date.now()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderNumber || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again later.');
    }
  };

  const handleCancelClick = (orderId) => {
    setOrderToCancel(orderId);
    setCancelReason('');
    setCancelCustomReason('');
    setIsCancelModalOpen(true);
  };

  const submitCancellation = async () => {
    if (!cancelReason) {
      alert('Please select a cancellation reason.');
      return;
    }
    if (cancelReason === 'Other' && !cancelCustomReason.trim()) {
      alert('Please provide a custom reason.');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    
    try {
      const res = await apiClient.put(`/orders/${orderToCancel}/cancel`, {
        cancellationReason: cancelReason,
        cancellationCustomReason: cancelCustomReason
      });
      if (res.data.success) {
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        refetch();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleReorder = async (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;
    try {
      for (const item of order.items) {
        if (item.product && item.product._id) {
          await apiClient.post('/users/cart', { productId: item.product._id, quantity: item.quantity, increment: true });
        }
      }
      await fetchProfile();
      navigate('/checkout');
    } catch (error) {
      alert('Failed to reorder. Please try again.');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const copyToClipboard = (text, fieldName) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const openPaymentModal = (order, milestoneIdx) => {
    setActiveOrderForPayment(order);
    setActiveMilestoneIndex(milestoneIdx);
    const isDomestic = (order.currency === 'INR') ||
      (order.shippingAddress?.country?.toLowerCase() === 'india') ||
      (user?.country?.toLowerCase() === 'india');
    setSelectedGateway(isDomestic ? 'razorpay' : 'stripe');
    setWireReference('');
    setWireReceiptUrl('');
    setWireNotes('');
    setPaymentError('');
    setPaymentSuccess('');
    setPaymentModalOpen(true);
  };

  const handleRazorpayCheckout = async () => {
    if (!activeOrderForPayment) return;
    setIsProcessing(true);
    setPaymentError('');

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      const initRes = await apiClient.post('/payments/initiate', {
        orderId: activeOrderForPayment._id,
        gateway: 'razorpay',
        milestoneIndex: activeMilestoneIndex,
      });

      if (!initRes.data.success) {
        throw new Error(initRes.data.message || 'Failed to initiate payment session');
      }

      const paymentData = initRes.data;

      if (!paymentData.key || paymentData.key.startsWith('mock_')) {
        setTimeout(async () => {
          try {
            const confirmRes = await apiClient.post('/payments/confirm', {
              orderId: activeOrderForPayment._id,
              paymentId: 'mock_rzp_' + Date.now(),
              gateway: 'mock',
              status: 'success',
              milestoneIndex: activeMilestoneIndex,
            });
            if (confirmRes.data.success) {
              setPaymentSuccess('Payment completed successfully!');
              setPaymentModalOpen(false);
              refetch();
            } else {
              throw new Error(confirmRes.data.message || 'Verification failed');
            }
          } catch (e) {
            setPaymentError(e.message);
          } finally {
            setIsProcessing(false);
          }
        }, 1000);
        return;
      }

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Cocoveera Export',
        description: `Milestone ${activeMilestoneIndex + 1} payment for Order #${activeOrderForPayment.orderNumber || activeOrderForPayment._id}`,
        order_id: paymentData.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            const verifyRes = await apiClient.post('/payments/verify-payment', {
              orderId: activeOrderForPayment._id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              milestoneIndex: activeMilestoneIndex,
            });

            if (verifyRes.data.success) {
              setPaymentSuccess('Payment verified successfully! Next milestone unlocked.');
              setPaymentModalOpen(false);
              refetch();
            } else {
              throw new Error(verifyRes.data.message || 'Verification failed');
            }
          } catch (err) {
            setPaymentError(err.response?.data?.message || err.message || 'Verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#2E7D32' },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentError('Payment failed: ' + (response.error?.description || 'Gateway error'));
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Could not connect to payment gateway.');
      setIsProcessing(false);
    }
  };

  const handleWireSubmit = async () => {
    if (!activeOrderForPayment) return;
    if (!wireReference.trim()) {
      setPaymentError('Please enter your Bank UTR / Transaction Reference Number.');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      const res = await apiClient.post('/payments/submit-wire', {
        orderId: activeOrderForPayment._id,
        milestoneIndex: activeMilestoneIndex,
        transactionReference: wireReference.trim(),
        paymentProofUrl: wireReceiptUrl.trim(),
        notes: wireNotes.trim(),
      });

      if (res.data.success) {
        setPaymentSuccess('Wire transfer details submitted! Status updated to Under Review.');
        setTimeout(() => {
          setPaymentModalOpen(false);
          refetch();
        }, 1500);
      } else {
        throw new Error(res.data.message || 'Failed to submit wire transfer details');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Failed to submit wire proof.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!activeOrderForPayment) return;
    setIsProcessing(true);
    setPaymentError('');
    try {
      const initRes = await apiClient.post('/payments/initiate', {
        orderId: activeOrderForPayment._id,
        gateway: 'stripe',
        milestoneIndex: activeMilestoneIndex,
      });
      if (!initRes.data.success) throw new Error(initRes.data.message || 'Failed to initiate Stripe session');

      const confirmRes = await apiClient.post('/payments/confirm', {
        orderId: activeOrderForPayment._id,
        paymentId: 'stripe_' + (initRes.data.clientSecret || Date.now()),
        gateway: 'stripe',
        status: 'success',
        milestoneIndex: activeMilestoneIndex,
      });
      if (confirmRes.data.success) {
        setPaymentSuccess('Stripe card payment processed successfully!');
        setTimeout(() => {
          setPaymentModalOpen(false);
          refetch();
        }, 1200);
      } else {
        throw new Error(confirmRes.data.message || 'Stripe payment confirmation failed');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Stripe payment error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaypalCheckout = async () => {
    if (!activeOrderForPayment) return;
    setIsProcessing(true);
    setPaymentError('');
    try {
      const initRes = await apiClient.post('/payments/initiate', {
        orderId: activeOrderForPayment._id,
        gateway: 'paypal',
        milestoneIndex: activeMilestoneIndex,
      });
      if (!initRes.data.success) throw new Error(initRes.data.message || 'Failed to initiate PayPal session');

      const confirmRes = await apiClient.post('/payments/confirm', {
        orderId: activeOrderForPayment._id,
        paymentId: 'paypal_' + (initRes.data.orderId || Date.now()),
        gateway: 'paypal',
        status: 'success',
        milestoneIndex: activeMilestoneIndex,
      });
      if (confirmRes.data.success) {
        setPaymentSuccess('PayPal payment processed successfully!');
        setTimeout(() => {
          setPaymentModalOpen(false);
          refetch();
        }, 1200);
      } else {
        throw new Error(confirmRes.data.message || 'PayPal payment confirmation failed');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'PayPal payment error');
    } finally {
      setIsProcessing(false);
    }
  };

  class OrderCardErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(err, info) {
      console.error('OrderCard rendering error:', err, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
            <p className="font-bold">Order Details Temporary Display Issue</p>
            <p className="text-stone-600 mt-1">This order's details encountered an issue during display.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-semibold cursor-pointer"
            >
              Retry Order
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  // Reusable Single Order Card Item
  const OrderCardItem = React.memo(({ order, idx }) => {
    if (!order) return null;

    const rawStatus = order.orderStatus ? String(order.orderStatus).toLowerCase() : 'pending';
    const progress = order.paymentProgress || 0;
    const [isExpanded, setIsExpanded] = useState(false);
    const shortOrderId = order.orderNumber || (order._id ? String(order._id).slice(-8).toUpperCase() : 'N/A');
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recent';
    const safeItems = Array.isArray(order.items) ? order.items : [];
    
    let displayStatusText = 'Pending';
    let statusColorClass = 'text-stone-900';
    let borderLeftColorClass = 'border-l-4 border-l-[#F59E0B] border-stone-200';

    if (rawStatus === 'cancelled') {
      displayStatusText = '🔴 Cancelled';
      statusColorClass = 'text-red-700';
      borderLeftColorClass = 'border-l-4 border-l-red-500 border-stone-200';
    } else {
      if (progress === 0) {
        displayStatusText = '🟡 Awaiting Initial Payment';
        statusColorClass = 'text-amber-600';
        borderLeftColorClass = 'border-l-4 border-l-[#F59E0B] border-stone-200';
      } else if (progress === 40) {
        displayStatusText = '🟢 Production Started';
        statusColorClass = 'text-[#067D62]';
        borderLeftColorClass = 'border-l-4 border-l-[#067D62] border-stone-200';
      } else if (progress === 60) {
        displayStatusText = '🟢 Production Completed';
        statusColorClass = 'text-[#067D62]';
        borderLeftColorClass = 'border-l-4 border-l-[#067D62] border-stone-200';
      } else if (progress === 80) {
        displayStatusText = '🟢 Shipped & In Transit';
        statusColorClass = 'text-[#067D62]';
        borderLeftColorClass = 'border-l-4 border-l-[#067D62] border-stone-200';
      } else if (progress === 100) {
        displayStatusText = '🟢 Delivered Successfully';
        statusColorClass = 'text-[#067D62]';
        borderLeftColorClass = 'border-l-4 border-l-[#067D62] border-stone-200';
      }
    }

    // Render dynamic checklist icons
    const renderProgressChecklist = () => {
      const milestones = Array.isArray(order.paymentMilestones) ? order.paymentMilestones : [];
      if (milestones.length === 0) return null;
      return (
        <div className="space-y-1.5 mt-1">
          {milestones.map((m, mIdx) => {
            const isPaid = m.status === 'Paid' || m.paid;
            const isUnderReview = m.status === 'Under Review';
            const isPending = m.status === 'Pending';
            const mTitle = m.milestoneType || m.name || `Milestone ${mIdx + 1}`;
            const mPercent = m.percentage || (mIdx === 0 ? 40 : 20);
            const mAmount = convertCurrency(m.amount || 0, order.currency || user?.currency || 'USD').formatted;

            return (
              <div key={mIdx} className="flex items-center gap-2 text-xs">
                {isPaid ? (
                  <span className="text-green-600 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : isUnderReview ? (
                  <span className="text-amber-600 font-bold flex items-center" title="Under Admin Review">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                ) : isPending ? (
                  <span className="text-blue-600 font-bold">●</span>
                ) : (
                  <span className="text-stone-300">○</span>
                )}
                <span className={isPaid ? 'font-bold text-stone-800' : isUnderReview ? 'font-semibold text-amber-700' : isPending ? 'font-semibold text-blue-700' : 'text-stone-500'}>
                  {mTitle}: {mPercent}% ({mAmount})
                  {isUnderReview && (
                    <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                      Under Review
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      );
    };

    // Render Card-Level Action Buttons
    const renderCardActionButtons = () => {
      if (rawStatus === 'cancelled') return null;

      const milestones = Array.isArray(order.paymentMilestones) ? order.paymentMilestones : [];

      if (progress === 0) {
        const isUnderReview = milestones[0]?.status === 'Under Review';
        return (
          <>
            {isUnderReview ? (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Wire Payment Under Review</span>
                </span>
                <button
                  onClick={() => openPaymentModal(order, 0)}
                  className="text-xs text-[#2E7D32] hover:underline font-bold px-2 py-1 cursor-pointer"
                >
                  Update Reference
                </button>
              </div>
            ) : (
              <button
                onClick={() => openPaymentModal(order, 0)}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Pay 40% Advance & Start Production</span>
              </button>
            )}
            <button
              onClick={() => handleCancelClick(order._id)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-red-600 text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
          </>
        );
      }

      if (progress === 40) {
        const isUnderReview = milestones[1]?.status === 'Under Review';
        return (
          <>
            {isUnderReview ? (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Wire Payment Under Review</span>
                </span>
                <button
                  onClick={() => openPaymentModal(order, 1)}
                  className="text-xs text-[#2E7D32] hover:underline font-bold px-2 py-1 cursor-pointer"
                >
                  Update Reference
                </button>
              </div>
            ) : (
              <button
                onClick={() => openPaymentModal(order, 1)}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Pay 20% Second Milestone</span>
              </button>
            )}
            <button
              onClick={() => handlePreviewInvoice(order._id, order.orderNumber || order._id)}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-850 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors cursor-pointer"
            >
              Invoice
            </button>
          </>
        );
      }

      if (progress === 60) {
        const isUnderReview = milestones[2]?.status === 'Under Review';
        return (
          <>
            {isUnderReview ? (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Wire Payment Under Review</span>
                </span>
                <button
                  onClick={() => openPaymentModal(order, 2)}
                  className="text-xs text-[#2E7D32] hover:underline font-bold px-2 py-1 cursor-pointer"
                >
                  Update Reference
                </button>
              </div>
            ) : (
              <button
                onClick={() => openPaymentModal(order, 2)}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Pay 20% Third Milestone</span>
              </button>
            )}
            <button
              onClick={() => handlePreviewInvoice(order._id, order.orderNumber || order._id)}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-850 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors cursor-pointer"
            >
              Invoice
            </button>
          </>
        );
      }

      if (progress === 80) {
        const isUnderReview = milestones[3]?.status === 'Under Review';
        return (
          <>
            {isUnderReview ? (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>Wire Payment Under Review</span>
                </span>
                <button
                  onClick={() => openPaymentModal(order, 3)}
                  className="text-xs text-[#2E7D32] hover:underline font-bold px-2 py-1 cursor-pointer"
                >
                  Update Reference
                </button>
              </div>
            ) : (
              <button
                onClick={() => openPaymentModal(order, 3)}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Pay Final 20% Balance</span>
              </button>
            )}
            <button
              onClick={() => handlePreviewInvoice(order._id, order.orderNumber || order._id)}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-850 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors cursor-pointer"
            >
              Invoice
            </button>
            <button
              onClick={() => navigate(`/track/${order._id}`)}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-850 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors cursor-pointer"
            >
              Track Shipment
            </button>
          </>
        );
      }

      if (progress === 100) {
        return (
          <>
            <button
              onClick={() => handlePreviewInvoice(order._id, order.orderNumber || order._id)}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-850 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors cursor-pointer"
            >
              Invoice
            </button>
            <button
              onClick={() => alert("Shipping documents (Bill of Lading, Packing List) are being prepared by the export officer. You will receive an email notification once finalized.")}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-850 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors cursor-pointer"
            >
              Shipping Documents
            </button>
            <button
              onClick={() => navigate(`/track/${order._id}`)}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-850 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors cursor-pointer"
            >
              Track Shipment
            </button>
          </>
        );
      }

      return null;
    };

    const isHighlighted = order._id === highlightedOrderId;

    return (
      <motion.div 
        initial={{ opacity: 0, y: isHighlighted ? 20 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: isHighlighted ? 0 : idx * 0.05 }}
        className={`bg-white rounded-xl border overflow-hidden relative transition-all duration-500 ${
          isHighlighted
            ? 'ring-4 ring-[#2E7D32]/40 shadow-2xl border-[#2E7D32] scale-[1.01]'
            : `shadow-sm hover:shadow-md ${borderLeftColorClass}`
        }`}
      >
        {isHighlighted && (
          <div className="bg-[#E8F5E9] border-b border-[#2E7D32]/20 px-4 py-2 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-[#2E7D32] font-black text-xs font-poppins">
              <div className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>✓ Order Created Successfully</span>
            </div>
            <span className="text-[10px] text-[#2E7D32] font-extrabold uppercase tracking-wider">New Export Order</span>
          </div>
        )}

        {/* Card Header (Amazon/Flipkart Style) */}
        <div className="bg-[#F0F2F2] border-b border-stone-200 px-4 md:px-6 py-3 text-sm text-stone-600 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-6 md:gap-12">
            <div className="flex flex-col">
              <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Order placed</span>
              <span className="font-semibold text-stone-700">{orderDate}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Total</span>
              <span className="font-semibold text-stone-700">{convertCurrency((order.totalAmount || order.total || 0), order.currency || user?.currency || 'USD').formatted}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Ship to</span>
              <span className="font-semibold text-[#007185] hover:text-[#C45500] hover:underline cursor-pointer">{order.shippingDetails?.country || user?.country || 'Destination Port'}</span>
            </div>
          </div>
          <div className="flex flex-col md:items-end">
            <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Order # {shortOrderId}</span>
            <div className="flex gap-2 text-[#007185] font-semibold mt-0.5 text-xs">
              <span className="hover:text-[#C45500] hover:underline cursor-pointer" onClick={() => navigate(`/orders/${order._id}`)}>Order details</span>
              <span className="text-stone-300">|</span>
              <span className="hover:text-[#C45500] hover:underline cursor-pointer" onClick={() => handlePreviewInvoice(order._id, order.orderNumber || order._id)}>Invoice Preview</span>
              <span className="text-stone-300">|</span>
              <span className="hover:text-[#C45500] hover:underline cursor-pointer" onClick={() => handleDownloadInvoice(order._id, order.orderNumber || order._id)}>Download</span>
            </div>
          </div>
        </div>

        {/* Card Body - Products List */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Status & Milestones Column Layout */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-stone-100 pb-5 gap-6">
            <div>
              <h3 className={`text-lg md:text-xl font-bold ${statusColorClass}`}>
                {displayStatusText}
              </h3>
              
              {/* Payment Progress Bar */}
              {order.paymentMilestones && order.paymentMilestones.length > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-40 sm:w-56 bg-stone-100 rounded-full h-2 border border-stone-200 overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] h-full transition-all" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-stone-700">{progress}% Paid</span>
                </div>
              )}
            </div>

            {/* Vertical milestones status tracker list */}
            {order.paymentMilestones && order.paymentMilestones.length > 0 && (
              <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-3 shrink-0">
                <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block mb-1">Payment Progress</span>
                {renderProgressChecklist()}
              </div>
            )}
          </div>

          {(isExpanded ? safeItems : safeItems.slice(0, 3)).map((item, itemIdx) => (
            <div key={itemIdx} className="flex flex-col md:flex-row gap-6 border-b border-stone-100 last:border-b-0 pb-5 last:pb-0">
              {/* Product Image */}
              <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-stone-50 border border-stone-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => item.product?.slug && navigate(`/product/${item.product.slug}`)}>
                {item.product?.images?.[0] ? (
                  <div className="w-full h-full relative p-1 overflow-hidden group">
                    <ImageWithFallback src={item.product.images[0]} alt={item.product.name || item.productName} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ) : (
                  <Package className="w-8 h-8 text-stone-300" />
                )}
              </div>
              
              {/* Product Details */}
              <div className="flex-grow flex flex-col justify-start">
                <h4 
                  className="text-base font-bold text-[#007185] hover:text-[#C45500] hover:underline cursor-pointer line-clamp-2"
                  onClick={() => item.product?.slug && navigate(`/product/${item.product.slug}`)}
                >
                  {item.productName || item.product?.name || 'Unknown Product'}
                </h4>
                <div className="text-xs text-stone-500 mt-1 mb-2 space-y-1">
                  <p>Quantity: {item.pieces || 0} Pieces</p>
                  <p>Container Quantity: {item.quantity || 1}</p>
                  <p>Container Type: {order.shippingDetails?.containerType || '20 FT FCL'}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Expand / Collapse Toggle */}
          {safeItems.length > 3 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-black text-[#007185] hover:text-[#C45500] hover:underline cursor-pointer border-none bg-transparent p-0 flex items-center mt-2"
            >
              {isExpanded ? 'Show Less Products' : `+${safeItems.length - 3} More Products`}
            </button>
          )}

          {/* Action buttons wrapper */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-100">
            {renderCardActionButtons()}
          </div>
        </div>
      </motion.div>
    );
  });

  // Render Virtualized or Standard Orders List
  const RenderOrdersList = () => {
    if (orders.length === 0) {
      return (
        <div className="w-full bg-white rounded-[24px] p-16 md:p-24 text-center border border-stone-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100">
            <Package className="w-10 h-10 text-[#2E7D32]" />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-900 mb-2">No Orders Found</h3>
          <p className="text-stone-500 font-semibold mb-6">
            {searchInput !== '' || dateFilter !== 'all' ? "We couldn't find any orders matching your criteria." : "You haven't placed any orders yet."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            {(searchInput !== '' || dateFilter !== 'all') && (
              <button 
                onClick={() => { setSearchInput(''); setDateFilter('all'); }}
                className="px-8 py-3.5 bg-white text-[#2E7D32] border border-[#2E7D32] font-bold rounded-xl hover:bg-stone-50 transition-all"
              >
                Clear Filters
              </button>
            )}
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white font-bold rounded-xl border border-transparent hover:shadow-lg hover:shadow-[#2E7D32]/30 transition-all"
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      );
    }

    if (orders.length > 20) {
      return (
        <List
          height={650}
          itemCount={orders.length}
          itemSize={360}
          width="100%"
        >
          {({ index, style }) => (
            <div style={{ ...style, paddingBottom: '20px' }}>
              <OrderCardErrorBoundary>
                <OrderCardItem order={orders[index]} idx={index} />
              </OrderCardErrorBoundary>
            </div>
          )}
        </List>
      );
    }

    return (
      <div className="space-y-6">
        {orders.map((order, idx) => (
          <OrderCardErrorBoundary key={order._id}>
            <OrderCardItem order={order} idx={idx} />
          </OrderCardErrorBoundary>
        ))}
      </div>
    );
  };

  const showSkeleton = isLoading && orders.length === 0;

  return (
    <div className="w-full space-y-6 pb-20">
      <SEO title="Your Orders - Cocoveera" />
      
      {/* Dynamic payment feedback notifications */}
      {paymentSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-800 font-semibold text-sm shadow-inner animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span>{paymentSuccess}</span>
        </div>
      )}
      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 font-semibold text-sm shadow-inner animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Your Orders</h1>
          <p className="text-stone-500 font-semibold text-sm">Track, return, or buy things again.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-stone-300 rounded-lg py-2 px-4 text-sm font-bold text-stone-700 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="180">Past 6 Months</option>
            <option value="365">Past Year</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search all orders..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg py-2 pl-9 pr-4 text-sm font-medium text-stone-900 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Cancel Order</h2>
            <p className="text-sm text-stone-600 mb-4">Please select a reason for cancellation:</p>
            
            <div className="space-y-2 mb-4">
              {cancellationReasons.map((reason, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-stone-50 rounded-lg border border-transparent hover:border-stone-200 transition-colors">
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason} 
                    checked={cancelReason === reason} 
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="accent-red-650 w-4 h-4"
                  />
                  <span className="text-sm text-stone-800 font-medium">{reason}</span>
                </label>
              ))}
            </div>

            {cancelReason === 'Other' && (
              <div className="mb-4">
                <textarea 
                  placeholder="Please specify your reason here..."
                  value={cancelCustomReason}
                  onChange={(e) => setCancelCustomReason(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-3 text-sm font-medium text-stone-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-24"
                  required
                ></textarea>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={submitCancellation}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition-colors"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Selection & Wire Transfer Modal */}
      {paymentModalOpen && activeOrderForPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                  Secure B2B Payment
                </span>
                <h2 className="text-xl font-black text-stone-900 mt-2 font-poppins">
                  Milestone #{activeMilestoneIndex + 1} Payment
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Order #{activeOrderForPayment.orderNumber || activeOrderForPayment._id?.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Banner */}
            {(() => {
              const activeMilestone = activeOrderForPayment.paymentMilestones?.[activeMilestoneIndex];
              const milestoneAmt = activeMilestone?.amount || (activeOrderForPayment.totalAmount * (activeMilestoneIndex === 0 ? 0.4 : 0.2));
              const milestoneName = activeMilestone?.milestoneType || `Milestone ${activeMilestoneIndex + 1}`;
              const isDomestic = (activeOrderForPayment.currency === 'INR') ||
                (activeOrderForPayment.shippingAddress?.country?.toLowerCase() === 'india') ||
                (user?.country?.toLowerCase() === 'india');

              return (
                <div className="my-5 space-y-4">
                  <div className="bg-gradient-to-r from-[#F1F8E9] to-[#E8F5E9] p-4 rounded-2xl border border-[#2E7D32]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-stone-600 block uppercase tracking-wide">
                        {milestoneName} ({activeMilestone?.percentage || (activeMilestoneIndex === 0 ? 40 : 20)}%)
                      </span>
                      <span className="text-xs text-stone-500">Total Order: {convertCurrency(activeOrderForPayment.totalAmount || 0, activeOrderForPayment.currency || user?.currency || 'INR').formatted}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#1B5E20]">
                        {convertCurrency(milestoneAmt, activeOrderForPayment.currency || user?.currency || 'INR').formatted}
                      </span>
                    </div>
                  </div>

                  {/* Payment Gateway Options */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-stone-600 block mb-2">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {isDomestic ? (
                        <>
                          <div
                            onClick={() => setSelectedGateway('razorpay')}
                            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              selectedGateway === 'razorpay'
                                ? 'border-[#2E7D32] bg-[#F1F8E9]/60 shadow-sm'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#2E7D32]" />
                                Razorpay
                              </span>
                              <span className="text-[10px] bg-[#2E7D32] text-white px-2 py-0.5 rounded-full font-bold">
                                Recommended
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              UPI, Cards (Debit/Credit), Net Banking & Wallets in INR.
                            </p>
                          </div>

                          <div
                            onClick={() => setSelectedGateway('wire')}
                            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              selectedGateway === 'wire'
                                ? 'border-[#2E7D32] bg-[#F1F8E9]/60 shadow-sm'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#2E7D32]" />
                                Bank Wire (NEFT/RTGS)
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Direct bank transfer to official company account with UTR.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            onClick={() => setSelectedGateway('stripe')}
                            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              selectedGateway === 'stripe'
                                ? 'border-[#2E7D32] bg-[#F1F8E9]/60 shadow-sm'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#2E7D32]" />
                                Stripe Card
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Global credit / debit card processing in USD/EUR.
                            </p>
                          </div>

                          <div
                            onClick={() => setSelectedGateway('paypal')}
                            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              selectedGateway === 'paypal'
                                ? 'border-[#2E7D32] bg-[#F1F8E9]/60 shadow-sm'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                                <span className="font-black text-blue-700">P</span>
                                PayPal
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Pay securely using your PayPal account balance or cards.
                            </p>
                          </div>

                          <div
                            onClick={() => setSelectedGateway('wire')}
                            className={`col-span-1 sm:col-span-2 p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                              selectedGateway === 'wire'
                                ? 'border-[#2E7D32] bg-[#F1F8E9]/60 shadow-sm'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#2E7D32]" />
                                International Wire Transfer (SWIFT / T/T)
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Telegraphic transfer to our global export bank account with SWIFT code.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Gateway Content Section */}
                  {selectedGateway === 'wire' ? (
                    <div className="space-y-4 pt-2">
                      {/* Bank Details Card */}
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                          <span className="font-extrabold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                            Official Company Bank Account
                          </span>
                          <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded">
                            Verified Beneficiary
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div>
                            <span className="text-stone-400 block font-semibold">Beneficiary Name</span>
                            <span className="font-bold text-stone-800">COCOVEERA EXPORTS PRIVATE LIMITED</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-semibold">Bank Name</span>
                            <span className="font-bold text-stone-800">HDFC BANK LTD</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-semibold">Account Number</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-stone-900">
                              <span>50200088912345</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('50200088912345', 'acc')}
                                className="text-stone-400 hover:text-stone-700 cursor-pointer"
                                title="Copy"
                              >
                                {copiedField === 'acc' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-semibold">IFSC Code</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-stone-900">
                              <span>HDFC0001234</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('HDFC0001234', 'ifsc')}
                                className="text-stone-400 hover:text-stone-700 cursor-pointer"
                                title="Copy"
                              >
                                {copiedField === 'ifsc' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-semibold">SWIFT / BIC</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-stone-900">
                              <span>HDFCINBBXXX</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('HDFCINBBXXX', 'swift')}
                                className="text-stone-400 hover:text-stone-700 cursor-pointer"
                                title="Copy"
                              >
                                {copiedField === 'swift' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-semibold">Branch</span>
                            <span className="font-bold text-stone-800">Coimbatore Main, Tamil Nadu, India</span>
                          </div>
                        </div>
                      </div>

                      {/* Wire Form */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1">
                            Transaction / UTR Reference Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. UTR1234567890 / SWIFT-REF-892"
                            value={wireReference}
                            onChange={(e) => setWireReference(e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1">
                            Receipt / Proof URL (Optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://drive.google.com/... or receipt link"
                            value={wireReceiptUrl}
                            onChange={(e) => setWireReceiptUrl(e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-stone-700 block mb-1">
                            Notes / Remarks (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Remitter bank name, date of transfer, etc."
                            value={wireNotes}
                            onChange={(e) => setWireNotes(e.target.value)}
                            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleWireSubmit}
                          disabled={isProcessing}
                          className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                        >
                          {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>Submit Wire Transfer Reference</span>
                        </button>
                        <p className="text-[10px] text-stone-400 text-center">
                          Once submitted, our finance officer verifies the bank credit and updates your milestone to Paid.
                        </p>
                      </div>
                    </div>
                  ) : selectedGateway === 'razorpay' ? (
                    <div className="pt-2 space-y-3">
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Instant Automated Verification</span>
                          <span className="text-[11px] text-blue-800 leading-relaxed">
                            Click below to open the Razorpay checkout overlay. Supports UPI, Google Pay, PhonePe, Netbanking, and Debit/Credit Cards. Your milestone unlocks immediately upon payment.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRazorpayCheckout}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Proceed to Razorpay Checkout ({convertCurrency(milestoneAmt, activeOrderForPayment.currency || user?.currency || 'INR').formatted})</span>
                      </button>
                    </div>
                  ) : selectedGateway === 'stripe' ? (
                    <div className="pt-2 space-y-3">
                      <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Stripe Global Processing</span>
                          <span className="text-[11px] text-purple-800 leading-relaxed">
                            Pay with international credit or debit cards. 256-bit SSL encrypted.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleStripeCheckout}
                        disabled={isProcessing}
                        className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Pay via Stripe ({convertCurrency(milestoneAmt, activeOrderForPayment.currency || user?.currency || 'USD').formatted})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-3">
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">PayPal Checkout</span>
                          <span className="text-[11px] text-amber-800 leading-relaxed">
                            Pay using PayPal balance or linked international cards.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePaypalCheckout}
                        disabled={isProcessing}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Pay via PayPal ({convertCurrency(milestoneAmt, activeOrderForPayment.currency || user?.currency || 'USD').formatted})</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Orders List Area */}
      {showSkeleton ? (
        <OrdersSkeleton />
      ) : errorState ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 max-w-5xl mx-auto shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider mb-1">API Error</h4>
            <p className="text-sm font-semibold">{errorState}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs px-3 py-1.5 rounded-lg border border-red-200 transition"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <RenderOrdersList />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border border-stone-300 rounded-lg bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-50 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-stone-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 border border-stone-300 rounded-lg bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-50 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}



      <Suspense fallback={<div className="h-10 animate-pulse bg-stone-100 rounded-xl" />}>
        <div className="mt-16">
          <RecommendedProducts />
        </div>
      </Suspense>
    </div>
  );
};

export default Orders;
