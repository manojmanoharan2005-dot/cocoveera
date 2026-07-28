/**
 * File: backend/controllers/paymentController.js
 * Purpose: Handles the business logic and request processing for payment operations.
 *
 * PRODUCTION-GRADE: Idempotent payment verification, dynamic progress calculation,
 * upsert-safe Payment records, atomic order + invoice sync, and a sync-status endpoint.
 */
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Quote from '../models/Quote.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../utils/InvoiceGenerator.js';
import { sendOrderConfirmationNotification } from '../utils/NotificationService.js';
import { generateAndStoreDocument } from '../utils/documentService.js';

// In-memory idempotency lock to prevent concurrent duplicate payment processing
// Key: `${orderId}-${milestoneIndex|full}` → true while in-flight
const _paymentLocks = new Map();

/**
 * Compute payment progress and derived fields from milestone data.
 * Never hardcodes percentage by index — always derives from actual amounts.
 */
const computePaymentFields = (order) => {
  const milestones = order.paymentMilestones || [];
  const totalAmount = order.totalAmount || 0;

  if (milestones.length > 0) {
    const totalPaidSoFar = milestones
      .filter(m => m.status === 'Paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    const progress = totalAmount > 0
      ? Math.min(100, Math.round((totalPaidSoFar / totalAmount) * 100))
      : 0;

    return {
      amountPaid: totalPaidSoFar,
      remainingAmount: Math.max(0, totalAmount - totalPaidSoFar),
      paymentProgress: progress,
    };
  }

  // No milestones: treat as full payment
  return {
    amountPaid: totalAmount,
    remainingAmount: 0,
    paymentProgress: 100,
  };
};

/**
 * Map payment progress percentage to order/production status.
 */
const resolveOrderStatus = (progress) => {
  if (progress >= 100) return { paymentStatus: 'paid',          orderStatus: 'shipped',   productionStatus: 'Completed'    };
  if (progress >= 80)  return { paymentStatus: 'partially_paid', orderStatus: 'loaded',    productionStatus: 'In Production' };
  if (progress >= 60)  return { paymentStatus: 'partially_paid', orderStatus: 'packed',    productionStatus: 'In Production' };
  if (progress >= 40)  return { paymentStatus: 'partially_paid', orderStatus: 'confirmed', productionStatus: 'In Production' };
  return                      { paymentStatus: 'partially_paid', orderStatus: 'confirmed', productionStatus: 'In Production' };
};

/**
 * Upsert Payment document — idempotent by transactionId.
 * Prevents duplicate Payment records on network retries.
 */
const upsertPaymentRecord = async ({ transactionId, orderId, amount, method, description, userId }) => {
  try {
    await Payment.findOneAndUpdate(
      { transactionId },
      {
        $setOnInsert: {
          order: orderId,
          amount,
          status: 'completed',
          method: method || 'mock',
          transactionId,
          paymentDate: new Date(),
          description,
          user: userId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    // E11000 duplicate key = already exists, safe to ignore
    if (err.code !== 11000) {
      console.error('[upsertPaymentRecord] Error:', err.message);
    }
  }
};

/**
 * Apply all payment updates to the order document and save.
 * Returns the saved order with all computed fields set.
 */
const applyPaymentToOrder = async (order, { milestoneIndex, effectivePaymentId, gateway, paidAmount, milestoneDescription }) => {
  const isMilestone = milestoneIndex !== undefined && milestoneIndex !== null;
  const idx = isMilestone ? parseInt(milestoneIndex) : null;

  // 1. Mark the milestone paid and unlock the next one
  if (isMilestone && idx !== null) {
    const milestone = order.paymentMilestones[idx];
    milestone.status = 'Paid';
    milestone.paidAt = new Date();
    milestone.paymentId = effectivePaymentId;

    if (idx + 1 < order.paymentMilestones.length) {
      order.paymentMilestones[idx + 1].status = 'Pending';
    }
  }

  // 2. Dynamic progress calculation — derived from actual amounts
  const { amountPaid, remainingAmount, paymentProgress } = computePaymentFields(order);
  order.amountPaid = amountPaid;
  order.remainingAmount = remainingAmount;
  order.paymentProgress = paymentProgress;

  // 3. Order/production status from progress
  const statusFields = resolveOrderStatus(paymentProgress);
  order.paymentStatus = statusFields.paymentStatus;
  order.orderStatus = statusFields.orderStatus;
  order.productionStatus = statusFields.productionStatus;

  // 4. Invoice version label
  order.invoiceVersion = paymentProgress >= 100 ? 'v4' : (paymentProgress >= 80 ? 'v3' : (paymentProgress >= 60 ? 'v2' : 'v1'));

  // 5. Payment metadata
  order.paymentId = effectivePaymentId;
  order.paymentGateway = gateway || 'mock';
  order.paymentVerified = true;

  // 6. Append payment history entry
  order.paymentHistory.push({
    amount: paidAmount,
    percentage: paymentProgress,
    transactionId: effectivePaymentId,
    paidAt: new Date(),
    milestoneType: milestoneDescription,
  });

  await order.save();
  return order;
};

/**
 * Post-save side effects: invoice regeneration, receipt, quote update.
 * Non-blocking — failures are logged but do not affect the HTTP response.
 *
 * IMPORTANT: All document generations use suppressEmail=true.
 * A single consolidated email with ALL PDFs attached is sent at the end.
 * The email send is idempotent: gated by transactionId so duplicate
 * webhook/retry executions can never send a second email for the same payment.
 */
const runPostPaymentSideEffects = async (order) => {
  const transactionId = order.paymentId;

  // ── 1. Generate all documents in parallel (emails suppressed) ──────────
  const [invDoc, receiptDoc] = await Promise.allSettled([
    generateAndStoreDocument({
      orderId: order._id,
      type: order.paymentProgress === 100 ? 'taxInvoicePdf' : 'commercialInvoicePdf',
      user: order.user,
      suppressEmail: true,  // ← suppress per-document email
    }),
    generateAndStoreDocument({
      orderId: order._id,
      type: 'receiptPdf',
      user: order.user,
      suppressEmail: true,  // ← suppress per-document email
      dataOverrides: {
        paymentStatus: 'PAID',
        transactionId: order.paymentId,
        paymentDate: new Date().toLocaleDateString(),
      },
    }),
  ]);

  // Log any generation failures without throwing
  if (invDoc.status === 'rejected')   console.error('[SideEffect] Invoice generation failed:', invDoc.reason?.message);
  if (receiptDoc.status === 'rejected') console.error('[SideEffect] Receipt generation failed:', receiptDoc.reason?.message);

  // Update invoiceUrl on order if invoice was generated
  if (invDoc.status === 'fulfilled' && invDoc.value?.url) {
    try {
      await Order.findByIdAndUpdate(order._id, { invoiceUrl: invDoc.value.url });
    } catch (e) { /* non-critical */ }
  }

  // ── 2. Idempotency guard — one email per transactionId ─────────────────
  // Prevents duplicate emails from Razorpay webhook retries, React Strict Mode
  // double-invocation, or any retry loop.
  if (transactionId) {
    const { default: Email } = await import('../models/Email.js');
    const alreadySent = await Email.findOne({
      subject: { $regex: transactionId, $options: 'i' },
      status: 'sent',
    });
    if (alreadySent) {
      console.log(`[SideEffect] Payment email for txn ${transactionId} already sent. Skipping.`);
      return;
    }
  }

  // ── 3. Send ONE consolidated payment confirmation email ─────────────────
  await sendConsolidatedPaymentEmail({ order, invDoc, receiptDoc });

  // ── 4. Mark quote as converted on full payment ─────────────────────────
  if (order.quote && order.paymentProgress === 100) {
    try {
      await Quote.findByIdAndUpdate(order.quote, { status: 'converted' });
    } catch (err) {
      console.error('[SideEffect] Quote update failed:', err.message);
    }
  }
};

/**
 * Send ONE consolidated payment confirmation email.
 * Subject: "Payment Successful – Cocoveera Export"
 * Attachments: Commercial Invoice PDF + Payment Receipt PDF
 *
 * Also logs the email to the Email collection with the transactionId
 * embedded in the subject for idempotency lookups.
 */
const sendConsolidatedPaymentEmail = async ({ order, invDoc, receiptDoc }) => {
  try {
    const SibApiV3Sdk = (await import('sib-api-v3-sdk')).default;
    const { default: Email } = await import('../models/Email.js');

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.basePath = 'https://api.brevo.com/v3';
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const recipientEmail = order.user?.email;
    const recipientName  = order.user?.name || 'Partner';
    const transactionId  = order.paymentId || 'N/A';
    const orderId        = order._id.toString().slice(-8).toUpperCase();
    const invoiceNum     = `INV-${orderId}`;
    const progress       = order.paymentProgress || 0;
    const totalAmount    = order.totalAmount || 0;
    const amountPaid     = order.amountPaid || 0;
    const outstanding    = order.remainingAmount || Math.max(0, totalAmount - amountPaid);
    const currency       = order.currency || order.user?.currency || 'USD';
    const currSym        = { INR: 'Rs. ', USD: '$', EUR: '€', GBP: '£', AED: 'AED ' }[currency] || '$';
    const paymentDate    = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const milestoneLabel = progress === 100 ? 'Final Payment (100%)' : `Milestone Payment (${progress}%)`;

    if (!recipientEmail) {
      console.warn('[sendConsolidatedPaymentEmail] No recipient email found. Skipping.');
      return;
    }

    const isMock = !process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.startsWith('mock_');
    const subject = `Payment Successful – ${milestoneLabel} | Order #${orderId} | Ref: ${transactionId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, Helvetica, sans-serif; background-color: #F3F4F6; padding: 20px; margin: 0;">
          <div style="max-width: 640px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background: #2E7D32; padding: 28px 32px; text-align: center;">
              <img src="https://res.cloudinary.com/dyrfiop7d/image/upload/v1780933359/cocoveera_assets/logo.png"
                   alt="Cocoveera" style="max-height: 50px; display: block; margin: 0 auto 12px auto;" />
              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: bold; margin: 0; letter-spacing: 1px;">Payment Confirmed ✓</h1>
              <p style="color: #A5D6A7; font-size: 13px; margin: 6px 0 0 0; font-style: italic;">Cocoveera Export Platform</p>
            </div>

            <!-- Success Banner -->
            <div style="background: #F1F8E9; border-left: 4px solid #2E7D32; margin: 24px 32px; padding: 16px 20px; border-radius: 4px;">
              <p style="margin: 0; color: #1B5E20; font-size: 14px; font-weight: bold;">✅ ${milestoneLabel} Received</p>
              <p style="margin: 6px 0 0 0; color: #388E3C; font-size: 13px;">Dear ${recipientName}, your payment has been verified and applied to your order.</p>
            </div>

            <!-- Payment Summary -->
            <div style="padding: 0 32px 8px 32px;">
              <h3 style="font-size: 14px; color: #111827; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Payment Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #374151; border-collapse: collapse;">
                <tr style="background: #F9FAFB;">
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Order Number</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB;">#${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Invoice Number</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB;">${invoiceNum}</td>
                </tr>
                <tr style="background: #F9FAFB;">
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Payment Milestone</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; color: #2E7D32; font-weight: bold;">${milestoneLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Amount Paid</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; color: #2E7D32; font-weight: bold; font-size: 14px;">${currSym}${amountPaid.toFixed(2)}</td>
                </tr>
                <tr style="background: #F9FAFB;">
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Outstanding Balance</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; color: ${outstanding === 0 ? '#2E7D32' : '#D32F2F'}; font-weight: bold;">${outstanding === 0 ? 'FULLY PAID' : `${currSym}${outstanding.toFixed(2)}`}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Grand Total</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB;">${currSym}${totalAmount.toFixed(2)}</td>
                </tr>
                <tr style="background: #F9FAFB;">
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Transaction Reference</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-family: monospace; font-size: 11px;">${transactionId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB; font-weight: bold;">Payment Date</td>
                  <td style="padding: 10px 14px; border: 1px solid #E5E7EB;">${paymentDate}</td>
                </tr>
              </table>
            </div>

            <!-- Attachments note -->
            <div style="margin: 20px 32px; padding: 14px 18px; background: #F3F4F6; border-radius: 6px; border: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 12px; color: #6B7280; font-weight: bold;">📎 DOCUMENTS ATTACHED TO THIS EMAIL</p>
              <ul style="margin: 8px 0 0 0; padding: 0 0 0 18px; font-size: 12px; color: #374151; line-height: 1.8;">
                <li>${progress === 100 ? 'Tax Invoice' : 'Commercial Invoice'}.pdf</li>
                <li>Payment Receipt.pdf</li>
              </ul>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #9CA3AF;">All documents are also available in the My Orders section of your Cocoveera portal.</p>
            </div>

            <!-- Footer -->
            <div style="padding: 20px 32px 28px 32px; border-top: 2px solid #2E7D32; text-align: center;">
              <p style="color: #2E7D32; font-weight: bold; font-size: 13px; margin: 0 0 6px 0;">Thank You For Choosing Cocoveera</p>
              <p style="color: #6B7280; font-size: 11px; margin: 0;">Verification: team@cocoveera.com &nbsp;|&nbsp; Support: servicedesk@cocoveera.com</p>
              <p style="color: #6B7280; font-size: 11px; margin: 4px 0 0 0;">www.cocoveera.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Build attachments array from successfully generated buffers
    const attachments = [];
    if (invDoc?.status === 'fulfilled' && invDoc.value?.pdfBuffer) {
      const docLabel = progress === 100 ? 'Tax_Invoice' : 'Commercial_Invoice';
      attachments.push({
        name: `${docLabel}_${orderId}.pdf`,
        content: invDoc.value.pdfBuffer.toString('base64'),
      });
    }
    if (receiptDoc?.status === 'fulfilled' && receiptDoc.value?.pdfBuffer) {
      attachments.push({
        name: `Payment_Receipt_${orderId}.pdf`,
        content: receiptDoc.value.pdfBuffer.toString('base64'),
      });
    }

    if (isMock) {
      console.log(`[Brevo Mock] Consolidated payment email → ${recipientEmail} | Subject: ${subject}`);
      await Email.create({
        to: recipientEmail,
        subject,
        body: htmlContent,
        attachments: attachments.map(a => ({ name: a.name })),
        status: 'sent',
      });
      return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: 'COCOVEERA Export Desk', email: 'servicedesk@cocoveera.com' };
    sendSmtpEmail.to = [{ email: recipientEmail, name: recipientName }];
    sendSmtpEmail.replyTo = { email: process.env.ADMIN_EMAIL || 'coirsystemadmin@gmail.com', name: 'Cocoveera Admin' };
    if (attachments.length > 0) {
      sendSmtpEmail.attachment = attachments;
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[sendConsolidatedPaymentEmail] Sent to ${recipientEmail} for order ${orderId}`);

    // Log the email — subject includes transactionId for future idempotency checks
    await Email.create({
      to: recipientEmail,
      subject,
      body: htmlContent,
      attachments: attachments.map(a => ({ name: a.name })),
      status: 'sent',
    });

  } catch (err) {
    console.error('[sendConsolidatedPaymentEmail] Failed:', err.message);
    // Log failure but don't re-throw — payment already succeeded
    try {
      const { default: Email } = await import('../models/Email.js');
      await Email.create({
        to: order.user?.email || 'unknown',
        subject: `Payment Successful – Order #${order._id.toString().slice(-8).toUpperCase()} [SEND FAILED]`,
        body: '',
        status: 'failed',
        error: err.message,
      });
    } catch { /* ignore logging failure */ }
  }
};

// @desc    Initiate payment session for an order
// @route   POST /api/payments/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
  // Force reload environment variables to pick up latest keys without a restart
  dotenv.config({ override: true });

  const { orderId, gateway, milestoneIndex } = req.body;

  try {
    const order = await Order.findById(orderId).populate('items.product', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order has already been paid in full' });
    }

    const isMilestone = milestoneIndex !== undefined && milestoneIndex !== null;
    let paymentAmount = order.totalAmount;
    let milestone = null;

    if (isMilestone) {
      const idx = parseInt(milestoneIndex);
      if (!order.paymentMilestones || !order.paymentMilestones[idx]) {
        return res.status(400).json({ success: false, message: 'Invalid milestone index' });
      }
      milestone = order.paymentMilestones[idx];
      if (milestone.status === 'Paid') {
        return res.status(400).json({ success: false, message: 'This milestone has already been paid' });
      }
      paymentAmount = milestone.amount;
    }

    const currency = milestone ? milestone.currency : (order.currency || 'USD');
    const exchangeRate = order.exchangeRate || 83.33;

    // Helper for gateway amount conversion
    const getGatewayAmount = (amount, orderCurrency, currentGateway) => {
      if (currentGateway === 'stripe') {
        if (orderCurrency === 'INR') {
          return Math.round(amount * 0.012 * 100);
        }
        return Math.round(amount * 100);
      }
      if (currentGateway === 'paypal') {
        if (orderCurrency === 'INR') {
          return (amount * 0.012).toFixed(2);
        }
        return amount.toFixed(2);
      }
      if (currentGateway === 'razorpay') {
        if (orderCurrency !== 'INR') {
          return Math.round(amount * exchangeRate * 100);
        }
        return Math.round(amount * 100);
      }
      return Math.round(amount);
    };

    const isPaypalMock = !process.env.PAYPAL_SECRET || process.env.PAYPAL_SECRET.startsWith('mock_');

    // 1. STRIPE GATEWAY
    if (gateway === 'stripe') {
      const isStripeMock = !process.env.STRIPE_SECRET || process.env.STRIPE_SECRET.startsWith('mock_');
      if (isStripeMock) {
        console.log(`[Stripe Mock] Simulating payment intent for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'stripe',
          clientSecret: 'mock_stripe_client_secret_' + Date.now(),
          amount: paymentAmount,
        });
      }

      const activeStripeInstance = new Stripe(process.env.STRIPE_SECRET);
      const stripeAmount = getGatewayAmount(paymentAmount, currency, 'stripe');
      const paymentIntent = await activeStripeInstance.paymentIntents.create({
        amount: stripeAmount,
        currency: 'usd',
        metadata: { 
          orderId: orderId.toString(),
          milestoneIndex: isMilestone ? milestoneIndex.toString() : ''
        },
      });

      return res.status(200).json({
        success: true,
        gateway: 'stripe',
        clientSecret: paymentIntent.client_secret,
        amount: paymentAmount,
      });
    }

    // 2. RAZORPAY GATEWAY
    if (gateway === 'razorpay') {
      const currentRzpKey = process.env.RAZORPAY_KEY;
      const currentRzpSecret = process.env.RAZORPAY_SECRET;
      const isRzpMock = !currentRzpKey || currentRzpKey.startsWith('mock_');
      const rzpAmount = getGatewayAmount(paymentAmount, currency, 'razorpay');

      if (isRzpMock) {
        console.log(`[Razorpay Mock] Simulating order creation for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'razorpay',
          id: 'mock_rzp_order_' + Date.now(),
          amount: rzpAmount,
          currency: 'INR',
        });
      }

      const activeRazorpayInstance = new Razorpay({
        key_id: currentRzpKey,
        key_secret: currentRzpSecret,
      });

      let inrAmount = Math.max(100, rzpAmount);
      const isLive = currentRzpKey.startsWith('rzp_live_');
      if (!isLive && inrAmount > 50000000) {
        console.warn(`[Razorpay] Test mode: Capping order amount from ${inrAmount} to 50000000 paise to prevent limit errors.`);
        inrAmount = 50000000;
      }
      
      const rzpOrder = await activeRazorpayInstance.orders.create({
        amount: inrAmount,
        currency: 'INR',
        receipt: orderId.toString(),
        notes: {
          orderId: orderId.toString(),
          milestoneIndex: isMilestone ? milestoneIndex.toString() : ''
        }
      });

      return res.status(200).json({
        success: true,
        gateway: 'razorpay',
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: currentRzpKey,
      });
    }

    // 3. PAYPAL GATEWAY
    if (gateway === 'paypal') {
      const paypalAmount = getGatewayAmount(paymentAmount, currency, 'paypal');
      if (isPaypalMock) {
        console.log(`[PayPal Mock] Simulating authorization for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'paypal',
          approvalUrl: '#mock-paypal-approval',
          orderId: 'mock_paypal_order_' + Date.now(),
        });
      }

      const environment = new paypal.core.LiveEnvironment(
        process.env.VITE_PAYPAL_CLIENT_ID,
        process.env.PAYPAL_SECRET
      );
      const client = new paypal.core.PayPalHttpClient(environment);

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId.toString(),
            amount: {
              currency_code: "USD",
              value: paypalAmount,
            },
          },
        ],
      });

      const paypalOrder = await client.execute(request);
      const approvalUrl = paypalOrder.result.links.find(
        (link) => link.rel === "approve"
      ).href;

      return res.status(200).json({
        success: true,
        gateway: 'paypal',
        approvalUrl,
        orderId: paypalOrder.result.id,
      });
    }

    // 4. MOCK DIRECT GATEWAY
    if (gateway === 'mock') {
      return res.status(200).json({
        success: true,
        gateway: 'mock',
        orderId: order._id,
        amount: paymentAmount,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid payment gateway' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm/finalize payment for order (mock or confirmed gateway callback)
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (req, res) => {
  const { orderId, paymentId, gateway, status, milestoneIndex } = req.body;
  const isMilestone = milestoneIndex !== undefined && milestoneIndex !== null;
  const idx = isMilestone ? parseInt(milestoneIndex) : null;

  // ── Duplicate-click in-flight guard ──────────────────────────────────────
  const lockKey = `${orderId}-${idx ?? 'full'}`;
  if (_paymentLocks.get(lockKey)) {
    return res.status(429).json({ success: false, message: 'Payment already processing. Please wait.' });
  }
  _paymentLocks.set(lockKey, true);

  try {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status === 'success' || status === 'paid') {

      // ── Idempotency check — return current state if already processed ──────
      if (isMilestone) {
        if (!order.paymentMilestones || !order.paymentMilestones[idx]) {
          return res.status(400).json({ success: false, message: 'Invalid milestone index' });
        }
        if (order.paymentMilestones[idx].status === 'Paid') {
          const fresh = await Order.findById(orderId)
            .populate('user', 'name email phone currency')
            .populate('items.product', 'name slug images price');
          return res.status(200).json({
            success: true,
            message: 'Milestone already verified',
            data: fresh,
            paymentProgress: fresh.paymentProgress,
            amountPaid: fresh.amountPaid,
            remainingAmount: fresh.remainingAmount,
            paymentSyncedAt: fresh.updatedAt,
          });
        }
      } else {
        if (order.paymentStatus === 'paid' && order.paymentVerified) {
          return res.status(200).json({
            success: true,
            message: 'Already verified',
            data: order,
            paymentProgress: order.paymentProgress,
            amountPaid: order.amountPaid,
            remainingAmount: order.remainingAmount,
            paymentSyncedAt: order.updatedAt,
          });
        }
      }

      // ── Determine amounts and description ────────────────────────────────
      const effectivePaymentId = paymentId || 'pm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      let paidAmount;
      let milestoneDescription;

      if (isMilestone) {
        paidAmount = order.paymentMilestones[idx].amount;
        milestoneDescription = `Milestone payment for ${order.paymentMilestones[idx].milestoneType} (Order ${order._id})`;
      } else {
        paidAmount = order.totalAmount;
        milestoneDescription = `Full payment for Order ${order._id}`;
      }

      // ── Apply payment and save order ──────────────────────────────────────
      await applyPaymentToOrder(order, { milestoneIndex: idx, effectivePaymentId, gateway, paidAmount, milestoneDescription });

      // ── Upsert Payment document (idempotent) ──────────────────────────────
      await upsertPaymentRecord({
        transactionId: effectivePaymentId,
        orderId: order._id,
        amount: paidAmount,
        method: gateway || 'mock',
        description: milestoneDescription,
        userId: order.user._id,
      });

      // ── Non-blocking side effects (invoice, receipt, quote) ───────────────
      runPostPaymentSideEffects(order).catch(err => console.error('[SideEffects]', err.message));

      // ── Return fresh, fully populated order ───────────────────────────────
      const freshOrder = await Order.findById(order._id)
        .populate('user', 'name email phone currency')
        .populate('items.product', 'name slug images price');

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: freshOrder,
        paymentProgress: freshOrder.paymentProgress,
        amountPaid: freshOrder.amountPaid,
        remainingAmount: freshOrder.remainingAmount,
        paymentSyncedAt: freshOrder.updatedAt,
      });

    } else {
      if (isMilestone) {
        return res.status(400).json({ success: false, message: 'Milestone payment failed', data: order });
      }
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment status marked as failed', data: order });
    }

  } catch (error) {
    console.error('[confirmPayment] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    _paymentLocks.delete(lockKey);
  }
};

// @desc    Get logged in user's payment history
// @route   GET /api/payments/history
// @access  Private
export const getMyPayments = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    let payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Fallback: if no Payment documents, derive from paid Orders
    if (!payments || payments.length === 0) {
      const Order = (await import('../models/Order.js')).default;
      const orders = await Order.find({ user: req.user._id, paymentStatus: 'paid' }).sort({ updatedAt: -1 });
      payments = orders.map(o => ({ _id: o._id, order: o._id, amount: o.totalAmount, status: 'completed', method: o.paymentGateway || 'mock', transactionId: o.paymentId || '', paymentDate: o.updatedAt, user: req.user._id }));
    }

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments/admin
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    let payments = await Payment.find().populate('order', 'orderId totalAmount').populate('user', 'name email').sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      const Order = (await import('../models/Order.js')).default;
      const orders = await Order.find({ paymentStatus: 'paid' }).populate('user', 'name email').sort({ updatedAt: -1 });
      payments = orders.map(o => ({ _id: o._id, order: o._id, amount: o.totalAmount, status: 'completed', method: o.paymentGateway || 'mock', transactionId: o.paymentId || '', paymentDate: o.updatedAt, user: o.user }));
    }

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a refund for a payment/order
// @route   POST /api/payments/refund
// @access  Private
export const requestRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const Payment = (await import('../models/Payment.js')).default;
    let payment = await Payment.findById(paymentId).populate('user');

    // If Payment doc not found, try interpreting paymentId as an Order id and derive/create Payment
    if (!payment) {
      const Order = (await import('../models/Order.js')).default;
      const order = await Order.findById(paymentId).populate('user');
      if (!order) return res.status(404).json({ success: false, message: 'Payment not found' });
      if (order.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

      // Create a Payment document representing this order's paid transaction if not present
      try {
        payment = await Payment.create({
          order: order._id,
          amount: order.totalAmount,
          status: 'completed',
          method: order.paymentGateway || 'mock',
          transactionId: order.paymentId || '',
          paymentDate: order.updatedAt || new Date(),
          user: order.user._id,
        });
      } catch (createErr) {
        // Handle duplicate transactionId: find existing payment
        if (createErr && createErr.code === 11000 && order.paymentId) {
          payment = await Payment.findOne({ transactionId: order.paymentId });
        } else {
          throw createErr;
        }
      }
    }

    if (payment.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    payment.status = 'refund_requested';
    payment.refundReason = reason || 'No reason provided';
    payment.refundRequestedAt = new Date();
    await payment.save();

    // Notify admin via email
    const { sendAdminNotificationEmail } = await import('../utils/mailer.js');
    await sendAdminNotificationEmail(process.env.SUPPORT_EMAIL || 'servicedesk@cocoveera.com', 'Cocoveera Admin', { type: 'refund_request', message: `Refund requested for payment ${payment._id}` });

    res.status(200).json({ success: true, message: 'Refund requested successfully', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve refund (admin)
// @route   PATCH /api/payments/refund/:id/approve
// @access  Private/Admin
export const approveRefund = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    const payment = await Payment.findById(req.params.id).populate('order');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'refunded';
    payment.refundDecisionAt = new Date();
    payment.refundDecisionBy = req.user._id;
    await payment.save();

    // Update order refund status if applicable
    if (payment.order) {
      const Order = (await import('../models/Order.js')).default;
      await Order.findByIdAndUpdate(payment.order, { refundStatus: 'refunded' });
    }

    res.status(200).json({ success: true, message: 'Refund approved', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject refund (admin)
// @route   PATCH /api/payments/refund/:id/reject
// @access  Private/Admin
export const rejectRefund = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'failed';
    payment.refundDecisionAt = new Date();
    payment.refundDecisionBy = req.user._id;
    await payment.save();

    res.status(200).json({ success: true, message: 'Refund rejected', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature and apply milestone payment
// @route   POST /api/payments/verify-payment
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId, milestoneIndex } = req.body;
  const isMilestone = milestoneIndex !== undefined && milestoneIndex !== null;
  const idx = isMilestone ? parseInt(milestoneIndex) : null;

  // ── Duplicate-click in-flight guard ──────────────────────────────────────
  const lockKey = `rzp-${orderId}-${idx ?? 'full'}`;
  if (_paymentLocks.get(lockKey)) {
    return res.status(429).json({ success: false, message: 'Verification already in progress. Please wait.' });
  }
  _paymentLocks.set(lockKey, true);

  try {
    dotenv.config({ override: true });
    const secret = process.env.VITE_RAZORPAY_SECRET || process.env.RAZORPAY_SECRET;

    if (!secret) {
      console.error('[Razorpay Verify] RAZORPAY_SECRET is missing from environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error: missing Razorpay secret' });
    }

    // ── Validate HMAC signature ───────────────────────────────────────────
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('[Razorpay Verify] Signature mismatch! Expected:', generated_signature);
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // ── Load order ────────────────────────────────────────────────────────
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // ── Idempotency check ────────────────────────────────────────────────
    if (isMilestone) {
      if (!order.paymentMilestones || !order.paymentMilestones[idx]) {
        return res.status(400).json({ success: false, message: 'Invalid milestone index' });
      }
      if (order.paymentMilestones[idx].status === 'Paid') {
        const fresh = await Order.findById(orderId)
          .populate('user', 'name email phone currency')
          .populate('items.product', 'name slug images price');
        return res.status(200).json({
          success: true,
          message: 'Milestone already verified',
          orderId: order._id,
          paymentId: razorpay_payment_id,
          data: fresh,
          paymentProgress: fresh.paymentProgress,
          amountPaid: fresh.amountPaid,
          remainingAmount: fresh.remainingAmount,
          paymentSyncedAt: fresh.updatedAt,
        });
      }
    } else {
      if (order.paymentStatus === 'paid' && order.paymentVerified) {
        return res.status(200).json({
          success: true,
          message: 'Already verified',
          orderId: order._id,
          paymentId: razorpay_payment_id,
          paymentProgress: order.paymentProgress,
          amountPaid: order.amountPaid,
          remainingAmount: order.remainingAmount,
          paymentSyncedAt: order.updatedAt,
        });
      }
    }

    // ── Determine amounts ────────────────────────────────────────────────
    let paidAmount;
    let milestoneDescription;

    if (isMilestone) {
      paidAmount = order.paymentMilestones[idx].amount;
      milestoneDescription = `Milestone payment for ${order.paymentMilestones[idx].milestoneType} (Order ${order._id})`;
    } else {
      paidAmount = order.totalAmount;
      milestoneDescription = `Full Razorpay payment for Order ${order._id}`;
    }

    // ── Apply payment + dynamic calculation ─────────────────────────────
    await applyPaymentToOrder(order, {
      milestoneIndex: idx,
      effectivePaymentId: razorpay_payment_id,
      gateway: 'razorpay',
      paidAmount,
      milestoneDescription,
    });

    // ── Upsert Payment document (idempotent) ─────────────────────────────
    await upsertPaymentRecord({
      transactionId: razorpay_payment_id,
      orderId: order._id,
      amount: paidAmount,
      method: 'razorpay',
      description: milestoneDescription,
      userId: order.user._id,
    });

    // ── Full payment extras (inventory, cart clear) ───────────────────────
    if (!isMilestone) {
      try { await User.findByIdAndUpdate(order.user._id, { cart: [] }); } catch(e) {}
      try {
        const Product = (await import('../models/Product.js')).default;
        for (const item of order.items) {
          if (item.product && item.product._id) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.pieces } });
          }
        }
      } catch(e) {}
    }

    // ── Non-blocking side effects ─────────────────────────────────────────
    runPostPaymentSideEffects(order).catch(err => console.error('[RZP SideEffects]', err.message));

    // ── Return fresh enriched order ───────────────────────────────────────
    const freshOrder = await Order.findById(order._id)
      .populate('user', 'name email phone currency')
      .populate('items.product', 'name slug images price');

    return res.status(200).json({
      success: true,
      orderId: freshOrder._id,
      paymentId: razorpay_payment_id,
      data: freshOrder,
      paymentProgress: freshOrder.paymentProgress,
      amountPaid: freshOrder.amountPaid,
      remainingAmount: freshOrder.remainingAmount,
      paymentSyncedAt: freshOrder.updatedAt,
    });

  } catch (error) {
    console.error('[verifyRazorpayPayment] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    _paymentLocks.delete(lockKey);
  }
};

// @desc    Get real-time payment sync status for an order
// @route   GET /api/payments/sync-status/:orderId
// @access  Private
export const getPaymentSyncStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .select('user paymentProgress amountPaid remainingAmount paymentStatus paymentMilestones paymentHistory paymentId paymentGateway invoiceVersion productionStatus orderStatus updatedAt')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: must be the order owner or admin/manager
    const orderUserId = order.user?.toString();
    if (orderUserId !== req.user.id && !['admin', 'manager', 'support'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lastPayment = order.paymentHistory?.length
      ? order.paymentHistory[order.paymentHistory.length - 1]
      : null;

    return res.status(200).json({
      success: true,
      data: {
        paymentProgress: order.paymentProgress,
        amountPaid: order.amountPaid,
        remainingAmount: order.remainingAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        productionStatus: order.productionStatus,
        invoiceVersion: order.invoiceVersion,
        milestones: order.paymentMilestones,
        lastPayment,
        syncedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('[getPaymentSyncStatus] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
