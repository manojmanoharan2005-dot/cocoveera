import React from 'react';
import { convertCurrency } from '../../utils/currencyConverter';

const HistoryTimeline = ({ type, data, userCurrency = 'USD' }) => {
  if (!data || data.length === 0) return null;

  if (type === 'milestones') {
    return (
      <div className="space-y-6 relative border-l-2 border-stone-150 pl-6 my-2">
        {data.map((milestone, idx) => {
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
                      {convertCurrency(milestone.amount, milestone.currency || userCurrency || 'USD').formatted}
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
    );
  }

  if (type === 'revisions') {
    return (
      <div className="space-y-3.5">
        {data.map((rev, idx) => (
          <div key={idx} className="bg-stone-50 p-3.5 rounded-xl border border-stone-150 text-xs">
            <div className="flex justify-between font-bold text-stone-400 mb-1">
              <span>Revision #{idx + 1}</span>
              <span>{new Date(rev.requestedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-stone-700 italic font-semibold">"{rev.comment}"</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default HistoryTimeline;
