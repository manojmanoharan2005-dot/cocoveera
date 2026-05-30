import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Package, Anchor, Truck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../../context/AuthContext';

const STATUS_MAP = {
  'pending': 1,
  'confirmed': 2,
  'production': 3,
  'packed': 4,
  'loaded': 5,
  'shipped': 6,
  'delivered': 7,
  'cancelled': 1
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

  const currentStepId = STATUS_MAP[order.orderStatus] || 1;

  const TRACKING_STEPS = [
    { id: 1, label: 'Order Created', icon: Package, date: new Date(order.createdAt).toLocaleDateString() },
    { id: 2, label: 'Confirmed', icon: Check, date: currentStepId >= 2 ? 'Completed' : 'Pending' },
    { id: 3, label: 'Production', icon: Package, date: currentStepId >= 3 ? 'Completed' : 'Pending' },
    { id: 4, label: 'Packed', icon: Package, date: currentStepId >= 4 ? 'Completed' : 'Pending' },
    { id: 5, label: 'Loaded', icon: Truck, date: currentStepId >= 5 ? 'Completed' : 'Pending' },
    { id: 6, label: 'Shipped', icon: Anchor, date: currentStepId >= 6 ? 'Completed' : 'Pending' },
    { id: 7, label: 'Delivered', icon: MapPin, date: currentStepId >= 7 ? 'Completed' : 'Pending' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/account/orders')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Track Order {order._id}</h1>
          <p className="text-stone-500 font-semibold text-sm">Container: {order.trackingNumber || 'Pending'} ({order.containerCapacity || 'LCL'})</p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Status</p>
          <p className="text-xl font-black text-[#2E7D32]">{order.orderStatus.toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tracking Timeline */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-8">Shipment Status</h3>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[19px] top-4 bottom-8 w-0.5 bg-stone-100" />
            <div 
              className="absolute left-[19px] top-4 w-0.5 bg-[#2E7D32] transition-all duration-1000"
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
                      isCurrent ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/30 ring-4 ring-[#F0FAF0]' :
                      isCompleted ? 'bg-[#F0FAF0] text-[#2E7D32]' :
                      'bg-stone-50 border-2 border-stone-200 text-stone-400'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-bold ${isCurrent ? 'text-stone-900' : isCompleted ? 'text-stone-700' : 'text-stone-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] font-semibold text-stone-500 mt-0.5">{step.date}</p>
                    </div>
                    {isCurrent && (
                      <span className="absolute right-0 top-1 text-[10px] font-black uppercase tracking-wider text-[#2E7D32] bg-[#F0FAF0] px-2 py-0.5 rounded-md">
                        Current
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map & ETA */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-[400px] relative">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
              alt="Global Map Tracking" 
              className="w-full h-full object-cover opacity-60"
            />
            {/* Overlay Map UI */}
            <div className="absolute inset-0 bg-stone-900/10" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs font-black text-stone-900 uppercase tracking-wider">Live Vessel Location</p>
              </div>
              <p className="text-sm font-semibold text-stone-700 mb-1"><span className="font-bold text-stone-900">Vessel:</span> EVER GIVEN (IMO 9811000)</p>
              <p className="text-sm font-semibold text-stone-700"><span className="font-bold text-stone-900">Location:</span> Indian Ocean (Lat: 4.5, Lon: 78.2)</p>
            </div>
            
            {/* Visual Ship Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center z-10 relative border-2 border-[#2E7D32]">
                  <Anchor className="w-5 h-5 text-[#2E7D32]" />
                </div>
                <div className="absolute inset-0 bg-[#2E7D32] rounded-full animate-ping opacity-20" />
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Voyage Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Port of Loading</p>
                <p className="text-sm font-bold text-stone-900 mt-1">Chennai (INMAA)</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Port of Discharge</p>
                <p className="text-sm font-bold text-stone-900 mt-1">Los Angeles (USLAX)</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Shipping Line</p>
                <p className="text-sm font-bold text-stone-900 mt-1">Maersk Line</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Bill of Lading</p>
                <p className="text-sm font-bold text-stone-900 mt-1">{order.trackingNumber || 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackOrder;
