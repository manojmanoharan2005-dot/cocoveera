/**
 * File: backend/utils/NotificationService.js
 * Purpose: Centralized service for dispatching notifications.
 */
import * as EmailService from './EmailService.js';
import * as mailer from './mailer.js';

/**
 * OTP Notification
 * Sends email via mailer.js
 */
export const sendOTPNotification = async (email, phone, name, otp) => {
  await mailer.sendOTPEmail(email, name, otp);
};

/**
 * Order Confirmation Notification
 * Sends email via EmailService
 */
export const sendOrderConfirmationNotification = async (email, phone, orderId, orderSummary, pdfBuffer) => {
  await EmailService.sendOrderConfirmationWithInvoice(email, orderId, orderSummary, pdfBuffer);
};

/**
 * Status Update Notification (Out for delivery, delivered, etc.)
 */
export const sendStatusUpdateNotification = async (email, phone, order, status) => {
  await EmailService.sendStatusUpdateEmail(email, order, status);
};

/**
 * Refund Notification
 */
export const sendRefundNotification = async (email, phone, refundStatus, amount, currency, orderId) => {
  await EmailService.sendRefundNotificationEmail(email, refundStatus, amount, currency, orderId);
};
