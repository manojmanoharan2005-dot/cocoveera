/**
 * File: backend/utils/emailTemplates/businessTemplates.js
 * Purpose: Utility helper functions used across the backend.
 */
import { baseTemplate } from './baseTemplate.js';

export const getQuoteRequestTemplate = (name, quoteDetails) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">We have received your request for a custom pricing proposal. Our commercial desk is currently reviewing your requirements.</p>
    
    <div style="background-color: #FCFBF9; border: 1px solid #E2DCD0; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Reference ID: ${quoteDetails.referenceId}</p>
      <p style="margin: 0 0 15px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Date: ${quoteDetails.date}</p>
      <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #2C2C2C;">Product Specification:</p>
      <p style="margin: 0; color: #555555; font-style: italic;">${quoteDetails.productSpec}</p>
    </div>
    
    <p style="color: #666666; font-size: 14px; line-height: 1.6;">A dedicated account manager will respond with a formal quotation and logistics options within 24-48 business hours.</p>
  `;
  return baseTemplate({ title: `Quote Request #${quoteDetails.referenceId}`, content });
};

export const getQuotePDFTemplate = (name, productName, priceProposed, comments) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Our commercial desk has successfully reviewed your recent inquiry. Please find attached the requested formal quotation PDF for <strong>${productName}</strong>.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border-collapse: collapse; border: 1px solid #E2DCD0; border-radius: 6px; overflow: hidden;">
      <tr style="background: linear-gradient(to right, #1E5B2E, #2E7D32); color: #FFFFFF;">
        <th align="left" style="padding: 14px 18px; font-family: Georgia, serif; font-size: 14px; font-weight: normal; letter-spacing: 1px;">Item Description</th>
        <th align="right" style="padding: 14px 18px; font-family: Georgia, serif; font-size: 14px; font-weight: normal; letter-spacing: 1px;">Proposed Pricing</th>
      </tr>
      <tr>
        <td style="padding: 18px; font-size: 14px; border-bottom: 1px solid #E2DCD0; color: #2C2C2C; font-weight: bold; background-color: #FFFFFF;">${productName}</td>
        <td align="right" style="padding: 18px; font-family: Georgia, serif; font-size: 17px; font-weight: bold; border-bottom: 1px solid #E2DCD0; color: #1E5B2E; background-color: #FFFFFF;">$${parseFloat(priceProposed).toFixed(2)} USD</td>
      </tr>
      ${comments ? `
      <tr>
        <td colspan="2" style="padding: 18px; font-size: 13px; color: #555555; background-color: #FCFBF9; border-top: 1px solid #E2DCD0;">
          <strong style="color: #9E7E53; font-family: Georgia, serif; font-style: italic; font-size: 14px; display: block; margin-bottom: 6px;">Commercial Notes & Logistics terms:</strong>
          <div style="line-height: 1.6; color: #4A4A4A;">${comments}</div>
        </td>
      </tr>
      ` : ''}
    </table>
    
    <p style="margin-bottom: 30px;">To proceed with scheduling manufacturing slots and secure logistics bookings for this assignment, please access your account dashboard to review terms and submit your response.</p>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${process.env.FRONTEND_URL || 'https://cocoveera.com'}/dashboard/quotes" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            Review & Approve Proposal
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: `Quotation Proposal: ${productName}`, content });
};

