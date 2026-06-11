/**
 * File: frontend/src/pages/account/HelpCenter.jsx
 * Purpose: React page component representing the HelpCenter view with a Chatbot interface.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, apiClient } from '../../context/AuthContext';

const KNOWLEDGE_BASE = [
  { keywords: ['hydroponics', 'plant', 'grow', 'best pith', 'pith'], answer: "For hydroponics and specialized growing, we recommend our premium washed Coir Pith Blocks (Low EC) as they prevent salt toxicity." },
  { keywords: ['track', 'order status', 'where is my order'], answer: "You can track your order in the 'My Orders' section of your dashboard using your Order ID." },
  { keywords: ['refund', 'return', 'damaged', 'money back'], answer: "If you receive damaged goods, contact us within 7 days. Once verified, refunds are processed within 5-7 business days." },
  { keywords: ['payment', 'pay', 'razorpay', 'paypal', 'wire transfer'], answer: "We accept Razorpay for domestic (India) orders and Wire Transfer/PayPal for international orders." },
  { keywords: ['quote', 'bulk', 'wholesale', 'b2b pricing'], answer: "You can request a quotation by navigating to the Quotes tab or clicking 'Request Bulk Quote' on any product page." },
  { keywords: ['shipping', 'delivery', 'time', 'how long', 'usa', 'international'], answer: "International shipping typically takes 3-5 weeks depending on customs clearance. Domestic orders arrive in 5-7 business days." },
  { keywords: ['contact', 'email', 'phone', 'call', 'support'], answer: "You can reach us directly at support@cocoveera.com or call our helpline at +91 123 456 7890." },
  { keywords: ['hello', 'hi', 'hey', 'greetings'], answer: "Hello there! Welcome to the Cocoveera Help Center. I'm your digital assistant. How can I help you today?" }
];

export default function HelpCenter() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'bot',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am the Cocoveera Support Assistant. I can help you with questions about products, shipping, orders, payments, and returns. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateBotResponse = async (userText) => {
    const text = userText.toLowerCase();

    // --- Dynamic Intents ---
    
    // Check Orders Intent
    if (text.includes('order') || text.includes('track') || text.includes('my orders')) {
      try {
        const res = await apiClient.get('/orders/myorders');
        const orders = res.data?.data || [];
        
        if (orders.length === 0) {
          return "I just checked our system, and it looks like you currently have no active orders. Once you place an order, you can ask me to track it for you!";
        } else {
          const latestOrder = orders[0];
          return `You have ${orders.length} order(s) on record. Your most recent order (ID: ${latestOrder._id.substring(0, 8).toUpperCase()}) is currently marked as '${latestOrder.orderStatus}'. You can view full details in your 'My Orders' dashboard.`;
        }
      } catch (err) {
        return "I'm having a little trouble retrieving your orders right now from the server. Please check the 'My Orders' tab directly, or try asking me again in a moment.";
      }
    }

    // Profile Intent
    if (text.includes('profile') || text.includes('account') || text.includes('who am i')) {
      if (user) {
        return `You are currently logged in as ${user.name} representing ${user.companyName !== 'N/A' && user.companyName ? user.companyName : 'your business'}. Your registered email is ${user.email}.`;
      }
    }

    // --- Static Knowledge Base ---
    
    // Find matching knowledge base entry
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

    return "I'm not quite sure about that. I can help you with topics like checking your active orders, shipping times, refunds, payment methods, or product recommendations. Could you rephrase your question?";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const fetchResponse = async () => {
      // Simulate network delay for natural feel
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

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  };

  return (
    <div className="max-w-4xl w-full h-[calc(100vh-140px)] md:h-[80vh] min-h-[500px] flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 h-full flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-4 sm:p-6 flex-shrink-0 z-10 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg relative flex-shrink-0">
              <Bot className="w-5 h-5 sm:w-7 sm:h-7 text-[#2E7D32]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white leading-tight">Cocoveera Assistant</h1>
              <p className="text-white/80 text-[10px] sm:text-xs font-semibold">Online | Ready to help</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 bg-stone-50/50">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex w-full max-w-[90%] sm:max-w-[75%] md:max-w-[65%] gap-2 sm:gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-1 ${
                    msg.type === 'user' ? 'bg-stone-200 text-stone-600' : 'bg-[#E8F5E9] text-[#2E7D32]'
                  }`}>
                    {msg.type === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} min-w-0`}>
                    <div className={`px-4 sm:px-5 py-3 sm:py-3.5 rounded-[20px] shadow-sm text-sm font-medium leading-relaxed break-words ${
                      msg.type === 'user' 
                        ? 'bg-[#2E7D32] text-white rounded-tr-none' 
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

        {/* Suggested Questions */}
        {messages.length === 1 && !isTyping && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-stone-100 flex flex-wrap gap-2 overflow-x-auto hide-scrollbar">
            {["Track my order", "Shipping times", "Request a quote", "Payment methods"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInputValue(q);
                  // Trigger form submission implicitly
                  const e = new Event('submit', { cancelable: true, bubbles: true });
                  document.getElementById('chatbot-form').dispatchEvent(e);
                }}
                className="text-[11px] font-bold bg-stone-50 text-stone-600 hover:bg-[#E8F5E9] hover:text-[#2E7D32] px-3 py-1.5 sm:py-2 rounded-full transition-colors border border-stone-200 hover:border-[#2E7D32]/30 whitespace-nowrap flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form id="chatbot-form" onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question here..."
              disabled={isTyping}
              className="flex-grow bg-stone-50 border border-stone-200 rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-stone-900 focus:bg-white focus:border-[#2E7D32] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
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
