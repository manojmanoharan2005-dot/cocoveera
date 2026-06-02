import React from 'react';
import { FileText } from 'lucide-react';

export default function Invoices() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-8 h-8 text-[#2E7D32]" />
        <h1 className="text-2xl font-bold text-stone-900">Invoices & Receipts</h1>
      </div>
      <p className="text-stone-500">Your recent invoices will appear here. (Coming soon in Phase 2)</p>
    </div>
  );
}
