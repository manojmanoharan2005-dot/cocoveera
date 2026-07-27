import React, { useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Truck, MessageSquare, MapPin, CreditCard, Package, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import RecommendedProducts from '../../components/common/RecommendedProducts';
import { formatDateFriendly } from '../../utils/dateFormatter';

// Lazy loaded heavy components
const PDFModal = React.lazy(() => import('../../components/common/PDFModal'));
const HistoryTimeline = React.lazy(() => import('../../components/common/HistoryTimeline'));

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Invoice Preview Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfViewUrl, setPdfViewUrl] = useState('');

  // React Query Fetch (Automatic cache, staleTime 5m, cacheTime 15m)
  const { data: backendOrder, isLoading, error } = useQuery(
    ['order', id],
    async () => {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
    }
  );

  const handleDownloadInvoice = async () => {
    if (!backendOrder?._id) return;
    try {
      const res = await apiClient.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${backendOrder.orderNumber || backendOrder._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert('Failed to generate invoice. Please try again later.');
    }
  };

  const handlePreviewInvoice = () => {
    if (!backendOrder?._id) return;
    const token = sessionStorage.getItem('cocoveera_token');
    const viewUrl = `${apiClient.defaults.baseURL}/orders/${id}/invoice?token=${token}`;
    setPdfViewUrl(viewUrl);
    setPdfModalOpen(true);
  };

  if (isLoading) return <div className="p-12 text-center text-stone-500 font-bold">Loading order details...</div>;
  if (error || !backendOrder) return <div className="p-12 text-center text-stone-500 font-bold">Order not found</div>;

  const order = {
    id: backendOrder._id,
    date: backendOrder.createdAt,
    shippingDate: backendOrder.shippingDate,
    estimatedDeliveryDate: backendOrder.estimatedDeliveryDate,
    status: backendOrder.orderStatus.charAt(0).toUpperCase() + backendOrder.orderStatus.slice(1),
    paymentStatus: backendOrder.paymentStatus.charAt(0).toUpperCase() + backendOrder.paymentStatus.slice(1),
    container: {
      type: backendOrder.shippingDetails?.containerType || backendOrder.recommendedContainer || 'LCL',
      number: backendOrder.trackingNumber || 'Pending',
      capacity: 'N/A',
      weight: backendOrder.totalWeight ? `${backendOrder.totalWeight.toLocaleString()} KG` : 'N/A',
      pallets: backendOrder.items ? Math.round(backendOrder.items.reduce((acc, item) => acc + item.quantity, 0) * ((backendOrder.shippingDetails?.containerType || backendOrder.recommendedContainer || '').includes('40FT') ? 22 : 10)) : 'N/A'
    },
    products: backendOrder.items.map(item => ({
      name: item.product?.name || 'Unknown',
      quantity: item.quantity,
      unit: 'Units',
      price: item.unitPrice
    })),
    summary: {
      subtotal: backendOrder.items ? backendOrder.items.reduce((acc, curr) => acc + ((curr.pieces || curr.quantity) * (curr.unitPrice || curr.price || 0)), 0) : backendOrder.totalAmount,
      discount: backendOrder.discount || 0,
      shipping: backendOrder.shippingCharge || 0,
      tax: backendOrder.tax || 0,
      total: backendOrder.totalAmount
    },
    shippingAddress: {
      name: backendOrder.user?.name || 'User',
      addressLine1: backendOrder.shippingAddress?.addressLine1 || backendOrder.shippingAddress?.addressLine || 'N/A',
      addressLine2: backendOrder.shippingAddress?.addressLine2 || '',
      city: backendOrder.shippingAddress?.city || 'N/A',
      state: backendOrder.shippingAddress?.state || '',
      country: backendOrder.shippingAddress?.country || 'N/A',
      zip: backendOrder.shippingAddress?.postalCode || backendOrder.shippingAddress?.zipCode || 'N/A'
    },
    customerNotes: '',
    paymentMethod: backendOrder.paymentGateway === 'cod' ? 'Cash on Delivery (COD)' :
                   backendOrder.paymentGateway === 'wire' ? 'Bank Wire Transfer (TT)' :
                   backendOrder.paymentGateway === 'cad' ? 'Cash Against Documents (CAD)' :
                   backendOrder.paymentGateway === 'stripe' ? 'Credit Card (Stripe)' :
                   backendOrder.paymentGateway === 'paypal' ? 'PayPal' :
                   backendOrder.paymentGateway ? backendOrder.paymentGateway.toUpperCase() : 'Unknown',
    paymentId: backendOrder.paymentId || backendOrder._id
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/orders')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-poppins">Order {backendOrder.orderNumber || order.id}</h1>
          <p className="text-stone-500 font-semibold text-sm">Placed on {new Date(order.date).toLocaleString()}</p>
          {(order.shippingDate || order.estimatedDeliveryDate || backendOrder.expectedDeliveryDate) && (
            <p className="text-stone-500 font-semibold text-xs mt-1">
              {order.shippingDate && <span>Est. Shipping: {new Date(order.shippingDate).toLocaleDateString()}</span>}
              {order.shippingDate && order.estimatedDeliveryDate && <span className="mx-2">&bull;</span>}
              {order.estimatedDeliveryDate && <span>Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>}
              {(order.estimatedDeliveryDate || order.shippingDate) && backendOrder.expectedDeliveryDate && <span className="mx-2">&bull;</span>}
              {backendOrder.expectedDeliveryDate && <span>Expected Delivery: {formatDateFriendly(backendOrder.expectedDeliveryDate)}</span>}
            </p>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => navigate(`/track/${order.id}`)} className="px-4 py-2 bg-[#2E7D32] text-white font-bold text-sm rounded-xl hover:bg-[#1B5E20] transition-colors flex items-center gap-2 shadow-md shadow-[#2E7D32]/20">
            <Truck className="w-4 h-4" /> Track Container
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {['Shipped', 'Delivered'].includes(order.status) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <span className="text-xl">🚚</span>
              <p className="text-sm font-bold text-amber-800 uppercase tracking-wider">Shipped Orders Cannot Be Cancelled</p>
            </div>
          )}

          {/* Order Status & Actions */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-black uppercase tracking-wider border border-blue-200">{order.status}</span>
              <span className="px-3 py-1.5 bg-[#F0FAF0] text-[#2E7D32] rounded-lg text-xs font-black uppercase tracking-wider border border-[#2E7D32]/20">{order.paymentStatus}</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handlePreviewInvoice}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 font-bold text-sm rounded-xl hover:bg-stone-200 transition-colors"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button 
                onClick={handleDownloadInvoice}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 font-bold text-sm rounded-xl hover:bg-stone-200 transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button 
                onClick={() => navigate(`/support?orderId=${order.id}`)}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 font-bold text-sm rounded-xl hover:bg-stone-200 transition-colors">
                <MessageSquare className="w-4 h-4" /> Support
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Products ({order.products.length})</h3>
            <div className="space-y-4">
              {order.products.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-stone-200">
                      <Package className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-500 font-semibold">{item.quantity} {item.unit} &bull; {convertCurrency(item.price, user?.currency).formatted} / {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#2E7D32]">{convertCurrency(item.quantity * item.price, user?.currency).formatted}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Container Information */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Container Logistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Type</p>
                <p className="text-sm font-bold text-stone-900">{order.container.type}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Container #</p>
                <p className="text-sm font-bold text-stone-900">{order.container.number}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Weight</p>
                <p className="text-sm font-bold text-stone-900">{order.container.weight}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total Pallets</p>
                <p className="text-sm font-bold text-stone-900">{order.container.pallets}</p>
              </div>
              {backendOrder.expectedDeliveryDate && (
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Expected Delivery</p>
                  <p className="text-sm font-bold text-stone-900">{formatDateFriendly(backendOrder.expectedDeliveryDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Milestones Timeline */}
          {backendOrder.paymentMilestones && backendOrder.paymentMilestones.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-6 border-b border-stone-100 pb-2">
                Payment Milestones
              </h3>
              
              <Suspense fallback={<div className="h-32 bg-stone-100 rounded-xl animate-pulse" />}>
                <HistoryTimeline 
                  type="milestones" 
                  data={backendOrder.paymentMilestones} 
                  userCurrency={user?.currency} 
                />
              </Suspense>
            </div>
          )}

        </div>

        {/* Right Column - Summaries */}
        <div className="space-y-6">
          
          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Payment Summary</h3>
            <div className="space-y-3 text-sm font-semibold text-stone-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-900">{convertCurrency(order.summary.subtotal, user?.currency).formatted}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping (FOB)</span>
                <span className="text-stone-900">{convertCurrency(order.summary.shipping, user?.currency).formatted}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{convertCurrency(order.summary.discount, user?.currency).formatted}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="text-stone-900">{convertCurrency(order.summary.tax, user?.currency).formatted}</span>
              </div>
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-black text-stone-900 uppercase tracking-wider">Grand Total</span>
              <span className="text-xl font-black text-[#2E7D32]">{convertCurrency(order.summary.total, user?.currency).formatted} {user?.currency?.toUpperCase() || 'INR'}</span>
            </div>
          </div>

          {/* Shipping & Billing */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-stone-400" />
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Shipping Address</h3>
              </div>
              <address className="not-italic text-sm font-semibold text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="block text-stone-900 font-bold mb-1">{order.shippingAddress.name}</span>
                {order.shippingAddress.addressLine1}<br/>
                {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br/></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br/>
                {order.shippingAddress.country}
              </address>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-stone-400" />
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Payment Method</h3>
              </div>
              <div className="text-sm font-semibold text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                {order.paymentMethod}<br/>
                {order.paymentId && <span className="text-xs text-stone-500 mt-1 block">Ref: {order.paymentId}</span>}
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.customerNotes && (
            <div className="bg-[#FFF9C4]/30 rounded-2xl p-6 border border-[#FBC02D]/30 shadow-sm">
              <h3 className="text-xs font-black text-[#F57F17] uppercase tracking-wider mb-2">Customer Notes</h3>
              <p className="text-sm font-semibold text-stone-700 italic">"{order.customerNotes}"</p>
            </div>
          )}

        </div>
      </div>

      {/* Lazy Invoice PDF Viewer Modal */}
      <Suspense fallback={null}>
        <PDFModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={pdfViewUrl}
          quoteNumber={backendOrder.orderNumber || backendOrder._id}
          title="Invoice Preview"
        />
      </Suspense>

      <div className="mt-16">
        <RecommendedProducts />
      </div>
    </div>
  );
};

export default OrderDetails;
