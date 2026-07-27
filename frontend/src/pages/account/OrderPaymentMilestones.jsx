import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, AlertCircle, CreditCard, ExternalLink, Activity } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import SEO from '../../components/SEO';

const OrderPaymentMilestones = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch the Order details
  const { data: order, isLoading, error, refetch } = useQuery(
    ['order', id],
    async () => {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 0, // Always fetch fresh to ensure accurate payment states
    }
  );

  // Invalidate 'orders' cache to refresh general order list
  useEffect(() => {
    if (order) {
      queryClient.invalidateQueries(['orders']);
    }
  }, [order, queryClient]);

  const handlePayMilestone = async (milestoneIndex, amount) => {
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Initiate payment session on the backend
      const initRes = await apiClient.post('/payments/initiate', {
        orderId: id,
        gateway: 'razorpay', // default gateway
        milestoneIndex,
      });

      if (!initRes.data.success) {
        throw new Error(initRes.data.message || 'Failed to initiate payment session');
      }

      const paymentData = initRes.data;

      // 2. Razorpay checkout flow
      if (paymentData.gateway === 'razorpay') {
        const isMock = !paymentData.key || paymentData.key.startsWith('mock_');

        if (isMock) {
          // Simulation popup for quick testing
          setTimeout(async () => {
            try {
              const confirmRes = await apiClient.post('/payments/confirm', {
                orderId: id,
                paymentId: 'mock_milestone_pay_' + Date.now(),
                gateway: 'mock',
                status: 'success',
                milestoneIndex,
              });

              if (confirmRes.data.success) {
                setSuccessMessage('Payment successful! Next milestone unlocked.');
                refetch();
              } else {
                throw new Error(confirmRes.data.message || 'Failed to confirm mock payment');
              }
            } catch (confirmErr) {
              setErrorMessage(confirmErr.message || 'Failed to process payment');
            } finally {
              setIsProcessing(false);
            }
          }, 1500);
          return;
        }

        // Live/Test Razorpay checkout overlay
        const options = {
          key: paymentData.key,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: 'Cocoveera Export',
          description: `Milestone ${milestoneIndex + 1} payment for Order #${order.orderNumber || id}`,
          order_id: paymentData.id,
          handler: async function (response) {
            try {
              const confirmRes = await apiClient.post('/payments/confirm', {
                orderId: id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: response.razorpay_payment_id,
                gateway: 'razorpay',
                status: 'success',
                milestoneIndex,
              });

              if (confirmRes.data.success) {
                setSuccessMessage('Payment completed successfully!');
                refetch();
              } else {
                throw new Error(confirmRes.data.message || 'Verification failed');
              }
            } catch (err) {
              setErrorMessage(err.response?.data?.message || err.message || 'Verification failed.');
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
          setErrorMessage('Payment failed: ' + response.error.description);
          setIsProcessing(false);
        });
        rzp.open();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Could not connect to payment gateway.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-[#2E7D32] rounded-full animate-spin"></div>
        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Fetching Milestones...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base font-extrabold text-red-900 mb-1">Order Milestones Unreachable</h3>
          <p className="text-sm font-semibold text-red-700">{error?.message || 'Could not fetch order data. Please check connection.'}</p>
          <button onClick={() => navigate('/quotes')} className="mt-4 px-5 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-bold rounded-xl transition shadow-sm">
            Go to My Quotes
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = order.paymentProgress || 0;
  const milestones = order.paymentMilestones || [];

  return (
    <div className="w-full space-y-6 pb-20 max-w-4xl mx-auto">
      <SEO title={`Order #${order.orderNumber || order._id} Payments`} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/quotes')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-poppins">Quotation Payments & Milestones</h1>
          <p className="text-stone-500 font-semibold text-xs sm:text-sm">
            Order Reference: <strong className="text-stone-800">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</strong>
          </p>
        </div>
      </div>

      {/* Summary Tracker Box */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Value</span>
            <h2 className="text-2xl font-black text-stone-900">
              {convertCurrency(order.totalAmount, order.currency || user?.currency || 'USD').formatted}
            </h2>
          </div>
          
          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Payment Status</span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                progressPercent === 100 ? 'bg-green-100 text-green-800 border border-green-200' :
                progressPercent > 0 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {progressPercent === 100 ? 'Fully Paid' : progressPercent > 0 ? 'Partially Paid' : 'Awaiting Deposit'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-stone-500">
            <span>Overall Payment Progress</span>
            <span className="text-stone-900 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 border border-stone-200/60 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] h-full"
            />
          </div>
        </div>
      </div>

      {/* Action Notifications */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-800 font-semibold text-xs sm:text-sm shadow-inner animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 font-semibold text-xs sm:text-sm shadow-inner animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Vertical Milestones Flow */}
      <div className="space-y-6">
        <h3 className="font-poppins font-black text-stone-900 text-base uppercase tracking-wider pl-1">Milestone Payments Plan</h3>
        
        <div className="space-y-6 relative border-l-2 border-stone-200/80 pl-6 sm:pl-8 ml-4">
          {milestones.map((milestone, idx) => {
            const isPaid = milestone.status === 'Paid';
            const isPending = milestone.status === 'Pending';
            const isLocked = milestone.status === 'Locked';
            
            let milestoneSubtext = '';
            let timelineStatus = 'Locked';
            if (isPaid) {
              milestoneSubtext = `Paid via ${order.paymentGateway?.toUpperCase() || 'Bank Transfer'} on ${new Date(milestone.paidAt).toLocaleDateString()}`;
              timelineStatus = 'Paid';
            } else if (isPending) {
              milestoneSubtext = idx === 0 ? 'Initial advance required to start production.' : 'Payment unlocked. Click Pay Now to proceed.';
              timelineStatus = 'Awaiting Payment';
            } else {
              milestoneSubtext = `Locked. Unlocks after Milestone ${idx} is completed.`;
              timelineStatus = 'Locked';
            }

            return (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                  isPaid ? 'bg-[#2E7D32]' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'
                }`} />

                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                  isPaid ? 'bg-[#2E7D32]/5 border-[#2E7D32]/20' : 
                  isPending ? 'bg-white border-[#2E7D32]/40 shadow-md ring-1 ring-[#2E7D32]/10' : 
                  'bg-stone-50 border-stone-200/60 opacity-60'
                }`}>
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
                        Milestone {idx + 1}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isPaid ? 'bg-green-100 text-green-800' :
                        isPending ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-200 text-stone-500'
                      }`}>
                        {timelineStatus}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-stone-900 leading-tight">
                      {milestone.milestoneType}
                    </h4>

                    <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                      {milestoneSubtext}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-4 justify-between md:justify-end shrink-0 border-t border-stone-100 md:border-none pt-3 md:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Milestone Value</p>
                      <p className="text-lg font-black text-stone-900">
                        {convertCurrency(milestone.amount, milestone.currency || order.currency).formatted}
                      </p>
                      <p className="text-[10px] text-stone-500 font-bold">({milestone.percentage}% of total)</p>
                    </div>

                    <div className="min-w-[100px] flex justify-end">
                      {isPaid && (
                        <div className="w-10 h-10 rounded-full bg-green-50 text-[#2E7D32] flex items-center justify-center shadow-inner">
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      )}

                      {isPending && (
                        <button
                          onClick={() => handlePayMilestone(idx, milestone.amount)}
                          disabled={isProcessing}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white text-xs font-black rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay Now
                        </button>
                      )}

                      {isLocked && (
                        <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center border border-stone-200">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support card */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-stone-900">Need wire transfer options?</h4>
          <p className="text-xs text-stone-500 font-semibold mt-0.5">Contact our support desk to register manual Bank TT slips.</p>
        </div>
        <button onClick={() => navigate('/support')} className="px-5 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl transition shadow-sm cursor-pointer shrink-0">
          Open Support Ticket
        </button>
      </div>
    </div>
  );
};

export default OrderPaymentMilestones;
