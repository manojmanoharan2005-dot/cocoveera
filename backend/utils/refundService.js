/**
 * File: backend/utils/refundService.js
 * Purpose: Handles automated gateway refund API calls (Razorpay, Stripe, PayPal).
 */
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import paypal from '@paypal/checkout-server-sdk';

const isStripeMock = !process.env.STRIPE_SECRET || process.env.STRIPE_SECRET.startsWith('mock_');
const isRazorpayMock = !process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY.startsWith('mock_');
const isPaypalMock = !process.env.PAYPAL_SECRET || process.env.PAYPAL_SECRET.startsWith('mock_');

let stripeInstance = null;
if (!isStripeMock) {
  stripeInstance = new Stripe(process.env.STRIPE_SECRET);
}

let razorpayInstance = null;
if (!isRazorpayMock) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

/**
 * Automatically process the refund against the appropriate gateway.
 * @param {Object} refundDoc - The Mongoose document for the Refund
 * @returns {Object} { success, refundId, gatewayName, error }
 */
export const processGatewayRefund = async (refundDoc) => {
  const { gatewayName, transactionId, amount } = refundDoc;

  try {
    switch (gatewayName) {
      case 'stripe':
        return await processStripeRefund(transactionId, amount);
      case 'razorpay':
        return await processRazorpayRefund(transactionId, amount);
      case 'paypal':
        return await processPaypalRefund(transactionId, amount);
      case 'mock':
      case 'cod':
      case 'wire':
        // For wire and COD, the processing happens offline or via finance approval.
        // So we return success immediately to move it to 'initiated' or 'pending_finance'.
        return { success: true, refundId: `mock_ref_${Date.now()}`, gatewayName };
      default:
        throw new Error(`Unsupported gateway for automated refund: ${gatewayName}`);
    }
  } catch (error) {
    console.error(`[RefundService] Error processing refund for ${gatewayName}:`, error);
    return { success: false, error: error.message || 'Gateway error' };
  }
};

const processStripeRefund = async (transactionId, amount) => {
  if (isStripeMock) {
    console.log(`[Stripe Mock] Processing refund for tx ${transactionId}, amount ${amount}`);
    return { success: true, refundId: `mock_stripe_ref_${Date.now()}`, gatewayName: 'stripe' };
  }

  // Note: amount is in dollars. Stripe expects cents.
  const amountInCents = Math.round(amount * 100);
  
  const refund = await stripeInstance.refunds.create({
    payment_intent: transactionId,
    amount: amountInCents,
  });

  return { success: true, refundId: refund.id, gatewayName: 'stripe' };
};

const processRazorpayRefund = async (transactionId, amount) => {
  if (isRazorpayMock) {
    console.log(`[Razorpay Mock] Processing refund for tx ${transactionId}, amount ${amount}`);
    return { success: true, refundId: `mock_rzp_ref_${Date.now()}`, gatewayName: 'razorpay' };
  }

  // Note: amount is in INR. Razorpay expects paise.
  const amountInPaise = Math.round(amount * 100);
  
  const refund = await razorpayInstance.payments.refund(transactionId, {
    amount: amountInPaise,
    speed: 'normal'
  });

  return { success: true, refundId: refund.id, gatewayName: 'razorpay' };
};

const processPaypalRefund = async (transactionId, amount) => {
  if (isPaypalMock) {
    console.log(`[PayPal Mock] Processing refund for tx ${transactionId}, amount ${amount}`);
    return { success: true, refundId: `mock_paypal_ref_${Date.now()}`, gatewayName: 'paypal' };
  }

  const environment = new paypal.core.LiveEnvironment(
    process.env.VITE_PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET
  );
  const client = new paypal.core.PayPalHttpClient(environment);

  // Note: PayPal expects a Capture ID to refund against, which should be stored as transactionId.
  const request = new paypal.payments.CapturesRefundRequest(transactionId);
  request.requestBody({
    amount: {
      value: (amount * 0.012).toFixed(2), // Conversion logic matching paymentController
      currency_code: 'USD'
    }
  });

  const response = await client.execute(request);
  return { success: true, refundId: response.result.id, gatewayName: 'paypal' };
};
