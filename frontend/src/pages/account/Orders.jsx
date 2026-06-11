import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Download, Truck, RotateCcw, XCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const Orders = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDownloadInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again later.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await apiClient.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
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
    return matchId || matchProduct;
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900">Your Orders</h1>
        </div>
        <div className="relative w-full md:w-80">
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

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-stone-200 flex flex-col items-center justify-center min-h-[300px]">
            <Package className="w-16 h-16 text-stone-300 mb-4" />
            <h3 className="text-lg font-bold text-stone-900">No Orders Found</h3>
            <p className="text-stone-500 font-medium text-sm mt-1">We couldn't find any orders matching your criteria.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 px-6 py-2.5 bg-stone-100 text-stone-700 font-bold text-sm rounded-lg hover:bg-stone-200 transition-colors"
            >
              Clear Search
            </button>
          </div>
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
                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
              >


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
                          <div className="w-full h-full relative p-1">
                            <ImageWithFallback src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
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
                          
                          {status === 'Pending' && (
                            <button onClick={() => handleCancelOrder(order._id)} className="px-3 py-1.5 bg-white hover:bg-stone-50 text-red-600 text-xs font-semibold rounded-full border border-stone-300 shadow-sm transition-colors w-fit">
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
    </div>
  );
};

export default Orders;
