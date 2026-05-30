import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Download, Truck, RotateCcw, XCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';

const STATUS_FILTERS = ['All', 'Pending', 'Confirmed', 'Production', 'Packed', 'Loaded', 'Shipped', 'Delivered', 'Cancelled'];

const TIMELINE_STEPS = ['Pending', 'Confirmed', 'Packed', 'Loaded', 'Shipped', 'Delivered'];

const getTimelineIndex = (status) => {
  const s = status.toLowerCase();
  const idx = TIMELINE_STEPS.findIndex(ts => ts.toLowerCase() === s);
  return idx >= 0 ? idx : 0; 
};

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [resOrders, resInvoices] = await Promise.all([
          apiClient.get('/orders/myorders'),
          apiClient.get('/invoices/myinvoices')
        ]);
        if (resOrders.data.success) setOrders(resOrders.data.data);
        if (resInvoices.data) setInvoices(resInvoices.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
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

  const formattedOrders = orders.map(o => {
    const invoice = invoices.find(inv => inv.orderId?._id === o._id || inv.orderId === o._id);
    return {
      id: o._id,
      date: o.createdAt,
      products: o.items.map(i => i.product?.name || 'Unknown Product'),
      containerType: o.containerCapacity || 'LCL',
      quantity: `${o.items.reduce((sum, i) => sum + i.quantity, 0)} Units`,
      totalAmount: o.totalAmount,
      paymentStatus: o.paymentStatus.charAt(0).toUpperCase() + o.paymentStatus.slice(1),
      status: o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1),
      timelineIndex: getTimelineIndex(o.orderStatus),
      invoiceId: invoice?._id || null,
    };
  });

  // Filter orders
  const filteredOrders = formattedOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-bold">Loading orders...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">My Orders</h1>
          <p className="text-stone-500 font-semibold text-sm">Manage your past and active B2B shipments.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-9 pr-4 text-sm font-semibold text-stone-900 focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
        {STATUS_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === filter 
                ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20' 
                : 'bg-white text-stone-600 border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[20px] p-12 text-center border border-stone-200/50 flex flex-col items-center justify-center min-h-[400px]">
            <Package className="w-16 h-16 text-stone-300 mb-4" />
            <h3 className="text-lg font-bold text-stone-900">No Orders Found</h3>
            <p className="text-stone-500 font-semibold text-sm mt-1">We couldn't find any orders matching your criteria.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
              className="mt-6 px-6 py-2.5 bg-[#2E7D32] text-white font-bold text-sm rounded-xl hover:bg-[#1B5E20] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredOrders.map((order, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={order.id} 
              className="bg-white rounded-[20px] border border-stone-200/80 p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-stone-100 pb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-black text-stone-900">{order.id}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      order.paymentStatus === 'Paid' ? 'bg-[#F0FAF0] text-[#2E7D32]' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs font-semibold">Ordered on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                  <button onClick={() => navigate(`/account/orders/${order.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  <button onClick={() => navigate(`/account/track/${order.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                    <Truck className="w-3.5 h-3.5" /> Track
                  </button>
                  {order.invoiceId && (
                    <button onClick={() => handleDownloadInvoice(order.invoiceId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                      <Download className="w-3.5 h-3.5" /> Invoice
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                      <RotateCcw className="w-3.5 h-3.5" /> Reorder
                    </button>
                  )}
                  {order.status === 'Pending' && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">Products</p>
                  <ul className="list-disc list-inside text-sm font-semibold text-stone-800 space-y-1">
                    {order.products.map((p, i) => <li key={i} className="truncate">{p}</li>)}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">Logistics</p>
                    <p className="text-sm font-bold text-stone-900">{order.containerType} &bull; {order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-lg font-black text-[#2E7D32]">{convertCurrency(order.totalAmount, user?.currency).formatted} {user?.currency?.toUpperCase() || 'INR'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {order.status !== 'Cancelled' && (
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">Shipment Progress</p>
                    <p className="text-xs font-black text-[#2E7D32]">{TIMELINE_STEPS[order.timelineIndex]}</p>
                  </div>
                  <div className="relative w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#43A047] to-[#2E7D32] rounded-full transition-all duration-1000"
                      style={{ width: `${(order.timelineIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    {TIMELINE_STEPS.map((step, i) => (
                      <div key={step} className={`w-1.5 h-1.5 rounded-full ${i <= order.timelineIndex ? 'bg-[#2E7D32]' : 'bg-stone-300'}`} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
