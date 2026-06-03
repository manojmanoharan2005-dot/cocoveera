/**
 * File: frontend/src/pages/account/HelpCenter.jsx
 * Purpose: React page component representing the HelpCenter view.
 */
import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Send, Search, Phone } from 'lucide-react';
import axios from 'axios';

const FAQS = [
  { q: "Which coir pith is best for hydroponics?", a: "For hydroponics, we recommend our premium washed Coir Pith Blocks (Low EC) as they prevent salt toxicity." },
  { q: "How can I track my order?", a: "You can track your order in the 'Track Orders' section of your dashboard using your Order ID." },
  { q: "How do refunds work?", a: "If you receive damaged goods, contact us within 7 days. Once verified, refunds are processed within 5-7 business days." },
  { q: "What payment methods are available?", a: "We accept Razorpay for domestic (India) orders and Wire Transfer/PayPal for international." },
  { q: "How do I request a quotation?", a: "Navigate to the Quotes tab, or click 'Request Bulk Quote' on any product page." },
  { q: "What is the shipping time for USA?", a: "International shipping typically takes 3-5 weeks depending on the customs clearance process." }
];

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState('FAQ');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  
  // Ticket State
  const [tickets, setTickets] = useState([]);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Order Issue', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'TICKETS') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/tickets/my-tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets(res.data);
    } catch (error) {
      console.error('Failed to fetch tickets');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/tickets', ticketForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTicketForm({ subject: '', category: 'Order Issue', description: '' });
      fetchTickets();
      alert('Ticket created successfully!');
    } catch (error) {
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 h-full flex flex-col">
      <div className="p-8 border-b border-stone-100 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-6">
          <HelpCircle className="w-8 h-8 text-[#2E7D32]" />
          <h1 className="text-2xl font-bold text-stone-900">Help Center</h1>
        </div>
        
        <div className="flex space-x-4 border-b border-stone-100">
          {['FAQ', 'TICKETS', 'CONTACT'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
                activeTab === tab ? 'text-[#2E7D32]' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E7D32] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 flex-grow overflow-y-auto">
        {activeTab === 'FAQ' && (
          <div className="max-w-3xl">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
              />
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border border-stone-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-[#2E7D32]/30">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-white focus:outline-none"
                  >
                    <span className="font-bold text-stone-900 text-left">{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-[#2E7D32]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4 bg-stone-50/50">
                      <p className="text-stone-600 leading-relaxed text-sm">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'TICKETS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold mb-4">Create New Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select 
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                  >
                    <option>Order Issue</option>
                    <option>Shipping</option>
                    <option>Payment</option>
                    <option>Refund</option>
                    <option>Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                  <textarea 
                    required
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 resize-none"
                    placeholder="Provide details..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#2E7D32] text-white font-bold py-2.5 rounded-xl hover:bg-[#1B5E20] transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="text-lg font-bold mb-4">My Tickets</h2>
              {tickets.length === 0 ? (
                <p className="text-stone-500 text-sm">You have no support tickets.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket._id} className="p-4 border border-stone-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-stone-900">{ticket.subject}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                          ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mb-2">Category: {ticket.category}</p>
                      <p className="text-sm text-stone-600 line-clamp-2">{ticket.messages[0]?.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'CONTACT' && (
          <div className="max-w-md">
            <h2 className="text-lg font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div className="w-10 h-10 bg-[#2E7D32]/10 rounded-full flex items-center justify-center text-[#2E7D32]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Email Support</p>
                  <p className="text-sm text-stone-500">support@cocoveera.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div className="w-10 h-10 bg-[#2E7D32]/10 rounded-full flex items-center justify-center text-[#2E7D32]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Phone Support</p>
                  <p className="text-sm text-stone-500">+91 123 456 7890</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-br from-[#2E7D32] to-[#43A047] rounded-2xl text-white">
                <h3 className="font-bold text-lg mb-2">Need immediate answers?</h3>
                <p className="text-sm text-white/80 mb-4">Try using our AI Assistant in the bottom right corner of your screen!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
