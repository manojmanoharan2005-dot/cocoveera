/**
 * File: backend/utils/emailTemplates/orderTemplates.js
 * Purpose: Utility helper functions used across the backend.
 */
import { baseTemplate } from './baseTemplate.js';

const getSealHTML = (text, dateStr) => {
  return `
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
      <tr>
        <td align="center" valign="middle" style="width: 140px; height: 140px; border: 4px solid #1E5B2E; border-radius: 50%; background-color: #FFFFFF; padding: 4px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" style="border: 2px dashed #1E5B2E; border-radius: 50%;">
            <tr>
              <td align="center" valign="middle" style="padding: 10px;">
                <div style="color: #1E5B2E; font-size: 12px; letter-spacing: 3px; line-height: 1;">★ ★ ★</div>
                <div style="color: #1E5B2E; font-weight: 900; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; font-family: Georgia, 'Times New Roman', Times, serif; margin: 8px 0;">${text}</div>
                <div style="color: #1E5B2E; font-size: 10px; font-weight: bold; font-family: Georgia, 'Times New Roman', Times, serif; margin-bottom: 8px;">${dateStr}</div>
                <div style="color: #1E5B2E; font-size: 12px; letter-spacing: 3px; line-height: 1;">★ ★ ★</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

const renderOrderDetails = (order) => {
  if (!order || !order.items) return '';
  const rows = order.items.map(item => `
    <tr>
      <td style="padding: 12px; font-size: 14px; border-bottom: 1px solid #E2DCD0; color: #2C2C2C;">${item.name}</td>
      <td style="padding: 12px; text-align: center; border-bottom: 1px solid #E2DCD0;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #E2DCD0;">$${parseFloat(item.price).toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #E2DCD0;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border-collapse: collapse; border: 1px solid #E2DCD0; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
      <tr style="background: linear-gradient(to right, #1E5B2E, #2E7D32); color: #FFFFFF;">
        <th align="left" style="padding: 14px 18px; font-family: Georgia, serif; font-size: 14px; font-weight: normal; letter-spacing: 1px;">Product</th>
        <th align="center" style="padding: 14px 18px; font-family: Georgia, serif; font-size: 14px; font-weight: normal;">Qty</th>
        <th align="right" style="padding: 14px 18px; font-family: Georgia, serif; font-size: 14px; font-weight: normal;">Price</th>
        <th align="right" style="padding: 14px 18px; font-family: Georgia, serif; font-size: 14px; font-weight: normal;">Subtotal</th>
      </tr>
      ${rows}
      <tr>
        <td colspan="3" align="right" style="padding: 18px; font-family: Georgia, serif; font-size: 15px; font-weight: bold; background-color: #FFFFFF;">Grand Total:</td>
        <td align="right" style="padding: 18px; font-family: Georgia, serif; font-size: 17px; font-weight: bold; color: #1E5B2E; background-color: #FFFFFF;">$${parseFloat(order.totalAmount).toFixed(2)}</td>
      </tr>
    </table>
  `;
};

export const getOrderConfirmationTemplate = (name, order) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Your order has been successfully placed and confirmed. We are currently preparing it for shipment from our processing facility.</p>
    
    <div style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" valign="top">
            <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: bold;">Order ID</p>
            <p style="margin: 0; font-weight: bold; color: #111827;">#${order.orderId}</p>
          </td>
          <td width="50%" valign="top">
            <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: bold;">Order Date</p>
            <p style="margin: 0; color: #111827;">${order.date}</p>
          </td>
        </tr>
      </table>
    </div>

    ${renderOrderDetails(order)}
    ${getSealHTML('CONFIRMED', order.date)}
    
    <h3 style="font-family: Georgia, serif; font-size: 16px; color: #1E5B2E; margin-top: 30px;">Shipping Destination</h3>
    <div style="border-left: 3px solid #1E5B2E; padding: 15px 20px; border-radius: 4px; background-color: transparent;">
      <p style="margin: 0 0 5px 0; font-weight: bold; color: #2C2C2C;">${order.shippingAddress.name}</p>
      <p style="margin: 0 0 5px 0; color: #555555; font-size: 14px;">
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
        ${order.shippingAddress.country}
      </p>
      <p style="margin: 0; color: #555555; font-size: 14px; font-weight: 600;">Tel: ${order.shippingAddress.phone}</p>
    </div>
  `;
  return baseTemplate({ title: `Order Confirmation #${order.orderId}`, content });
};

export const getPaymentSuccessTemplate = (name, transaction) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">We have successfully processed your payment. Thank you for your continued business with Cocoveera.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border-collapse: collapse; border: 1px solid #E2DCD0; border-radius: 6px; overflow: hidden;">
      <tr style="background: linear-gradient(to right, #1E5B2E, #2E7D32); color: #FFFFFF;">
        <th align="left" colspan="2" style="padding: 14px 18px; font-family: Georgia, serif; font-size: 14px; font-weight: normal; letter-spacing: 1px;">Transaction Details</th>
      </tr>
      <tr>
        <td style="padding: 18px; font-size: 14px; border-bottom: 1px solid #E2DCD0; background-color: #FFFFFF;">Transaction ID</td>
        <td align="right" style="padding: 18px; font-weight: bold; border-bottom: 1px solid #E2DCD0; background-color: #FFFFFF;">${transaction.transactionId}</td>
      </tr>
      <tr>
        <td style="padding: 18px; font-size: 14px; border-bottom: 1px solid #E2DCD0; background-color: #FFFFFF;">Amount Paid</td>
        <td align="right" style="padding: 18px; font-family: Georgia, serif; font-size: 17px; font-weight: bold; color: #1E5B2E; border-bottom: 1px solid #E2DCD0; background-color: #FFFFFF;">$${parseFloat(transaction.amount).toFixed(2)}</td>
      </tr>
    </table>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${process.env.FRONTEND_URL || 'https://cocoveera.com'}/dashboard/orders" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            View Order History
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: `Payment Receipt: ${transaction.transactionId}`, content });
};

