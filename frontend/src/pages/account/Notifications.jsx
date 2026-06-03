/**
 * File: frontend/src/pages/account/Notifications.jsx
 * Purpose: React page component representing the Notifications view.
 */
import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { apiClient } from '../../context/AuthContext';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get('/notifications/me');
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? res.data.data : n));
      }
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this notification?')) return;
    try {
      const res = await apiClient.delete(`/notifications/${id}`);
      if (res.data.success) setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading notifications...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900">Notifications</h2>
          <p className="text-sm text-stone-500">Manage your order and account updates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center text-stone-500 font-bold">No notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n._id} className={`bg-white rounded-2xl p-5 border ${n.isRead ? 'border-stone-100' : 'border-[#2E7D32]'} shadow-sm flex justify-between items-start`}> 
              <div>
                <h3 className="text-sm font-bold text-stone-900">{n.title}</h3>
                <p className="text-xs text-stone-500 mt-1">{n.message}</p>
                <p className="text-[10px] text-stone-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {!n.isRead && (<button onClick={() => markRead(n._id)} className="text-xs text-[#2E7D32] font-bold">Mark read</button>)}
                <button onClick={() => remove(n._id)} className="text-xs text-red-500 font-bold flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" />Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
