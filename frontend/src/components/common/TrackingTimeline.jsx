import React from 'react';
import { Package, Check, Truck, Anchor, MapPin, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_MAP = {
  'pending': 1,
  'confirmed': 2,
  'packed': 3,
  'loaded': 4,
  'shipped': 5,
  'delivered': 6
};

const TrackingTimeline = ({ order }) => {
  if (!order) return null;

  const isCancelled = order.orderStatus === 'cancelled';
  const currentStepId = isCancelled ? 2 : (STATUS_MAP[order.orderStatus] || 1);

  const destCity = order.shippingAddress?.city || 'Destination';
  const destCountry = order.shippingAddress?.country || '';

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
  );
};

export default TrackingTimeline;
