import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Download, FileText, MessageSquare, X, Package, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import SEO from '../../components/SEO';

// Inline PDF Modal Viewer Component
const PDFModal = ({ isOpen, onClose, pdfUrl, quoteNumber }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-stone-200 overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-[#2E7D32] w-5 h-5" />
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                Quotation Viewer - #{quoteNumber}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Iframe */}
          <div className="flex-grow bg-stone-100 relative">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title={`Quote_${quoteNumber}`}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Success Creation Modal
const SuccessModal = ({ isOpen, orderId, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center animate-slide-up space-y-6">
        <div className="w-16 h-16 bg-green-50 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-poppins font-black text-stone-900 leading-tight">Quotation Accepted Successfully!</h3>
          <p className="text-sm text-stone-500 font-semibold leading-relaxed">
            Your export order has been successfully created. You can now proceed to the payment stage and view the timeline.
          </p>
        </div>
        
        <button
          onClick={() => {
            onClose();
            navigate(`/orders/${orderId}`);
          }}
          className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black py-3 rounded-xl shadow-md transition-colors cursor-pointer text-sm"
        >
          Go to My Orders
        </button>
      </div>
    </div>
  );
};

const Quotes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Management
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);

  // PDF Viewer Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState('');
  const [activeQuoteNum, setActiveQuoteNum] = useState('');

  // Rejection & Acceptance Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/quotes/myquotes', {
        params: {
          page: currentPage,
          limit,
          search: searchQuery,
          status: statusFilter,
          dateFilter,
        },
      });

      if (res.data.success) {
        setQuotes(res.data.data);
        setTotalPages(res.data.pagination.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load quotes:', err);
      setError(err.response?.data?.message || 'Failed to load your quotations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [currentPage, statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuotes();
  };

  const handleDownloadPDF = async (quoteId, quoteNumber) => {
    try {
      const res = await apiClient.get(`/quotes/${quoteId}/download-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quotation_${quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Could not download PDF file. Please verify with admin.');
    }
  };

  const handleViewPDF = (quoteId, quoteNumber) => {
    const token = sessionStorage.getItem('cocoveera_token');
    const viewUrl = `${apiClient.defaults.baseURL}/quotes/${quoteId}/view-pdf?token=${token}`;
    setActivePdfUrl(viewUrl);
    setActiveQuoteNum(quoteNumber);
    setPdfModalOpen(true);
  };

  const handleOpenRejectModal = (quote) => {
    setSelectedQuote(quote);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleOpenAcceptModal = (quote) => {
    setSelectedQuote(quote);
    setAcceptModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuote) return;

    try {
      setActionLoading(true);
      setError('');
      const res = await apiClient.put(`/quotes/${selectedQuote._id}/reject`, {
        rejectionReason: rejectReason.trim(),
      });
      if (res.data.success) {
        setRejectModalOpen(false);
        fetchQuotes();
      }
    } catch (err) {
      console.error('Failed to reject quote:', err);
      setError(err.response?.data?.message || 'Failed to reject quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptSubmit = async () => {
    if (!selectedQuote) return;

    try {
      setActionLoading(true);
      setError('');
      const res = await apiClient.put(`/quotes/${selectedQuote._id}/accept`);
      if (res.data.success) {
        setSuccessOrderId(res.data.orderId);
        setAcceptModalOpen(false);
        setSuccessModalOpen(true);
        fetchQuotes();
      }
    } catch (err) {
      console.error('Failed to accept quote:', err);
      setError(err.response?.data?.message || 'Failed to accept quotation.');
      setAcceptModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Quote Approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Quote Rejected':
      case 'Rejected by Customer':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Quote Expired':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'Quote Accepted':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Pending Review':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'RFQ Submitted':
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  const renderCardAddress = (address) => {
    if (!address || !address.addressLine1) return 'Standard FOB Destination Port';
    return `${address.addressLine1}, ${address.city}, ${address.country}`;
  };

  return (
    <div className="w-full space-y-6 pb-20">
      <SEO title="Your Quotations - Cocoveera" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2 font-poppins">My Quotes</h1>
          <p className="text-stone-500 font-semibold text-sm">View, track, and accept your export quotations.</p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-stone-300 rounded-lg py-2 px-4 text-sm font-bold text-stone-700 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="180">Past 6 Months</option>
            <option value="365">Past Year</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-stone-300 rounded-lg py-2 px-4 text-sm font-bold text-stone-700 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="RFQ Submitted">RFQ Submitted</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Quote Approved">Quote Approved</option>
            <option value="Quote Rejected">Quote Rejected</option>
            <option value="Quote Expired">Quote Expired</option>
            <option value="Quote Accepted">Quote Accepted</option>
            <option value="Rejected by Customer">Rejected by Customer</option>
          </select>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg py-2 pl-9 pr-4 text-sm font-medium text-stone-900 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-all"
            />
          </form>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white/90 backdrop-blur-md rounded-[24px] border border-stone-200 shadow-sm max-w-5xl mx-auto">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-[#2E7D32] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-700 font-bold font-poppins text-lg">Loading your quotes...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 max-w-5xl mx-auto shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider mb-1">API Error</h4>
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchQuotes}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs px-3 py-1.5 rounded-lg border border-red-200 transition"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : quotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-[24px] p-16 md:p-24 text-center border border-stone-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]"
        >
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100">
            <FileText className="w-10 h-10 text-[#2E7D32]" />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-900 mb-2 font-poppins">No quotations available.</h3>
          <p className="text-stone-500 font-semibold mb-6">
            {searchQuery || statusFilter || dateFilter !== 'all'
              ? "We couldn't find any quotes matching your query filters."
              : "You haven't requested any quotations yet."}
          </p>
          {(searchQuery || statusFilter || dateFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter(''); setDateFilter('all'); setCurrentPage(1); }}
              className="px-8 py-3.5 bg-white text-[#2E7D32] border border-[#2E7D32] font-bold rounded-xl hover:bg-stone-50 transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      ) : (
        /* Quotes Card List */
        <div className="space-y-6">
          {quotes.map((quote, idx) => {
            const hasPdf = !!quote.pdfUrl;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={quote._id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header (Flipkart/Amazon style) */}
                <div className="bg-[#F0F2F2] border-b border-stone-200 px-4 md:px-6 py-3.5 text-sm text-stone-600 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex flex-wrap gap-6 md:gap-12">
                    <div className="flex flex-col">
                      <span className="uppercase text-[9px] font-bold text-stone-400 tracking-wider mb-0.5">Quoted On</span>
                      <span className="font-bold text-stone-700">
                        {new Date(quote.quoteDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="uppercase text-[9px] font-bold text-stone-400 tracking-wider mb-0.5">Price Quoted</span>
                      <span className="font-black text-stone-900 text-sm sm:text-base">
                        {quote.convertedAmount > 0
                          ? convertCurrency(quote.originalInrAmount, quote.currency || user?.currency || 'USD').formatted
                          : 'Under Review'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="uppercase text-[9px] font-bold text-stone-400 tracking-wider mb-0.5">Ship To</span>
                      <span className="font-bold text-stone-700">{user?.name || 'Customer'}</span>
                    </div>

                    {quote.validUntil && quote.status === 'Quote Approved' && (
                      <div className="flex flex-col">
                        <span className="uppercase text-[9px] font-bold text-stone-400 tracking-wider mb-0.5">Valid Until</span>
                        <span className="font-bold text-red-600">
                          {new Date(quote.validUntil).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:items-end justify-center">
                    <span className="uppercase text-[9px] font-black text-stone-400 tracking-widest mb-0.5">Quote #{quote.quoteNumber}</span>
                    <div className="flex gap-2.5 text-[#007185] font-semibold mt-0.5 text-xs">
                      <span
                        className="hover:text-[#C45500] hover:underline cursor-pointer"
                        onClick={() => navigate(`/quotes/${quote._id}`)}
                      >
                        View Details
                      </span>
                      {hasPdf && (
                        <>
                          <span className="text-stone-300">|</span>
                          <span
                            className="hover:text-[#C45500] hover:underline cursor-pointer"
                            onClick={() => handleViewPDF(quote._id, quote.quoteNumber)}
                          >
                            View PDF
                          </span>
                          <span className="text-stone-300">|</span>
                          <span
                            className="hover:text-[#C45500] hover:underline cursor-pointer"
                            onClick={() => handleDownloadPDF(quote._id, quote.quoteNumber)}
                          >
                            Download PDF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-5">
                    {/* Icon container */}
                    <div className="w-16 h-16 bg-[#2E7D32]/5 rounded-xl border border-[#2E7D32]/10 flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7 text-[#2E7D32]" />
                    </div>
                    {/* Product Summary details */}
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClass(quote.status)}`}>
                        {quote.status}
                      </span>
                      <h4 className="text-base font-extrabold text-stone-800 mt-2">
                        {quote.productDetails?.name || 'Coco Coir Export Substrate'}
                      </h4>
                      <p className="text-xs text-stone-500 font-semibold mt-1">
                        Quantity: {quote.productDetails?.quantity || quote.containerDetails?.quantity || 'N/A'} {quote.productDetails?.unitType || 'Tons'} &bull; Container: {quote.containerDetails?.containerSize || '20 FT FCL'}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Shipping Destination: <strong className="text-stone-600">{renderCardAddress(quote.shippingAddress)}</strong></p>
                      {quote.shippingTerms && (
                        <p className="text-[11px] text-stone-400 mt-0.5">Shipping Terms: <strong className="text-stone-600">{quote.shippingTerms}</strong></p>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons column */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                    <button
                      onClick={() => navigate(`/quotes/${quote._id}`)}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white text-xs font-black rounded-xl border border-transparent shadow-sm hover:shadow-md transition-all cursor-pointer text-center w-full md:w-44 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    {hasPdf && (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleViewPDF(quote._id, quote.quoteNumber)}
                          className="flex-1 px-3 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" /> View PDF
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(quote._id, quote.quoteNumber)}
                          className="flex-1 px-3 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-500" /> Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approve actions bar at the bottom of the card */}
                {quote.status === 'Quote Approved' && (
                  <div className="bg-stone-50 border-t border-stone-100 px-6 py-3.5 flex justify-end gap-3">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleOpenRejectModal(quote)}
                      className="px-5 py-2 bg-white hover:bg-stone-100 text-red-650 border border-red-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Reject Quote
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleOpenAcceptModal(quote)}
                      className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Accept Quote
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border border-stone-300 rounded-lg bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-50 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-stone-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 border border-stone-300 rounded-lg bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-50 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-stone-900">Reject Quotation Proposal</h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-stone-400 hover:text-stone-650 p-1.5 rounded-full hover:bg-stone-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Provide an optional reason for rejecting quotation <strong>#{selectedQuote.quoteNumber}</strong>:
              </p>
              <textarea
                placeholder="Specify rejection reason (optional)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-24"
              />

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCEPT CONFIRMATION DIALOG */}
      {acceptModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-slide-up space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-extrabold text-stone-900">Accept Quotation Proposal</h3>
              <button onClick={() => setAcceptModalOpen(false)} className="text-stone-400 hover:text-stone-650 p-1.5 rounded-full hover:bg-stone-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quote details */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs font-semibold text-stone-600 space-y-2">
              <div className="flex justify-between">
                <span>Quote Reference</span>
                <span className="text-stone-900 font-bold">#{selectedQuote.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Product Summary</span>
                <span className="text-stone-900 font-bold">{selectedQuote.productDetails?.name || 'Coco Coir'}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-stone-200">
                <span className="font-extrabold text-stone-900">Total Price</span>
                <span className="font-black text-[#2E7D32]">
                  {selectedQuote.convertedAmount > 0
                    ? convertCurrency(selectedQuote.originalInrAmount, selectedQuote.currency || user?.currency || 'USD').formatted
                    : 'Awaiting Pricing'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 font-semibold leading-relaxed">
              "You are about to accept this quotation. Once accepted, your order will be created and you will proceed to the payment stage."
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAcceptModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptSubmit}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none"
              >
                Accept Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal Container */}
      <PDFModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={activePdfUrl}
        quoteNumber={activeQuoteNum}
      />

      {/* SUCCESS ORDER REDIRECT MODAL */}
      <SuccessModal
        isOpen={successModalOpen}
        orderId={successOrderId}
        onClose={() => setSuccessModalOpen(false)}
      />
    </div>
  );
};

export default Quotes;
