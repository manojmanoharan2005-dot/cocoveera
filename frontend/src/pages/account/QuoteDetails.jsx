import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, MessageSquare, MapPin, CheckCircle, Package, FileText, AlertCircle, RefreshCw, X } from 'lucide-react';
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
                Quotation Document - #{quoteNumber}
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

const QuoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Management
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get(`/quotes/${id}`);
      if (res.data.success) {
        setQuote(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load quote details:', err);
      setError(err.response?.data?.message || 'Failed to fetch quote details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuoteDetails();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!quote?._id) return;
    try {
      const res = await apiClient.get(`/quotes/${quote._id}/download-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quotation_${quote.quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Could not download PDF. Please try again later.');
    }
  };

  const handleViewPDF = () => {
    if (!quote?._id) return;
    const token = sessionStorage.getItem('cocoveera_token');
    const viewUrl = `${apiClient.defaults.baseURL}/quotes/${quote._id}/view-pdf?token=${token}`;
    setPdfModalOpen(true);
  };

  const handleAcceptQuote = async () => {
    if (!window.confirm('Are you sure you want to accept this quotation proposal?')) return;
    
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await apiClient.put(`/quotes/${id}/accept`);
      if (res.data.success) {
        setSuccessMsg('✅ Quotation accepted successfully. Ready for order processing.');
        fetchQuoteDetails();
      }
    } catch (err) {
      console.error('Failed to accept quote:', err);
      setError(err.response?.data?.message || 'Failed to accept quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevisionSubmit = async (e) => {
    e.preventDefault();
    if (!revisionComment.trim()) {
      alert('Please specify your comments.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await apiClient.post(`/quotes/${id}/revision`, {
        comment: revisionComment.trim(),
      });
      if (res.data.success) {
        setSuccessMsg('✅ Revision request submitted. Our team has been notified.');
        setRevisionModalOpen(false);
        setRevisionComment('');
        fetchQuoteDetails();
      }
    } catch (err) {
      console.error('Failed to request revision:', err);
      setError(err.response?.data?.message || 'Failed to submit revision request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Quote Approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Quote Rejected':
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-stone-200 shadow-sm p-12 max-w-5xl mx-auto">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-[#2E7D32] rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 font-bold font-poppins">Loading quotation details...</p>
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 max-w-5xl mx-auto shadow-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider mb-1">Error Loading Quote</h4>
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => navigate('/quotes')}
            className="mt-3 bg-white text-stone-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-stone-300 transition hover:bg-stone-50"
          >
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-12 text-center text-stone-500 font-bold max-w-5xl mx-auto">
        Quotation details not found.
      </div>
    );
  }

  const hasPdf = !!quote.pdfUrl;
  const isApproved = quote.status === 'Quote Approved';
  const token = sessionStorage.getItem('cocoveera_token');
  const pdfViewUrl = hasPdf ? `${apiClient.defaults.baseURL}/quotes/${quote._id}/view-pdf?token=${token}` : '';

  return (
    <div className="w-full space-y-6">
      <SEO title={`Quote details #${quote.quoteNumber} - Cocoveera`} />
      
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/quotes')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-poppins">Quotation #{quote.quoteNumber}</h1>
          <p className="text-stone-500 font-semibold text-sm">Submitted on {new Date(quote.quoteDate).toLocaleString()}</p>
          {quote.validUntil && quote.status === 'Quote Approved' && (
            <p className="text-red-600 font-bold text-xs mt-1">Valid Until: {new Date(quote.validUntil).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-green-800 text-xs font-bold shadow-sm">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-bold shadow-sm">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quotation Status and Actions */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(quote.status)}`}>
                {quote.status}
              </span>
            </div>
            
            {/* Actions Panel */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {isApproved && (
                <button
                  disabled={actionLoading}
                  onClick={handleAcceptQuote}
                  className="flex-grow sm:flex-none px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow-md shadow-[#2E7D32]/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Accept Quote
                </button>
              )}
              {['Quote Approved', 'Pending Review', 'RFQ Submitted'].includes(quote.status) && (
                <button
                  disabled={actionLoading}
                  onClick={() => setRevisionModalOpen(true)}
                  className="flex-grow sm:flex-none px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Request Revision
                </button>
              )}
              {hasPdf && (
                <>
                  <button
                    onClick={handleViewPDF}
                    className="flex-grow sm:flex-none px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" /> View PDF
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-grow sm:flex-none px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" /> Download PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Specifications Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
              Quoted Product Details
            </h3>
            
            <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-stone-200 shrink-0">
                <Package className="w-6 h-6 text-stone-400" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-extrabold text-stone-900">
                  {quote.productDetails?.name || 'Coco Coir Export Substrate'}
                </h4>
                <p className="text-xs text-stone-500 font-bold mt-0.5">
                  Quantity: {quote.productDetails?.quantity || 'N/A'} {quote.productDetails?.unitType || 'Tons'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#2E7D32]">
                  {quote.convertedAmount > 0
                    ? convertCurrency(quote.originalInrAmount, quote.currency || user?.currency || 'USD').formatted
                    : 'Awaiting Pricing'}
                </span>
              </div>
            </div>

            {/* Technical Specifications */}
            {quote.productDetails?.specifications && (
              <div className="pt-2">
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Technical Specifications</h4>
                <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400 block font-bold">EC Target</span>
                    <span className="font-semibold text-stone-800">{quote.productDetails.specifications.ec || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-bold">pH Target</span>
                    <span className="font-semibold text-stone-800">{quote.productDetails.specifications.ph || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-bold">Moisture</span>
                    <span className="font-semibold text-stone-800">{quote.productDetails.specifications.moisture || 'Standard'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Container Logistics details */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
              Container Logistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Container Size</p>
                <p className="text-sm font-bold text-stone-900">{quote.containerDetails?.containerSize || '20 FT FCL'}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Number of Containers</p>
                <p className="text-sm font-bold text-stone-900">{quote.containerDetails?.quantity || 1}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Estimated Production Time</p>
                <p className="text-sm font-bold text-stone-900">{quote.estimatedProductionTime || 'TBD'}</p>
              </div>
            </div>
          </div>

          {/* Revision Comments History */}
          {quote.revisionRequests && quote.revisionRequests.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
                Revision History
              </h3>
              <div className="space-y-3.5">
                {quote.revisionRequests.map((rev, idx) => (
                  <div key={idx} className="bg-stone-50 p-3.5 rounded-xl border border-stone-150 text-xs">
                    <div className="flex justify-between font-bold text-stone-400 mb-1">
                      <span>Revision #{idx + 1}</span>
                      <span>{new Date(rev.requestedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-stone-700 italic font-semibold">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Summaries Column */}
        <div className="space-y-6">
          
          {/* Price breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
              Commercial Summary
            </h3>
            
            <div className="space-y-3 text-sm font-semibold text-stone-600 mb-4">
              <div className="flex justify-between">
                <span>Shipping terms</span>
                <span className="text-stone-900 font-bold">{quote.shippingTerms || 'FOB'}</span>
              </div>
              <div className="flex justify-between">
                <span>Currency</span>
                <span className="text-stone-900 font-bold">{quote.currency || 'USD'}</span>
              </div>
              {quote.exchangeRate && quote.currency && quote.currency !== 'INR' && (
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Exchange rate</span>
                  <span>1 {quote.currency} = {Number(quote.exchangeRate.toFixed(2))} INR</span>
                </div>
              )}
            </div>

            <div className="border-t border-stone-100 pt-3 flex justify-between items-end">
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider mb-0.5">Grand Total</span>
              <span className="text-xl font-black text-[#2E7D32]">
                {quote.convertedAmount > 0
                  ? convertCurrency(quote.originalInrAmount, quote.currency || user?.currency || 'USD').formatted
                  : 'Pending'}
              </span>
            </div>
          </div>

          {/* Logistics Terms / Shipping Address details */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Destination Port / Country</h3>
            </div>
            
            <div className="not-italic text-sm font-semibold text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-100">
              {quote.rfq?.country && (
                <span className="block text-stone-900 font-bold mb-1">Target Country: {quote.rfq.country}</span>
              )}
              {quote.rfq?.address && (
                <p className="text-xs text-stone-500 mt-1">{quote.rfq.address}</p>
              )}
            </div>
          </div>

          {/* Commercial Notes Card */}
          {quote.commercialNotes && (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 shadow-sm">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Commercial Notes</h3>
              <p className="text-xs font-medium text-stone-700 leading-relaxed whitespace-pre-wrap">{quote.commercialNotes}</p>
            </div>
          )}

        </div>

      </div>

      {/* REVISION COMMENTS MODAL */}
      {revisionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[210] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-stone-900">Request Revision</h2>
              <button onClick={() => setRevisionModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRevisionSubmit} className="space-y-4">
              <p className="text-xs text-stone-500">Provide details on what you would like to be modified (pricing, terms, specifications):</p>
              <textarea
                placeholder="Enter revision comments..."
                value={revisionComment}
                onChange={(e) => setRevisionComment(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl p-3.5 text-xs font-medium text-stone-900 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-all resize-none h-28"
                required
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Modal Viewer Container */}
      <PDFModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={pdfViewUrl}
        quoteNumber={quote.quoteNumber}
      />
    </div>
  );
};

export default QuoteDetails;
