import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Download, Truck, RotateCcw, Package, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FixedSizeList as List } from 'react-window';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecommendedProducts from '../../components/common/RecommendedProducts';
import SEO from '../../components/SEO';

// Lazy load common PDFModal component for inline invoice preview
const PDFModal = React.lazy(() => import('../../components/common/PDFModal'));

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
  const { user, fetchProfile } = useAuth();
  
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
  
  const [errorState, setErrorState] = useState('');

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

  // React Query Fetch (Automatic cache, staleTime 5m, cacheTime 15m)
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
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      onError: (err) => {
        console.error('Failed to fetch orders:', err);
        setErrorState(err.response?.data?.message || 'Failed to load your orders.');
      }
    }
  );

  const orders = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  const handlePreviewInvoice = (orderId, orderNumber) => {
    if (!orderId) return;
    const token = sessionStorage.getItem('cocoveera_token');
    const viewUrl = `${apiClient.defaults.baseURL}/orders/${orderId}/invoice?token=${token}`;
    setActivePdfUrl(viewUrl);
    setActiveOrderNum(orderNumber);
    setPdfModalOpen(true);
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    if (!orderId) return;
    try {
      const response = await apiClient.get(`/orders/${orderId}/invoice`, {
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

  // Reusable Single Order Card Item
  const OrderCardItem = React.memo(({ order, idx }) => {
    const status = order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending';
    let displayStatus = status;
    if (status === 'Cancelled' && order.paymentStatus === 'failed') {
      displayStatus = 'Cancelled (Payment Failed)';
    }

    const shortOrderId = (order.orderNumber || order._id).slice(-8).toUpperCase();

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`bg-white rounded-xl border overflow-hidden relative shadow-sm hover:shadow-md transition-shadow ${
          status === 'Delivered' ? 'border-l-4 border-l-[#067D62] border-stone-200' : 
          status === 'Cancelled' ? 'border-l-4 border-l-red-500 border-stone-200' : 
          'border-l-4 border-l-[#F59E0B] border-stone-200'
        }`}
      >
        {/* Card Header (Amazon/Flipkart Style) */}
        <div className="bg-[#F0F2F2] border-b border-stone-200 px-4 md:px-6 py-3 text-sm text-stone-600 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-6 md:gap-12">
            <div className="flex flex-col">
              <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Order placed</span>
              <span className="font-semibold text-stone-700">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Total</span>
              <span className="font-semibold text-stone-700">{convertCurrency((order.totalAmount || order.total || 0), user?.currency || 'INR').formatted}</span>
            </div>
            <div className="flex flex-col">
              <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Ship to</span>
              <span className="font-semibold text-[#007185] hover:text-[#C45500] hover:underline cursor-pointer">{user?.name || 'Customer'}</span>
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
          {/* Status Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 gap-4">
            <div>
              <h3 className={`text-lg md:text-xl font-black ${status === 'Delivered' ? 'text-[#067D62]' : status === 'Cancelled' ? 'text-red-700' : 'text-stone-900'}`}>
                {displayStatus}
              </h3>
              
              {/* Payment Milestones Progress Tracker */}
              {order.paymentMilestones && order.paymentMilestones.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-40 sm:w-56 bg-stone-100 rounded-full h-2 border border-stone-200 overflow-hidden relative">
                      <div 
                        className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] h-full transition-all" 
                        style={{ width: `${order.paymentProgress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-stone-700">{order.paymentProgress || 0}% Paid</span>
                  </div>

                  {/* Horizontal visual status indicators */}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Milestone Progress:</span>
                    <div className="flex items-center gap-2">
                      {order.paymentMilestones.map((m, mIdx) => {
                        const targetPct = mIdx === 0 ? 40 : mIdx === 1 ? 60 : mIdx === 2 ? 80 : 100;
                        const isPaid = m.status === 'Paid';
                        const isPending = m.status === 'Pending';
                        return (
                          <span key={mIdx} className="font-bold text-stone-600 flex items-center gap-0.5">
                            {isPaid ? '✔' : isPending ? '⭕' : '🔒'} {targetPct}%
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Milestone & Remaining Amount details */}
                  <div className="text-xs text-stone-500 font-medium space-y-0.5">
                    {(order.paymentProgress || 0) < 100 ? (
                      <>
                        <p>Current Milestone: <strong className="text-stone-700">{order.paymentMilestones.find(m => m.status !== 'Paid')?.milestoneType || 'N/A'}</strong></p>
                        <p>Remaining Balance: <strong className="text-stone-950 font-black">{convertCurrency(order.paymentMilestones.reduce((acc, m) => acc + (m.status !== 'Paid' ? m.amount : 0), 0), order.currency || 'USD').formatted}</strong></p>
                      </>
                    ) : (
                      <p className="text-[#2E7D32] font-bold">✔ All milestones paid in full.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Next Payment button */}
            {order.paymentMilestones && order.paymentMilestones.find(m => m.status === 'Pending') && (
              <button 
                onClick={() => navigate(`/orders/payment/${order._id}`)}
                className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shadow-sm hover:shadow transition-all cursor-pointer w-full sm:w-auto text-center"
              >
                Pay Next Milestone
              </button>
            )}
          </div>

          {order.items.map((item, itemIdx) => (
            <div key={itemIdx} className="flex flex-col md:flex-row gap-6">
              {/* Product Image */}
              <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-stone-50 border border-stone-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => item.product?.slug && navigate(`/product/${item.product.slug}`)}>
                {item.product?.images?.[0] ? (
                  <div className="w-full h-full relative p-1 overflow-hidden group">
                    <ImageWithFallback src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
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
                  {item.product?.name || 'Unknown Product'}
                </h4>
                <div className="text-xs text-stone-500 mt-1 mb-2">Containers: {item.quantity}</div>
                
                <div className="mt-auto flex flex-wrap gap-2">
                  {status !== 'Pending' && status !== 'Cancelled' && (
                    <button onClick={() => navigate(`/track/${order._id}`)} className="px-3 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] text-stone-900 text-xs font-semibold rounded-full border border-[#FCD200] shadow-sm transition-colors w-fit">
                      Track package
                    </button>
                  )}
                  
                  {(status === 'Delivered' || status === 'Cancelled') && (
                    <button onClick={() => handleReorder(order._id)} className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors w-fit flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" /> {status === 'Cancelled' ? 'Reorder' : 'Buy it again'}
                    </button>
                  )}
                  
                  {['Pending', 'Confirmed', 'Packed', 'Loaded'].includes(status) && (
                    <button onClick={() => handleCancelClick(order._id)} className="px-3 py-1.5 bg-white hover:bg-stone-50 text-red-650 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors w-fit">
                      Cancel items
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              <OrderCardItem order={orders[index]} idx={index} />
            </div>
          )}
        </List>
      );
    }

    return (
      <div className="space-y-6">
        {orders.map((order, idx) => (
          <OrderCardItem key={order._id} order={order} idx={idx} />
        ))}
      </div>
    );
  };

  const showSkeleton = isLoading && orders.length === 0;

  return (
    <div className="w-full space-y-6 pb-20">
      <SEO title="Your Orders - Cocoveera" />
      
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

      {/* Lazy Invoice PDF Viewer Modal */}
      <Suspense fallback={null}>
        <PDFModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={activePdfUrl}
          quoteNumber={activeOrderNum}
          title="Invoice Preview"
        />
      </Suspense>

      <div className="mt-16">
        <RecommendedProducts />
      </div>
    </div>
  );
};

export default Orders;
