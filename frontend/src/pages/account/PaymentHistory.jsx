/**
 * File: frontend/src/pages/account/PaymentHistory.jsx
 * Purpose: React page component representing the PaymentHistory view.
 */
import React, { useEffect, useState } from 'react';
import { apiClient } from '../../context/AuthContext';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiClient.get('/payments/history');
        if (res.data.success) setPayments(res.data.data);
      } catch (err) {
        console.error('Failed to fetch payments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const requestRefund = async (paymentId) => {
    if (!confirm('Request refund for this payment?')) return;
    try {
      setRequesting(paymentId);
      const res = await apiClient.post('/payments/refund', { paymentId, reason: 'Customer requested refund via UI' });
      if (res.data.success) {
        setPayments(prev => prev.map(p => p._id === paymentId ? res.data.data : p));
        alert('Refund requested');
      }
    } catch (err) {
      console.error('Refund request failed', err);
      alert('Refund request failed');
    } finally {
      setRequesting(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading payments...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-stone-900">Payment History</h1>
      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center text-stone-500 font-bold">No payments found</div>
      ) : (
        <div className="space-y-4">
          {payments.map(p => (
            <div key={p._id} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">{p.method.toUpperCase()} • {p.status}</h3>
                <p className="text-xs text-stone-500 mt-1">Amount: {p.amount}</p>
                <p className="text-[10px] text-stone-400 mt-1">Date: {new Date(p.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {p.status === 'completed' && <button onClick={() => requestRefund(p._id)} disabled={requesting === p._id} className="text-xs font-bold text-[#2E7D32]">{requesting===p._id ? 'Requesting...' : 'Request Refund'}</button>}
                {p.status === 'refund_requested' && <span className="text-xs font-bold text-yellow-600">Refund Requested</span>}
                {p.status === 'refunded' && <span className="text-xs font-bold text-green-600">Refunded</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