export const getComparisonRecommendationTemplate = (name, recommendation) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Based on your agronomy requirements, our specialists have analyzed the best fit for your application.</p>
    
    <div style="background-color: #FCFBF9; border: 1px solid #E2DCD0; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Recommended Match</p>
      <p style="margin: 0 0 20px 0; font-weight: bold; font-family: Georgia, serif; color: #1E5B2E; font-size: 18px;">${recommendation.recommendedProduct}</p>
      
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Alternative Option</p>
      <p style="margin: 0; color: #2C2C2C;">${recommendation.alternativeProduct}</p>
    </div>
    
    <p style="color: #4A4A4A; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">${recommendation.summary}</p>
    <p style="color: #666666; font-size: 13px; font-style: italic;">For an in-depth breakdown of EC values, porosity, and crop suitability, please check the attached comparison PDF document.</p>
  `;
  return baseTemplate({ title: 'Cocoveera Product Analysis & Recommendation', content });
};

export const getHelpTicketTemplate = (name, ticket) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Your support request has been successfully created. Our team is reviewing the details and will contact you shortly.</p>
    
    <div style="background-color: #FCFBF9; border-left: 3px solid #9E7E53; padding: 15px 20px; border-radius: 4px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0;"><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
      <p style="margin: 0;"><strong>Summary:</strong> ${ticket.summary}</p>
    </div>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${process.env.FRONTEND_URL || 'https://cocoveera.com'}/dashboard/support/${ticket.ticketId}" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            View Ticket Status
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: `Support Ticket #${ticket.ticketId} Created`, content });
};

export const getAdminNotificationTemplate = (adminName, notification) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #E63946; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Admin Alert</h3>
    <p style="margin-bottom: 20px;">Hello ${adminName}, a new system event requires your attention.</p>
    
    <div style="background-color: #FFFDF9; border: 1px solid #E2DCD0; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Event Type</p>
      <p style="margin: 0 0 15px 0; font-weight: bold; color: #2C2C2C;">${notification.type}</p>
      
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Details</p>
      <p style="margin: 0; color: #555555;">${notification.details}</p>
    </div>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${process.env.FRONTEND_URL || 'https://cocoveera.com'}/admin" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            Open Admin Panel
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: `[Admin] New ${notification.type} Alert`, content });
};

