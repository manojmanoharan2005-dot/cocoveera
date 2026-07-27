import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, useAuth } from '../context/AuthContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getPhoneCountry } from '../utils/countryHelpers';
import { useQueryClient } from '@tanstack/react-query';

export const RequestQuoteModal = ({
  isOpen,
  onClose,
  product,
  user,
  quantity = 0,
  extraItems = [],
  setQuantity,
  setExtraItems,
  containerType = '20FT',
}) => {
  const queryClient = useQueryClient();
  const { fetchProfile } = useAuth();
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqSubmitLoading, setRfqSubmitLoading] = useState(false);
  const [rfqError, setRfqError] = useState('');

  const [rfqFormData, setRfqFormData] = useState({
    requirementNote: '',
    containerSize: containerType === '40FT' ? '40 FT' : '20 FT',
    quantity: '',
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
  const firstEditableRef = useRef(null);

  // Compute selected products from Parent's Container Configurator
  const selectedProductsList = React.useMemo(() => {
    const list = [];
    if (product && quantity > 0) {
      list.push({
        productId: product._id,
        productName: product.name,
        categoryId: product.categoryInfo?._id || '',
        categoryName: product.category || 'Coco Substrates',
        quantity: quantity,
        imageUrl: product.images?.[0] || 'https://placehold.co/100x100'
      });
    }
    (extraItems || []).forEach(item => {
      if (item.quantity > 0) {
        list.push({
          productId: item.product._id,
          productName: item.product.name,
          categoryId: item.product.categoryInfo?._id || '',
          categoryName: item.product.category || 'Coco Substrates',
          quantity: item.quantity,
          imageUrl: item.product.images?.[0] || 'https://placehold.co/100x100'
        });
      }
    });
    return list;
  }, [product, quantity, extraItems]);

  const totalQuantity = React.useMemo(() => {
    return selectedProductsList.reduce((acc, item) => acc + item.quantity, 0);
  }, [selectedProductsList]);

  const isWholeContainer = React.useMemo(() => {
    return totalQuantity > 0 && Math.abs((totalQuantity * 4) - Math.round(totalQuantity * 4)) < 0.001;
  }, [totalQuantity]);

  const handleRemoveProductFromRfq = (prodId) => {
    if (prodId === product?._id) {
      if (setQuantity) setQuantity(0);
    } else {
      if (setExtraItems) {
        setExtraItems(prev => prev.filter(item => item.product._id !== prodId));
      }
    }
  };

  // Sync containerSize if parent containerType updates
  useEffect(() => {
    setRfqFormData(prev => ({
      ...prev,
      containerSize: containerType === '40FT' ? '40 FT' : '20 FT',
    }));
  }, [containerType]);

  // Load user profile details if available
  useEffect(() => {
    if (user) {
      const addr = user.defaultShippingAddress || {};
      setRfqFormData(prev => ({
        ...prev,
        companyName: user.companyName || prev.companyName,
        contactPerson: user.name || prev.contactPerson,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        country: addr.country || user.country || prev.country || '',
        addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2 || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
      }));
    }
  }, [user]);

  // Autofocus first editable field when modal opens
  useEffect(() => {
    if (isOpen && !rfqSubmitted) {
      const timer = setTimeout(() => {
        if (firstEditableRef.current) {
          firstEditableRef.current.focus();
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, rfqSubmitted]);

  // Disable page scrolling while the modal is open
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

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleRfqChange = (e) => {
    const { name, value } = e.target;
    setRfqFormData(prev => ({ ...prev, [name]: value }));
    if (rfqValidationErrors[name]) {
      setRfqValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateRfqForm = () => {
    const errors = {};
    
    if (!rfqFormData.requirementNote.trim()) {
      errors.requirementNote = 'Requirement notes are required';
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
    } else if (!/^\+?[0-9\s-]{8,20}$/.test(rfqFormData.phone)) {
      errors.phone = 'Please enter a valid phone number (8-20 digits)';
    }

    // Shipping Address fields validation
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
      errors.country = 'Country is required';
    }

    if (!rfqFormData.expectedDeliveryDate) {
      errors.expectedDeliveryDate = 'Expected delivery date is required';
    } else {
      const selectedDate = new Date(rfqFormData.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(selectedDate.getTime())) {
        errors.expectedDeliveryDate = 'Please select a valid date';
      } else if (selectedDate < today) {
        errors.expectedDeliveryDate = 'Expected delivery date cannot be in the past';
      }
    }

    setRfqValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRfqSubmit = async (e) => {
    e.preventDefault();
    if (!validateRfqForm() || rfqSubmitLoading) return;

    if (selectedProductsList.length === 0) {
      setRfqError('No products are selected. Please configure your container.');
      return;
    }
    if (totalQuantity === 0) {
      setRfqError('Total container quantity cannot be zero.');
      return;
    }

    setRfqSubmitLoading(true);
    setRfqError('');

    try {
      // Setup payload with structured shipping address
      const payload = {
        category: product?.category || 'Coco Substrates',
        product: product?._id || null,
        products: selectedProductsList.map(item => ({
          product: item.productId,
          productName: item.productName,
          categoryName: item.categoryName,
          quantity: item.quantity
        })),
        containerType: containerType === '40FT' ? '40FT' : '20FT',
        containerSize: containerType === '40FT' ? '40 FT' : '20 FT',
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
      };

      const res = await apiClient.post('/quote-requests', payload);

      if (res.data.success) {
        setRfqSubmitted(true);
        // Invalidate the quotes query cache so the "My Quotes" page fetches the new request immediately
        queryClient.invalidateQueries(['quotes']);
        
        // Automatically sync the profile context defaults
        try {
          if (fetchProfile) await fetchProfile();
        } catch (syncErr) {
          console.error('Failed to sync profile after RFQ:', syncErr);
        }

        // Automatically close modal after success and remain on the same page
        setTimeout(() => {
          setRfqSubmitted(false);
          setRfqFormData(prev => ({ ...prev, requirementNote: '', quantity: '' }));
          onClose();
        }, 2200);
      }
    } catch (error) {
      setRfqError(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setRfqSubmitLoading(false);
    }
  };

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDateStr = `${yyyy}-${mm}-${dd}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-[500px] bg-white rounded-[20px] overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col border border-stone-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-850 transition-colors z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Area */}
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {rfqSubmitted ? (
                <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[350px]">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-[#F0FAF0] text-[#2E7D32] rounded-full flex items-center justify-center shadow-inner mb-2"
                  >
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-base font-poppins font-black text-stone-900 leading-tight">✓ Quote Request Submitted Successfully</h3>
                    <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                      Our B2B commercial desk is reviewing your requirements and will contact you shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Modal Header */}
                  <div className="px-6 pt-6 pb-4 border-b border-stone-100 text-center">
                    <h2 className="text-base font-poppins font-black text-stone-900 leading-tight uppercase tracking-wide">Request Export Quote</h2>
                    <p className="text-xs font-semibold text-[#2E7D32] mt-1">{product?.name || 'Coco Substrates'}</p>
                  </div>

                  <form onSubmit={handleRfqSubmit} className="p-6 space-y-4">
                    {rfqError && (
                      <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 font-semibold">{rfqError}</p>
                      </div>
                    )}

                    {/* Selected Products Section */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Selected Products</label>
                      <div className="border border-stone-200 rounded-[12px] overflow-hidden bg-white">
                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">
                                <th className="px-3 py-2">Image</th>
                                <th className="px-3 py-2">Product Name</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2 text-right">Qty</th>
                                <th className="px-3 py-2 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProductsList.map((item) => (
                                <tr key={item.productId} className="border-b border-stone-100 last:border-b-0 text-stone-700 font-semibold">
                                  <td className="px-3 py-2">
                                    <div className="w-8 h-8 rounded bg-stone-50 border border-stone-100 p-0.5 overflow-hidden flex items-center justify-center">
                                      <img src={item.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 font-bold text-stone-900 truncate max-w-[140px]">{item.productName}</td>
                                  <td className="px-3 py-2 text-stone-500">{item.categoryName}</td>
                                  <td className="px-3 py-2 text-right font-black text-stone-900">{item.quantity.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProductFromRfq(item.productId)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Stacked Card View */}
                        <div className="block sm:hidden divide-y divide-stone-100">
                          {selectedProductsList.map((item) => (
                            <div key={item.productId} className="p-3 flex items-center gap-3 text-xs">
                              <div className="w-10 h-10 rounded bg-stone-50 border border-stone-100 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                                <img src={item.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-stone-900 truncate leading-snug">{item.productName}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-stone-500 font-semibold mt-0.5">
                                  <span>{item.categoryName}</span>
                                  <span>•</span>
                                  <span className="font-bold text-stone-850">Qty: {item.quantity.toFixed(2)}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveProductFromRfq(item.productId)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0 border-none bg-transparent cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RFQ Summary Card */}
                    <div className="bg-stone-50/80 border border-stone-200 rounded-[12px] p-3 text-[11px] font-semibold text-stone-700 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Total Selected Products</span>
                        <span className="font-bold text-stone-900">{selectedProductsList.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Container Type</span>
                        <span className="font-bold text-stone-900">{containerType === '40FT' ? '40 FT' : '20 FT'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Current Total</span>
                        <span className="font-black text-stone-900">{totalQuantity.toFixed(2)} Containers</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-stone-200/60 pt-1.5 mt-0.5">
                        <span className="text-stone-500">Requirement Status</span>
                        <span className={`font-black flex items-center gap-1 ${!isWholeContainer ? 'text-orange-600' : 'text-[#2E7D32]'}`}>
                          {!isWholeContainer ? 'Incomplete' : 'Requirement Met ✓'}
                        </span>
                      </div>
                    </div>

                    {/* Expected Delivery Date */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Expected Delivery Date <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="date"
                          name="expectedDeliveryDate"
                          min={minDateStr}
                          value={rfqFormData.expectedDeliveryDate}
                          onChange={handleRfqChange}
                          className={`w-full bg-stone-50 border ${rfqValidationErrors.expectedDeliveryDate ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                          placeholder="Select your expected delivery date"
                        />
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 pointer-events-none" />
                      </div>
                      {rfqValidationErrors.expectedDeliveryDate && (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.expectedDeliveryDate}</p>
                      )}
                    </div>

                    {/* Requirement Note (Textarea) */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Requirement Note <span className="text-red-500">*</span></label>
                      <textarea
                        ref={firstEditableRef}
                        name="requirementNote"
                        rows="3"
                        value={rfqFormData.requirementNote}
                        onChange={handleRfqChange}
                        maxLength="2000"
                        placeholder="Describe your target cargo parameters, customized pH/EC limits, packing instructions..."
                        className={`w-full bg-stone-50 border ${rfqValidationErrors.requirementNote ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32] resize-none`}
                      />
                      {rfqValidationErrors.requirementNote && (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.requirementNote}</p>
                      )}
                    </div>

                    {/* Company Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={rfqFormData.companyName}
                        onChange={handleRfqChange}
                        placeholder="e.g. Growers Inc."
                        className="w-full bg-stone-50 border border-stone-200 rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                      />
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Contact Person <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={rfqFormData.contactPerson}
                        onChange={handleRfqChange}
                        placeholder="Your Name"
                        className={`w-full bg-stone-50 border ${rfqValidationErrors.contactPerson ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                      />
                      {rfqValidationErrors.contactPerson && (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.contactPerson}</p>
                      )}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={rfqFormData.email}
                          onChange={handleRfqChange}
                          placeholder="you@company.com"
                          className={`w-full bg-stone-50 border ${rfqValidationErrors.email ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                        />
                        {rfqValidationErrors.email && (
                          <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Phone <span className="text-red-500">*</span></label>
                        <PhoneInput
                          country={getPhoneCountry(rfqFormData.country) || 'us'}
                          value={rfqFormData.phone}
                          onChange={phone => {
                            setRfqFormData(prev => ({ ...prev, phone: phone.startsWith('+') ? phone : '+' + phone }));
                            if (rfqValidationErrors.phone) {
                              setRfqValidationErrors(prev => ({ ...prev, phone: '' }));
                            }
                          }}
                          enableSearch={true}
                          searchPlaceholder="Search country..."
                          inputClass={`!w-full !bg-stone-50 !border ${rfqValidationErrors.phone ? '!border-red-400' : '!border-stone-200'} !text-stone-900 !rounded-[10px] !h-9.5 !pl-12 !pr-4 !text-xs !font-semibold focus:!outline-none focus:!border-[#2E7D32] focus:!bg-white transition-all`}
                          buttonClass={`!bg-stone-50 !border ${rfqValidationErrors.phone ? '!border-red-400' : '!border-stone-200'} !rounded-l-[10px] !pl-2`}
                          dropdownClass="!rounded-[10px] !border-stone-200/80 !text-xs !font-semibold"
                          searchClass="!bg-stone-50 !border-transparent !text-xs !font-semibold !rounded-lg !mb-2"
                        />
                        {rfqValidationErrors.phone && (
                          <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address Section */}
                    <div className="border-t border-stone-100 pt-4 space-y-3">
                      <h4 className="text-xs font-poppins font-black text-stone-900 uppercase tracking-wide">Shipping Address</h4>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Address Line 1 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={rfqFormData.addressLine1}
                          onChange={handleRfqChange}
                          placeholder="Street name, P.O. box, company name"
                          className={`w-full bg-stone-50 border ${rfqValidationErrors.addressLine1 ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                        />
                        {rfqValidationErrors.addressLine1 && (
                          <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.addressLine1}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Address Line 2 <span className="text-stone-400">(Optional)</span></label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={rfqFormData.addressLine2}
                          onChange={handleRfqChange}
                          placeholder="Apartment, suite, unit, building, floor"
                          className="w-full bg-stone-50 border border-stone-200 rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">City <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="city"
                            value={rfqFormData.city}
                            onChange={handleRfqChange}
                            placeholder="e.g. Rotterdam"
                            className={`w-full bg-stone-50 border ${rfqValidationErrors.city ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                          />
                          {rfqValidationErrors.city && (
                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.city}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">State / Province <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="state"
                            value={rfqFormData.state}
                            onChange={handleRfqChange}
                            placeholder="e.g. South Holland"
                            className={`w-full bg-stone-50 border ${rfqValidationErrors.state ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                          />
                          {rfqValidationErrors.state && (
                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.state}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Postal / ZIP Code <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="postalCode"
                            value={rfqFormData.postalCode}
                            onChange={handleRfqChange}
                            placeholder="e.g. 3000"
                            className={`w-full bg-stone-50 border ${rfqValidationErrors.postalCode ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                          />
                          {rfqValidationErrors.postalCode && (
                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.postalCode}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Country <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="country"
                            value={rfqFormData.country}
                            onChange={handleRfqChange}
                            placeholder="e.g. Netherlands"
                            className={`w-full bg-stone-50 border ${rfqValidationErrors.country ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
                          />
                          {rfqValidationErrors.country && (
                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">{rfqValidationErrors.country}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold py-2.5 rounded-[12px] text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={rfqSubmitLoading}
                        className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-2.5 rounded-[12px] text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {rfqSubmitLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Submit RFQ'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RequestQuoteModal;
