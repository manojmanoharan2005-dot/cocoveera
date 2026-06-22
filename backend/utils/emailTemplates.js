/**
 * File: backend/utils/emailTemplates.js
 * Purpose: Utility helper functions used across the backend.
 */
export const getOrderConfirmedTemplate = (order, user) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center; position: relative;">
        
        <!-- Logo -->
        <h1 style="color: #2E7D32; font-size: 28px; margin-bottom: 5px; font-weight: 800; letter-spacing: 2px;">COCOVEERA</h1>
        <p style="color: #666; font-size: 12px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Premium Quality Export</p>
        
        <div style="margin: 30px 0;">
          <h2 style="color: #333; font-size: 24px;">Your Order is Confirmed!</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            Hi ${user.name}, thank you for choosing Cocoveera. Your order <strong>#${order._id}</strong> has been successfully placed and is now being processed.
          </p>
        </div>

        <!-- Confirmed Seal Image -->
        <div style="margin: 20px 0;">
          <img src="cid:confirmedSeal" alt="Order Confirmed Seal" style="width: 150px; height: auto;" />
        </div>

        <!-- Order Summary Box -->
        <div style="background-color: #F0FAF0; border-left: 4px solid #2E7D32; padding: 20px; text-align: left; margin: 30px 0; border-radius: 4px;">
          <h3 style="color: #2E7D32; margin-top: 0; font-size: 16px; text-transform: uppercase;">Order Summary</h3>
          <p style="margin: 5px 0; color: #444;"><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
          <p style="margin: 5px 0; color: #444;"><strong>Payment Gateway:</strong> ${order.paymentGateway.toUpperCase()}</p>
          <p style="margin: 5px 0; color: #444;"><strong>Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
        </div>

        <p style="color: #555; line-height: 1.6; font-size: 14px;">
          We have attached your official PDF invoice to this email for your records. You will receive another update as soon as your order ships.
        </p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Cocoveera. All rights reserved.<br/>
          If you have any questions, reply to this email or contact our support team.
        </p>
      </div>
    </div>
  `;
};

export const getShippingUpdateTemplate = (order, user) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center;">
        
        <h1 style="color: #2E7D32; font-size: 28px; margin-bottom: 5px; font-weight: 800; letter-spacing: 2px;">COCOVEERA</h1>
        
        <div style="margin: 30px 0;">
          <h2 style="color: #333; font-size: 24px;">Shipping Update</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            Hi ${user.name}, the status of your order <strong>#${order._id}</strong> has been updated!
          </p>
        </div>

        <div style="background-color: #F8F9FA; border: 1px solid #E9ECEF; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
          <h3 style="color: #495057; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Current Status</h3>
          <p style="font-size: 22px; font-weight: bold; color: #2E7D32; margin: 10px 0;">
            ${order.orderStatus.toUpperCase()}
          </p>
          ${order.trackingNumber ? `<p style="margin: 15px 0 0 0; color: #6C757D; font-size: 14px;">Tracking Number: <strong>${order.trackingNumber}</strong></p>` : ''}
        </div>

        <p style="color: #555; line-height: 1.6; font-size: 14px;">
          You can track your order live from your dashboard. Thank you for your continued business.
        </p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Cocoveera. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

export const getInquiryConfirmationTemplate = (inquiry) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center;">
        
        <h1 style="color: #2E7D32; font-size: 28px; margin-bottom: 5px; font-weight: 800; letter-spacing: 2px;">COCOVEERA</h1>
        <p style="color: #666; font-size: 12px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Premium Quality Export</p>
        
        <div style="margin: 30px 0; text-align: left;">
          <h2 style="color: #333; font-size: 22px;">We Have Received Your Inquiry</h2>
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            Dear ${inquiry.name},<br><br>
            Thank you for contacting Cocoveera. This email confirms that we have successfully received your inquiry. Our global sales team will review your request and respond within 24 hours.
          </p>
        </div>

        <div style="background-color: #F8F9FA; border-left: 4px solid #2E7D32; padding: 20px; text-align: left; margin: 30px 0; border-radius: 4px;">
          <h3 style="color: #2E7D32; margin-top: 0; font-size: 14px; text-transform: uppercase;">Inquiry Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #444;">
            <tr><td style="padding: 5px 0;"><strong>Inquiry ID:</strong></td><td>${inquiry.inquiryId}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Type:</strong></td><td>${inquiry.inquiryType}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Company:</strong></td><td>${inquiry.company}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Country:</strong></td><td>${inquiry.country}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
          <h4 style="margin: 0 0 10px 0; color: #333;">Your Message:</h4>
          <p style="margin: 0; color: #666; font-style: italic; white-space: pre-wrap;">${inquiry.message}</p>
        </div>

        <p style="color: #555; line-height: 1.6; font-size: 14px; text-align: left;">
          For urgent queries, please reach out to our Export Department directly at <a href="mailto:exports@cocoveera.com" style="color: #2E7D32;">exports@cocoveera.com</a>.
        </p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Cocoveera Private Limited. All rights reserved.<br/>
          Cocoveera Plaza, Industrial Port Zone, Cochin, India.
        </p>
      </div>
    </div>
  `;
};
