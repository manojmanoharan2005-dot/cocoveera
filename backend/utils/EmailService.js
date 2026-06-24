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
  admin: { email: 'adminteam@cocoveera.com', name: 'COCOVEERA Admin Team' },
  service: { email: 'servicedesk@cocoveera.com', name: 'COCOVEERA Service Desk' },
  support: { email: 'supportdesk@cocoveera.com', name: 'COCOVEERA Support Desk' },
};

export const sendEmail = async (options, retries = 3) => {
  const { to, subject, textContent, htmlContent, senderType = 'service', attachment } = options;

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;
  sendSmtpEmail.sender = SENDERS[senderType];
  sendSmtpEmail.to = [{ email: to }];

  if (attachment && attachment.length > 0) {
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
  const shortOrderId = orderId.toString().slice(-8).toUpperCase();
  const subject = `Order Confirmation & Invoice - Order #${shortOrderId}`;
  
  const orderDate = orderSummary.orderDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  let formattedPhone = orderSummary.customerPhone || '';
  if (formattedPhone && !formattedPhone.startsWith('+') && formattedPhone.length > 10) {
    const diff = formattedPhone.length - 10;
    formattedPhone = '+' + formattedPhone.substring(0, diff) + ' ' + formattedPhone.substring(diff);
  }
  
  let itemsHtml = '';
  if (orderSummary.items && orderSummary.items.length > 0) {
    itemsHtml = orderSummary.items.map(item => `
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #374151; font-size: 11px; font-weight: 500;">
          ${item.productName || 'Product'}
        </td>
        <td align="center" style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 11px;">${Math.round(item.pieces || item.quantity)}</td>
        <td align="right" style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 11px;">₹${(item.unitPrice || 0).toFixed(2)}</td>
        <td align="right" style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 11px; font-weight: bold;">₹${((item.unitPrice || 0) * (item.pieces || item.quantity)).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Inter', Arial, sans-serif; background-color: #F4F6F8; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header section -->
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-top: 5px solid #2E7D32;">
            <img src="https://res.cloudinary.com/dyrfiop7d/image/upload/v1780933359/cocoveera_assets/logo.png" alt="COCOVEERA Logo" style="max-height: 60px; margin: 0 auto; display: block;" />
            <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 2px;">COCOVEERA</h1>
            <div style="width: 40px; height: 3px; background-color: #D4AF37; margin: 8px auto;"></div>
            <p style="color: #D4AF37; font-style: italic; font-size: 12px; margin: 5px 0 0 0; font-family: 'Times New Roman', Times, serif;">Premium Coconut Substrates & Lab Quality Testing</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin-top: 0; margin-bottom: 10px;">
          
          <!-- Status Banner Box -->
          <div style="background-color: #05966915; border: 1px solid #05966940; border-radius: 8px; padding: 20px; margin: 20px;">
            <h2 style="color: #059669; font-size: 18px; margin: 0 0 10px 0;">✅ Order Confirmed!</h2>
            <p style="color: #4B5563; font-size: 12px; margin: 0; line-height: 1.5;">Dear ${orderSummary.customerName || 'Customer'}, your order status has been updated. We are preparing it for shipment.</p>
          </div>
          
          <!-- 3 Info Cards -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 0 20px; margin-bottom: 30px;">
            <tr>
              <td width="31%" style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; background: #FAFAFA;">
                <div style="font-size: 9px; font-weight: bold; color: #6B7280; margin-bottom: 4px; text-transform: uppercase;">ORDER ID</div>
                <div style="font-size: 12px; font-weight: bold; color: #111827;">#${shortOrderId}</div>
              </td>
              <td width="3%"></td>
              <td width="31%" style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; background: #FAFAFA;">
                <div style="font-size: 9px; font-weight: bold; color: #6B7280; margin-bottom: 4px; text-transform: uppercase;">ORDER DATE</div>
                <div style="font-size: 11px; font-weight: bold; color: #111827;">${orderDate}</div>
              </td>
              <td width="3%"></td>
              <td width="32%" style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; background: #FAFAFA;">
                <div style="font-size: 9px; font-weight: bold; color: #6B7280; margin-bottom: 4px; text-transform: uppercase;">PAYMENT</div>
                <div style="font-size: 12px; font-weight: bold; color: #111827;">${orderSummary.paymentMethod || 'COD'}</div>
              </td>
            </tr>
          </table>
          
          <!-- Order Details Table -->
          <div style="padding: 0 20px;">
            <h3 style="font-size: 15px; color: #111827; margin: 0 0 15px 0;">Order Details</h3>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 0;">
              <thead>
                <tr>
                  <th align="left" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">PRODUCT</th>
                  <th align="center" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">QTY</th>
                  <th align="right" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">PRICE</th>
                  <th align="right" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div style="background-color: #F9FAFB; padding: 15px; text-align: right; border-radius: 0 0 6px 6px; margin-bottom: 30px;">
              <span style="font-size: 12px; font-weight: bold; color: #4B5563; margin-right: 15px;">Grand Total:</span>
              <span style="font-size: 16px; font-weight: 900; color: #059669;">₹${(orderSummary.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <!-- Shipping and Seal -->
          <div style="padding: 0 20px; margin-bottom: 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="55%" valign="top">
                  <h3 style="font-size: 14px; color: #111827; margin: 0 0 10px 0;">Shipping Destination</h3>
                  <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; background: #FAFAFA;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #111827;">${orderSummary.customerName || 'Customer'}</p>
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #6B7280; line-height: 1.5;">
                      ${orderSummary.shippingAddress?.street || orderSummary.shippingAddress?.addressLine || 'Address not provided'}<br>
                      ${orderSummary.shippingAddress?.city || ''}, ${orderSummary.shippingAddress?.state || ''} - ${orderSummary.shippingAddress?.zip || orderSummary.shippingAddress?.postalCode || ''}<br>
                      ${orderSummary.shippingAddress?.country || ''}
                    </p>
                    ${formattedPhone ? `<p style="margin: 0; font-size: 11px; color: #4B5563; font-weight: 500;">📞 ${formattedPhone}</p>` : ''}
                  </div>
                </td>
                <td width="5%"></td>
                <td width="40%" valign="middle" align="center">
                  <!-- Dynamic Seal with Double Border -->
                  <table align="right" border="0" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
                    <tr>
                      <td style="border: 3px solid #059669; border-radius: 50%; padding: 4px;">
                        <table border="0" cellpadding="0" cellspacing="0" style="border: 2px dashed #059669; border-radius: 50%; width: 130px; height: 130px;">
                          <tr>
                            <td align="center" valign="middle">
                              <div style="color: #059669; font-size: 14px; letter-spacing: 4px; line-height: 1; margin-bottom: 8px;">★ ★ ★</div>
                              <div style="color: #059669; font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif; margin-bottom: 5px;">CONFIRMED</div>
                              <div style="color: #059669; font-size: 8px; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 8px; letter-spacing: 0.5px;">${orderDate.toUpperCase()}</div>
                              <div style="color: #059669; font-size: 14px; letter-spacing: 4px; line-height: 1;">★ ★ ★</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          
        </div>
      </body>
    </html>
  `;

  // Provide the attachment as base64 or URL according to Brevo docs
  let attachment = null;
  if (pdfBuffer) {
    const base64Pdf = Buffer.isBuffer(pdfBuffer) ? pdfBuffer.toString('base64') : pdfBuffer;
    attachment = [{
      content: base64Pdf,
      name: `Invoice_${orderId}.pdf`,
    }];
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

export const sendStatusUpdateEmail = async (to, order, status) => {
  const shortOrderId = order._id.toString().slice(-8).toUpperCase();
  const subject = `Order Update: #${shortOrderId} is now ${status.toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const customerName = order.user?.name || 'Customer';

  const getStatusColor = (s) => {
    switch(s.toLowerCase()) {
      case 'pending': return '#D97706'; // Amber
      case 'confirmed': return '#059669'; // Emerald/Green (matches screenshot)
      case 'packed': return '#7C3AED'; // Purple
      case 'loaded': return '#EA580C'; // Orange
      case 'shipped': return '#2563EB'; // Blue
      case 'delivered': return '#16A34A'; // Green
      case 'cancelled': return '#DC2626'; // Red
      default: return '#2E7D32';
    }
  };

  const color = getStatusColor(status);

  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #374151; font-size: 11px; font-weight: 500;">
          ${item.product?.name || 'Product'}
        </td>
        <td align="center" style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 11px;">${Math.round(item.pieces || item.quantity)}</td>
        <td align="right" style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 11px;">₹${(item.unitPrice || 0).toFixed(2)}</td>
        <td align="right" style="padding: 15px 0; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 11px; font-weight: bold;">₹${((item.unitPrice || 0) * (item.pieces || item.quantity)).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const paymentMethod = order.paymentStatus === 'paid' ? 'PREPAID' : 'COD';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Inter', Arial, sans-serif; background-color: #F4F6F8; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header section -->
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-top: 5px solid #2E7D32;">
            <img src="https://res.cloudinary.com/dyrfiop7d/image/upload/v1780933359/cocoveera_assets/logo.png" alt="COCOVEERA Logo" style="max-height: 60px; margin: 0 auto; display: block;" />
            <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 2px;">COCOVEERA</h1>
            <div style="width: 40px; height: 3px; background-color: #D4AF37; margin: 8px auto;"></div>
            <p style="color: #D4AF37; font-style: italic; font-size: 12px; margin: 5px 0 0 0; font-family: 'Times New Roman', Times, serif;">Premium Coconut Substrates & Lab Quality Testing</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin-top: 0; margin-bottom: 10px;">
          
          <!-- Status Banner Box -->
          <div style="background-color: ${color}15; border: 1px solid ${color}40; border-radius: 8px; padding: 20px; margin: 20px;">
            <h2 style="color: ${color}; font-size: 18px; margin: 0 0 10px 0;">✅ Order ${status.charAt(0).toUpperCase() + status.slice(1)}!</h2>
            <p style="color: #4B5563; font-size: 12px; margin: 0; line-height: 1.5;">Dear ${customerName}, your order status has been updated. We are preparing it for shipment.</p>
          </div>
          
          <!-- 3 Info Cards -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 0 20px; margin-bottom: 30px;">
            <tr>
              <td width="31%" style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; background: #FAFAFA;">
                <div style="font-size: 9px; font-weight: bold; color: #6B7280; margin-bottom: 4px; text-transform: uppercase;">ORDER ID</div>
                <div style="font-size: 12px; font-weight: bold; color: #111827;">#${shortOrderId}</div>
              </td>
              <td width="3%"></td>
              <td width="31%" style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; background: #FAFAFA;">
                <div style="font-size: 9px; font-weight: bold; color: #6B7280; margin-bottom: 4px; text-transform: uppercase;">ORDER DATE</div>
                <div style="font-size: 11px; font-weight: bold; color: #111827;">${orderDate}</div>
              </td>
              <td width="3%"></td>
              <td width="32%" style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; background: #FAFAFA;">
                <div style="font-size: 9px; font-weight: bold; color: #6B7280; margin-bottom: 4px; text-transform: uppercase;">PAYMENT</div>
                <div style="font-size: 12px; font-weight: bold; color: #111827;">${paymentMethod}</div>
              </td>
            </tr>
          </table>
          
          <!-- Order Details Table -->
          <div style="padding: 0 20px;">
            <h3 style="font-size: 15px; color: #111827; margin: 0 0 15px 0;">Order Details</h3>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 0;">
              <thead>
                <tr>
                  <th align="left" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">PRODUCT</th>
                  <th align="center" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">QTY</th>
                  <th align="right" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">PRICE</th>
                  <th align="right" style="font-size: 10px; font-weight: bold; color: #6B7280; text-transform: uppercase; padding: 10px 0; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB;">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div style="background-color: #F9FAFB; padding: 15px; text-align: right; border-radius: 0 0 6px 6px; margin-bottom: 30px;">
              <span style="font-size: 12px; font-weight: bold; color: #4B5563; margin-right: 15px;">Grand Total:</span>
              <span style="font-size: 16px; font-weight: 900; color: ${color};">₹${(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <!-- Shipping and Seal -->
          <div style="padding: 0 20px; margin-bottom: 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="55%" valign="top">
                  <h3 style="font-size: 14px; color: #111827; margin: 0 0 10px 0;">Shipping Destination</h3>
                  <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; background: #FAFAFA;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #111827;">${customerName}</p>
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #6B7280; line-height: 1.5;">
                      ${order.shippingAddress?.street || order.shippingAddress?.addressLine || 'Address not provided'}<br>
                      ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zip || order.shippingAddress?.postalCode || ''}<br>
                      ${order.shippingAddress?.country || ''}
                    </p>
                    ${order.user?.phone ? `<p style="margin: 0; font-size: 11px; color: #4B5563; font-weight: 500;">📞 ${order.user.phone}</p>` : ''}
                  </div>
                </td>
                <td width="5%"></td>
                <td width="40%" valign="middle" align="center">
                  <!-- Dynamic Seal with Double Border -->
                  <table align="right" border="0" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
                    <tr>
                      <td style="border: 3px solid ${color}; border-radius: 50%; padding: 4px;">
                        <table border="0" cellpadding="0" cellspacing="0" style="border: 2px dashed ${color}; border-radius: 50%; width: 130px; height: 130px;">
                          <tr>
                            <td align="center" valign="middle">
                              <div style="color: ${color}; font-size: 14px; letter-spacing: 4px; line-height: 1; margin-bottom: 8px;">★ ★ ★</div>
                              <div style="color: ${color}; font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif; margin-bottom: 5px;">${status}</div>
                              <div style="color: ${color}; font-size: 8px; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 8px; letter-spacing: 0.5px;">${dateStr}</div>
                              <div style="color: ${color}; font-size: 14px; letter-spacing: 4px; line-height: 1;">★ ★ ★</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Footer Note -->
          <div style="padding: 0 20px 30px 20px;">
            <div style="border: 1px dashed #93C5FD; background-color: #EFF6FF; border-radius: 6px; padding: 15px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #1E3A8A; font-weight: 500;">
                We will notify you once your order status updates. Expected delivery depends on your chosen shipping method.
              </p>
            </div>
          </div>
          
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

export const sendNotificationEmail = async (to, subject, message) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #fcfcfc; padding: 20px; margin: 0; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2E7D32; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 1px;">Cocoveera Update</h1>
        </div>
        <div style="border-top: 4px solid #2E7D32; max-width: 600px; margin: 0 auto;"></div>
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Hello,</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">${message}</p>
          <div style="margin-top: 40px; text-align: center;">
            <p style="color: #555; font-size: 14px; margin-bottom: 5px;">Best Regards,</p>
            <p style="margin: 0;"><strong style="color: #2E7D32;">Cocoveera Team</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendEmail({ to, subject, htmlContent, senderType: 'service' });
};

export const sendOrderCancellationEmail = async (to, orderId, reason, cancellationDate, refundStatus) => {
  const shortOrderId = orderId.toString().slice(-8).toUpperCase();
  const subject = `Order Cancelled - Order #${shortOrderId}`;
  const dateStr = new Date(cancellationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Inter', Arial, sans-serif; background-color: #F4F6F8; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-top: 5px solid #DC2626;">
            <h1 style="color: #DC2626; font-family: 'Times New Roman', Times, serif; font-size: 28px; margin: 10px 0 0 0; letter-spacing: 2px;">COCOVEERA</h1>
            <p style="color: #D4AF37; font-style: italic; font-size: 12px; margin: 5px 0 0 0;">Premium Coconut Substrates & Lab Quality Testing</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin-top: 0; margin-bottom: 10px;">
          
          <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 20px; margin: 20px;">
            <h2 style="color: #DC2626; font-size: 18px; margin: 0 0 10px 0;">❌ Order Cancelled</h2>
            <p style="color: #4B5563; font-size: 14px; margin: 0; line-height: 1.5;">Your order <strong>#${shortOrderId}</strong> has been successfully cancelled as requested.</p>
          </div>
          
          <div style="padding: 0 20px 20px 20px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 6px;">
              <tr>
                <td style="padding: 15px; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-size: 11px; font-weight: bold; color: #6B7280; text-transform: uppercase;">Cancellation Date</span><br>
                  <span style="font-size: 14px; color: #111827; font-weight: 500;">${dateStr}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px; border-bottom: 1px solid #E5E7EB;">
                  <span style="font-size: 11px; font-weight: bold; color: #6B7280; text-transform: uppercase;">Reason</span><br>
                  <span style="font-size: 14px; color: #111827; font-weight: 500;">${reason}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px;">
                  <span style="font-size: 11px; font-weight: bold; color: #6B7280; text-transform: uppercase;">Refund Status</span><br>
                  <span style="font-size: 14px; color: #111827; font-weight: 500;">${refundStatus}</span>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 0 20px 30px 20px;">
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 0;">If you have any questions or need further assistance, please contact our support team at <strong style="color: #2E7D32;">supportdesk@cocoveera.com</strong>.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendEmail({ to, subject, htmlContent, senderType: 'service' });
};
