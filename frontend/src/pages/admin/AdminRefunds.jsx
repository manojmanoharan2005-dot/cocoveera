/**
 * File: frontend/src/pages/admin/AdminRefunds.jsx
 * Purpose: Standalone Refund Management module for B2B Admin.
 * Includes: Status filters, search, pagination, detail modal, approve/reject actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, Search, DollarSign,
  Clock, AlertCircle, Filter, ChevronLeft, ChevronRight,
  Eye, Calendar, User, CreditCard, FileText, X, Loader2,
  ArrowUpDown, Hash, BadgeCheck, ShieldAlert, Ban, CircleDotDashed
} from 'lucide-react';
import { apiClient } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';

const STATUS_TABS = [
  { key: '', label: 'All', icon: RefreshCw, color: 'text-gray-500', bg: 'bg-gray-100' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'requested', label: 'Requested', icon: CircleDotDashed, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'failed', label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  requested: 'bg-blue-100 text-blue-700 border-blue-200',
  pending_validation: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Detail Modal
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resRefunds, resAnalytics] = await Promise.all([
        apiClient.get('/refunds'),
        apiClient.get('/refunds/analytics'),
      ]);
      setRefunds(resRefunds.data.data || []);
      setTotal((resRefunds.data.data || []).length);
      setAnalytics(resAnalytics.data.data);
    } catch (err) {
      setError('Failed to load refund data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/refunds/${id}/approve`);
      await fetchData();
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving refund');
    } finally {
      setActionLoading('');
      setConfirmModal({ open: false, type: '', id: '' });
    }
  };

  // Derived filtered & paginated data
  const filteredRefunds = refunds.filter(r => {
    const matchSearch =
      !searchTerm ||
      r._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gatewayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !activeStatus || r.status === activeStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    let aVal = a[sortBy], bVal = b[sortBy];
    if (sortBy === 'amount') { aVal = Number(aVal); bVal = Number(bVal); }
    if (sortBy === 'createdAt') { aVal = new Date(aVal); bVal = new Date(bVal); }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredRefunds.length / pageSize);
  const pagedRefunds = filteredRefunds.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
    setPage(1);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtAmt = (amt, currency = 'INR') => {
    if (!amt) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amt);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Refund Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review, approve, and track all customer refund requests
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X size={16} /></button>
          </div>
        )}

        {/* ── Analytics Summary Cards ── */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Refunds', value: analytics.total ?? refunds.length, icon: Hash, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
              { label: 'Pending', value: refunds.filter(r => r.status === 'pending' || r.status === 'requested').length, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
              { label: 'Completed', value: analytics.completed ?? refunds.filter(r => r.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              { label: 'Success Rate', value: analytics.successRate ? `${analytics.successRate}%` : '—', icon: BadgeCheck, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            ].map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-3`}>
                <div className={`w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center border ${border}`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">{label}</p>
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Status Tabs ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 [&::-webkit-scrollbar]:hidden">
            {STATUS_TABS.map(({ key, label, icon: Icon, color }) => {
              const count = key ? refunds.filter(r => r.status === key).length : refunds.length;
              return (
                <button
                  key={key}
                  onClick={() => { setActiveStatus(key); setPage(1); }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-[12px] font-extrabold whitespace-nowrap transition border-b-2 ${
                    activeStatus === key
                      ? `border-[#2E7D32] ${color} bg-[#F0FAF0]`
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  } cursor-pointer`}
                >
                  <Icon size={13} />
                  {label}
                  <span className={`ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeStatus === key ? 'bg-[#2E7D32] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Search & Filter Bar ── */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50/60 border-b border-gray-100">
            <div className="relative flex-grow">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, customer, email, gateway, payment reference..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/30 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold whitespace-nowrap">Per page:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-gray-200 rounded-lg text-xs font-bold px-2 py-2 focus:outline-none bg-white cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm font-bold">Loading refunds...</span>
              </div>
            ) : pagedRefunds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                <RefreshCw size={32} className="opacity-30" />
                <p className="text-sm font-bold">No refunds found</p>
                <p className="text-xs">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      { label: 'Refund ID', field: '_id' },
                      { label: 'Customer', field: 'user' },
                      { label: 'Gateway', field: 'gatewayName' },
                      { label: 'Amount', field: 'amount', sortable: true },
                      { label: 'Reason', field: 'reason' },
                      { label: 'Status', field: 'status' },
                      { label: 'Date', field: 'createdAt', sortable: true },
                      { label: 'Actions', field: null },
                    ].map(({ label, field, sortable }) => (
                      <th
                        key={label}
                        onClick={sortable && field ? () => toggleSort(field) : undefined}
                        className={`px-4 py-3 text-[11px] font-black text-gray-500 uppercase tracking-wide whitespace-nowrap ${sortable ? 'cursor-pointer hover:text-gray-800 select-none' : ''}`}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortable && <ArrowUpDown size={11} className="opacity-50" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pagedRefunds.map(refund => (
                    <tr key={refund._id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Refund ID */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          #{refund._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] text-[10px] font-black flex items-center justify-center shrink-0">
                            {refund.user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-gray-900 truncate max-w-[140px]">{refund.user?.name || '—'}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{refund.user?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      {/* Gateway */}
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          {refund.gatewayName || '—'}
                        </span>
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-black text-[#2E7D32]">
                          {fmtAmt(refund.amount)}
                        </span>
                      </td>
                      {/* Reason */}
                      <td className="px-4 py-3.5 max-w-[160px]">
                        <p className="text-[11px] text-gray-500 truncate" title={refund.reason}>
                          {refund.reason || '—'}
                        </p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[refund.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {refund.status?.replace('_', ' ') || '—'}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] text-gray-500 font-medium">{fmtDate(refund.createdAt)}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedRefund(refund); setModalOpen(true); }}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#2E7D32]/10 text-gray-500 hover:text-[#2E7D32] flex items-center justify-center transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </button>
                          {(refund.status === 'requested' || refund.status === 'pending' || refund.status === 'pending_validation') && (
                            <button
                              onClick={() => setConfirmModal({ open: true, type: 'approve', id: refund._id })}
                              disabled={actionLoading === refund._id}
                              className="flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
                              title="Approve Refund"
                            >
                              {actionLoading === refund._id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-bold text-gray-500">
                Showing <span className="text-gray-800">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredRefunds.length)}</span> of <span className="text-gray-800">{filteredRefunds.length}</span> refunds
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        page === pageNum
                          ? 'bg-[#2E7D32] text-white shadow-md'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ Refund Detail Modal ══ */}
      {modalOpen && selectedRefund && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-900">Refund Details</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">#{selectedRefund._id}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-[12px] font-extrabold px-3 py-1.5 rounded-full border capitalize ${STATUS_BADGE[selectedRefund.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {selectedRefund.status?.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400 font-medium">{fmtDate(selectedRefund.createdAt)}</span>
              </div>

              {/* Amount */}
              <div className="bg-[#F0FAF0] border border-[#2E7D32]/20 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-gray-500 mb-1">Refund Amount</p>
                <p className="text-3xl font-black text-[#2E7D32]">{fmtAmt(selectedRefund.amount)}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Customer Name', value: selectedRefund.user?.name, icon: User },
                  { label: 'Customer Email', value: selectedRefund.user?.email, icon: FileText },
                  { label: 'Gateway', value: selectedRefund.gatewayName?.toUpperCase(), icon: CreditCard },
                  { label: 'Payment Reference', value: selectedRefund.paymentReference || selectedRefund.gatewayRefundId || '—', icon: Hash },
                  { label: 'Refund Date', value: fmtDate(selectedRefund.createdAt), icon: Calendar },
                  { label: 'Processed Date', value: fmtDate(selectedRefund.processedAt), icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={11} className="text-gray-400" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                    </div>
                    <p className="text-[12px] font-bold text-gray-800 truncate">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Reason */}
              {selectedRefund.reason && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1.5">Refund Reason</p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{selectedRefund.reason}</p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRefund.adminNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide mb-1.5">Admin Notes</p>
                  <p className="text-sm text-amber-800 font-medium leading-relaxed">{selectedRefund.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              {(selectedRefund.status === 'requested' || selectedRefund.status === 'pending' || selectedRefund.status === 'pending_validation') && (
                <button
                  onClick={() => setConfirmModal({ open: true, type: 'approve', id: selectedRefund._id })}
                  disabled={actionLoading === selectedRefund._id}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {actionLoading === selectedRefund._id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  Approve Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ Confirmation Modal ══ */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Confirm Approval</h3>
              <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">
                Are you sure you want to approve this refund? This action will trigger the payment gateway and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, type: '', id: '' })}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(confirmModal.id)}
                disabled={!!actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRefunds;
