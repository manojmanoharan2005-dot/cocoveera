/**
 * File: frontend/src/pages/Contact.jsx
 * Purpose: React page component representing the Premium B2B Contact view.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Building, CheckCircle, Upload, ArrowRight, Clock, Ship, AlertCircle } from 'lucide-react';
import PageHero from '../components/PageHero';
import { API_URL } from '../utils/config';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    company: '',
    country: '',
    city: '',
    inquiryType: 'General Inquiry',
    productCategory: '',
    productName: '',
    requiredQuantity: '',
    unitType: '',
    monthlyRequirement: '',
    targetMarket: '',
    expectedOrderFrequency: '',
    message: '',
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [consent, setConsent] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      setError("Please agree to be contacted by Cocoveera.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessData(null);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      files.forEach(file => {
        data.append('files', file);
      });

      const res = await axios.post(`${API_URL}/contact`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        setSuccessData({
          message: res.data.message,
          inquiryId: res.data.inquiryId
        });
        setFormData({
          name: '', email: '', phone: '', whatsapp: '', company: '', country: '', city: '',
          inquiryType: 'General Inquiry', productCategory: '', productName: '', requiredQuantity: '',
          unitType: '', monthlyRequirement: '', targetMarket: '', expectedOrderFrequency: '', message: '',
        });
        setFiles([]);
        setConsent(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16 bg-stone-50 min-h-screen">
      <PageHero
        badge="GLOBAL REACH"
        title="Get in Touch With"
        titleAccent="Cocoveera"
        subtitle="Connect with our export specialists for product information, quotations, container planning, logistics support, and bulk orders."
        breadcrumbs={[{ label: 'Contact', path: '/contact' }]}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        {/* Left Side: Premium Contact Form */}
        <div className="lg:col-span-8 bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white">
          <div className="mb-8 border-b border-stone-200 pb-4 flex items-center justify-between">
            <h3 className="text-2xl font-poppins font-black text-stone-900 tracking-tight">
              Export Inquiry Form
            </h3>
            <div className="h-1 w-16 bg-gradient-to-r from-[#D4A843] to-[#2E7D32] rounded-full"></div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-650 text-sm p-4 rounded-xl border border-red-150 mb-8 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-b from-[#F0FAF0] to-white rounded-2xl border border-[#2E7D32]/20"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                  className="w-24 h-24 bg-white shadow-[0_8px_30px_rgba(46,125,50,0.2)] rounded-full flex items-center justify-center mb-6 relative z-10"
                >
                  <CheckCircle className="w-12 h-12 text-[#2E7D32]" />
                </motion.div>
                
                <h4 className="text-3xl font-poppins font-black text-stone-900 mb-2 tracking-tight">Inquiry Received</h4>
                <p className="text-stone-600 text-base max-w-md mx-auto mb-8 leading-relaxed">
                  {successData.message}
                </p>
                
                <div className="bg-white px-8 py-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center min-w-[300px]">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Your Tracking ID</span>
                  <span className="text-2xl font-mono font-bold text-[#1E5B2E] bg-[#F0FAF0] px-4 py-1 rounded-lg">
                    {successData.inquiryId}
                  </span>
                </div>
                
                <button 
                  onClick={() => setSuccessData(null)} 
                  className="mt-10 flex items-center gap-2 text-[#2E7D32] text-sm font-bold hover:bg-[#F0FAF0] px-6 py-2.5 rounded-full transition-colors"
                >
                  Submit Another Inquiry <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* SECTION 1: Personal Details */}
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">1. Personal Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Full Name *</label>
                      <input
                        type="text" name="name" value={formData.name} onChange={handleInputChange} required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Business Email *</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleInputChange} required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Mobile Number (with Country Code) *</label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">WhatsApp Number</label>
                      <input
                        type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Company Name *</label>
                      <input
                        type="text" name="company" value={formData.company} onChange={handleInputChange} required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="Your Company Ltd."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Country *</label>
                        <input
                          type="text" name="country" value={formData.country} onChange={handleInputChange} required
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                          placeholder="USA"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">City</label>
                        <input
                          type="text" name="city" value={formData.city} onChange={handleInputChange}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                          placeholder="Los Angeles"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-stone-100"></div>

                {/* SECTION 2: Inquiry Details */}
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">2. Inquiry Details</h4>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Inquiry Type *</label>
                      <select
                        name="inquiryType" value={formData.inquiryType} onChange={handleInputChange} required
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none appearance-none"
                      >
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Bulk Order Inquiry">Bulk Order Inquiry</option>
                        <option value="Container Load Planning">Container Load Planning</option>
                        <option value="Pricing Request">Pricing Request</option>
                        <option value="Sample Request">Sample Request</option>
                        <option value="Distributor Partnership">Distributor Partnership</option>
                        <option value="OEM / Private Label">OEM / Private Label</option>
                        <option value="Logistics Support">Logistics Support</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-stone-50/50 border border-stone-100 rounded-2xl">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Product Category</label>
                        <input
                          type="text" name="productCategory" value={formData.productCategory} onChange={handleInputChange}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                          placeholder="e.g. Coco Peat"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Product Name</label>
                        <input
                          type="text" name="productName" value={formData.productName} onChange={handleInputChange}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                          placeholder="e.g. 5KG Blocks"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Required Quantity</label>
                        <input
                          type="number" name="requiredQuantity" value={formData.requiredQuantity} onChange={handleInputChange}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">Unit Type</label>
                        <select
                          name="unitType" value={formData.unitType} onChange={handleInputChange}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none appearance-none"
                        >
                          <option value="">Select Unit</option>
                          <option value="Pieces">Pieces</option>
                          <option value="Pallets">Pallets</option>
                          <option value="Containers">Containers (20ft/40ft)</option>
                          <option value="Tons">Tons</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-stone-100"></div>

                {/* SECTION 3: Business Requirements */}
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">3. Business Requirements</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Monthly Requirement</label>
                      <input
                        type="text" name="monthlyRequirement" value={formData.monthlyRequirement} onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="e.g. 5 Containers"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Target Market</label>
                      <input
                        type="text" name="targetMarket" value={formData.targetMarket} onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="e.g. Europe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700">Order Frequency</label>
                      <input
                        type="text" name="expectedOrderFrequency" value={formData.expectedOrderFrequency} onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none"
                        placeholder="e.g. Weekly / Monthly"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Message */}
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">4. Message</h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Detailed Requirement / Message *</label>
                    <textarea
                      name="message" value={formData.message} onChange={handleInputChange} rows="5" required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all outline-none resize-none"
                      placeholder="Please describe your specific requirements, product specifications, or any questions you have."
                    ></textarea>
                  </div>
                </div>

                {/* SECTION 5: File Upload */}
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">5. Attachments</h4>
                  <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center hover:bg-stone-50 transition cursor-pointer relative">
                    <input 
                      type="file" multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <Upload className="w-8 h-8 text-stone-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-stone-700">Click to upload files or drag and drop</p>
                    <p className="text-xs text-stone-500 mt-1">Upload Specification File, Purchase Requirement PDF, or Reference Images</p>
                    {files.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-xs font-bold text-[#2E7D32] mb-2">{files.length} file(s) selected:</p>
                        <ul className="text-xs text-stone-600 space-y-1">
                          {files.map((f, i) => <li key={i} className="truncate">✓ {f.name}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Consent & Submit */}
                <div className="bg-[#F0FAF0] rounded-xl p-5 border border-[#2E7D32]/20 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  <label className="flex items-start gap-3 cursor-pointer group flex-1">
                    <div className="relative flex items-center pt-0.5">
                      <input 
                        type="checkbox" 
                        checked={consent} 
                        onChange={(e) => setConsent(e.target.checked)} 
                        className="peer w-5 h-5 border-2 border-stone-300 rounded focus:ring-[#2E7D32] appearance-none checked:bg-[#2E7D32] checked:border-[#2E7D32] transition-all cursor-pointer"
                      />
                      <CheckCircle className="w-3.5 h-3.5 text-white absolute top-1.5 left-[3px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm font-medium text-stone-800 group-hover:text-[#1E5B2E] transition-colors leading-snug">
                      I agree to be contacted by Cocoveera regarding my inquiry and accept the privacy policy. *
                    </span>
                  </label>
                  
                  <button
                    type="submit"
                    disabled={loading || !consent}
                    className="bg-gradient-to-r from-[#2E7D32] to-[#1E5B2E] hover:from-[#1E5B2E] hover:to-[#143e20] text-white font-poppins text-sm font-bold py-4 px-8 rounded-xl shadow-[0_8px_20px_rgba(46,125,50,0.3)] hover:shadow-[0_8px_25px_rgba(46,125,50,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Contact Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Professional Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100 sticky top-24">
            <div className="bg-gradient-to-br from-[#1E5B2E] to-[#2E7D32] p-8 text-white relative overflow-hidden">
              {/* Abstract decorative shapes */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
              
              <h4 className="font-poppins font-black text-2xl relative z-10 mb-2">Global Export Hub</h4>
              <p className="text-[#D4A843] font-medium text-sm relative z-10">Cocoveera Corporate Operations</p>
            </div>
            
            <div className="p-8 space-y-8">
              
              <div className="space-y-6">
                {/* Sales Support */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F0FAF0] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Sales Support</p>
                    <a href="mailto:supportdesk@cocoveera.com" className="text-stone-900 font-medium hover:text-[#2E7D32] transition">supportdesk@cocoveera.com</a>
                  </div>
                </div>

                {/* Export Department */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F0FAF0] flex items-center justify-center flex-shrink-0">
                    <Ship className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Export Department</p>
                    <a href="mailto:exports@cocoveera.com" className="text-stone-900 font-medium hover:text-[#2E7D32] transition">exports@cocoveera.com</a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F0FAF0] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Direct Phone</p>
                    <a href="tel:+919876543210" className="text-stone-900 font-medium hover:text-[#2E7D32] transition">+91 98765 43210</a>
                  </div>
                </div>
              </div>

              <div className="h-px bg-stone-100 w-full"></div>

              {/* Working Hours */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Business Hours</p>
                    <p className="text-stone-900 font-medium">Monday – Saturday</p>
                    <p className="text-stone-500 text-sm">9:00 AM – 6:00 PM IST</p>
                  </div>
                </div>
              </div>

              {/* Response Time Badge */}
              <div className="bg-[#1E5B2E] rounded-xl p-4 flex items-center justify-between text-white shadow-md">
                <span className="font-medium text-sm">Response Time</span>
                <span className="font-bold text-[#D4A843]">Within 24 Hours</span>
              </div>
              
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white py-3.5 rounded-xl font-bold transition shadow-[0_4px_12px_rgba(37,211,102,0.3)]">
                Chat on WhatsApp
              </a>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
