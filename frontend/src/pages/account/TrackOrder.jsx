/**
 * File: frontend/src/pages/account/TrackOrder.jsx
 * Purpose: React page component representing the TrackOrder view.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Package, Anchor, Truck, MapPin, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../../context/AuthContext';

const STATUS_MAP = {
  'pending': 1,
  'confirmed': 2,
  'packed': 3,
  'loaded': 4,
  'shipped': 5,
  'delivered': 6
};

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading tracking info...</div>;
  if (!order) return <div className="p-12 text-center text-stone-500 font-bold">Order not found</div>;

  const isCancelled = order.orderStatus === 'cancelled';
  const currentStepId = isCancelled ? 2 : (STATUS_MAP[order.orderStatus] || 1);

  const destCity = order?.shippingAddress?.city || 'Destination';
  const destCountry = order?.shippingAddress?.country || '';

  const TRACKING_STEPS = isCancelled ? [
    { id: 1, label: 'Order Created', icon: Package, date: new Date(order.createdAt).toLocaleDateString(), location: 'Website' },
    { id: 2, label: 'Order Cancelled', icon: XCircle, date: new Date(order.updatedAt).toLocaleDateString(), location: 'System' }
  ] : [
    { id: 1, label: 'Order Created', icon: Package, date: new Date(order.createdAt).toLocaleDateString(), location: 'Website' },
    { id: 2, label: 'Confirmed', icon: Check, date: currentStepId >= 2 ? 'Completed' : 'Pending', location: 'Processing Center' },
    { id: 3, label: 'Packed', icon: Package, date: currentStepId >= 3 ? 'Completed' : 'Pending', location: 'Warehouse, Pollachi, India' },
    { id: 4, label: 'Loaded', icon: Truck, date: currentStepId >= 4 ? 'Completed' : 'Pending', location: 'Chennai Port, India' },
    { id: 5, label: 'Shipped', icon: Anchor, date: currentStepId >= 5 ? 'Completed' : 'Pending', location: 'In Transit' },
    { id: 6, label: 'Delivered', icon: MapPin, date: currentStepId >= 6 ? 'Completed' : 'Pending', location: `${destCity}${destCountry ? `, ${destCountry}` : ''}` }
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start md:items-center gap-3">
          <button onClick={() => navigate('/orders')} className="w-10 h-10 shrink-0 mt-1 md:mt-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="break-all">
            <h1 className="text-xl md:text-2xl font-extrabold text-stone-900 leading-tight">Track Order <span className="text-stone-500 font-medium text-base md:text-lg block sm:inline">#{order._id.substring(order._id.length - 8)}</span></h1>
            <p className="text-stone-500 font-semibold text-xs md:text-sm mt-1">Container: {order.trackingNumber || 'Pending'} ({order.containerCapacity || 'LCL'})</p>
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
        
        {/* Tracking Timeline */}
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-stone-200 shadow-sm relative overflow-hidden">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-8">Shipment Status</h3>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[19px] top-4 bottom-8 w-0.5 bg-stone-100" />
            <div 
              className={`absolute left-[19px] top-4 w-0.5 transition-all duration-1000 ${isCancelled ? 'bg-red-600' : 'bg-[#2E7D32]'}`}
              style={{ height: `${((currentStepId - 1) / (TRACKING_STEPS.length - 1)) * 100}%` }}
            />

            <div className="space-y-8 relative">
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = step.id <= currentStepId;
                const isCurrent = step.id === currentStepId;
                const Icon = step.icon;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={step.id} 
                    className="flex gap-4 relative"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                      isCurrent && isCancelled ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-4 ring-red-50' :
                      isCurrent ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30 ring-4 ring-[#F0FAF0]' :
                      isCompleted ? (isCancelled ? 'bg-red-50 text-red-600' : 'bg-[#F0FAF0] text-[#2E7D32]') :
                      'bg-stone-50 border-2 border-stone-200 text-stone-400'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="pt-1 flex-1 pr-16 md:pr-0">
                      <p className={`text-sm md:text-base font-bold ${isCurrent ? (isCancelled ? 'text-red-700' : 'text-stone-900') : isCompleted ? 'text-stone-700' : 'text-stone-400'}`}>
                        {step.label}
                      </p>
                      <div className="flex flex-col mt-0.5">
                        <p className="text-xs font-semibold text-stone-500">{step.date}</p>
                        {isCompleted && step.location && (
                          <p className={`text-xs font-medium mt-1 flex items-start md:items-center gap-1 ${isCancelled ? 'text-red-400' : 'text-stone-400'}`}>
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 md:mt-0" /> <span className="break-words">{step.location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className={`absolute right-0 top-1 text-[10px] md:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${isCancelled ? 'text-red-600 bg-red-50' : 'text-[#2E7D32] bg-[#F0FAF0]'}`}>
                        Current
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;
