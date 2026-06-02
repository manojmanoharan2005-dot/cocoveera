import React, { useEffect, useState } from 'react';
import { apiClient } from '../../context/AuthContext';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiClient.get('/payments/admin');
        if (res.data.success) setPayments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const decide = async (id, action) => {
    try {
      const endpoint = `/payments/refund/${id}/${action}`;
      const res = await apiClient.patch(endpoint);
      if (res.data.success) {
        setPayments(prev => prev.map(p => p._id === id ? res.data.data : p));
      }
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold">Payments (Admin)</h1>
      {payments.length === 0 ? (
        <div className="bg-white p-6 rounded shadow-sm">No payments</div>
      ) : (
        payments.map(p => (
          <div key={p._id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
            <div>
              <div className="text-sm font-bold">{p.user?.name || (p.user && p.user.email) || 'Customer'}</div>
              <div className="text-xs text-stone-500">Amount: {p.amount} • Status: {p.status}</div>
              <div className="text-xs text-stone-400">Txn: {p.transactionId}</div>
            </div>
            <div className="flex gap-2">
              {p.status === 'refund_requested' && (
                <>
                  <button onClick={() => decide(p._id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                  <button onClick={() => decide(p._id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
