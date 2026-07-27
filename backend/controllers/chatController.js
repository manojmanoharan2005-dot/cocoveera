/**
 * File: backend/controllers/chatController.js
 * Purpose: Handles the business logic and request processing for chat operations.
 */
import { GoogleGenAI } from '@google/genai';
import Order from '../models/Order.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are the COCOVEERA AI Assistant. You are a highly professional, knowledgeable, and helpful customer support agent for Cocoveera, a premium Global Coir Product Platform.

Knowledge Base:
- Products: Coir Pith Blocks, Grow Bags, Coir Discs, Erosion Control, Hobby Gardening.
- Shipping: We ship globally. Shipping rules vary by country and are tiered by weight (0-5kg, 5-20kg, 20kg+). Free shipping is available for certain regions based on minimum order amount.
- Payment: We accept Razorpay (Cards, UPI, Netbanking) for India, and Wire Transfer, PayPal, or Stripe for international orders.
- Refunds: Standard 7-day refund policy for damaged goods.
- Quotes: wholesale customers can request bulk quotes which an admin will review and approve.

Rules:
1. Always be polite and professional.
2. If asked about something outside of your knowledge base or unrelated to Cocoveera, politely decline to answer and redirect the user back to Cocoveera products.
3. Keep responses concise and formatted nicely.
4. You can recommend users to check their 'Orders' or 'Help Center' for specific issues.
`;

export const handleChat = async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Invalid messages array' });
    }

    // Format messages for the new SDK
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    let dynamicPrompt = SYSTEM_PROMPT;
    if (userContext) {
      if (userContext.isLoggedIn) {
        dynamicPrompt += `\n\nUSER CONTEXT:\nThe user you are speaking to is currently LOGGED IN to their Cocoveera account. Their name is ${userContext.name}.`;
        
        if (userContext.userId) {
            const recentOrders = await Order.find({ user: userContext.userId })
                .sort({ createdAt: -1 })
                .limit(3);
                
            if (recentOrders.length > 0) {
                dynamicPrompt += `\nHere are their most recent orders (up to 3):\n`;
                recentOrders.forEach((o, index) => {
                    dynamicPrompt += `${index + 1}. Order ID: ${o._id}, Status: ${o.orderStatus}, Payment: ${o.paymentStatus}, Total Amount: $${o.totalPrice}\n`;
                });
                dynamicPrompt += `If they ask to track an order or check its status, answer directly using the data provided above! (DO NOT tell them to go to the Orders tab, tell them the actual status). If they have multiple orders, clarify which one they mean.`;
            } else {
                dynamicPrompt += `\nThis user currently has ZERO (0) orders. If they ask to track an order, inform them nicely that our records show they haven't placed any orders yet.`;
            }
        }
      } else {
        dynamicPrompt += `\n\nUSER CONTEXT:\nThe user is currently a GUEST (not logged in). If they want to track an order or view account details, they MUST log in first.`;
      }
    }

    const response = await ai.models.generateContent({
        model: 'gemma-4-31b-it',
        contents: formattedMessages,
        config: {
            systemInstruction: dynamicPrompt,
        }
    });

    return res.status(200).json({
      success: true,
      message: response.text
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process chat request' });
  }
};
