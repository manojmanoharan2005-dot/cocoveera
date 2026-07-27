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
  const invoiceNum = orderSummary.invoiceNumber || `INV-${shortOrderId}`;
  const subject = `Tax Invoice & Order Confirmation - ${invoiceNum}`;
  
  const orderDate = orderSummary.orderDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  let formattedPhone = orderSummary.customerPhone || '';
  if (formattedPhone && !formattedPhone.startsWith('+') && formattedPhone.length > 10) {
    const diff = formattedPhone.length - 10;
    formattedPhone = '+' + formattedPhone.substring(0, diff) + ' ' + formattedPhone.substring(diff);
  }

  const curr = orderSummary.currency === 'INR' ? '₹' : (orderSummary.currency === 'EUR' ? '€' : (orderSummary.currency === 'GBP' ? '£' : '$'));
  
  let itemsHtml = '';
  if (orderSummary.items && orderSummary.items.length > 0) {
    itemsHtml = orderSummary.items.map((item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#F9FAFB' : '#FFFFFF'};">
        <td style="padding: 10px 12px; font-size: 11px; color: #374151; font-weight: 500; border-bottom: 1px solid #E5E7EB;">
          ${item.productName || item.name || 'Product'}
        </td>
        <td style="padding: 10px 12px; font-size: 11px; color: #6B7280; border-bottom: 1px solid #E5E7EB;">
          ${item.sku || 'COCO-ITEM'}
        </td>
        <td align="center" style="padding: 10px 12px; font-size: 11px; color: #6B7280; border-bottom: 1px solid #E5E7EB;">
          ${(item.quantity || 1).toFixed ? (item.quantity || 1).toFixed(2) : (item.quantity || 1)}
        </td>
        <td align="right" style="padding: 10px 12px; font-size: 11px; color: #6B7280; border-bottom: 1px solid #E5E7EB;">
          ${Math.round(item.pieces || item.quantity || 0).toLocaleString()}
        </td>
        <td align="right" style="padding: 10px 12px; font-size: 11px; color: #6B7280; border-bottom: 1px solid #E5E7EB;">
          ${curr}${(item.unitPrice || item.price || 0).toFixed(2)}
        </td>
        <td align="right" style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #111827; border-bottom: 1px solid #E5E7EB;">
          ${curr}${((item.unitPrice || item.price || 0) * (item.pieces || item.quantity || 1)).toFixed(2)}
        </td>
      </tr>
    `).join('');
  }

  const subtotal = orderSummary.subtotal || (orderSummary.items || []).reduce((acc, i) => acc + ((i.unitPrice || i.price || 0) * (i.pieces || i.quantity || 1)), 0);
  const discount = orderSummary.discount || 0;
  const shippingCharge = orderSummary.shippingCharge || 0;
  const tax = orderSummary.tax || 0;
  const totalAmount = orderSummary.totalAmount || (subtotal - discount + shippingCharge + tax);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; background-color: #F3F4F6; padding: 20px; margin: 0; color: #374151;">
        <div style="max-width: 700px; margin: 0 auto; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 25px;">
          
          <!-- Header Section -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px;">
            <tr>
              <td width="60%" valign="top">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle" style="padding-right: 12px;">
                      <img src="https://res.cloudinary.com/dyrfiop7d/image/upload/v1780933359/cocoveera_assets/logo.png" alt="COCOVEERA Logo" style="max-height: 55px; display: block;" />
                    </td>
                    <td valign="middle">
                      <h1 style="color: #2E7D32; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.1;">Cocoveera</h1>
                      <p style="color: #6B7280; font-style: italic; font-size: 11px; margin: 4px 0 0 0;">Premium Coir substrates exports and Quality testing</p>
                    </td>
                  </tr>
                </table>
              </td>
              <td width="40%" align="right" valign="top">
                <h2 style="color: #2E7D32; font-size: 22px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">TAX INVOICE</h2>
                <table border="0" cellpadding="2" cellspacing="0" style="font-size: 11px; color: #374151;">
                  <tr>
                    <td align="right" style="font-weight: bold; padding-right: 5px;">Invoice Number:</td>
                    <td align="right" style="color: #111827;">${invoiceNum}</td>
                  </tr>
                  <tr>
                    <td align="right" style="font-weight: bold; padding-right: 5px;">Invoice Date:</td>
                    <td align="right" style="color: #111827;">${orderDate}</td>
                  </tr>
                  <tr>
                    <td align="right" style="font-weight: bold; padding-right: 5px;">Order Number:</td>
                    <td align="right" style="color: #111827;">${shortOrderId}</td>
                  </tr>
                  <tr>
                    <td align="right" style="font-weight: bold; padding-right: 5px;">Status:</td>
                    <td align="right" style="color: #2E7D32; font-weight: bold;">${(orderSummary.paymentStatus || 'PAID').toUpperCase()}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <div style="border-top: 2px solid #2E7D32; margin-bottom: 20px;"></div>
          
          <!-- Company & Customer Info Section -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; font-size: 11px;">
            <tr>
              <td width="48%" valign="top">
                <h3 style="color: #2E7D32; font-size: 12px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">FROM:</h3>
                <div style="font-weight: bold; color: #111827; font-size: 12px; margin-bottom: 4px;">COCOVEERA</div>
                <div style="color: #4B5563; line-height: 1.5;">
                  96/1, Vikas Layout, Kalluri Nagar,<br>
                  Anna Nagar, Peelamedu,<br>
                  Coimbatore, Tamil Nadu – 641004<br><br>
                  <strong>GST:</strong> 33OOTPK6234P1ZV<br>
                  <strong>Contact:</strong> +91 63834 69877, +91 95972 93490<br>
                  <strong>Email:</strong> servicedesk@cocoveera.com<br>
                  <strong>Web:</strong> www.cocoveera.com
                </div>
              </td>
              <td width="4%"></td>
              <td width="48%" valign="top">
                <h3 style="color: #2E7D32; font-size: 12px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">BILL TO / SHIP TO:</h3>
                <div style="font-weight: bold; color: #111827; font-size: 12px; margin-bottom: 4px;">${orderSummary.customerName || 'Customer'}</div>
                <div style="color: #4B5563; line-height: 1.5;">
                  ${orderSummary.shippingAddress?.street || orderSummary.shippingAddress?.addressLine || 'Address not provided'}<br>
                  ${orderSummary.shippingAddress?.city || ''}${orderSummary.shippingAddress?.state ? `, ${orderSummary.shippingAddress.state}` : ''} ${orderSummary.shippingAddress?.zip || orderSummary.shippingAddress?.postalCode || ''}<br>
                  ${orderSummary.shippingAddress?.country || ''}<br><br>
                  ${orderSummary.customerEmail ? `<strong>Email:</strong> ${orderSummary.customerEmail}<br>` : ''}
                  ${formattedPhone ? `<strong>Contact:</strong> ${formattedPhone}` : ''}
                </div>
              </td>
            </tr>
          </table>
          
          <div style="border-top: 1px solid #E5E7EB; margin-bottom: 20px;"></div>
          
          <!-- Logistics & Shipping Boxes -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
            <tr>
              <td width="48%" valign="top" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 4px; padding: 12px;">
                <h4 style="color: #2E7D32; font-size: 11px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">EXPORT LOGISTICS</h4>
                <table border="0" cellpadding="2" cellspacing="0" width="100%" style="font-size: 10px; color: #4B5563;">
                  <tr><td><strong>Container Type:</strong></td><td align="right">${orderSummary.containerType || '20 ft'}</td></tr>
                  <tr><td><strong>Total Containers:</strong></td><td align="right">${(orderSummary.totalContainers || 1).toFixed ? (orderSummary.totalContainers || 1).toFixed(2) : 1}</td></tr>
                  <tr><td><strong>Total Pieces:</strong></td><td align="right">${Math.round(orderSummary.totalPieces || 0).toLocaleString()}</td></tr>
                  <tr><td><strong>Estimated Weight:</strong></td><td align="right">${(orderSummary.estimatedWeight || 0).toLocaleString()} KG</td></tr>
                  <tr><td><strong>Estimated Volume:</strong></td><td align="right">${(orderSummary.estimatedVolume || 0).toFixed(2)} CBM</td></tr>
                </table>
              </td>
              <td width="4%"></td>
              <td width="48%" valign="top" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 4px; padding: 12px;">
                <h4 style="color: #2E7D32; font-size: 11px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">SHIPPING INFORMATION</h4>
                <table border="0" cellpadding="2" cellspacing="0" width="100%" style="font-size: 10px; color: #4B5563;">
                  <tr><td><strong>Shipping Method:</strong></td><td align="right">${orderSummary.shippingMethod || 'Sea Freight'}</td></tr>
                  <tr><td><strong>Origin Port:</strong></td><td align="right">${orderSummary.portOfLoading || 'Origin Port'}</td></tr>
                  <tr><td><strong>Destination Port:</strong></td><td align="right">${orderSummary.portOfDischarge || 'Destination Port'}</td></tr>
                  <tr><td><strong>Incoterms:</strong></td><td align="right">${orderSummary.incoterms || 'FOB'}</td></tr>
                  <tr><td><strong>Transit Time:</strong></td><td align="right">${orderSummary.transitTime || 'Standard ETA'}</td></tr>
                  ${orderSummary.expectedDeliveryDate ? `<tr><td><strong>Expected Delivery:</strong></td><td align="right">${orderSummary.expectedDeliveryDate}</td></tr>` : ''}
                </table>
              </td>
            </tr>
          </table>
          
          <!-- Product Table -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #2E7D32; color: #FFFFFF; font-size: 10px; text-transform: uppercase;">
                <th align="left" style="padding: 8px 12px;">Product Name</th>
                <th align="left" style="padding: 8px 12px;">SKU</th>
                <th align="center" style="padding: 8px 12px;">Containers</th>
                <th align="right" style="padding: 8px 12px;">Total Pieces</th>
                <th align="right" style="padding: 8px 12px;">Unit Price</th>
                <th align="right" style="padding: 8px 12px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Summary Section -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
            <tr>
              <td width="50%"></td>
              <td width="50%" align="right">
                <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 11px; color: #374151;">
                  <tr>
                    <td align="right" style="font-weight: bold;">Items Total:</td>
                    <td align="right" width="100">${curr}${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td align="right" style="font-weight: bold;">Discount:</td>
                    <td align="right" style="color: #2E7D32;">${curr}${discount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td align="right" style="font-weight: bold;">Delivery Charges:</td>
                    <td align="right">${curr}${shippingCharge.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td align="right" style="font-weight: bold;">Handling Charges:</td>
                    <td align="right">${curr}0.00</td>
                  </tr>
                  <tr>
                    <td align="right" style="font-weight: bold;">Tax / GST:</td>
                    <td align="right">${curr}${tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top: 1px solid #E5E7EB; padding: 2px 0;"></td>
                  </tr>
                  <tr>
                    <td align="right" style="font-size: 13px; font-weight: bold; color: #2E7D32;">GRAND TOTAL:</td>
                    <td align="right" style="font-size: 13px; font-weight: bold; color: #2E7D32;">${curr}${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- Payment Info & Signature -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px; font-size: 11px;">
            <tr>
              <td width="50%" valign="top">
                <h4 style="color: #2E7D32; font-size: 11px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">PAYMENT INFORMATION</h4>
                <table border="0" cellpadding="2" cellspacing="0" style="color: #4B5563; font-size: 10px;">
                  <tr><td><strong>Method:</strong></td><td style="padding-left: 10px;">${orderSummary.paymentMethod || 'Card / Wire'}</td></tr>
                  <tr><td><strong>Transaction Ref:</strong></td><td style="padding-left: 10px;">${orderSummary.transactionId || 'N/A'}</td></tr>
                  <tr><td><strong>Paid Date:</strong></td><td style="padding-left: 10px;">${orderSummary.paymentDate || orderDate}</td></tr>
                  <tr><td><strong>Status:</strong></td><td style="padding-left: 10px; color: #2E7D32; font-weight: bold;">${(orderSummary.paymentStatus || 'PAID').toUpperCase()}</td></tr>
                </table>
              </td>
              <td width="50%" align="center" valign="top">
                <h4 style="color: #374151; font-size: 11px; font-weight: bold; margin: 0 0 25px 0; text-transform: uppercase;">AUTHORIZED SIGNATURE</h4>
                <div style="border-bottom: 1px solid #D1D5DB; width: 180px; margin: 0 auto 6px auto;"></div>
                <div style="font-size: 9px; color: #6B7280;">Company Seal</div>
                <div style="font-size: 9px; color: #6B7280; font-style: italic;">Generated By Cocoveera ERP System</div>
              </td>
            </tr>
          </table>
          
          <!-- Footer Bar -->
          <div style="border-top: 2px solid #2E7D32; padding-top: 12px; text-align: center; font-size: 10px;">
            <div style="color: #2E7D32; font-weight: bold; font-size: 12px; margin-bottom: 4px;">Thank You For Choosing Cocoveera</div>
            <div style="color: #6B7280; margin-bottom: 2px;">Verification: team@cocoveera.com | Support: servicedesk@cocoveera.com</div>
            <div style="color: #6B7280;">Website: www.cocoveera.com</div>
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
