/**
 * File: frontend/src/pages/account/HelpCenter.jsx
 * Purpose: React page component representing the HelpCenter view with a Chatbot interface.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, HelpCircle, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, apiClient } from '../../context/AuthContext';

const KNOWLEDGE_BASE = [
  // Product Specifics
  { keywords: ['coco cube', 'cubes', 'propagation', 'seedling', 'starter'], answer: "Our Coco Cubes are ideal for seed propagation and early-stage growth. They come with a pre-cut transplanting hole and are wrapped in biodegradable netting. Standard size is 7x7x7 cm, but we offer custom dimensions upon request." },
  { keywords: ['substrate bag', 'grow bag', 'greenhouse', 'tomato', 'cucumber', 'berry', 'berries'], answer: "Cocoveera Substrate Bags (Grow Bags) are tailored for commercial greenhouse production of tomatoes, cucumbers, and berries. We offer various air-to-water ratios, and our bags come with pre-cut planting and drainage holes. They are UV-treated to last up to 3 years." },
  { keywords: ['coir fiber', 'bale', 'bales', 'mattress', 'bristle', 'twisted'], answer: "We supply premium Coir Fiber Bales extracted from mature coconut husks. Our fiber is available in Bristle, Mattress, and Twisted variations, perfect for automotive seating, erosion control, and upholstery." },
  { keywords: ['hydroponics', 'plant', 'grow', 'best pith', 'pith', 'peat', 'coco peat', 'block', '5kg'], answer: "Our signature 5KG Coco Peat Blocks are highly compressed and yield up to 75 liters of premium growing medium. They are extensively washed to achieve a Low EC (Electrical Conductivity) to prevent salt toxicity, making them perfect for hydroponics." },
  { keywords: ['ec', 'electrical conductivity', 'salt', 'washed', 'unwashed', 'high ec', 'low ec'], answer: "We offer both Low EC (Washed, <0.5 mS/cm) and High EC (Unwashed) coco peat. Low EC is essential for sensitive plants and hydroponics to prevent salt burn, while High EC is often used for animal bedding or soil conditioning." },
  { keywords: ['expansion', 'yield', 'liter', 'water holding', 'capacity'], answer: "Our 5KG Coco Peat Blocks have an expansion ratio of 1:15, yielding roughly 70-75 liters of volume per block when hydrated. They boast excellent water retention while maintaining optimal aeration." },
  
  // Manufacturing & Quality
  { keywords: ['manufacture', 'factory', 'process', 'dry', 'sun', 'aging', 'aged'], answer: "Our coco peat is aged, thoroughly washed with fresh water to lower EC, and sun-dried on concrete floors to prevent contamination. It is then compressed using high-pressure hydraulic presses to ensure dense, uniform blocks." },
  { keywords: ['quality', 'certification', 'organic', 'sri lanka', 'india', 'ph level'], answer: "Cocoveera products maintain a stable pH of 5.5 to 6.8. We adhere to strict quality control, ensuring our products are free from weeds, pathogens, and foreign matter. Our facilities are ISO certified." },
  
  // Logistics & B2B
  { keywords: ['moq', 'minimum order', 'minimum', 'quantity'], answer: "As a B2B manufacturer, our Minimum Order Quantity (MOQ) is generally one 20ft container. However, for initial trial orders, we can accommodate smaller palletized shipments. Please contact sales for specifics." },
  { keywords: ['pallet', 'container', '20ft', '40ft', 'load', 'loading', 'weight'], answer: "A standard 40ft High Cube (HC) container can hold approximately 22-24 metric tons of our 5KG Coco Peat Blocks (roughly 20-22 pallets). A 20ft container holds about 10-12 metric tons." },
  { keywords: ['shipping', 'delivery', 'time', 'lead time', 'how long', 'freight', 'fob', 'cif'], answer: "Lead time for manufacturing and loading a 40ft container is typically 10-14 days. Ocean transit times vary: 3-5 weeks to the US/Europe, and 1-2 weeks to the Middle East/Asia. We offer both FOB and CIF terms." },
  { keywords: ['customs', 'duty', 'phytosanitary', 'fumigation', 'certificate'], answer: "We provide all necessary export documentation, including Commercial Invoices, Packing Lists, Certificates of Origin, Phytosanitary Certificates, and Fumigation Certificates to ensure smooth customs clearance." },
  
  // Orders, Payment & Refunds
  { keywords: ['quote', 'bulk', 'wholesale', 'b2b pricing', 'price list', 'catalog'], answer: "To get B2B pricing, please use the 'Request Bulk Quote' button on our product pages. Our sales team will respond within 24 hours with a customized CIF/FOB quotation." },
  { keywords: ['payment', 'pay', 'razorpay', 'paypal', 'wire transfer', 'lc', 'letter of credit'], answer: "For wholesale container orders, we typically accept T/T (Wire Transfer) with a 30% advance and 70% against the copy of the Bill of Lading, or 100% Irrevocable LC at sight. For smaller/domestic orders, we accept standard gateways like Razorpay." },
  { keywords: ['refund', 'return', 'damaged', 'money back', 'claim'], answer: "We stand by our quality. If a shipment is damaged or fails to meet specified EC/pH parameters, please submit a claim with photos within 14 days of port arrival for investigation and compensation." },
  
  // Sustainability
  { keywords: ['sustainable', 'eco', 'environment', 'biodegradable', 'renewable', 'peat moss'], answer: "Cocoveera products are 100% organic, biodegradable, and renewable. Unlike peat moss, which is mined from fragile bogs, coco peat is a sustainable byproduct of the coconut industry, making it the most environmentally friendly growing medium." },

  // General 
  { keywords: ['contact', 'email', 'phone', 'call', 'support', 'help', 'human'], answer: "You can reach our human support team directly at support@cocoveera.com or call our international helpline at +91 123 456 7890." },
  { keywords: ['bye', 'goodbye', 'thanks', 'thank you'], answer: "You're very welcome! Feel free to ask if you need anything else. Have a great day!" }
];

export default function HelpCenter() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'bot',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am the Cocoveera Support Assistant. I can help you with B2B product inquiries, shipping logistics, order tracking, and account details. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState('faq');
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
    
    // Greeting Intent
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon'];
    if (greetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g))) {
      const firstName = user?.name ? user.name.split(' ')[0] : 'there';
      return `Hi ${firstName}! I'm the Cocoveera Assistant. I can help you with product specs, wholesale logistics, order tracking, and more. How can I assist you today?`;
    }
    
    // Check Orders Intent
    if (text.includes('order') || text.includes('track')) {
      // Don't trigger if asking for minimum order (MOQ)
      if (!text.includes('minimum')) {
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
    }

    // Check Cart Intent
    if (text.includes('cart') || text.includes('basket')) {
      if (user?.cart && user.cart.length > 0) {
        const itemCount = user.cart.reduce((total, item) => total + item.quantity, 0);
        return `You currently have ${itemCount} items across ${user.cart.length} different product types in your cart. You can review them by clicking the Cart icon in the navigation menu.`;
      } else {
        return "Your shopping cart is currently empty. Head over to the Marketplace to explore our premium coco peat products!";
      }
    }

    // Check Wishlist Intent
    if (text.includes('wishlist') || text.includes('saved item') || text.includes('save for later')) {
      if (user?.wishlist && user.wishlist.length > 0) {
        return `You have ${user.wishlist.length} product(s) saved in your wishlist for later consideration. You can view them in the 'Wishlist' section.`;
      } else {
        return "Your wishlist is currently empty. If you see a product you like but aren't ready to buy, click the heart icon to save it!";
      }
    }

    // Check Address Intent
    if (text.includes('address') || text.includes('where do you ship to me') || text.includes('shipping location')) {
      try {
        const res = await apiClient.get('/users/profile');
        const addresses = res.data?.data?.addresses || [];
        const defaultAddress = addresses.find(a => a.isDefault);
        
        if (defaultAddress) {
          return `Your default shipping address is set to: ${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.country}. If you need to change this, you can do so in the Address tab.`;
        } else if (addresses.length > 0) {
          return `You have ${addresses.length} address(es) saved, but no default is set. Please go to your Address settings to select a default shipping location.`;
        } else {
          return "You haven't set up any shipping addresses yet. To receive quotes and shipments, please add an address in your account settings.";
        }
      } catch (err) {
        return "I can't access your address book right now, but you can manage your locations in the Address tab of your dashboard.";
      }
    }

    // Profile / Account Intent
    if (text.includes('profile') || text.includes('account') || text.includes('who am i')) {
      if (user) {
        return `You are currently logged in as ${user.name} representing ${user.companyName !== 'N/A' && user.companyName ? user.companyName : 'your business'}. Your registered email is ${user.email}.`;
      }
    }

    // Product Search / Availability Intent
    if (text.includes('product') || text.includes('trending') || text.includes('do you have') || text.includes('do you sell') || text.includes('looking for')) {
      try {
        const res = await apiClient.get('/products');
        const allProducts = res.data?.data || [];
        if (allProducts.length > 0) {
          const productNames = allProducts.slice(0, 3).map(p => p.name).join(', ');
          return `We have a wide range of premium products! Some of our trending items right now include: ${productNames}. You can browse our full catalog and check real-time stock in the Marketplace tab.`;
        } else {
          return "We are currently updating our catalog, but we typically offer a wide range of premium Coco Peat and Coir products. Check back in the Marketplace soon!";
        }
      } catch (err) {
        return "We are a full-scale manufacturer of Coir products! We produce 5KG Coco Peat Blocks, Coco Cubes, Substrate Grow Bags, and Coir Fiber Bales. You can browse our full catalog in the Marketplace.";
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

    return "I'm not quite sure about that specific detail. I can help you with topics like wholesale container capacities, product specs (like Low EC coco peat), checking your active orders, shipping times, or your account info. Could you rephrase your question?";
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
    <div className="max-w-6xl w-full h-[calc(100vh-140px)] md:h-[80vh] min-h-[500px] grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Sidebar - Quick FAQs & Resources */}
      <div className={`${mobileView === 'faq' ? 'flex' : 'hidden'} md:flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4`}>
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Help Center</h2>
          <p className="text-stone-500 font-medium text-sm">Find quick answers to common questions or chat with our digital assistant.</p>
        </div>

        <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#2E7D32]"/> Quick FAQs</h3>
          
          <div className="space-y-3">
            <details className="group cursor-pointer">
              <summary className="font-semibold text-sm text-stone-800 hover:text-[#2E7D32] list-none flex justify-between items-center">
                Shipping Times
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="14" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">International shipping typically takes 3-5 weeks depending on customs clearance. Domestic orders arrive in 5-7 business days.</p>
            </details>
            <div className="h-px w-full bg-stone-200"></div>
            
            <details className="group cursor-pointer">
              <summary className="font-semibold text-sm text-stone-800 hover:text-[#2E7D32] list-none flex justify-between items-center">
                Return Policy
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="14" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">If you receive damaged goods, contact us within 7 days. Once verified, refunds are processed within 5-7 business days.</p>
            </details>
            <div className="h-px w-full bg-stone-200"></div>

            <details className="group cursor-pointer">
              <summary className="font-semibold text-sm text-stone-800 hover:text-[#2E7D32] list-none flex justify-between items-center">
                Payment Methods
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="14" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">We accept Razorpay for domestic (India) orders and Wire Transfer/PayPal for international orders.</p>
            </details>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
          <h3 className="font-bold text-stone-900 mb-2">Need direct help?</h3>
          <p className="text-xs text-stone-600 mb-4">You can reach out to our human support team via email or phone.</p>
          <div className="space-y-2 text-sm font-semibold text-[#2E7D32]">
            <a href="mailto:support@cocoveera.com" className="block hover:underline">support@cocoveera.com</a>
            <p>+91 123 456 7890</p>
          </div>
        </div>

        {/* Mobile AI Assistant Button */}
        <div 
          onClick={() => setMobileView('chat')}
          className="md:hidden cursor-pointer bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white rounded-xl p-5 shadow-lg flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold mb-1 flex items-center gap-2"><Bot className="w-5 h-5"/> Chat with AI Assistant</h3>
            <p className="text-xs text-white/80">Get instant answers to your questions.</p>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex md:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 h-full flex-col overflow-hidden relative`}>
        
        {/* Header */}
        <div className="bg-white border-b border-stone-200 p-4 sm:p-6 flex-shrink-0 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileView('faq')}
              className="md:hidden text-stone-400 hover:text-stone-600 p-1.5 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0FAF0] rounded-full flex items-center justify-center relative flex-shrink-0">
              <Bot className="w-5 h-5 sm:w-7 sm:h-7 text-[#2E7D32]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-tight">Cocoveera Assistant</h1>
              <p className="text-stone-500 text-[10px] sm:text-xs font-semibold">Online | Ready to help</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 bg-stone-50/30">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex w-full max-w-[90%] sm:max-w-[75%] md:max-w-[65%] gap-2 sm:gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-1 ${
                    msg.type === 'user' ? 'bg-stone-100 text-stone-500' : 'bg-[#E8F5E9] text-[#2E7D32]'
                  }`}>
                    {msg.type === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} min-w-0`}>
                    <div className={`px-4 sm:px-5 py-3 sm:py-3.5 rounded-[20px] shadow-sm text-sm font-medium leading-relaxed break-words ${
                      msg.type === 'user' 
                        ? 'bg-stone-100 text-stone-800 rounded-tr-none border border-stone-200/60' 
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
