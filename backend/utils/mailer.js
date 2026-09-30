/**
 * File: backend/utils/mailer.js
 * Purpose: Utility helper functions used across the backend.
 */
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
import {
  getOTPTemplate,
  getWelcomeTemplate,
  getForgotPasswordTemplate,
  getOrderConfirmationTemplate,
  getPaymentSuccessTemplate,
  getOrderProcessingTemplate,
  getShippingTemplate,
  getDeliveredTemplate,
  getRefundTemplate,
  getQuoteRequestTemplate,
  getQuotePDFTemplate,
  getComparisonRecommendationTemplate,
  getHelpTicketTemplate,
  getAdminNotificationTemplate,
  getMarketingCampaignTemplate,
  getContactInquiryTemplate,
  getInquiryConfirmationTemplate,
  getAdminQuoteRequestTemplate,
  getRFQApprovalTemplate,
  getRFQRejectionTemplate,
  getRFQInfoRequestedTemplate,
} from './emailTemplates/index.js';

import nodemailer from 'nodemailer';

dotenv.config();

// Purpose-specific Senders
const OTP_SENDER = process.env.OTP_SENDER_EMAIL || 'adminteam@cocoveera.com';
const ORDER_SENDER = process.env.ORDER_SENDER_EMAIL || 'servicedesk@cocoveera.com';
const SUPPORT_SENDER = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configure Gmail Transporter as automatic fallback
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_SENDER_EMAIL || process.env.SENDER_EMAIL || 'adminteam@cocoveera.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async (
  subject,
  htmlContent,
  to,
  senderName = 'Cocoveera',
  senderEmail = null,
  attachment = null,
  replyTo = null
) => {
  const resolvedSenderEmail = senderEmail || process.env.OTP_SENDER_EMAIL || process.env.SENDER_EMAIL || 'adminteam@cocoveera.com';
  const supportReplyEmail = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';

  if (subject.toLowerCase().includes('otp') || subject.toLowerCase().includes('verification') || resolvedSenderEmail.includes('adminteam')) {
    console.log(`[Mailer] OTP sender: ${resolvedSenderEmail}`);
  }

  // 1. Try sending via Brevo API with verified sender address
  if (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.startsWith('mock_')) {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { name: senderName, email: resolvedSenderEmail };
      sendSmtpEmail.to = to.map((t) => ({ email: t.email, name: t.name || t.email }));

      if (replyTo) {
        sendSmtpEmail.replyTo = typeof replyTo === 'string'
          ? { email: replyTo, name: 'Cocoveera Support Desk' }
          : { email: replyTo.email || supportReplyEmail, name: replyTo.name || 'Cocoveera Support Desk' };
      } else {
        sendSmtpEmail.replyTo = { email: supportReplyEmail, name: 'Cocoveera Support Desk' };
      }

      if (attachment) {
        sendSmtpEmail.attachment = Array.isArray(attachment)
          ? attachment
          : [
              {
                name: attachment.name,
                content: attachment.content,
              },
            ];
      }

      const info = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`[Mailer] Brevo accepted OTP email request`);
      console.log(`[Mailer] MessageId: ${info.messageId}`);
      console.log(
        `[Mailer] Email successfully sent to ${to[0].email} via Brevo API (Sender: ${resolvedSenderEmail}, Reply-To: ${sendSmtpEmail.replyTo.email}, MessageId: ${info.messageId})`
      );
      return info;
    } catch (error) {
      const status = error.status || error.statusCode || error.response?.statusCode || error.response?.status || 'N/A';
      const brevoCode = error.response?.body?.code || error.code || 'UNKNOWN';
      const brevoMsg = error.response?.body?.message || error.response?.text || error.message;
      console.error(`[Mailer] Brevo API send failed (${error.message}). Attempting Gmail SMTP fallback...`);
      console.error('[Mailer] Brevo Error Details:');
      console.error(`  - HTTP Status: ${status}`);
      console.error(`  - Brevo Error Code: ${brevoCode}`);
      console.error(`  - Brevo Error Message: ${brevoMsg}`);
      console.error(`  - Sender Email: ${resolvedSenderEmail}`);
      console.error(`  - Recipient Email: ${to.map(t => t.email).join(', ')}`);
    }
  }

  // 2. Fallback: Send via Gmail SMTP Transporter using App Password
  if (process.env.GMAIL_APP_PASSWORD) {
    try {
      const mailOptions = {
        from: `"${senderName}" <${resolvedSenderEmail}>`,
        to: to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email)).join(', '),
        replyTo: typeof replyTo === 'string' ? replyTo : (replyTo?.email || supportReplyEmail),
        subject,
        html: htmlContent,
      };

      if (attachment) {
        const attArray = Array.isArray(attachment) ? attachment : [attachment];
        mailOptions.attachments = attArray.map(att => ({
          filename: att.name,
          content: Buffer.from(att.content, 'base64'),
        }));
      }

      const info = await gmailTransporter.sendMail(mailOptions);
      console.log(`[Mailer] Email successfully sent to ${to[0].email} via Gmail SMTP (MessageId: ${info.messageId})`);
      return info;
    } catch (gmailErr) {
      console.error(`[Mailer] Gmail SMTP send failed: ${gmailErr.message}`);
      throw gmailErr;
    }
  }

  console.error(`[Mailer] No active mail transport configured (Brevo/Gmail). Skipping email.`);
  return { mock: true };
};

