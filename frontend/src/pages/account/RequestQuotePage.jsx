/**
 * File: frontend/src/pages/account/RequestQuotePage.jsx
 * Purpose: Dedicated authenticated Customer Dashboard page for submitting B2B Request Quotes (RFQs).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  FileText,
  Package,
  Ship,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  ArrowLeft,
  Info,
  Building,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Anchor
} from 'lucide-react';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, useAuth } from '../../context/AuthContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import SEO from '../../components/SEO';

const SHIPPING_TERMS_OPTIONS = [
  { value: 'FOB', label: 'FOB (Free On Board)', description: 'Seller delivers goods on board the vessel at origin port' },
  { value: 'CIF', label: 'CIF (Cost, Insurance & Freight)', description: 'Seller pays cost, insurance & freight to destination port' },
  { value: 'CFR', label: 'CFR (Cost & Freight)', description: 'Seller pays freight to destination port' },
  { value: 'EXW', label: 'EXW (Ex Works)', description: 'Buyer assumes all transport costs and responsibilities' },
  { value: 'DDP', label: 'DDP (Delivered Duty Paid)', description: 'Seller delivers goods cleared for import at destination' },
];

export const RequestQuotePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, fetchProfile } = useAuth();

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [product, setProduct] = useState(null);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqSubmitLoading, setRfqSubmitLoading] = useState(false);
  const [rfqError, setRfqError] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Form State
  const [rfqFormData, setRfqFormData] = useState({
    quantity: 1,
    containerSize: '20 FT',
    shippingTerms: 'FOB',
    preferredPort: '',
    requirementNote: '',
    expectedDeliveryDate: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [rfqValidationErrors, setRfqValidationErrors] = useState({});

  // 1. Load pending RFQ state or product details on mount
  useEffect(() => {
    let pendingData = null;
    try {
      const stored = sessionStorage.getItem('pendingRFQ');
      if (stored) {
        pendingData = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse pendingRFQ from sessionStorage:', e);
    }

    const stateData = location.state;
    const urlProductId = searchParams.get('productId');
    const urlQuantity = searchParams.get('quantity');
    const urlContainerType = searchParams.get('containerType');

    const targetProductId = urlProductId || stateData?.productId || pendingData?.productId;
    const initialQty = urlQuantity ? parseFloat(urlQuantity) : (stateData?.quantity || pendingData?.quantity || 1);
    const initialContainer = urlContainerType || stateData?.containerType || pendingData?.containerType || '20FT';

    setRfqFormData(prev => ({
      ...prev,
      quantity: initialQty > 0 ? initialQty : 1,
      containerSize: initialContainer.includes('40') ? '40 FT' : '20 FT',
    }));

    if (targetProductId) {
      fetchProductDetails(targetProductId, pendingData?.product || stateData?.product);
    } else {
      // Fetch latest featured coir product if no specific product was selected
      fetchDefaultProduct();
    }
  }, [searchParams, location.state]);

  // Load User profile default shipping details
  useEffect(() => {
    if (user) {
      const addr = user.defaultShippingAddress || {};
      setRfqFormData(prev => ({
        ...prev,
        companyName: user.companyName && user.companyName !== 'N/A' ? user.companyName : prev.companyName,
        contactPerson: user.name || prev.contactPerson,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        country: addr.country || user.country || prev.country || '',
        addressLine1: addr.addressLine1 || prev.addressLine1 || '',
        addressLine2: addr.addressLine2 || prev.addressLine2 || '',
        city: addr.city || prev.city || '',
        state: addr.state || prev.state || '',
        postalCode: addr.postalCode || prev.postalCode || '',
      }));
    }
  }, [user]);

  const fetchProductDetails = async (productId, fallbackProductObj) => {
    setLoadingProduct(true);
    try {
      if (fallbackProductObj && fallbackProductObj._id === productId) {
        setProduct(fallbackProductObj);
        setLoadingProduct(false);
        return;
      }
      const res = await apiClient.get(`/products/${productId}`);
      if (res.data && res.data.data) {
        setProduct(res.data.data);
      } else if (res.data) {
        setProduct(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch product for RFQ:', err);
      if (fallbackProductObj) {
        setProduct(fallbackProductObj);
      }
    } finally {
      setLoadingProduct(false);
    }
  };

  const fetchDefaultProduct = async () => {
    setLoadingProduct(true);
    try {
      const res = await apiClient.get('/products');
      const list = res.data?.data || res.data || [];
      if (list.length > 0) {
        setProduct(list[0]);
      }
    } catch (err) {
      console.error('Failed to load default product:', err);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRfqFormData(prev => ({ ...prev, [name]: value }));
    if (rfqValidationErrors[name]) {
      setRfqValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Store file info for attachment specifications
    const fileList = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    }));
    setAttachments(prev => [...prev, ...fileList]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateRfqForm = () => {
    const errors = {};
    if (!rfqFormData.quantity || rfqFormData.quantity <= 0) {
      errors.quantity = 'Required quantity must be at least 1 container/unit';
    }
    if (!rfqFormData.requirementNote.trim()) {
      errors.requirementNote = 'Requirement notes / specifications are required';
    } else if (rfqFormData.requirementNote.length > 2000) {
      errors.requirementNote = 'Notes cannot exceed 2000 characters';
    }
    if (!rfqFormData.contactPerson.trim()) {
      errors.contactPerson = 'Contact person name is required';
    }
    if (!rfqFormData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rfqFormData.email)) {
      errors.email = 'A valid email format is required';
    }
    if (!rfqFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!rfqFormData.addressLine1.trim()) {
      errors.addressLine1 = 'Address Line 1 is required';
    }
    if (!rfqFormData.city.trim()) {
      errors.city = 'City is required';
    }
    if (!rfqFormData.state.trim()) {
      errors.state = 'State / Province is required';
    }
    if (!rfqFormData.postalCode.trim()) {
      errors.postalCode = 'Postal / ZIP Code is required';
    }
    if (!rfqFormData.country.trim()) {
      errors.country = 'Destination country is required';
    }
    if (!rfqFormData.expectedDeliveryDate) {
      errors.expectedDeliveryDate = 'Expected delivery date is required';
    } else {
      const selectedDate = new Date(rfqFormData.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(selectedDate.getTime()) || selectedDate < today) {
        errors.expectedDeliveryDate = 'Expected delivery date must be in the future';
      }
    }

    setRfqValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRfqSubmit = async (e) => {
    e.preventDefault();
    if (!validateRfqForm() || rfqSubmitLoading) return;

    if (!product) {
      setRfqError('No product selected for quote request.');
      return;
    }

    setRfqSubmitLoading(true);
    setRfqError('');

    try {
      const payload = {
        category: product.category || 'Coco Substrates',
        product: product._id,
        products: [
          {
            product: product._id,
            productName: product.name,
            categoryName: product.category || 'Coco Substrates',
            quantity: Number(rfqFormData.quantity) || 1
          }
        ],
        containerSize: rfqFormData.containerSize,
        containerType: rfqFormData.containerSize === '40 FT' ? '40FT' : '20FT',
        quantity: `${rfqFormData.quantity} Container(s)`,
        shippingTerms: rfqFormData.shippingTerms,
        preferredPort: rfqFormData.preferredPort,
        requirementNote: rfqFormData.requirementNote,
        companyName: rfqFormData.companyName,
        contactPerson: rfqFormData.contactPerson,
        email: rfqFormData.email,
        phone: rfqFormData.phone,
        country: rfqFormData.country,
        shippingAddress: {
          addressLine1: rfqFormData.addressLine1.trim(),
          addressLine2: rfqFormData.addressLine2.trim(),
          city: rfqFormData.city.trim(),
          state: rfqFormData.state.trim(),
          postalCode: rfqFormData.postalCode.trim(),
          country: rfqFormData.country.trim(),
        },
        expectedDeliveryDate: rfqFormData.expectedDeliveryDate,
        attachments: attachments.map(a => a.name)
      };

      const res = await apiClient.post('/quote-requests', payload);

      if (res.data.success) {
        // Clear pending RFQ from session storage
        sessionStorage.removeItem('pendingRFQ');
        
        setRfqSubmitted(true);
        queryClient.invalidateQueries(['quotes']);

        try {
          if (fetchProfile) await fetchProfile();
        } catch (syncErr) {
          console.error('Failed to sync profile after RFQ:', syncErr);
        }

        setTimeout(() => {
          navigate('/quotes');
        }, 1800);
      }
    } catch (err) {
      console.error('RFQ Submission error:', err);
      setRfqError(
        err.response?.data?.message || 'Failed to submit quote request. Please try again.'
      );
    } finally {
      setRfqSubmitLoading(false);
    }
  };

  const productSku = product?._id ? `CV-${product._id.slice(-6).toUpperCase()}` : 'CV-EXPORT-001';

  return (
    <div className="w-full min-h-screen bg-stone-50/50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <SEO title="Request Quote (RFQ) | Cocoveera Dashboard" description="Submit enterprise B2B Request for Quote" />
      
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-[#2E7D32]">Request Quote (RFQ)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-poppins font-black text-stone-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-[#2E7D32]" />
              Enterprise B2B Request for Quote
            </h1>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-extrabold text-stone-600 hover:text-[#2E7D32] bg-white border border-stone-200 hover:border-[#2E7D32]/40 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </button>
        </div>

        {rfqSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-lg space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl font-poppins font-black text-stone-900">RFQ Submitted Successfully!</h2>
              <p className="text-sm font-semibold text-stone-600 leading-relaxed">
                Thank you for submitting your Request for Quote. Our export desk has received your specifications and will issue a formal Proforma / Quotation shortly.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" /> Redirecting to My Quotes...
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Product Summary Card */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="text-xs font-poppins font-black uppercase tracking-wider text-stone-400">Selected Product</span>
                  <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-md">B2B Export</span>
                </div>

                {loadingProduct ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-stone-200 border-t-[#2E7D32] rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-stone-400 font-bold">Loading product details...</p>
                  </div>
                ) : product ? (
                  <div className="space-y-4">
                    <div className="w-full h-48 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 flex items-center justify-center p-3 relative group">
                      <ImageWithFallback
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider block">
                        {product.category || 'Coco Substrates'}
                      </span>
                      <h2 className="text-lg font-poppins font-extrabold text-stone-900 leading-snug mt-0.5">
                        {product.name}
                      </h2>
                    </div>

                    <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-100/80 space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600 font-semibold">
                        <span className="text-stone-400">SKU / Item Code:</span>
                        <span className="font-mono font-bold text-stone-800">{productSku}</span>
                      </div>
                      {product.packageSize && (
                        <div className="flex justify-between text-stone-600 font-semibold">
                          <span className="text-stone-400">Packaging:</span>
                          <span className="font-bold text-stone-800">{product.packageSize}</span>
                        </div>
                      )}
                      {product.specifications?.ph && (
                        <div className="flex justify-between text-stone-600 font-semibold">
                          <span className="text-stone-400">pH Level:</span>
                          <span className="font-bold text-stone-800">{product.specifications.ph}</span>
                        </div>
                      )}
                      {product.specifications?.ec && (
                        <div className="flex justify-between text-stone-600 font-semibold">
                          <span className="text-stone-400">EC Value:</span>
                          <span className="font-bold text-stone-800">{product.specifications.ec}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-stone-400 font-bold">
                    No product selected. Select a product from marketplace.
                  </div>
                )}

                <div className="p-4 bg-[#F7F9F7] rounded-2xl border border-[#2E7D32]/10 space-y-2 text-xs text-stone-600 font-semibold">
                  <div className="flex items-center gap-2 text-[#2E7D32] font-extrabold">
                    <ShieldCheck className="w-4 h-4" /> Direct Manufacturer Guarantee
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-500">
                    Your request goes directly to Cocoveera's export desk. You will receive customized container pricing, shipping lead times, and lab COA documents.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Enterprise RFQ Form */}
            <div className="lg:col-span-8">
              <form onSubmit={handleRfqSubmit} className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-8">
                
                {rfqError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{rfqError}</span>
                  </div>
                )}

                {/* SECTION 1: Container & Shipping Specifications */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                    <Package className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="font-poppins font-extrabold text-base text-stone-900">
                      1. Container Load & Transport Specifications
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Container Size */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">Container Size</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['20 FT', '40 FT'].map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setRfqFormData(prev => ({ ...prev, containerSize: size }))}
                            className={`py-3 px-4 text-xs font-black rounded-xl border transition-all flex items-center justify-center gap-2 ${
                              rfqFormData.containerSize === size
                                ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <Ship className="w-4 h-4" />
                            {size} Container
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Required Quantity */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Required Quantity (Containers) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="0.25"
                        step="0.25"
                        value={rfqFormData.quantity}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.quantity ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="e.g. 1"
                      />
                      {rfqValidationErrors.quantity && (
                        <p className="text-[11px] font-bold text-red-500">{rfqValidationErrors.quantity}</p>
                      )}
                    </div>

                    {/* Shipping Terms */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">Shipping Terms (Incoterms)</label>
                      <select
                        name="shippingTerms"
                        value={rfqFormData.shippingTerms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition"
                      >
                        {SHIPPING_TERMS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Port of Discharge */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">Preferred Port of Discharge</label>
                      <div className="relative">
                        <Anchor className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          name="preferredPort"
                          value={rfqFormData.preferredPort}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition"
                          placeholder="e.g. Port of Rotterdam, Hamburg, Jebel Ali"
                        />
                      </div>
                    </div>

                    {/* Expected Delivery Date */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Target / Expected Delivery Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <input
                          type="date"
                          name="expectedDeliveryDate"
                          min={new Date().toISOString().split('T')[0]}
                          value={rfqFormData.expectedDeliveryDate}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                            rfqValidationErrors.expectedDeliveryDate ? 'border-red-400' : 'border-stone-200'
                          }`}
                        />
                      </div>
                      {rfqValidationErrors.expectedDeliveryDate && (
                        <p className="text-[11px] font-bold text-red-500">{rfqValidationErrors.expectedDeliveryDate}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Destination Shipping Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                    <MapPin className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="font-poppins font-extrabold text-base text-stone-900">
                      2. Destination & Delivery Address
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={rfqFormData.addressLine1}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.addressLine1 ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="Street Address, Warehouse Number, or P.O. Box"
                      />
                      {rfqValidationErrors.addressLine1 && (
                        <p className="text-[11px] font-bold text-red-500">{rfqValidationErrors.addressLine1}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={rfqFormData.addressLine2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition"
                        placeholder="Suite, Unit, Building, Floor"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={rfqFormData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.city ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="City"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        State / Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={rfqFormData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.state ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="State / Region"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Postal / ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={rfqFormData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.postalCode ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="Postal Code"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Destination Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={rfqFormData.country}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.country ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="e.g. Netherlands, United States, Japan"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Customer & Company Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                    <Building className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="font-poppins font-extrabold text-base text-stone-900">
                      3. Company & Contact Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={rfqFormData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition"
                        placeholder="e.g. Global Agri Import B.V."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={rfqFormData.contactPerson}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.contactPerson ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="Full Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Business Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={rfqFormData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                          rfqValidationErrors.email ? 'border-red-400' : 'border-stone-200'
                        }`}
                        placeholder="buyer@company.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-stone-700">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        country={'us'}
                        value={rfqFormData.phone}
                        onChange={(phoneVal) => {
                          setRfqFormData(prev => ({ ...prev, phone: phoneVal ? `+${phoneVal}` : '' }));
                          if (rfqValidationErrors.phone) {
                            setRfqValidationErrors(prev => ({ ...prev, phone: '' }));
                          }
                        }}
                        inputStyle={{
                          width: '100%',
                          height: '42px',
                          borderRadius: '12px',
                          borderColor: rfqValidationErrors.phone ? '#F87171' : '#E7E5E4',
                          backgroundColor: '#F7F5F4',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Requirements & Attachments */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                    <FileText className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="font-poppins font-extrabold text-base text-stone-900">
                      4. Custom Requirements & Specification Documents
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-stone-700">
                      Requirement Notes & Technical Specifications <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="requirementNote"
                      rows={4}
                      value={rfqFormData.requirementNote}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-stone-50 border rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${
                        rfqValidationErrors.requirementNote ? 'border-red-400' : 'border-stone-200'
                      }`}
                      placeholder="Specify custom EC, pH, expansion volume, washed/unwashed preference, palletization instructions, branding requirements..."
                    />
                    {rfqValidationErrors.requirementNote && (
                      <p className="text-[11px] font-bold text-red-500">{rfqValidationErrors.requirementNote}</p>
                    )}
                  </div>

                  {/* File Upload Attachment */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-stone-700">
                      Specification Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center bg-stone-50/50 hover:bg-stone-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                      />
                      <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-stone-700">Click or drag files here to upload requirement specs</p>
                      <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Supports PDF, DOCX, XLSX, Images (Max 10MB per file)</p>
                    </div>

                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#2E7D32]/20">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="text-stone-400 hover:text-red-500 ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#2E7D32]" />
                    <span>Your quotation request will be evaluated by our export desk.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={rfqSubmitLoading}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white font-poppins text-xs font-black rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {rfqSubmitLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Official RFQ Request</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default RequestQuotePage;
