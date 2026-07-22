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

dotenv.config();

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (
  subject,
  htmlContent,
  to,
  senderName = 'Cocoveera',
  senderEmail = 'adminteam@cocoveera.com',
  attachment = null,
  replyTo = null
) => {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.startsWith('mock_')) {
    console.error(`[Brevo] API Key missing or mocked. Skipping email dispatch.`);
    return { mock: true };
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = to.map((t) => ({ email: t.email, name: t.name || t.email }));

    // ALWAYS configure Reply-To so customer replies go directly to Admin Email (coirsystemadmin@gmail.com)
    const adminReplyEmail = process.env.ADMIN_EMAIL || 'coirsystemadmin@gmail.com';
    if (replyTo) {
      sendSmtpEmail.replyTo = typeof replyTo === 'string'
        ? { email: replyTo, name: 'Cocoveera Admin' }
        : { email: replyTo.email || adminReplyEmail, name: replyTo.name || 'Cocoveera Admin' };
    } else {
      sendSmtpEmail.replyTo = { email: adminReplyEmail, name: 'Cocoveera Export Team' };
    }

    if (attachment) {
      sendSmtpEmail.attachment = Array.isArray(attachment)
        ? attachment
        : [
            {
              name: attachment.name,
              content: attachment.content, // Ensure Base64 string
            },
          ];
    }

    const info = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      `Email successfully sent to ${to[0].email} via Brevo from ${senderEmail} (Reply-To: ${sendSmtpEmail.replyTo.email}, MessageId: ${info.messageId})`
    );
    return info;
  } catch (error) {
    console.error(`Error sending email via Brevo API: ${error.message}`);
    if (error.response && error.response.text) {
      console.error('Brevo API Error Details:', error.response.text);
    }
    throw error;
  }
};

// --- AUTH EMAILS (adminteam@cocoveera.com) ---

export const sendOTPEmail = async (email, name, otp) => {
  const htmlContent = getOTPTemplate(name, otp);
  return sendEmail('Cocoveera Account Verification - OTP', htmlContent, [{ email, name }], 'COCOVEERA Admin Team', 'adminteam@cocoveera.com');
};

export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = getWelcomeTemplate(name);
  return sendEmail('Welcome to Cocoveera - Global Growth Begins Here', htmlContent, [{ email, name }], 'COCOVEERA Admin Team', 'adminteam@cocoveera.com');
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const htmlContent = getForgotPasswordTemplate(name, resetUrl);
  return sendEmail('Cocoveera - Password Reset Request', htmlContent, [{ email, name }], 'COCOVEERA Admin Team', 'adminteam@cocoveera.com');
};

// --- ORDER EMAILS (servicedesk@cocoveera.com) ---

