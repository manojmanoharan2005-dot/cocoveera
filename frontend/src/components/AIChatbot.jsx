/**
 * File: frontend/src/components/AIChatbot.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm the Cocoveera AI Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const userContext = {
        isLoggedIn: !!user,
        userId: user?._id,
        name: user?.name,
        company: user?.companyName
      };

      const res = await axios.post(`${API_URL}/chat`, { 
        messages: [...messages, userMsg],
        userContext
      });
      setMessages(prev => [...prev, { role: 'model', content: res.data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error connecting to my servers. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_REPLIES = [
    "Which coir pith is best for hydroponics?",
    "How can I track my order?",
    "How do refunds work?",
    "What payment methods are available?",
    "How do I request a quotation?",
    "What is the shipping time for USA?"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#43A047] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles className="absolute top-2 right-2 w-3 h-3 text-yellow-300" />
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 z-50 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] p-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
                  <Bot className="w-6 h-6 text-white" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#1B5E20] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Cocoveera AI</h3>
                  <p className="text-[10px] text-white/70 font-medium">Powered by Google Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-stone-50 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-full bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0 mb-1">
                      <Bot className="w-3.5 h-3.5 text-[#2E7D32]" />
                    </div>
                  )}
                  <div className={`px-4 py-3 max-w-[75%] shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#2E7D32] text-white rounded-[20px] rounded-br-[5px]' 
                      : 'bg-white border border-stone-200 text-stone-800 rounded-[20px] rounded-bl-[5px]'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 mb-1">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start items-end space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#2E7D32]/10 flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot className="w-3.5 h-3.5 text-[#2E7D32]" />
                  </div>
                  <div className="px-4 py-3 bg-white border border-stone-200 rounded-[20px] rounded-bl-[5px] shadow-sm flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-[#2E7D32] animate-spin" />
                    <span className="text-xs text-stone-500 font-medium">Cocoveera AI is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pb-2 bg-stone-50 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    className="text-[10px] font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-3 py-1.5 rounded-full hover:bg-[#2E7D32]/20 transition-colors border border-[#2E7D32]/20"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-stone-100 flex-shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-full px-2 py-1.5 focus-within:border-[#2E7D32] focus-within:ring-2 focus-within:ring-[#2E7D32]/20 transition-all"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-grow bg-transparent px-4 py-2 text-sm focus:outline-none text-stone-800"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-[#2E7D32] text-white flex items-center justify-center disabled:opacity-50 disabled:bg-stone-300 transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
