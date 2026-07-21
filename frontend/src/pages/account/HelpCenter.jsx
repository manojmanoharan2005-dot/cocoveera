import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, User, HelpCircle, Loader2, ChevronRight, ArrowLeft, Ticket, Phone, Mail, MessageCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, apiClient } from '../../context/AuthContext';

const KNOWLEDGE_BASE = [
  { keywords: ['coco cube', 'cubes', 'propagation', 'seedling', 'starter'], answer: "Our Coco Cubes are ideal for seed propagation and early-stage growth. Standard size is 7x7x7 cm." },
  { keywords: ['substrate bag', 'grow bag', 'greenhouse', 'tomato'], answer: "Cocoveera Substrate Bags (Grow Bags) are tailored for commercial greenhouse production of tomatoes, cucumbers, and berries." },
  { keywords: ['coir fiber', 'bale', 'bales', 'mattress'], answer: "We supply premium Coir Fiber Bales extracted from mature coconut husks. Perfect for automotive seating, erosion control, and upholstery." },
  { keywords: ['hydroponics', 'plant', 'grow', 'best pith', 'pith', 'peat', 'coco peat', 'block', '5kg'], answer: "Our signature 5KG Coco Peat Blocks are highly compressed and yield up to 75 liters of premium growing medium." },
  { keywords: ['ec', 'electrical conductivity', 'salt', 'washed', 'unwashed'], answer: "We offer both Low EC (Washed, <0.5 mS/cm) and High EC (Unwashed) coco peat." },
  { keywords: ['expansion', 'yield', 'liter', 'water holding'], answer: "Our 5KG Coco Peat Blocks have an expansion ratio of 1:15, yielding roughly 70-75 liters of volume per block when hydrated." },
  { keywords: ['moq', 'minimum order', 'minimum', 'quantity'], answer: "As a B2B manufacturer, our Minimum Order Quantity (MOQ) is generally one 20ft container." },
  { keywords: ['pallet', 'container', '20ft', '40ft', 'load'], answer: "A standard 40ft High Cube (HC) container can hold approximately 22-24 metric tons of our 5KG Coco Peat Blocks (roughly 20-22 pallets)." },
  { keywords: ['shipping', 'delivery', 'time', 'lead time'], answer: "Lead time for manufacturing and loading a 40ft container is typically 10-14 days. Ocean transit times vary." },
  { keywords: ['customs', 'duty', 'phytosanitary', 'fumigation'], answer: "We provide all necessary export documentation, including Commercial Invoices, Packing Lists, Certificates of Origin, etc." },
  { keywords: ['quote', 'bulk', 'wholesale', 'b2b pricing'], answer: "To get B2B pricing, please use the 'Request Bulk Quote' button on our product pages." },
  { keywords: ['payment', 'pay', 'wire transfer', 'lc'], answer: "For wholesale container orders, we typically accept T/T (Wire Transfer) with a 30% advance and 70% against the copy of the Bill of Lading, or 100% Irrevocable LC at sight." },
  { keywords: ['refund', 'return', 'damaged', 'money back'], answer: "If a shipment is damaged or fails to meet specified EC/pH parameters, please submit a claim with photos within 14 days of port arrival." }
];

const ISSUE_CATEGORIES = [
  'Order Tracking',
  'Shipping & Logistics',
  'Payment Issue',
  'Invoice Issue',
  'Product Quality',
  'Export Documentation',
  'Container Booking',
  'Return / Refund',
  'Technical Support',
  'Other'
];

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Found a better price',
  'Shipping delay',
  'Payment issue',
  'Product no longer required',
  'Other'
];

