import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function Quotes() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="w-8 h-8 text-[#2E7D32]" />
        <h1 className="text-2xl font-bold text-stone-900">B2B Quotes</h1>
      </div>
      <p className="text-stone-500">Your requested quotes will appear here. (Coming soon in Phase 2)</p>
    </div>
  );
}
