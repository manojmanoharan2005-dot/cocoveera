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
  getMarketingCampaignTemplate
} from './emailTemplates/index.js';

dotenv.config();

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (subject, htmlContent, to, senderName = 'Cocoveera', senderEmail = 'adminteam@cocoveera.com', attachment = null) => {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.startsWith('mock_')) {
    console.error(`[Brevo] API Key missing or mocked. Skipping email dispatch.`);
    return { mock: true };
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = to.map(t => ({ email: t.email, name: t.name || t.email }));
    
    if (attachment) {
      sendSmtpEmail.attachment = [
        {
          name: attachment.name,
          content: attachment.content // Ensure this is base64
        }
      ];
    }

    const info = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email successfully sent to ${to[0].email} via Brevo from ${senderEmail} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`Error sending email via Brevo API: ${error.message}`);
    if (error.response && error.response.text) {
      console.error('Brevo API Error Details:', error.response.text);
    }
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