export const sendOrderConfirmationEmail = async (email, name, order, invoicePdfBase64 = null) => {
  const htmlContent = getOrderConfirmationTemplate(name, order);
  let attachment = null;
  if (invoicePdfBase64) {
    attachment = {
      content: invoicePdfBase64,
      name: `Invoice_${order.orderId}.pdf`,
      type: 'application/pdf'
    };
  }
  return sendEmail(`Order Confirmation #${order.orderId}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', 'servicedesk@cocoveera.com', attachment);
};

export const sendPaymentSuccessEmail = async (email, name, transaction) => {
  const htmlContent = getPaymentSuccessTemplate(name, transaction);
  return sendEmail(`Payment Receipt: ${transaction.transactionId}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', 'servicedesk@cocoveera.com');
};

export const sendOrderProcessingEmail = async (email, name, orderId) => {
  const htmlContent = getOrderProcessingTemplate(name, orderId);
  return sendEmail(`Order #${orderId} is Processing`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', 'servicedesk@cocoveera.com');
};

export const sendShippingEmail = async (email, name, shipping) => {
  const htmlContent = getShippingTemplate(name, shipping);
  return sendEmail(`Order #${shipping.orderId} Shipped`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', 'servicedesk@cocoveera.com');
};

export const sendDeliveredEmail = async (email, name, delivery) => {
  const htmlContent = getDeliveredTemplate(name, delivery);
  return sendEmail(`Order Delivered: #${delivery.orderId}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', 'servicedesk@cocoveera.com');
};

export const sendRefundEmail = async (email, name, refund) => {
  const htmlContent = getRefundTemplate(name, refund);
  return sendEmail(`Refund Processed: $${parseFloat(refund.amount).toFixed(2)}`, htmlContent, [{ email, name }], 'COCOVEERA Service Desk', 'servicedesk@cocoveera.com');
};

// --- BUSINESS / QUOTE EMAILS (supportdesk@cocoveera.com) ---

export const sendQuoteRequestEmail = async (email, name, quoteDetails) => {
  const htmlContent = getQuoteRequestTemplate(name, quoteDetails);
  return sendEmail(`Quote Request #${quoteDetails.referenceId}`, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', 'supportdesk@cocoveera.com');
};

export const sendQuotePDFEmail = async (email, name, productName, priceProposed, comments, pdfBase64 = null) => {
  const htmlContent = getQuotePDFTemplate(name, productName, priceProposed, comments);
  let attachment = null;
  if (pdfBase64) {
    attachment = {
      content: pdfBase64,
      name: `Quotation_${productName.replace(/\s+/g, '_')}.pdf`,
      type: 'application/pdf'
    };
  }
  return sendEmail(`Cocoveera - Quote Proposal for ${productName}`, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', 'supportdesk@cocoveera.com', attachment);
};

export const sendQuoteResponseEmail = async (email, name, productName, priceProposed, comments) => {
  // Legacy compatibility for old function calls in quoteController
  return sendQuotePDFEmail(email, name, productName, priceProposed, comments);
};

export const sendComparisonRecommendationEmail = async (email, name, recommendation, pdfBase64 = null) => {
  const htmlContent = getComparisonRecommendationTemplate(name, recommendation);
  let attachment = null;
  if (pdfBase64) {
    attachment = {
      content: pdfBase64,
      name: `Product_Comparison_${recommendation.recommendedProduct.replace(/\s+/g, '_')}.pdf`,
      type: 'application/pdf'
    };
  }
  return sendEmail('Cocoveera Product Analysis & Recommendation', htmlContent, [{ email, name }], 'COCOVEERA Support Desk', 'supportdesk@cocoveera.com', attachment);
};

export const sendHelpTicketEmail = async (email, name, ticket) => {
  const htmlContent = getHelpTicketTemplate(name, ticket);
  return sendEmail(`Support Ticket #${ticket.ticketId} Created`, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', 'supportdesk@cocoveera.com');
};

export const sendAdminNotificationEmail = async (adminEmail, adminName, notification) => {
  const htmlContent = getAdminNotificationTemplate(adminName, notification);
  return sendEmail(`[Admin] New ${notification.type} Alert`, htmlContent, [{ email: adminEmail, name: adminName }], 'COCOVEERA Admin Team', 'adminteam@cocoveera.com');
};

export const sendMarketingCampaignEmail = async (email, name, campaign) => {
  const htmlContent = getMarketingCampaignTemplate(name, campaign);
  // Marketing emails can fall under Support Desk or a dedicated marketing email if added later. Defaulting to Support.
  return sendEmail(campaign.subject, htmlContent, [{ email, name }], 'COCOVEERA Support Desk', 'supportdesk@cocoveera.com');
};

export const sendContactInquiryEmail = async (inquiry) => {
  const htmlContent = getContactInquiryTemplate(inquiry);
  // Send notification to supportdesk
  return sendEmail(
    `New Contact Inquiry: ${inquiry.inquiryType || 'General Inquiry'}`,
    htmlContent,
    [{ email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' }],
    `${inquiry.name} via Cocoveera`,
    'adminteam@cocoveera.com'
  );
};

export const sendInquiryConfirmationEmail = async (inquiry) => {
  const htmlContent = getInquiryConfirmationTemplate(inquiry);
  return sendEmail(
    `We Have Received Your Inquiry - ${inquiry.inquiryId}`,
    htmlContent,
    [{ email: inquiry.email, name: inquiry.name }],
    'COCOVEERA Export Desk',
    'supportdesk@cocoveera.com'
  );
};

export const sendAdminQuoteRequestEmail = async (enquiry) => {
  const htmlContent = getAdminQuoteRequestTemplate(enquiry);
  const adminEmail = process.env.SENDER_EMAIL || 'supportdesk@cocoveera.com';
  return sendEmail(
    'New Quote Request Received',
    htmlContent,
    [{ email: adminEmail, name: 'Cocoveera Admin' }],
    'COCOVEERA Export Desk',
    'supportdesk@cocoveera.com'
  );
};

export const sendRFQApprovalEmail = async (toEmail, toName, approvalData, pdfAttachment = null) => {
  const htmlContent = getRFQApprovalTemplate(toName, approvalData);
  const subject = approvalData.subject || 'Your Quote Request Has Been Approved - Cocoveera Export';
  const adminReplyEmail = process.env.ADMIN_EMAIL || 'coirsystemadmin@gmail.com';
  
  return sendEmail(
    subject,
    htmlContent,
    [{ email: toEmail, name: toName }],
    'COCOVEERA Export Desk',
    'supportdesk@cocoveera.com',
    pdfAttachment,
    { email: adminReplyEmail, name: 'Cocoveera Export Team' }
  );
};

export const sendRFQRejectionEmail = async (toEmail, toName, productName, reason) => {
  const htmlContent = getRFQRejectionTemplate(toName, productName, reason);
  const adminReplyEmail = process.env.ADMIN_EMAIL || 'coirsystemadmin@gmail.com';

  return sendEmail(
    'Update Regarding Your Quotation Request - Cocoveera',
    htmlContent,
    [{ email: toEmail, name: toName }],
    'COCOVEERA Export Desk',
    'supportdesk@cocoveera.com',
    null,
    { email: adminReplyEmail, name: 'Cocoveera Export Team' }
  );
};

export const sendRFQInfoRequestedEmail = async (toEmail, toName, productName, message) => {
  const htmlContent = getRFQInfoRequestedTemplate(toName, productName, message);
  const adminReplyEmail = process.env.ADMIN_EMAIL || 'coirsystemadmin@gmail.com';

  return sendEmail(
    'Information Requested for Your Quote Request - Cocoveera',
    htmlContent,
    [{ email: toEmail, name: toName }],
    'COCOVEERA Export Desk',
    'supportdesk@cocoveera.com',
    null,
    { email: adminReplyEmail, name: 'Cocoveera Export Team' }
  );
};

export const sendQuoteRevisionRequestEmail = async (customerEmail, customerName, quoteNumber, comment) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'coirsystemadmin@gmail.com';
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
    'supportdesk@cocoveera.com'
  );
};
