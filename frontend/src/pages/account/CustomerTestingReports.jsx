import React from 'react';
import { FileText, FlaskConical, Clock } from 'lucide-react';

export default function CustomerTestingReports() {
  return (
    <div className="bg-white rounded-[24px] border border-stone-200/60 shadow-sm p-6 sm:p-8 min-h-[60vh] flex flex-col">
      {/* Top Header */}
      <div className="mb-6 border-b border-stone-100 pb-4">
        <h2 className="text-xl font-poppins font-black text-stone-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2E7D32]" />
          My Testing Reports
        </h2>
        <p className="text-sm font-semibold text-stone-500 mt-1">
          View and download your requested professional product quality tests.
        </p>
      </div>

      {/* Centered Minimal Coming Soon View */}
      <div className="my-auto py-16 px-4 text-center flex flex-col items-center justify-center bg-stone-50/70 rounded-2xl border border-stone-100/80">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
            <FlaskConical className="w-8 h-8 text-[#2E7D32]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-poppins font-black uppercase tracking-wider mb-3">
          <Clock className="w-3 h-3 text-amber-600" />
          Feature In Development
        </span>

        <h3 className="text-2xl font-poppins font-black text-stone-900 tracking-tight mb-2">
          Coming Soon
        </h3>
        
        <p className="text-sm font-semibold text-stone-500 max-w-md mx-auto leading-relaxed">
          Product Quality Testing & Batch Inspection reports will be available here soon.
        </p>
      </div>
    </div>
  );
}
