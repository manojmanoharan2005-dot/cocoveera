/**
 * File: backend/utils/EmailService.js
 * Purpose: Utility helper functions used across the backend.
 */
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.basePath = 'https://api.brevo.com/v3';
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const SENDERS = {
  admin: { email: 'adminteam@cocoveera.com', name: 'Cocoveera Admin' },
  service: { email: 'servicedesk@cocoveera.com', name: 'Cocoveera Service Desk' },
  support: { email: 'supportdesk@cocoveera.com', name: 'Cocoveera Support Desk' },
};

export const sendEmail = async (options, retries = 3) => {
  const { to, subject, textContent, htmlContent, senderType = 'service', attachment } = options;

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;
  sendSmtpEmail.sender = SENDERS[senderType];
  sendSmtpEmail.to = [{ email: to }];

  if (attachment) {
    sendSmtpEmail.attachment = attachment;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('API called successfully. Returned data: ', data);
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: `, error);
      if (i === retries - 1) {
        throw new Error('Failed to send email after multiple attempts');
      }
    }
  }
};

export const sendRegistrationOTP = async (to, otp) => {
  const subject = 'Your Registration OTP';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #fcfcfc; padding: 20px; margin: 0; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 1px;">Welcome to Cocoveera!</h1>
          <p style="color: #666; font-size: 14px; margin: 5px 0 20px 0;">Your Trusted Partner in 100% Natural Coconut Substrates</p>
        </div>
        <div style="border-top: 4px solid #2E7D32; max-width: 600px; margin: 0 auto;"></div>
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Hello,</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">We are thrilled to welcome you to the <strong>Cocoveera Global Network</strong>. To complete your registration and verify your account, please use the One-Time Password (OTP) below.</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2E7D32; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #555; font-weight: bold;">Your OTP Code is:</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #2E7D32; letter-spacing: 4px;">${otp}</p>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">This code is valid for the next 10 minutes. If you did not request this code, please ignore this email.</p>
          
          <div style="margin-top: 40px; text-align: center;">
            <p style="color: #555; font-size: 14px; margin-bottom: 5px;">If you have any questions, our support team is available at</p>
            <p style="margin: 0;"><strong style="color: #2E7D32;">supportdesk@cocoveera.com</strong></p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>Cocoveera Manufacturing & Exports<br>100% Biodegradable • OMRI Certified • Premium Quality</p>
        </div>
      </body>
    </html>
  `;
  return sendEmail({ to, subject, htmlContent, senderType: 'admin' });
};

export const sendOrderConfirmationWithInvoice = async (to, orderId, orderSummary, pdfBuffer) => {
  const subject = `Order Confirmation & Invoice - Order #${orderId}`;
  
  const shortOrderId = orderId.toString().slice(-8).toUpperCase();
  const orderDate = orderSummary.orderDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  let itemsHtml = '';
  if (orderSummary.items && orderSummary.items.length > 0) {
    itemsHtml = orderSummary.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #333; font-size: 14px;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #333; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #333; font-size: 14px; text-align: right;">Rs. ${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #333; font-size: 14px; text-align: right;">Rs. ${(item.unitPrice * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  let addressHtml = '';
  if (orderSummary.shippingAddress) {
    const addr = orderSummary.shippingAddress;
    addressHtml = `
      ${orderSummary.customerName}<br>
      ${addr.addressLine || addr.street || ''}<br>
      ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || addr.zip || ''}<br>
      ${addr.country || ''}<br>
      ${orderSummary.customerPhone ? `Tel: ${orderSummary.customerPhone}` : ''}
    `;
  } else {
    addressHtml = 'Address not provided';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #fcfcfc; padding: 20px; margin: 0;">
        <div style="max-w-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-top: 5px solid #2E7D32;">
          
          <!-- Header section -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 2px;">COCOVEERA</h1>
            <div style="width: 40px; height: 3px; background-color: #D4AF37; margin: 8px auto;"></div>
            <p style="color: #D4AF37; font-style: italic; font-size: 12px; margin: 5px 0 0 0; font-family: 'Times New Roman', Times, serif;">Premium Coconut Substrates & Lab Quality Testing</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin-bottom: 30px;">
          
          <p style="color: #2E7D32; font-weight: bold; font-size: 16px;">Dear ${orderSummary.customerName || 'Customer'},</p>
          <p style="color: #555; font-size: 14px; line-height: 1.5; margin-bottom: 30px;">Your order has been successfully placed and confirmed. We are currently preparing it for shipment from our processing facility.</p>
          
          <!-- Order Info Box -->
          <div style="border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 30px; display: table; width: 100%;">
            <div style="display: table-cell; width: 50%;">
              <p style="margin: 0; font-size: 10px; color: #888; font-weight: bold;">ORDER ID</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #333;">#${shortOrderId}</p>
            </div>
            <div style="display: table-cell; width: 50%;">
              <p style="margin: 0; font-size: 10px; color: #888; font-weight: bold;">ORDER DATE</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #333;">${orderDate}</p>
            </div>
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="background-color: #2E7D32; color: #fff; text-align: left; padding: 10px 12px; font-size: 13px;">Product</th>
                <th style="background-color: #2E7D32; color: #fff; text-align: center; padding: 10px 12px; font-size: 13px;">Qty</th>
                <th style="background-color: #2E7D32; color: #fff; text-align: right; padding: 10px 12px; font-size: 13px;">Price</th>
                <th style="background-color: #2E7D32; color: #fff; text-align: right; padding: 10px 12px; font-size: 13px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Grand Total -->
          <div style="text-align: right; margin-bottom: 40px;">
            <span style="font-size: 14px; font-weight: bold; color: #333; margin-right: 20px;">Grand Total:</span>
            <span style="font-size: 18px; font-weight: bold; color: #2E7D32;">Rs. ${(orderSummary.totalAmount || 0).toFixed(2)}</span>
          </div>
          
          <!-- Confirmed Stamp -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; border: 2px dashed #2E7D32; border-radius: 50%; padding: 25px; min-width: 80px; min-height: 80px;">
              <div style="color: #2E7D32; font-size: 16px; margin-bottom: 5px;">★ ★ ★</div>
              <div style="color: #2E7D32; font-weight: bold; font-size: 13px; letter-spacing: 1px; margin-bottom: 5px;">CONFIRMED</div>
              <div style="color: #2E7D32; font-size: 10px; font-weight: bold;">${orderDate}</div>
              <div style="color: #2E7D32; font-size: 16px; margin-top: 5px;">★ ★ ★</div>
            </div>
          </div>
          
          <!-- Shipping Destination -->
          <h3 style="color: #2E7D32; font-size: 15px; margin-bottom: 15px;">Shipping Destination</h3>
          <div style="border-left: 2px solid #2E7D32; padding-left: 15px; font-size: 13px; color: #555; line-height: 1.6;">
            ${addressHtml}
          </div>
          
        </div>
      </body>
    </html>
  `;

  // Provide the attachment as base64 or URL according to Brevo docs
  let attachment = [];
  if (pdfBuffer) {
    const base64Pdf = Buffer.isBuffer(pdfBuffer) ? pdfBuffer.toString('base64') : pdfBuffer;
    attachment.push({
      content: base64Pdf,
      name: `Invoice_${orderId}.pdf`,
    });
  }

  return sendEmail({ to, subject, htmlContent, senderType: 'service', attachment });
};

export const sendShipmentUpdate = async (to, orderId, trackingInfo) => {
  const subject = `Shipment Update - Order #${orderId}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #fcfcfc; padding: 20px; margin: 0; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 1px;">Shipment Update</h1>
          <p style="color: #666; font-size: 14px; margin: 5px 0 20px 0;">Your Trusted Partner in 100% Natural Coconut Substrates</p>
        </div>
        <div style="border-top: 4px solid #2E7D32; max-width: 600px; margin: 0 auto;"></div>
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Hello,</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">We have an update regarding your recent order <strong>#${orderId}</strong>.</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2E7D32; padding: 20px; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 15px; color: #333; font-weight: bold;">Tracking Information:</p>
            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">${trackingInfo}</p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="display: inline-block; background-color: #2E7D32; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Track Order in Dashboard</a>
          </div>

          <div style="margin-top: 40px; text-align: center;">
            <p style="color: #555; font-size: 14px; margin-bottom: 5px;">If you have any questions, our logistics team is available at</p>
            <p style="margin: 0;"><strong style="color: #2E7D32;">servicedesk@cocoveera.com</strong></p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>Cocoveera Manufacturing & Exports<br>100% Biodegradable • OMRI Certified • Premium Quality</p>
        </div>
      </body>
    </html>
  `;
  return sendEmail({ to, subject, htmlContent, senderType: 'service' });
};

export const sendContactResponse = async (to, replyText) => {
  const subject = 'Reply to your Enquiry';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #fcfcfc; padding: 20px; margin: 0; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 1px;">Support Response</h1>
          <p style="color: #666; font-size: 14px; margin: 5px 0 20px 0;">Your Trusted Partner in 100% Natural Coconut Substrates</p>
        </div>
        <div style="border-top: 4px solid #2E7D32; max-width: 600px; margin: 0 auto;"></div>
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Hello,</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Thank you for contacting Cocoveera Support. We have an update regarding your inquiry:</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2E7D32; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6; white-space: pre-wrap;">${replyText}</p>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">If you have further questions or need more assistance, simply reply directly to this email.</p>
          
          <div style="margin-top: 40px; text-align: center;">
            <p style="color: #555; font-size: 14px; margin-bottom: 5px;">Best Regards,</p>
            <p style="margin: 0;"><strong style="color: #2E7D32;">Cocoveera Support Team</strong></p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>Cocoveera Manufacturing & Exports<br>100% Biodegradable • OMRI Certified • Premium Quality</p>
        </div>
      </body>
    </html>
  `;
  return sendEmail({ to, subject, htmlContent, senderType: 'support' });
};

export const sendRefundNotificationEmail = async (to, refundStatus, amount, currency, orderId) => {
  const subjects = {
    requested: `Refund Requested - Order #${orderId}`,
    approved: `Refund Approved - Order #${orderId}`,
    initiated: `Refund Initiated - Order #${orderId}`,
    processed: `Refund Completed - Order #${orderId}`,
    failed: `Refund Failed - Order #${orderId}`,
  };

  const messages = {
    requested: `We have received your refund request for Order #${orderId} for the amount of Rs. ${amount.toFixed(2)}. Our team is currently reviewing it.`,
    approved: `Great news! Your refund request for Order #${orderId} for Rs. ${amount.toFixed(2)} has been approved. We will initiate the refund to your original payment method shortly.`,
    initiated: `Your refund of Rs. ${amount.toFixed(2)} for Order #${orderId} has been successfully initiated to your original payment method. It may take 3-5 business days to reflect in your account.`,
    processed: `Your refund of Rs. ${amount.toFixed(2)} for Order #${orderId} has been successfully processed and completed.`,
    failed: `Unfortunately, we encountered an error while attempting to process your refund of Rs. ${amount.toFixed(2)} for Order #${orderId}. Our team has been notified and will manually review this issue.`,
  };

  const subject = subjects[refundStatus] || `Refund Update - Order #${orderId}`;
  const message = messages[refundStatus] || `There is an update on your refund for Order #${orderId}.`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #fcfcfc; padding: 20px; margin: 0; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 1px;">Refund Update</h1>
        </div>
        <div style="border-top: 4px solid #2E7D32; max-width: 600px; margin: 0 auto;"></div>
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Hello,</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">${message}</p>
          <div style="margin-top: 40px; text-align: center;">
            <p style="color: #555; font-size: 14px; margin-bottom: 5px;">Best Regards,</p>
            <p style="margin: 0;"><strong style="color: #2E7D32;">Cocoveera Support Team</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendEmail({ to, subject, htmlContent, senderType: 'service' });
};