export const getMarketingCampaignTemplate = (name, campaign) => {
  const content = `
    ${campaign.imageUrl ? `<img src="${campaign.imageUrl}" alt="Campaign" style="width: 100%; max-width: 600px; border-radius: 8px; margin-bottom: 25px;" />` : ''}
    <h2 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 22px; color: #1E5B2E; margin-top: 0; margin-bottom: 20px;">${campaign.title}</h2>
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 16px; color: #3A3A3A; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <div style="margin-bottom: 30px; line-height: 1.7; color: #4A4A4A;">
      ${campaign.message}
    </div>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${campaign.actionUrl || (process.env.FRONTEND_URL || 'https://cocoveera.com')}" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            ${campaign.actionText || 'Discover Now'}
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: campaign.subject, content });
};

export const getContactInquiryTemplate = (inquiry) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #E63946; margin-top: 0; font-weight: normal; margin-bottom: 20px;">New B2B Inquiry: ${inquiry.inquiryId}</h3>
    <p style="margin-bottom: 20px;">A new export inquiry has been received.</p>
    
    <div style="background-color: #FFFDF9; border: 1px solid #E2DCD0; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Sender Details</p>
      <p style="margin: 0 0 5px 0; color: #2C2C2C;"><strong>Name:</strong> ${inquiry.name}</p>
      <p style="margin: 0 0 5px 0; color: #2C2C2C;"><strong>Email:</strong> ${inquiry.email}</p>
      <p style="margin: 0 0 5px 0; color: #2C2C2C;"><strong>Phone:</strong> ${inquiry.phone || 'N/A'}</p>
      <p style="margin: 0 0 5px 0; color: #2C2C2C;"><strong>WhatsApp:</strong> ${inquiry.whatsapp || 'N/A'}</p>
      <p style="margin: 0 0 15px 0; color: #2C2C2C;"><strong>Company:</strong> ${inquiry.company || 'N/A'} - ${inquiry.country || 'N/A'}</p>
      
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Inquiry Details</p>
      <p style="margin: 0 0 5px 0; font-weight: bold; color: #2C2C2C;">Type: ${inquiry.inquiryType}</p>
      ${inquiry.productCategory ? `<p style="margin: 0 0 5px 0; color: #2C2C2C;"><strong>Product:</strong> ${inquiry.productCategory} - ${inquiry.productName}</p>` : ''}
      ${inquiry.requiredQuantity ? `<p style="margin: 0 0 15px 0; color: #2C2C2C;"><strong>Quantity:</strong> ${inquiry.requiredQuantity} ${inquiry.unitType}</p>` : ''}
      
      <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Message</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1E5B2E; border-radius: 4px;">
        <p style="margin: 0; color: #555555; white-space: pre-wrap;">${inquiry.message}</p>
      </div>
      
      ${inquiry.files && inquiry.files.length > 0 ? `
        <p style="margin: 15px 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Attachments</p>
        <ul style="margin: 0; padding-left: 20px; color: #2C2C2C;">
          ${inquiry.files.map(url => `<li><a href="${url}" target="_blank">View File</a></li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `;
  return baseTemplate({ title: `New Inquiry: ${inquiry.inquiryType}`, content });
};

export const getInquiryConfirmationTemplate = (inquiry) => {
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 22px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 15px;">Dear ${inquiry.name},</h3>
      <p style="font-size: 16px; color: #4A4A4A; line-height: 1.6; margin-bottom: 20px;">
        Thank you for contacting Cocoveera. We have successfully received your inquiry and our team is currently reviewing the information provided.
      </p>
    </div>
    
    <div style="background-color: #FCFBF9; border: 1px solid #E2DCD0; border-radius: 8px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <h4 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1E5B2E; border-bottom: 1px solid #E2DCD0; padding-bottom: 10px;">Inquiry Summary</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4A4A4A;">
        <tr><td style="padding: 8px 0; width: 40%; color: #666;"><strong>Inquiry ID:</strong></td><td style="font-weight: 600;">${inquiry.inquiryId}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Inquiry Type:</strong></td><td>${inquiry.inquiryType}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Company:</strong></td><td>${inquiry.company}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Country:</strong></td><td>${inquiry.country}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Submitted On:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
      </table>
      
      <h4 style="margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1E5B2E; border-bottom: 1px solid #E2DCD0; padding-bottom: 10px;">Message</h4>
      <p style="margin: 0; color: #555555; font-style: italic; white-space: pre-wrap; font-size: 14px;">${inquiry.message}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h4 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-bottom: 15px;">What Happens Next?</h4>
      <ul style="list-style: none; padding: 0; margin: 0; color: #4A4A4A; font-size: 15px; line-height: 1.8;">
        <li style="margin-bottom: 8px;">✓ Inquiry received successfully</li>
        <li style="margin-bottom: 8px;">✓ Assigned to our export support team</li>
        <li style="margin-bottom: 8px;">✓ Under review by product specialists</li>
        <li style="margin-bottom: 8px;">✓ Response within 24 business hours</li>
      </ul>
    </div>

    <div style="background-color: #F3F8F4; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
      <h4 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; margin-bottom: 15px;">Why Cocoveera?</h4>
      <ul style="list-style: none; padding: 0; margin: 0; color: #4A4A4A; font-size: 15px; line-height: 1.8;">
        <li style="margin-bottom: 5px;">✓ Premium Quality Coconut Substrates</li>
        <li style="margin-bottom: 5px;">✓ Global Export Standards</li>
        <li style="margin-bottom: 5px;">✓ Customized Solutions</li>
        <li style="margin-bottom: 5px;">✓ Reliable Logistics Support</li>
        <li style="margin-bottom: 5px;">✓ Dedicated Customer Assistance</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-bottom: 20px; font-size: 14px;">
      <p style="color: #666666; margin-bottom: 10px;">Need Immediate Assistance?</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:supportdesk@cocoveera.com" style="color: #1E5B2E; text-decoration: none;">supportdesk@cocoveera.com</a></p>
      <p style="margin: 5px 0;"><strong>Website:</strong> <a href="http://www.cocoveera.com" target="_blank" style="color: #1E5B2E; text-decoration: none;">www.cocoveera.com</a></p>
    </div>
  `;
  return baseTemplate({ title: `Thank You for Contacting Cocoveera | Inquiry Received Successfully`, preheader: 'We have received your inquiry. View details inside.', content });
};