// --- AUTH EMAILS ---

export const sendOTPEmail = async (email, name, otp) => {
  const htmlContent = getOTPTemplate(name, otp);
  const sender = process.env.OTP_SENDER_EMAIL || 'adminteam@cocoveera.com';
  return sendEmail('Cocoveera Account Verification - OTP', htmlContent, [{ email, name }], 'COCOVEERA Admin Team', sender);
};

export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = getWelcomeTemplate(name);
  const sender = process.env.OTP_SENDER_EMAIL || 'adminteam@cocoveera.com';
  return sendEmail('Welcome to Cocoveera - Global Growth Begins Here', htmlContent, [{ email, name }], 'COCOVEERA Admin Team', sender);
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const htmlContent = getForgotPasswordTemplate(name, resetUrl);
  const sender = process.env.OTP_SENDER_EMAIL || 'adminteam@cocoveera.com';
  return sendEmail('Cocoveera - Password Reset Request', htmlContent, [{ email, name }], 'COCOVEERA Admin Team', sender);
};

// --- ORDER EMAILS ---

export const sendOrderConfirmationEmail = async (email, name, order, invoicePdfBase64 = null) => {
  const htmlContent = getOrderConfirmationTemplate(name, order);
  const sender = process.env.ORDER_SENDER_EMAIL || 'servicedesk@cocoveera.com';
  let attachment = null;
  if (invoicePdfBase64) {
    attachment = {
      content: invoicePdfBase64,
      name: `Invoice_${order.orderId}.pdf`,
      type: 'application/pdf'
    };
  }
  return sendEmail(`Order Confirmation #${order.orderId}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', sender, attachment);
};

export const sendPaymentSuccessEmail = async (email, name, transaction) => {
  const htmlContent = getPaymentSuccessTemplate(name, transaction);
  const sender = process.env.ORDER_SENDER_EMAIL || 'servicedesk@cocoveera.com';
  return sendEmail(`Payment Receipt: ${transaction.transactionId}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', sender);
};

export const sendOrderProcessingEmail = async (email, name, orderId) => {
  const htmlContent = getOrderProcessingTemplate(name, orderId);
  const sender = process.env.ORDER_SENDER_EMAIL || 'servicedesk@cocoveera.com';
  return sendEmail(`Order #${orderId} is Processing`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', sender);
};

export const sendShippingEmail = async (email, name, shipping) => {
  const htmlContent = getShippingTemplate(name, shipping);
  const sender = process.env.ORDER_SENDER_EMAIL || 'servicedesk@cocoveera.com';
  return sendEmail(`Order #${shipping.orderId} Shipped`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', sender);
};

export const sendDeliveredEmail = async (email, name, delivery) => {
  const htmlContent = getDeliveredTemplate(name, delivery);
  const sender = process.env.ORDER_SENDER_EMAIL || 'servicedesk@cocoveera.com';
  return sendEmail(`Order Delivered: #${delivery.orderId}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', sender);
};

export const sendRefundEmail = async (email, name, refund) => {
  const htmlContent = getRefundTemplate(name, refund);
  const sender = process.env.ORDER_SENDER_EMAIL || 'servicedesk@cocoveera.com';
  return sendEmail(`Refund Processed: $${parseFloat(refund.amount).toFixed(2)}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', sender);
};

// --- BUSINESS / QUOTE EMAILS ---

export const sendQuoteRequestEmail = async (email, name, quoteDetails) => {
  const htmlContent = getQuoteRequestTemplate(name, quoteDetails);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  return sendEmail(`Quote Request #${quoteDetails.referenceId}`, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', sender);
};

export const sendQuotePDFEmail = async (email, name, productName, priceProposed, comments, pdfBase64 = null) => {
  const htmlContent = getQuotePDFTemplate(name, productName, priceProposed, comments);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  let attachment = null;
  if (pdfBase64) {
    attachment = {
      content: pdfBase64,
      name: `Quotation_${productName.replace(/\s+/g, '_')}.pdf`,
      type: 'application/pdf'
    };
  }
  return sendEmail(`Cocoveera - Quote Proposal for ${productName}`, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', sender, attachment);
};

export const sendQuoteResponseEmail = async (email, name, productName, priceProposed, comments) => {
  return sendQuotePDFEmail(email, name, productName, priceProposed, comments);
};

export const sendComparisonRecommendationEmail = async (email, name, recommendation, pdfBase64 = null) => {
  const htmlContent = getComparisonRecommendationTemplate(name, recommendation);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  let attachment = null;
  if (pdfBase64) {
    attachment = {
      content: pdfBase64,
      name: `Product_Comparison_${recommendation.recommendedProduct.replace(/\s+/g, '_')}.pdf`,
      type: 'application/pdf'
    };
  }
  return sendEmail('Cocoveera Product Analysis & Recommendation', htmlContent, [{ email, name }], 'COCOVEERA Support Desk', sender, attachment);
};

export const sendHelpTicketEmail = async (email, name, ticket) => {
  const htmlContent = getHelpTicketTemplate(name, ticket);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  return sendEmail(`Support Ticket #${ticket.ticketId} Created`, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', sender);
};

export const sendAdminNotificationEmail = async (adminEmail, adminName, notification) => {
  const htmlContent = getAdminNotificationTemplate(adminName, notification);
  const sender = process.env.OTP_SENDER_EMAIL || process.env.ADMIN_EMAIL || 'adminteam@cocoveera.com';
  const targetEmail = adminEmail || process.env.ADMIN_EMAIL || 'adminteam@cocoveera.com';
  const recipients = [
    { email: targetEmail, name: adminName || 'Cocoveera Admin' },
    { email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' },
  ];
  return sendEmail(`[Admin] New ${notification.type} Alert`, htmlContent, recipients, 'COCOVEERA Admin Team', sender);
};

export const sendMarketingCampaignEmail = async (email, name, campaign) => {
  const htmlContent = getMarketingCampaignTemplate(name, campaign);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  return sendEmail(campaign.subject, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', sender);
};

export const sendContactInquiryEmail = async (inquiry) => {
  const htmlContent = getContactInquiryTemplate(inquiry);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  const adminEmail = process.env.ADMIN_EMAIL || 'adminteam@cocoveera.com';
  const recipients = [
    { email: adminEmail, name: 'Cocoveera Admin' },
    { email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' },
  ];
  return sendEmail(
    `New Contact Inquiry: ${inquiry.inquiryType || 'General Inquiry'} from ${inquiry.name}`,
    htmlContent,
    recipients,
    `${inquiry.name} via Cocoveera`,
    sender
  );
};

export const sendInquiryConfirmationEmail = async (inquiry) => {
  const htmlContent = getInquiryConfirmationTemplate(inquiry);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  return sendEmail(
    `We Have Received Your Inquiry - ${inquiry.inquiryId}`,
    htmlContent,
    [{ email: inquiry.email, name: inquiry.name }],
    'COCOVEERA Export Desk',
    sender
  );
};

export const sendAdminQuoteRequestEmail = async (enquiry) => {
  const htmlContent = getAdminQuoteRequestTemplate(enquiry);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  const adminEmail = process.env.ADMIN_EMAIL || 'adminteam@cocoveera.com';
  const recipients = [
    { email: adminEmail, name: 'Cocoveera Admin' },
    { email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' },
  ];
  return sendEmail(
    'New Quote Request Received',
    htmlContent,
    recipients,
    'COCOVEERA Export Desk',
    sender
  );
};

export const sendRFQApprovalEmail = async (toEmail, toName, approvalData, pdfAttachment = null) => {
  const htmlContent = getRFQApprovalTemplate(toName, approvalData);
  const subject = approvalData.subject || 'Your Quote Request Has Been Approved - Cocoveera Export';
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';

  return sendEmail(
    subject,
    htmlContent,
    [{ email: toEmail, name: toName }],
    'COCOVEERA Export Desk',
    sender,
    pdfAttachment,
    { email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' }
  );
};

export const sendRFQRejectionEmail = async (toEmail, toName, productName, reason) => {
  const htmlContent = getRFQRejectionTemplate(toName, productName, reason);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';

  return sendEmail(
    'Update Regarding Your Quotation Request - Cocoveera',
    htmlContent,
    [{ email: toEmail, name: toName }],
    'COCOVEERA Export Desk',
    sender,
    null,
    { email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' }
  );
};

export const sendRFQInfoRequestedEmail = async (toEmail, toName, productName, message) => {
  const htmlContent = getRFQInfoRequestedTemplate(toName, productName, message);
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';

  return sendEmail(
    'Information Requested for Your Quote Request - Cocoveera',
    htmlContent,
    [{ email: toEmail, name: toName }],
    'COCOVEERA Export Desk',
    sender,
    null,
    { email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' }
  );
};

export const sendQuoteRevisionRequestEmail = async (customerEmail, customerName, quoteNumber, comment) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'adminteam@cocoveera.com';
  const sender = process.env.SUPPORT_SENDER_EMAIL || 'supportdesk@cocoveera.com';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
      <h2 style="color: #2E7D32;">Revision Requested for Quote #${quoteNumber}</h2>
      <p>Customer <strong>${customerName}</strong> (${customerEmail}) has submitted a revision request for quotation <strong>#${quoteNumber}</strong>.</p>
      <div style="background-color: #f5f5f5; border-left: 4px solid #2E7D32; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong style="display: block; margin-bottom: 5px;">Customer Comments:</strong>
        <p style="margin: 0; white-space: pre-wrap; font-style: italic;">"${comment}"</p>
      </div>
      <p>Please review these feedback notes and submit an updated proposal/PDF via the admin portal.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 11px; color: #888;">This is an automated system notification from Cocoveera Export Portal.</p>
    </div>
  `;
  return sendEmail(
    `[Revision Requested] Quote #${quoteNumber}`,
    htmlContent,
    [{ email: adminEmail, name: 'Cocoveera Admin' }],
    'COCOVEERA Export Desk',
    sender,
    null,
    'supportdesk@cocoveera.com'
  );
};
