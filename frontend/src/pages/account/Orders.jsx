import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Download, Truck, RotateCcw, XCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecommendedProducts from '../../components/common/RecommendedProducts';

const Orders = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelCustomReason, setCancelCustomReason] = useState('');

  const cancellationReasons = [
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Product no longer needed',
    'Shipping time is too long',
    'Want to modify the order',
    'Payment issue',
    'Other'
  ];

  const fetchOrders = async () => {
    try {
      const resOrders = await apiClient.get('/orders/myorders');
      if (resOrders.data.success) setOrders(resOrders.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    if (!orderId) return;
    try {
      const response = await apiClient.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderId}.pdf`);
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
        fetchOrders();
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
      navigate('/account/checkout');
    } catch (error) {
      alert('Failed to reorder. Please try again.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const search = searchQuery.toLowerCase();
    const matchId = order._id.toLowerCase().includes(search);
    const matchProduct = order.items.some(item => 
      (item.product?.name || '').toLowerCase().includes(search)
    );
    const matchesSearch = matchId || matchProduct;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt || Date.now());
      const diffTime = Math.abs(new Date() - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesDate = diffDays <= parseInt(dateFilter);
    }

    return matchesSearch && matchesDate;
  });



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white/90 backdrop-blur-md rounded-[24px] border border-stone-200 shadow-sm max-w-5xl mx-auto">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-[#2E7D32] rounded-full animate-spin mb-4"></div>
        <p className="text-stone-700 font-bold font-poppins text-lg">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Your Orders</h1>
          <p className="text-stone-500 font-semibold text-sm">Track, return, or buy things again.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-stone-300 rounded-lg py-2 px-4 text-sm font-bold text-stone-700 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] appearance-none cursor-pointer"
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    className="accent-red-600 w-4 h-4"
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



      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="w-full bg-white rounded-[24px] p-16 md:p-24 text-center border border-stone-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100">
                <Package className="w-10 h-10 text-[#2E7D32]" />
              </div>
              <h3 className="text-2xl font-extrabold text-stone-900 mb-2">No Orders Found</h3>
              <p className="text-stone-500 font-semibold mb-6">
                {orders.length === 0 ? "You haven't placed any orders yet." : "We couldn't find any orders matching your criteria."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                {orders.length > 0 && (searchQuery !== '' || dateFilter !== 'all') && (
                  <button 
                    onClick={() => { setSearchQuery(''); setDateFilter('all'); }}
                    className="px-8 py-3.5 bg-white text-[#2E7D32] border border-[#2E7D32] font-bold rounded-xl hover:bg-stone-50 transition-all hover:-translate-y-0.5"
                  >
                    Clear Filters
                  </button>
                )}
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white font-bold rounded-xl border border-transparent hover:shadow-lg hover:shadow-[#2E7D32]/30 transition-all hover:-translate-y-0.5"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>
            
            <RecommendedProducts />
          </motion.div>
        ) : (
          filteredOrders.map((order, idx) => {
            const status = order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending';
            let displayStatus = status;
            if (status === 'Cancelled' && order.paymentStatus === 'failed') {
              displayStatus = 'Cancelled (Payment Failed)';
            }
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={order._id} 
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
                    <span className="uppercase text-[10px] font-bold text-stone-500 mb-0.5">Order # {order._id.slice(-8).toUpperCase()}</span>
                    <div className="flex gap-2 text-[#007185] font-semibold mt-0.5 text-xs">
                      <span className="hover:text-[#C45500] hover:underline cursor-pointer">Order details</span>
                      <span className="text-stone-300">|</span>
                      <span className="hover:text-[#C45500] hover:underline cursor-pointer" onClick={() => handleDownloadInvoice(order._id)}>Invoice</span>
                    </div>
                  </div>
                </div>

                {/* Card Body - Products List */}
                <div className="p-4 md:p-6 space-y-6">
                  {/* Status Banner */}
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg md:text-xl font-bold ${status === 'Delivered' ? 'text-[#067D62]' : status === 'Cancelled' ? 'text-red-700' : 'text-stone-900'}`}>
                      {displayStatus}
                    </h3>
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
                            <button onClick={() => navigate(`/account/track/${order._id}`)} className="px-3 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] text-stone-900 text-xs font-semibold rounded-full border border-[#FCD200] shadow-sm transition-colors w-fit">
                              Track package
                            </button>
                          )}
                          
                          {(status === 'Delivered' || status === 'Cancelled') && (
                            <button onClick={() => handleReorder(order._id)} className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors w-fit flex items-center gap-1.5">
                              <RotateCcw className="w-3.5 h-3.5" /> {status === 'Cancelled' ? 'Reorder' : 'Buy it again'}
                            </button>
                          )}
                          
                          {['Pending', 'Confirmed', 'Packed', 'Loaded'].includes(status) && (
                            <button onClick={() => handleCancelClick(order._id)} className="px-3 py-1.5 bg-white hover:bg-stone-50 text-red-600 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors w-fit">
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
          })
        )}
      </div>

      <div className="mt-16">
        <RecommendedProducts />
      </div>
    </div>
  );
};

export default Orders;