export const getOrderProcessingTemplate = (name, orderId) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Great news! We have started processing your order <strong>#${orderId}</strong>. Our team is currently preparing your premium substrates for dispatch.</p>
    <p style="color: #666666; font-style: italic;">You will receive another email as soon as your order has been handed over to our logistics partners.</p>
  `;
  return baseTemplate({ title: `Order #${orderId} is Processing`, content });
};

export const getShippingTemplate = (name, shipping) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Your order has successfully cleared our facility and is now in transit.</p>
    
    <div style="background-color: #FCFBF9; border: 1px solid #E2DCD0; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" valign="top">
            <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Tracking Number</p>
            <p style="margin: 0; font-weight: bold; color: #2C2C2C;">${shipping.trackingNumber}</p>
          </td>
          <td width="50%" valign="top">
            <p style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #9E7E53; font-weight: bold;">Courier</p>
            <p style="margin: 0; color: #2C2C2C;">${shipping.courier}</p>
          </td>
        </tr>
      </table>
    </div>

    ${getSealHTML('SHIPPED', shipping.date)}
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${shipping.trackingUrl}" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            Track Shipment
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: `Order #${shipping.orderId} Shipped`, content });
};

export const getDeliveredTemplate = (name, delivery) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Your order <strong>#${delivery.orderId}</strong> has been successfully delivered to the destination address.</p>
    
    ${getSealHTML('DELIVERED', delivery.date)}
    
    <p style="margin-bottom: 20px; margin-top: 30px;">We hope our products meet the high standards of your operation. Your feedback is highly valuable to our agricultural community.</p>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${process.env.FRONTEND_URL || 'https://cocoveera.com'}/dashboard/orders/${delivery.orderId}/review" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            Leave a Review
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: `Order Delivered: #${delivery.orderId}`, content });
};

export const getRefundTemplate = (name, refund) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">A refund has been successfully <strong>${refund.status}</strong> for your account.</p>
    
    <div style="background-color: #FCFBF9; border-left: 3px solid #9E7E53; padding: 15px 20px; border-radius: 4px; margin-bottom: 30px;">
      <p style="margin: 0 0 5px 0;"><strong>Reference ID:</strong> ${refund.referenceId}</p>
      <p style="margin: 0; font-family: Georgia, serif; font-size: 18px; color: #1E5B2E; font-weight: bold;">$${parseFloat(refund.amount).toFixed(2)} USD</p>
    </div>
    
    <p style="color: #666666; font-size: 13px; font-style: italic;">Please note that it may take 5-7 business days for the funds to reflect in your original payment method, depending on banking institutions.</p>
  `;
  return baseTemplate({ title: `Refund Processed: $${parseFloat(refund.amount).toFixed(2)}`, content });
};