export default function HelpCenter() {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId');

  const [contextOrder, setContextOrder] = useState(null);
  const [loadingContext, setLoadingContext] = useState(!!orderId);
  const [issueCategory, setIssueCategory] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState('faq');
  const messagesEndRef = useRef(null);

  const [cancellationMode, setCancellationMode] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, cancellationMode]);

  // Initialize context
  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const res = await apiClient.get(`/orders/${orderId}`);
          if (res.data.success) {
            const o = res.data.data;
            setContextOrder(o);
            
            const status = o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1);
            const paymentStatus = o.paymentStatus.charAt(0).toUpperCase() + o.paymentStatus.slice(1);
            const name = user?.name?.split(' ')[0] || 'Customer';
            
            setMessages([
              {
                id: 'welcome_context',
                type: 'bot',
                content: `Hello ${name}! I can see you're requesting support for Order #${o._id.substring(0,8).toUpperCase()}.\n\nCurrent Order Status: ${status}\nPayment Status: ${paymentStatus}\n\nHow can I help you today?`,
                timestamp: new Date()
              }
            ]);
            setMobileView('chat'); // Auto open chat on mobile if coming with context
          }
        } catch (err) {
          console.error("Failed to load context order", err);
          initDefaultGreeting();
        } finally {
          setLoadingContext(false);
        }
      };
      fetchOrder();
    } else {
      initDefaultGreeting();
      setLoadingContext(false);
    }
  }, [orderId, user]);

  const initDefaultGreeting = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am the Cocoveera Support Assistant. I can help you with B2B product inquiries, shipping logistics, order tracking, and account details. What would you like to know?`,
        timestamp: new Date()
      }
    ]);
  };

  const getQuickActions = () => {
    if (!contextOrder) {
      return ["Track my order", "Shipping times", "Request a quote", "Payment methods"];
    }

    const status = contextOrder.orderStatus;
    if (['pending', 'confirmed'].includes(status)) {
      return ["Track Order", "Cancel Order", "Payment Issue", "Modify Order"];
    } else if (['packed', 'loaded'].includes(status)) {
      return ["Track Order", "Modify Shipping Address", "Contact Support", "Logistics Support"];
    } else if (['shipped'].includes(status)) {
      return ["Track Shipment", "Download Invoice", "Logistics Support", "Export Documents"];
    } else if (['delivered'].includes(status)) {
      return ["Raise Complaint", "Product Quality Issue", "Request Invoice", "Reorder"];
    }
    return ["Talk to Human"];
  };

  const generateBotResponse = async (userText) => {
    const text = userText.toLowerCase();

    // Contextual Quick Actions
    if (contextOrder) {
      if (text.includes('track') || text.includes('shipment')) {
        return `Your order #${contextOrder._id.substring(0,8).toUpperCase()} is currently marked as '${contextOrder.orderStatus}'. ${contextOrder.trackingNumber ? `The tracking number is ${contextOrder.trackingNumber}.` : 'A tracking number has not been assigned yet.'}`;
      }
      if (text.includes('invoice')) {
        return `You can download the invoice for Order #${contextOrder._id.substring(0,8).toUpperCase()} directly from your 'My Orders' dashboard.`;
      }
      if (text.includes('modify')) {
        return `To modify Order #${contextOrder._id.substring(0,8).toUpperCase()}, please select the 'Talk to Human' option or email supportdesk@cocoveera.com as modifications depend on the current packing status.`;
      }
      if (text.includes('logistics') || text.includes('export document')) {
        return `For Order #${contextOrder._id.substring(0,8).toUpperCase()}, export documents (Bill of Lading, Phytosanitary Certificate, etc.) will be uploaded to your portal once the container is loaded and cleared.`;
      }
    }

    // Ticket Generation Simulation (If a category is selected and they type an issue)
    if (issueCategory && !text.includes('cancel')) {
      const ticketId = `CV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Clear issue category after generating ticket so it doesn't loop
      setIssueCategory('');
      
      return `Ticket ID: ${ticketId}\n\nStatus: Open\n\nEstimated Response Time: Within 24 Hours\n\nWe have received your issue regarding '${issueCategory}'. A dedicated B2B support representative will get back to you shortly.`;
    }

    // --- Dynamic Intents ---
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon'];
    if (greetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g))) {
      const firstName = user?.name ? user.name.split(' ')[0] : 'there';
      return `Hi ${firstName}! I'm the Cocoveera Assistant. How can I assist you today?`;
    }
    
    // Check Orders Intent (Non-contextual)
    if (!contextOrder && (text.includes('order') || text.includes('track'))) {
      if (!text.includes('minimum')) {
        try {
          const res = await apiClient.get('/orders/myorders');
          const orders = res.data?.data || [];
          if (orders.length === 0) {
            return "I just checked our system, and it looks like you currently have no active orders. Once you place an order, you can ask me to track it for you!";
          } else {
            const latestOrder = orders[0];
            return `You have ${orders.length} order(s) on record. Your most recent order (ID: ${latestOrder._id.substring(0, 8).toUpperCase()}) is currently marked as '${latestOrder.orderStatus}'.`;
          }
        } catch (err) {
          return "I'm having a little trouble retrieving your orders right now from the server. Please check the 'My Orders' tab directly.";
        }
      }
    }

    // Static Knowledge Base
    let bestMatch = null;
    let maxMatches = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let matches = 0;
      for (const keyword of entry.keywords) {
        if (text.includes(keyword)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      return bestMatch.answer;
    }

    return "I'm not quite sure about that specific detail. Could you provide more context or select an 'Issue Category' above to open a support ticket?";
  };

  const handleSendMessage = (e, overrideText = null) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim() && !cancellationMode) return;

    if (cancellationMode && e) {
      // Don't send normal messages in cancellation mode
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Intercept "Cancel Order"
    if (textToSend === "Cancel Order" && contextOrder) {
      setIsTyping(false);
      if (['shipped', 'delivered', 'cancelled'].includes(contextOrder.orderStatus)) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Sorry, this order is currently marked as '${contextOrder.orderStatus}' and cannot be cancelled through the automated system. Please contact human support if you need urgent assistance.`,
          timestamp: new Date()
        }]);
        return;
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `I understand you want to cancel Order #${contextOrder._id.substring(0,8).toUpperCase()}. Could you please select a reason for this cancellation?`,
          timestamp: new Date()
        }]);
        setCancellationMode(true);
        return;
      }
    }

    const fetchResponse = async () => {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
      const botResponse = await generateBotResponse(userMsg.content);
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    };

    fetchResponse();
  };

  const submitCancellation = async () => {
    if (!cancellationReason) return;
    
    setIsTyping(true);
    setCancellationMode(false);
    
    // Simulate user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: `Selected reason: ${cancellationReason}`,
      timestamp: new Date()
    }]);

    try {
      const res = await apiClient.put(`/orders/${contextOrder._id}/cancel`, {
        cancellationReason: cancellationReason,
        cancellationCustomReason: ''
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (res.data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `Your cancellation request for Order #${contextOrder._id.substring(0,8).toUpperCase()} has been processed successfully. A confirmation email has been sent to you.`,
          timestamp: new Date()
        }]);
        // Update local context status to prevent multiple cancellations
        setContextOrder({...contextOrder, orderStatus: 'cancelled'});
      }
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I'm sorry, I encountered an error while trying to cancel your order: ${error.response?.data?.message || 'Unknown error'}. Please try again later or contact human support.`,
        timestamp: new Date()
      }]);
    }
    
    setIsTyping(false);
    setCancellationReason('');
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  };

  if (loadingContext) {
    return <div className="p-12 text-center text-[#2E7D32] font-bold flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6 mr-3" /> Loading Support Context...</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-140px)] md:h-[80vh] min-h-[500px] grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
      
      {/* Sidebar - Need Human Support? */}
      <div className={`${mobileView === 'faq' ? 'flex' : 'hidden'} md:flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4`}>
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Help Center</h2>
          <p className="text-stone-500 font-medium text-sm">Find quick answers or chat with our digital assistant.</p>
        </div>

        {/* Need Human Support Section */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#2E7D32]"></div>
          <h3 className="font-extrabold text-stone-900 flex items-center gap-2 text-lg"><User className="w-5 h-5 text-[#2E7D32]"/> Need Human Support?</h3>
          <p className="text-xs text-stone-500 font-medium">Our B2B specialists are available 24/7 to assist you with large volume orders and complex logistics.</p>
          
          <div className="space-y-3 mt-4">
            <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-100/50 group">
              <div className="w-8 h-8 rounded-full bg-[#2E7D32] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-0.5">WhatsApp Support</p>
                <p className="text-xs font-semibold text-stone-700">+91 123 456 7890</p>
              </div>
            </a>
            
            <a href="mailto:supportdesk@cocoveera.com" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100/50 group">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">Email Support</p>
                <p className="text-xs font-semibold text-stone-700">supportdesk@cocoveera.com</p>
              </div>
            </a>

            <a href="tel:+916383469877" className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200/50 group">
              <div className="w-8 h-8 rounded-full bg-stone-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-0.5">Phone Support</p>
                <p className="text-xs font-semibold text-stone-700">+91 63834 69877</p>
              </div>
            </a>
          </div>
        </div>

        {/* Mobile AI Assistant Button */}
        <div 
          onClick={() => setMobileView('chat')}
          className="md:hidden cursor-pointer bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl p-5 shadow-lg flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold mb-1 flex items-center gap-2"><Bot className="w-5 h-5"/> Open AI Assistant</h3>
            <p className="text-xs text-white/80">Get instant answers or raise tickets.</p>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex md:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 h-full flex-col overflow-hidden relative`}>
        
        {/* Header */}
        <div className="bg-white border-b border-stone-200 p-4 sm:p-5 flex-shrink-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMobileView('faq')}
                className="md:hidden text-stone-400 hover:text-stone-600 p-1.5 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0FAF0] rounded-full flex items-center justify-center relative flex-shrink-0">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#2E7D32]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-tight">Cocoveera Assistant</h1>
                <p className="text-[#2E7D32] text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            
            {/* Issue Category Dropdown */}
            <div className="w-full sm:w-48 flex-shrink-0">
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs font-bold text-stone-700 focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition-all cursor-pointer appearance-none"
              >
                <option value="">Select Issue Category</option>
                {ISSUE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 bg-stone-50/50">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex w-full max-w-[90%] sm:max-w-[75%] md:max-w-[80%] gap-2 sm:gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-1 ${
                    msg.type === 'user' ? 'bg-stone-200 text-stone-600' : 'bg-[#E8F5E9] text-[#2E7D32]'
                  }`}>
                    {msg.type === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} min-w-0`}>
                    <div className={`px-4 sm:px-5 py-3 sm:py-3.5 rounded-[20px] shadow-sm text-sm font-medium leading-relaxed break-words whitespace-pre-wrap ${
                      msg.type === 'user' 
                        ? 'bg-stone-800 text-white rounded-tr-none border border-stone-800' 
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 mt-1.5 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Cancellation Prompt */}
            {cancellationMode && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start pl-10 sm:pl-12 w-full"
              >
                <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm w-full max-w-md">
                  <h4 className="text-xs font-black text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Select Reason
                  </h4>
                  <div className="space-y-2 mb-4">
                    {CANCELLATION_REASONS.map(reason => (
                      <label key={reason} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-stone-50 rounded-lg border border-transparent hover:border-stone-200 transition-colors">
                        <input 
                          type="radio" 
                          name="cancellationReason"
                          value={reason}
                          checked={cancellationReason === reason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          className="accent-red-600 w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-stone-700">{reason}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCancellationMode(false)} className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg transition-colors">Cancel</button>
                    <button onClick={submitCancellation} disabled={!cancellationReason} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50">Submit Request</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-start"
              >
                <div className="flex gap-2 sm:gap-3 max-w-[80%] flex-row">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex-shrink-0 flex items-center justify-center shadow-sm mt-1">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="px-4 sm:px-5 py-3 sm:py-4 rounded-[20px] rounded-tl-none bg-white border border-stone-200 shadow-sm flex items-center space-x-1.5 h-[40px] sm:h-[46px]">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-stone-300 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-stone-300 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-stone-300 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions / Suggested Questions */}
        {!isTyping && !cancellationMode && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-stone-100 flex flex-wrap gap-2 overflow-x-auto hide-scrollbar">
            {getQuickActions().map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(null, q)}
                className={`text-[11px] font-bold px-3 py-1.5 sm:py-2 rounded-full transition-colors border whitespace-nowrap flex-shrink-0 ${
                  q === 'Cancel Order' 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                    : 'bg-stone-50 text-stone-700 hover:bg-[#E8F5E9] hover:text-[#2E7D32] border-stone-200 hover:border-[#2E7D32]/30'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form id="chatbot-form" onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 sm:gap-3 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={cancellationMode ? "Select a reason above..." : issueCategory ? `Type your ${issueCategory} issue...` : "Type your question here..."}
              disabled={isTyping || cancellationMode}
              className="flex-grow bg-stone-50 border border-stone-200 rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
            />
            <button
              type="submit"
              disabled={(!inputValue.trim() && !cancellationMode) || isTyping || cancellationMode}
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-[#2E7D32] text-white rounded-full flex items-center justify-center hover:bg-[#1B5E20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#2E7D32]/20 group"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 translate-x-[-1px] group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
