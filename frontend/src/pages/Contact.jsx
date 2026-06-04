/**
 * File: frontend/src/pages/Contact.jsx
 * Purpose: React page component representing the Contact view.
 */
import React, { useState } from 'react';
import { apiClient } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Building, CheckCircle } from 'lucide-react';
import PageHero from '../components/PageHero';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient.post('/contact', formData);
      if (res.data.success) {
        setSuccess(res.data.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: 'General Inquiry',
          message: '',
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const offices = [
    { name: 'Cochin HQ & Export Yard', address: 'Cocoveera Plaza, Port Trust Area, Cochin, Kerala, India', tel: '+91 484 286 9900', email: 'export@cocoveera.com' },
    { name: 'European Distribution Office', address: 'Am Sandtorkai 48, HafenCity, Hamburg, Germany', tel: '+49 40 8900 120', email: 'eu-desk@cocoveera.com' },
    { name: 'North American Hub', address: '100 World Trade Center, Long Beach, Los Angeles, CA, USA', tel: '+1 310 985 4321', email: 'us-desk@cocoveera.com' },
  ];

  return (
    <div className="pb-16 bg-white min-h-screen">
      <PageHero
        badge="GLOBAL REACH"
        title="Contact"
        titleAccent="Export Desk"
        subtitle="Reach out to our domestic and international corporate offices for commercial quote approvals, logistic queries, or product certifications."
        breadcrumbs={[{ label: 'Contact', path: '/contact' }]}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-soft border border-stone-200">
          <h3 className="text-lg font-poppins font-extrabold text-stone-900 mb-6">
            Send Message
          </h3>

          {error && (
            <div className="bg-red-50 text-red-650 text-xs p-4 rounded-xl border border-red-150 mb-6 font-semibold">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
                  <CheckCircle className="w-8 h-8 text-primary relative z-10" />
                </motion.div>
                <h4 className="text-xl font-poppins font-extrabold text-stone-900 mb-2">Message Sent Successfully!</h4>
                <p className="text-stone-500 text-sm font-medium">Our global export desk will get back to you shortly.</p>
                <button onClick={() => setSuccess(null)} className="mt-6 text-primary text-xs font-bold hover:underline">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4 text-stone-850"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="peer w-full border border-stone-250 rounded-xl p-3 pt-5 text-xs font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-900 placeholder-transparent bg-white/50"
                      placeholder="Full Name"
                      required
                    />
                    <label htmlFor="name" className="absolute left-3 top-1.5 text-[9px] font-bold text-stone-400 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-primary uppercase tracking-wider pointer-events-none">
                      Full Name
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="peer w-full border border-stone-250 rounded-xl p-3 pt-5 text-xs font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-900 placeholder-transparent bg-white/50"
                      placeholder="Corporate Email"
                      required
                    />
                    <label htmlFor="email" className="absolute left-3 top-1.5 text-[9px] font-bold text-stone-400 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-primary uppercase tracking-wider pointer-events-none">
                      Corporate Email
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="peer w-full border border-stone-250 rounded-xl p-3 pt-5 text-xs font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-900 placeholder-transparent bg-white/50"
                      placeholder="Telephone"
                    />
                    <label htmlFor="phone" className="absolute left-3 top-1.5 text-[9px] font-bold text-stone-400 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-primary uppercase tracking-wider pointer-events-none">
                      Telephone
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="peer w-full border border-stone-250 rounded-xl p-3 pt-5 text-xs font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-900 placeholder-transparent bg-white/50"
                      placeholder="Company / Organization"
                    />
                    <label htmlFor="company" className="absolute left-3 top-1.5 text-[9px] font-bold text-stone-400 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-primary uppercase tracking-wider pointer-events-none">
                      Company / Org
                    </label>
                  </div>
                </div>

                <div className="relative">
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border border-stone-250 rounded-xl p-3 pt-5 text-xs font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-900 bg-white/50 appearance-none"
                  >
                    <option value="General Inquiry">General Corporate Inquiry</option>
                    <option value="Export Logistics">Export Cargo Logistics</option>
                    <option value="Quality Certifications">Substrate Certifications</option>
                    <option value="Custom Packaging">Custom Packaging Solutions</option>
                  </select>
                  <label htmlFor="subject" className="absolute left-3 top-1.5 text-[9px] font-bold text-primary uppercase tracking-wider pointer-events-none">
                    Inquiry Topic
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    id="message"
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="peer w-full border border-stone-250 rounded-xl p-3 pt-5 text-xs font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-900 placeholder-transparent bg-white/50"
                    placeholder="Message Description"
                    required
                  ></textarea>
                  <label htmlFor="message" className="absolute left-3 top-1.5 text-[9px] font-bold text-stone-400 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[9px] peer-focus:text-primary uppercase tracking-wider pointer-events-none">
                    Message Description
                  </label>
                </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3 px-6 rounded-lg shadow-soft flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Office Coordinates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-6">
            {offices.map((office, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-poppins font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                    <Building className="w-4 h-4 text-primary" />
                    <span>{office.name}</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-3 flex items-start space-x-2 font-medium">
                    <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>{office.address}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block uppercase">Phone</span>
                    <a href={`tel:${office.tel}`} className="text-stone-850 font-bold hover:text-primary transition-colors">
                      {office.tel}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block uppercase">Email</span>
                    <a href={`mailto:${office.email}`} className="text-stone-850 font-bold hover:text-primary transition-colors">
                      {office.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
