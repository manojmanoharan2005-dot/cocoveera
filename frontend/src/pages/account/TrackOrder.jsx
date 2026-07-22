import React, { Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../context/AuthContext';
import SEO from '../../components/SEO';

// Lazy loaded heavy timeline component
const TrackingTimeline = React.lazy(() => import('../../components/common/TrackingTimeline'));

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // React Query Fetch (Automatic cache, staleTime 5m, cacheTime 15m)
  const { data: order, isLoading, error } = useQuery(
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

  if (isLoading) return <div className="p-12 text-center text-stone-500 font-bold">Loading tracking info...</div>;
  if (error || !order) return <div className="p-12 text-center text-stone-500 font-bold">Order not found</div>;

  const isCancelled = order.orderStatus === 'cancelled';
  const shortOrderId = order._id.substring(order._id.length - 8);

  return (
    <div className="w-full space-y-6">
      <SEO title={`Track Order #${shortOrderId} - Cocoveera`} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start md:items-center gap-3">
          <button onClick={() => navigate('/orders')} className="w-10 h-10 shrink-0 mt-1 md:mt-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="break-all">
            <h1 className="text-xl md:text-2xl font-extrabold text-stone-900 leading-tight font-poppins">Track Order <span className="text-stone-500 font-medium text-base md:text-lg block sm:inline">#{shortOrderId}</span></h1>
            <p className="text-stone-500 font-semibold text-xs md:text-sm mt-1">Container: {order.trackingNumber || 'Pending'} ({order.containerCapacity || 'LCL'})</p>
            {(order.shippingDate || order.estimatedDeliveryDate) && (
              <p className="text-stone-500 font-semibold text-xs mt-1">
                {order.shippingDate && <span>Est. Shipping: {new Date(order.shippingDate).toLocaleDateString()}</span>}
                {order.shippingDate && order.estimatedDeliveryDate && <span className="mx-2">&bull;</span>}
                {order.estimatedDeliveryDate && <span>Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>}
              </p>
            )}
          </div>
        </div>
        <div className="md:ml-auto flex items-center justify-between md:justify-end gap-2 bg-white p-3 md:p-0 rounded-xl border md:border-none border-stone-200 shadow-sm md:shadow-none">
          <div className="text-left md:text-right">
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-0.5 md:mb-1">Status</p>
            <p className={`text-lg md:text-xl font-black ${isCancelled ? 'text-red-600' : 'text-[#2E7D32]'}`}>{order.orderStatus.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        
        {/* Tracking Timeline Card */}
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-stone-200 shadow-sm relative overflow-hidden">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-8">Shipment Status</h3>
          
          <Suspense fallback={<div className="h-48 bg-stone-50 rounded-xl animate-pulse" />}>
            <TrackingTimeline order={order} />
          </Suspense>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;
