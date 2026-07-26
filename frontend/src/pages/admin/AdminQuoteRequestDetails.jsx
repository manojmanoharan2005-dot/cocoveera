/**
 * File: frontend/src/pages/admin/AdminQuoteRequestDetails.jsx
 * Purpose: Admin view to inspect full RFQ details, send formal quote approvals with PDF attachments, reject or request info, and track email timeline.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminQuoteRequestService } from '../../services/adminService';
import {
  ArrowLeft,
  Loader,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  Send,
  Upload,
  Clock,
  DollarSign,
  Ship,
  FileCheck,
  X
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminQuoteRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Approve Form State
  const [approveForm, setApproveForm] = useState({
    subject: '',
    emailBody: '',
    price: '',
    currency: 'USD',
    shippingTerms: 'FOB',
    validity: 15,
    deliveryDate: '',
    additionalNotes: '',
  });
  const [pdfFile, setPdfFile] = useState(null);

  // Reject Form State
  const [rejectReason, setRejectReason] = useState('');

  // Request Info Form State
  const [infoMessage, setInfoMessage] = useState('');

  const fetchRequestDetails = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await adminQuoteRequestService.getById(id);
      const data = response.data;
      setRequest(data);

      // Pre-fill approve form default values
      setApproveForm({
        subject: `Quote Request Approved - Cocoveera Export (Ref: #${data._id.slice(-6).toUpperCase()})`,
        emailBody: `Dear ${data.contactPerson},\n\nWe have reviewed your quotation request for ${data.product?.name || 'Coco Substrates'} (${data.containerSize}). Attached is our official pricing proposal.`,
        price: data.price || '',
        currency: data.currency || 'USD',
        shippingTerms: data.shippingTerms || 'FOB',
        validity: data.validity || 15,
        deliveryDate: data.deliveryDate || (data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : ''),
        additionalNotes: data.additionalNotes || '',
      });
    } catch (err) {
      setError('Failed to load quote request details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRequestDetails();
  }, [id]);

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveForm.price || isNaN(approveForm.price)) {
      setError('Please enter a valid estimated price.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await adminQuoteRequestService.approve(id, approveForm, pdfFile);
      setSuccessMsg('✅ Quote approved successfully. ✅ Email sent successfully.');
      setShowApproveModal(false);
      setPdfFile(null);
      await fetchRequestDetails();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to approve quote. Email dispatch failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await adminQuoteRequestService.reject(id, rejectReason);
      setSuccessMsg('Quote request rejected and notice sent to customer.');
      setShowRejectModal(false);
      setRejectReason('');
      await fetchRequestDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject quote.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!infoMessage) {
      setError('Please enter information requested message.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await adminQuoteRequestService.requestInfo(id, infoMessage);
      setSuccessMsg('Information request email sent to customer successfully.');
      setShowInfoModal(false);
      setInfoMessage('');
      await fetchRequestDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request information.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (window.confirm('Are you sure you want to delete this quote request?')) {
      try {
        await adminQuoteRequestService.delete(id);
        navigate('/admin/quote-requests');
      } catch (err) {
        setError('Failed to delete quote request');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/admin/quote-requests')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors mb-6 font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Requests
        </button>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : error && !request ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Details & Actions Bar */}
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-stone-200/60">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200">
                    Reference: #{request._id.slice(-6).toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      request.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : request.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : request.status === 'INFO_REQUESTED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : request.status === 'CUSTOMER_REPLIED'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Enquiry for {request.product?.name || 'Deleted Product'}</h1>
                <p className="text-gray-500 text-sm mt-1">Submitted on {new Date(request.createdAt).toLocaleString()}</p>
              </div>

              {/* ADMIN ACTIONS BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(true)}
                  className="bg-[#2E5E35] hover:bg-[#1F4625] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer border-none"
                >
                  <CheckCircle2 size={16} />
                  <span>Approve Quote</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer border-none"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer border-none"
                >
                  <HelpCircle size={16} />
                  <span>Request Info</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteRequest}
                  className="bg-stone-100 hover:bg-stone-200 text-red-600 px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer border border-stone-200"
                  title="Delete RFQ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Notification Messages */}
            {successMsg && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2.5 text-green-800 text-xs font-bold shadow-sm animate-fade-in">
                <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-800 text-xs font-bold shadow-sm animate-fade-in">
                <AlertCircle size={18} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* APPROVED PROPOSAL SUMMARY CARD (If Approved) */}
            {request.status === 'APPROVED' && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3 mb-4">
                  <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck size={18} className="text-emerald-700" />
                    Approved Quotation Record
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold">
                    Approved on: {request.approvedAt ? new Date(request.approvedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-emerald-700 font-bold block">Quotation Price</span>
                    <span className="text-emerald-950 font-black text-base">{request.currency} {request.price ? request.price.toLocaleString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold block">Shipping Terms</span>
                    <span className="text-emerald-950 font-bold text-sm">{request.shippingTerms || 'FOB'}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold block">Validity</span>
                    <span className="text-emerald-950 font-bold text-sm">{request.validity} Days</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-bold block">Email Status</span>
                    <span className="inline-block bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px] uppercase mt-0.5">
                      ✓ {request.emailStatus || 'delivered'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Specifications & Delivery Address */}
              <div className="md:col-span-2 space-y-6">
                           {/* Product Specification */}
                <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-stone-200/60">
                  {request.products && request.products.length > 0 ? (
                    <>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
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
                            {request.products.map((item) => (
                              <tr key={item.product || item._id} className="border-b border-stone-100 last:border-b-0 text-stone-700 font-semibold">
                                <td className="px-3 py-2 font-bold text-gray-900">{item.productName}</td>
                                <td className="px-3 py-2 text-gray-500">{item.categoryName}</td>
                                <td className="px-3 py-2 text-right font-black text-gray-900">{(item.quantity || 0).toFixed(2)}</td>
                                <td className="px-3 py-2 text-center text-gray-400 font-bold">Containers</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs border-t border-stone-100 pt-3">
                        <div>
                          <span className="text-gray-400 block font-bold">Container Size Requested</span>
                          <span className="inline-block bg-blue-50 text-blue-700 font-bold border border-blue-100 px-2 py-0.5 rounded mt-1 text-xs">
                            {request.containerSize}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Expected Delivery Date</span>
                          <span className="text-gray-900 font-semibold">
                            {request.expectedDeliveryDate ? new Date(request.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        RFQ Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block font-bold">Category</span>
                          <span className="text-gray-900 font-semibold text-sm">{request.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Container Size Requested</span>
                          <span className="inline-block bg-blue-50 text-blue-700 font-bold border border-blue-100 px-2 py-0.5 rounded mt-1 text-xs">
                            {request.containerSize}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Expected Delivery Date</span>
                          <span className="text-gray-900 font-semibold">
                            {request.expectedDeliveryDate ? new Date(request.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Requested Quantity</span>
                          <span className="text-gray-900 font-semibold">{request.quantity || 'N/A'}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2">
                    <span className="text-gray-400 block font-bold text-xs mb-1.5">Requirement Notes:</span>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-semibold leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {request.requirementNote}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-2xl shadow p-6 space-y-3 border border-stone-200/60">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-500" />
                    Delivery Address & Country
                  </h3>
                  <div className="text-xs text-gray-800 font-semibold leading-relaxed p-1 flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      {request.shippingAddress && request.shippingAddress.addressLine1 ? (
                        <div className="space-y-0.5 text-xs text-stone-750">
                          <p className="font-bold text-stone-900">{request.shippingAddress.addressLine1}</p>
                          {request.shippingAddress.addressLine2 && <p className="font-medium text-stone-600">{request.shippingAddress.addressLine2}</p>}
                          <p className="font-semibold">{request.shippingAddress.city}, {request.shippingAddress.state} - {request.shippingAddress.postalCode}</p>
                          <p className="font-black text-[#2E7D32] uppercase tracking-wider mt-1">{request.shippingAddress.country}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-extrabold text-sm">{request.country}</p>
                          <p className="text-gray-600 mt-1">{request.address || 'Standard CIF/FOB Destination Port'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* TIMELINE HISTORY AUDIT LOG */}
                <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-stone-200/60">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    RFQ Status History & Timeline
                  </h3>

                  {(!request.timeline || request.timeline.length === 0) ? (
                    <p className="text-xs text-gray-500 italic">No timeline entries logged yet.</p>
                  ) : (
                    <div className="relative border-l-2 border-stone-200 pl-4 space-y-4 my-2">
                      {request.timeline.map((event, idx) => (
                        <div key={idx} className="relative group">
                          {/* Dot */}
                          <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-[#2E5E35] border-2 border-white"></div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{event.title}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-600 mt-0.5">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Customer Profile */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-stone-200/60">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                    <User size={18} className="text-blue-500" />
                    Customer Profile
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block font-bold">Contact Person</span>
                        <span className="text-gray-900 font-semibold">{request.contactPerson}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block font-bold">Company Name</span>
                        <span className="text-gray-900 font-semibold">{request.companyName || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block font-bold">Email Address</span>
                        <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline font-semibold break-all">{request.email}</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block font-bold">Phone / WhatsApp</span>
                        <span className="text-gray-900 font-semibold">{request.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Globe size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-gray-400 block font-bold">Country</span>
                        <span className="text-gray-900 font-semibold">{request.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex gap-2">
                    <a
                      href={`https://wa.me/${request.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] text-white hover:bg-[#1ebd5a] font-poppins text-[10px] font-black py-2.5 rounded-lg text-center shadow-sm flex items-center justify-center gap-1.5"
                    >
                      WhatsApp Chat
                    </a>
                  </div>
                </div>

                {/* Email Target Info */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs font-medium space-y-1 text-stone-600">
                  <div className="font-bold text-stone-900">Email Routing Info:</div>
                  <div>Outbound: Brevo API</div>
                  <div>Reply-To Target: <strong className="text-stone-900">coirsystemadmin@gmail.com</strong></div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* APPROVE QUOTE MODAL */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-slide-up border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-[#2E5E35]" size={22} />
                  <h2 className="text-lg font-bold text-stone-900">Approve Quote & Send Quotation Email</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleApproveSubmit} className="space-y-4">
                
                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Email Subject (Pre-filled)
                  </label>
                  <input
                    type="text"
                    required
                    value={approveForm.subject}
                    onChange={(e) => setApproveForm({ ...approveForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Editable Email Message Body
                  </label>
                  <textarea
                    rows={4}
                    value={approveForm.emailBody}
                    onChange={(e) => setApproveForm({ ...approveForm, emailBody: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                  />
                </div>

                {/* Price, Currency, Validity Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                      Estimated Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 2450.00"
                      value={approveForm.price}
                      onChange={(e) => setApproveForm({ ...approveForm, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={approveForm.currency}
                      onChange={(e) => setApproveForm({ ...approveForm, currency: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                      Validity (Default 15 Days)
                    </label>
                    <input
                      type="number"
                      required
                      value={approveForm.validity}
                      onChange={(e) => setApproveForm({ ...approveForm, validity: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                    />
                  </div>
                </div>

                {/* Shipping Terms & Delivery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                      Shipping Terms
                    </label>
                    <select
                      value={approveForm.shippingTerms}
                      onChange={(e) => setApproveForm({ ...approveForm, shippingTerms: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                    >
                      <option value="FOB">FOB (Free On Board)</option>
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                      Expected Delivery Date / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Days from Order Confirmation"
                      value={approveForm.deliveryDate}
                      onChange={(e) => setApproveForm({ ...approveForm, deliveryDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Additional Commercial Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Price includes standard phytosanitary certification."
                    value={approveForm.additionalNotes}
                    onChange={(e) => setApproveForm({ ...approveForm, additionalNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20"
                  />
                </div>

                {/* PDF Quotation Attachment Upload */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Attachment Upload (Quotation PDF)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold cursor-pointer transition">
                      <Upload size={16} />
                      <span>{pdfFile ? pdfFile.name : 'Choose PDF File...'}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {pdfFile && (
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowApproveModal(false)}
                    className="px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-[#2E5E35] hover:bg-[#1F4625] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer border-none"
                  >
                    {actionLoading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span>Sending Approval Email...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Approval Email</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* REJECT QUOTE MODAL */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 animate-slide-up">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle size={22} />
                  <h2 className="text-lg font-bold text-stone-900">Reject Quote Request</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Rejection Reason / Note to Customer
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter reason for declining quote request..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {actionLoading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Send Rejection Notice</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REQUEST INFO MODAL */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 animate-slide-up">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <HelpCircle size={22} />
                  <h2 className="text-lg font-bold text-stone-900">Request Information</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                    Message to Customer (Specific details needed)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Please clarify required moisture percentage and target delivery port..."
                    value={infoMessage}
                    onChange={(e) => setInfoMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowInfoModal(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {actionLoading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Send Info Request Email</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
