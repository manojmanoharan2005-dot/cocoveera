import React, { useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, MapPin, CheckCircle, Package, AlertCircle, RefreshCw, X, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import SEO from '../../components/SEO';
import { formatDateFriendly } from '../../utils/dateFormatter';

// Lazy loaded components
const PDFModal = React.lazy(() => import('../../components/common/PDFModal'));
const HistoryTimeline = React.lazy(() => import('../../components/common/HistoryTimeline'));

// Success Creation Modal
const SuccessModal = ({ isOpen, orderId, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center animate-slide-up space-y-6">
        <div className="w-16 h-16 bg-green-50 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle size={32} className="stroke-[2.5]" />
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

const renderShippingAddress = (address) => {
  if (!address || !address.addressLine1) return null;
  return (
    <div className="text-xs text-stone-600 space-y-0.5">
      <p className="font-bold text-stone-900">{address.addressLine1}</p>
      {address.addressLine2 && <p className="font-medium text-stone-700">{address.addressLine2}</p>}
      <p className="font-semibold">{address.city}, {address.state} - {address.postalCode}</p>
      <p className="font-black text-[#2E7D32] uppercase tracking-wider">{address.country}</p>
    </div>
  );
};

const QuoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();

  // Modals & Action loading
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorState, setErrorState] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const queryClient = useQueryClient();

  // React Query Fetch (Automatic cache, staleTime 5m, cacheTime 15m)
  const { data: quote, isLoading, error, refetch } = useQuery(
    ['quote', id],
    async () => {
      setErrorState('');
      const res = await apiClient.get(`/quotes/${id}`);
      return res.data.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      onError: (err) => {
        console.error('Failed to load quote details:', err);
        setErrorState(err.response?.data?.message || 'Failed to fetch quote details.');
      }
    }
  );

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
    const token = sessionStorage.getItem('cocoveera_token') || '';
    const base = apiClient.defaults.baseURL?.replace(/\/$/, '');
    window.open(`${base}/quotes/${quote._id}/view-pdf?token=${encodeURIComponent(token)}`, '_blank');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setErrorState('');
      setSuccessMsg('');
      const res = await apiClient.put(`/quotes/${id}/reject`, {
        rejectionReason: rejectReason.trim(),
      });
      if (res.data.success) {
        setRejectModalOpen(false);
        setSuccessMsg('Quotation rejected successfully.');
        refetch();
      }
    } catch (err) {
      console.error('Failed to reject quote:', err);
      setErrorState(err.response?.data?.message || 'Failed to reject quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptSubmit = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      setErrorState('');
      setSuccessMsg('');
      const res = await apiClient.put(`/quotes/${id}/accept`);
      if (res.data.success) {
        setAcceptModalOpen(false);
        setToastMessage('Quotation accepted successfully. Redirecting to Orders...');
        
        // Invalidate and refetch immediately
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['quotes']);
        queryClient.invalidateQueries(['dashboard']);
        queryClient.invalidateQueries(['customer']);

        // Update global profile/counts
        try {
          await fetchProfile();
        } catch (authErr) {
          console.error('Failed to fetch profile stats:', authErr);
        }

        // Wait 1 second and navigate
        setTimeout(() => {
          setToastMessage('');
          navigate('/orders');
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to accept quote:', err);
      setErrorState(err.response?.data?.message || 'Failed to accept quotation.');
      setAcceptModalOpen(false);
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
      setErrorState('');
      setSuccessMsg('');
      const res = await apiClient.post(`/quotes/${id}/revision`, {
        comment: revisionComment.trim(),
      });
      if (res.data.success) {
        setSuccessMsg('✅ Revision request submitted. Our team has been notified.');
        setRevisionModalOpen(false);
        setRevisionComment('');
        refetch();
      }
    } catch (err) {
      console.error('Failed to request revision:', err);
      setErrorState(err.response?.data?.message || 'Failed to submit revision request.');
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

  const queryError = errorState || (error ? (error.response?.data?.message || 'Failed to load quote details.') : '');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-stone-200 shadow-sm p-12 max-w-5xl mx-auto">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-[#2E7D32] rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 font-bold font-poppins">Loading quotation details...</p>
      </div>
    );
  }

  if (queryError && !quote) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 max-w-5xl mx-auto shadow-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider mb-1">Error Loading Quote</h4>
          <p className="text-sm font-semibold">{queryError}</p>
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

  const hasPdf = !!quote?.pdfUrl;
  const isApproved = quote?.status === 'Quote Approved';
  const token = sessionStorage.getItem('cocoveera_token');
  const pdfViewUrl = quote?._id 
    ? `${apiClient.defaults.baseURL}/quotes/${quote._id}/view-pdf?token=${token}` 
    : '';

  return (
    <div className="w-full space-y-6">
      <SEO title={`Quote details #${quote?.quoteNumber || ''} - Cocoveera`} />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[250] bg-[#1A1A1A] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-850"
          >
            <div className="w-5 h-5 rounded-full bg-[#2E7D32] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-poppins font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/quotes')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-poppins">Quotation #{quote?.quoteNumber}</h1>
          <p className="text-stone-500 font-semibold text-sm">Request Date: {quote?.rfq?.createdAt ? new Date(quote.rfq.createdAt).toLocaleString() : (quote?.createdAt ? new Date(quote.createdAt).toLocaleString() : 'N/A')}</p>
          {quote?.validUntil && quote?.status === 'Quote Approved' && (
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

      {errorState && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-bold shadow-sm">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorState}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quotation Status and Actions */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(quote?.status)}`}>
                {quote?.status}
              </span>
            </div>
            
            {/* Actions Panel */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {isApproved && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => setRejectModalOpen(true)}
                    className="flex-grow sm:flex-none px-4 py-2 bg-white hover:bg-stone-100 text-red-650 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Reject Quote
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => setAcceptModalOpen(true)}
                    className="flex-grow sm:flex-none px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow-md shadow-[#2E7D32]/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Accept Quote
                  </button>
                </>
              )}
              {['Quote Approved', 'Pending Review', 'RFQ Submitted'].includes(quote?.status) && (
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
          {quote.products && quote.products.length > 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
                Selected Products
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">
                      <th className="px-3 py-2">Product Name</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-center">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.products.map((item) => (
                      <tr key={item.product || item._id} className="border-b border-stone-100 last:border-b-0 text-stone-700 font-semibold">
                        <td className="px-3 py-2 font-bold text-stone-900">{item.productName}</td>
                        <td className="px-3 py-2 text-stone-500">{item.categoryName}</td>
                        <td className="px-3 py-2 text-right font-black text-stone-900">{(item.quantity || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-center text-stone-400 font-bold">Containers</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
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
                    {quote?.productDetails?.name || 'Coco Coir Export Substrate'}
                  </h4>
                  <p className="text-xs text-stone-500 font-bold mt-0.5">
                    Quantity: {quote?.productDetails?.quantity || 'N/A'} {quote?.productDetails?.unitType || 'Tons'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#2E7D32]">
                    {quote?.convertedAmount > 0
                      ? convertCurrency(quote?.originalInrAmount || 0, quote?.currency || user?.currency || 'USD').formatted
                      : 'Awaiting Pricing'}
                  </span>
                </div>
              </div>

              {/* Technical Specifications */}
              {quote?.productDetails?.specifications && (
                <div className="pt-2">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Technical Specifications</h4>
                  <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
                    <div>
                      <span className="text-stone-400 block font-bold">EC Target</span>
                      <span className="font-semibold text-stone-800">{quote?.productDetails?.specifications?.ec || 'Standard'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold">pH Target</span>
                      <span className="font-semibold text-stone-800">{quote?.productDetails?.specifications?.ph || 'Standard'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-bold">Moisture</span>
                      <span className="font-semibold text-stone-800">{quote?.productDetails?.specifications?.moisture || 'Standard'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Container Logistics details */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
              Container Logistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Container Size</p>
                <p className="text-sm font-bold text-stone-900">{quote?.containerDetails?.containerSize || '20 FT FCL'}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Number of Containers</p>
                <p className="text-sm font-bold text-stone-900">{quote?.containerDetails?.quantity || 1}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Expected Delivery</p>
                <p className="text-sm font-bold text-stone-900">{quote?.rfq?.expectedDeliveryDate ? formatDateFriendly(quote.rfq.expectedDeliveryDate) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Estimated Production Time</p>
                <p className="text-sm font-bold text-stone-900">{quote?.estimatedProductionTime || 'TBD'}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason display if rejected */}
          {quote?.status === 'Rejected by Customer' && quote?.rejectionReason && (
            <div className="bg-red-50 border border-red-150 rounded-2xl p-6 shadow-sm space-y-2">
              <h3 className="text-sm font-black text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={16} className="text-red-650" />
                Customer Rejection Comments
              </h3>
              <p className="text-xs font-semibold text-red-800 italic">"{quote?.rejectionReason}"</p>
            </div>
          )}

          {/* Revision Comments History */}
          {quote?.revisionRequests && quote?.revisionRequests.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
                Revision History
              </h3>
              
              <Suspense fallback={<div className="h-20 bg-stone-100 rounded-xl animate-pulse" />}>
                <HistoryTimeline 
                  type="revisions" 
                  data={quote?.revisionRequests || []} 
                />
              </Suspense>
            </div>
          )}

        </div>

        {/* Right Summaries Column */}
        <div className="space-y-6">
          
          {/* Documents Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
              Quotation Documents
            </h3>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-stone-200 shrink-0">
                  <FileText className="text-[#2E7D32] w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Official Quotation</h4>
                  <span className={`text-[10px] font-black uppercase mt-1 inline-block ${
                    hasPdf ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    Status: {hasPdf ? 'Available' : 'Pending'}
                  </span>
                </div>
              </div>
              {hasPdf && (
                <div className="flex gap-2">
                  <button
                    onClick={handleViewPDF}
                    className="p-2 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-250 transition cursor-pointer"
                    title="Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="p-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg transition cursor-pointer"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
              Commercial Summary
            </h3>
            
            <div className="space-y-3 text-sm font-semibold text-stone-600 mb-4">
              <div className="flex justify-between">
                <span>Shipping terms</span>
                <span className="text-stone-900 font-bold">{quote?.shippingTerms || 'FOB'}</span>
              </div>
              <div className="flex justify-between">
                <span>Currency</span>
                <span className="text-stone-900 font-bold">{quote?.currency || 'USD'}</span>
              </div>
              {quote?.exchangeRate && quote?.currency && quote?.currency !== 'INR' && (
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Exchange rate</span>
                  <span>1 {quote?.currency} = {Number(quote?.exchangeRate?.toFixed(2) || 0)} INR</span>
                </div>
              )}
            </div>

            <div className="border-t border-stone-100 pt-3 flex justify-between items-end">
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider mb-0.5">Grand Total</span>
              <span className="text-xl font-black text-[#2E7D32]">
                {quote?.convertedAmount > 0
                  ? convertCurrency(quote?.originalInrAmount || 0, quote?.currency || user?.currency || 'USD').formatted
                  : 'Pending'}
              </span>
            </div>
          </div>

          {/* Logistics Terms / Shipping Address details */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Shipping Destination</h3>
            </div>
            
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
              {quote?.shippingAddress && quote?.shippingAddress.addressLine1 ? (
                renderShippingAddress(quote?.shippingAddress)
              ) : quote?.rfq?.shippingAddress && quote?.rfq?.shippingAddress?.addressLine1 ? (
                renderShippingAddress(quote?.rfq?.shippingAddress)
              ) : (
                <div className="not-italic text-sm font-semibold text-stone-600 leading-relaxed">
                  {quote?.rfq?.country && (
                    <span className="block text-stone-900 font-bold mb-1">Target Country: {quote?.rfq?.country}</span>
                  )}
                  {quote?.rfq?.address && (
                    <p className="text-xs text-stone-500 mt-1">{quote?.rfq?.address}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Commercial Notes Card */}
          {quote?.commercialNotes && (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 shadow-sm">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Commercial Notes</h3>
              <p className="text-xs font-medium text-stone-700 leading-relaxed whitespace-pre-wrap">{quote?.commercialNotes}</p>
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
              <button onClick={() => setRevisionModalOpen(false)} className="text-stone-400 hover:text-stone-655 p-1 rounded-full">
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

      {/* REJECTION REASON MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-stone-900">Reject Quotation Proposal</h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-stone-400 hover:text-stone-655 p-1.5 rounded-full hover:bg-stone-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Provide an optional reason for rejecting quotation <strong>#{quote?.quoteNumber}</strong>:
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
                  className="flex-1 px-4 py-2.5 bg-red-650 hover:bg-red-755 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCEPT CONFIRMATION DIALOG */}
      {acceptModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-slide-up space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-extrabold text-stone-900">Accept Quotation Proposal</h3>
              <button onClick={() => setAcceptModalOpen(false)} className="text-stone-400 hover:text-stone-655 p-1.5 rounded-full hover:bg-stone-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quote details */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs font-semibold text-stone-600 space-y-2">
              <div className="flex justify-between">
                <span>Quote Reference</span>
                <span className="text-stone-900 font-bold">#{quote?.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Product Summary</span>
                <div className="text-right">
                  {quote?.products && quote?.products.length > 0 ? (
                    quote.products.map((p, idx) => (
                      <span key={idx} className="text-stone-900 font-bold block">{p.productName}</span>
                    ))
                  ) : (
                    <span className="text-stone-900 font-bold">{quote?.productDetails?.name || 'Coco Coir'}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-stone-200">
                <span className="font-extrabold text-stone-900">Total Price</span>
                <span className="font-black text-[#2E7D32]">
                  {quote?.convertedAmount > 0
                    ? convertCurrency(quote?.originalInrAmount || 0, quote?.currency || user?.currency || 'USD').formatted
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
                className="flex-1 px-4 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer border-none flex items-center justify-center min-h-[36px]"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Accept Quote'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal Viewer Container */}
      <Suspense fallback={null}>
        <PDFModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={pdfViewUrl}
          quoteNumber={quote?.quoteNumber || ''}
          title="Quotation Viewer"
        />
      </Suspense>

      {/* SUCCESS ORDER REDIRECT MODAL */}
      <SuccessModal
        isOpen={successModalOpen}
        orderId={successOrderId}
        onClose={() => setSuccessModalOpen(false)}
      />
    </div>
  );
};

export default QuoteDetails;
