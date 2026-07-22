import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, useAuth } from '../context/AuthContext';

export const RequestQuoteModal = ({ isOpen, onClose, product, user }) => {
  const { fetchProfile } = useAuth();
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
  const [rfqSubmitLoading, setRfqSubmitLoading] = useState(false);
  const [rfqError, setRfqError] = useState('');

  const [rfqFormData, setRfqFormData] = useState({
    requirementNote: '',
    containerSize: '20 FT',
    quantity: '',
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

    setRfqValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRfqSubmit = async (e) => {
    e.preventDefault();
    if (!validateRfqForm() || rfqSubmitLoading) return;
    setRfqSubmitLoading(true);
    setRfqError('');

    try {
      // Setup payload with structured shipping address
      const payload = {
        category: product.category,
        product: product._id,
        requirementNote: rfqFormData.requirementNote,
        containerSize: rfqFormData.containerSize,
        quantity: rfqFormData.quantity,
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
        expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // default to 30 days out
      };

      const res = await apiClient.post('/quote-requests', payload);

      if (res.data.success) {
        setRfqSubmitted(true);
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
            className="relative w-full max-w-[450px] bg-white rounded-[20px] overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col border border-stone-200"
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

                    {/* Auto-filled, Read Only: Category & Product */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block mb-1">Category</label>
                        <input
                          type="text"
                          value={product?.category || ''}
                          readOnly
                          className="w-full bg-stone-50 border border-stone-200 rounded-[10px] py-2 px-3 text-xs text-stone-500 font-bold select-none cursor-not-allowed outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block mb-1">Product</label>
                        <input
                          type="text"
                          value={product?.name || ''}
                          readOnly
                          className="w-full bg-stone-50 border border-stone-200 rounded-[10px] py-2 px-3 text-xs text-stone-500 font-bold select-none cursor-not-allowed overflow-hidden text-ellipsis whitespace-nowrap outline-none"
                        />
                      </div>
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

                    {/* Container (Dropdown) & Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Container <span className="text-red-500">*</span></label>
                        <select
                          name="containerSize"
                          value={rfqFormData.containerSize}
                          onChange={handleRfqChange}
                          className="w-full bg-stone-50 border border-stone-200 rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32] cursor-pointer"
                        >
                          <option value="20 FT">20 FT Container</option>
                          <option value="40 FT">40 FT Container</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Quantity <span className="text-stone-400">(Optional)</span></label>
                        <input
                          type="text"
                          name="quantity"
                          value={rfqFormData.quantity}
                          onChange={handleRfqChange}
                          placeholder="e.g. 10 Pallets"
                          className="w-full bg-stone-50 border border-stone-200 rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                        />
                      </div>
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
                        <input
                          type="text"
                          name="phone"
                          value={rfqFormData.phone}
                          onChange={handleRfqChange}
                          placeholder="+1234567890"
                          className={`w-full bg-stone-50 border ${rfqValidationErrors.phone ? 'border-red-400' : 'border-stone-200'} rounded-[10px] py-2 px-3 text-xs font-semibold focus:outline-none focus:border-[#2E7D32]`}
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
