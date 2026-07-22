/**
 * File: frontend/src/pages/account/OrderDetails.jsx
 * Purpose: React page component representing the OrderDetails view.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Truck, MessageSquare, MapPin, CreditCard, Package } from 'lucide-react';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import RecommendedProducts from '../../components/common/RecommendedProducts';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [backendOrder, setBackendOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/orders/${id}`);
        if (res.data.success) {
          setBackendOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading order details...</div>;
  if (!backendOrder) return <div className="p-12 text-center text-stone-500 font-bold">Order not found</div>;

  const handleDownloadInvoice = async () => {
    try {
      const res = await apiClient.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${backendOrder._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert('Failed to generate invoice. Please try again later.');
    }
  };

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
          <h1 className="text-2xl font-extrabold text-stone-900">Order {backendOrder.orderNumber || order.id}</h1>
          <p className="text-stone-500 font-semibold text-sm">Placed on {new Date(order.date).toLocaleString()}</p>
          {(order.shippingDate || order.estimatedDeliveryDate) && (
            <p className="text-stone-500 font-semibold text-xs mt-1">
              {order.shippingDate && <span>Est. Shipping: {new Date(order.shippingDate).toLocaleDateString()}</span>}
              {order.shippingDate && order.estimatedDeliveryDate && <span className="mx-2">&bull;</span>}
              {order.estimatedDeliveryDate && <span>Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>}
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
                onClick={handleDownloadInvoice}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 font-bold text-sm rounded-xl hover:bg-stone-200 transition-colors"
              >
                <Download className="w-4 h-4" /> Invoice
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            </div>
          </div>

          {/* B2B Payment Milestones Timeline */}
          {backendOrder.paymentMilestones && backendOrder.paymentMilestones.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-6 border-b border-stone-100 pb-2">
                B2B Payment Milestones
              </h3>
              
              <div className="space-y-6 relative border-l-2 border-stone-150 pl-6 my-2">
                {backendOrder.paymentMilestones.map((milestone, idx) => {
                  const isPending = milestone.status === 'Pending';
                  const isPaid = milestone.status === 'Paid';
                  const isLocked = milestone.status === 'Locked';
                  
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                        isPaid ? 'bg-[#2E7D32]' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'
                      }`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">{milestone.milestoneType}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-[#2E7D32]">
                              {convertCurrency(milestone.amount, milestone.currency).formatted}
                            </span>
                            <span className="text-[10px] text-stone-400 font-bold">({milestone.percentage}%)</span>
                          </div>
                          {milestone.dueDate && (
                            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPaid ? 'bg-green-100 text-green-800 border border-green-200' :
                            isPending ? 'bg-amber-100 text-amber-800 border border-amber-250' :
                            'bg-stone-200 text-stone-500 border border-stone-250'
                          }`}>
                            {milestone.status}
                          </span>
                          
                          {isPending && (
                            <button
                              onClick={() => alert(`Payment portal integration will be unlocked in the next phase. Milestone amount: ${milestone.currency} ${milestone.amount.toLocaleString()}`)}
                              className="px-4 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-xs rounded-lg shadow transition-colors cursor-pointer border-none"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

      <div className="mt-16">
        <RecommendedProducts />
      </div>
    </div>
  );
};

export default OrderDetails;
