/**
 * File: backend/utils/emailTemplates/authTemplates.js
 * Purpose: Utility helper functions used across the backend.
 */
import { baseTemplate } from './baseTemplate.js';

export const getOTPTemplate = (name, otp) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">Thank you for initiating your registration with Cocoveera. To finalize the verification of your account, please use the secure One-Time Password (OTP) provided below:</p>
    
    <!-- Vibrant Code Box -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto; background: linear-gradient(135deg, #FCFBF9, #FAF9F6); border: 2px dashed #9E7E53; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
      <tr>
        <td style="padding: 24px 50px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9E7E53; font-weight: bold;">Verification Passcode</p>
          <span style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #1E5B2E; display: block; margin-top: 5px; text-shadow: 1px 1px 0px rgba(255,255,255,0.9);">${otp}</span>
        </td>
      </tr>
    </table>
    
    <div style="background-color: #FFFDF9; border-left: 3px solid #E63946; padding: 15px 20px; border-radius: 4px; margin-top: 30px;">
      <p style="font-size: 13px; color: #555555; margin: 0; line-height: 1.5;"><strong>Important:</strong> This verification code is valid for exactly 10 minutes. For compliance and account safety, please do not forward this message or disclose this code to anyone.</p>
    </div>
  `;
  return baseTemplate({ title: 'Verify Your Account', content });
};

export const getWelcomeTemplate = (name) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://cocoveera.com';
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 20px;">We are pleased to welcome you to the <strong>Cocoveera Global Network</strong>. Your account has been verified, granting you access to our premium, OMRI-certified coir products designed for professional growers and soil blenders globally.</p>
    
    <p style="margin-bottom: 20px; font-weight: bold; color: #1E5B2E; font-family: Georgia, serif; font-size: 16px;">Here is what you can now accomplish in your workspace:</p>
    
    <!-- Classic styled list -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 35px; font-size: 14.5px; color: #4A4A4A; background-color: #FCFBF9; border: 1px solid #F0EBE1; border-radius: 8px; overflow: hidden;">
      <tr>
        <td valign="top" style="padding: 16px 10px 16px 20px; color: #1E5B2E; font-weight: bold; width: 20px;">✓</td>
        <td style="padding: 16px 20px 16px 0; border-bottom: 1px solid #F5F1E9; line-height: 1.5;"><strong>Request Bulk Quotes</strong>: Initiate custom pricing and logistics proposals.</td>
      </tr>
      <tr>
        <td valign="top" style="padding: 16px 10px 16px 20px; color: #1E5B2E; font-weight: bold; width: 20px;">✓</td>
        <td style="padding: 16px 20px 16px 0; border-bottom: 1px solid #F5F1E9; line-height: 1.5;"><strong>Access Laboratory Reports</strong>: View detailed chemical & physical quality data.</td>
      </tr>
      <tr>
        <td valign="top" style="padding: 16px 10px 16px 20px; color: #1E5B2E; font-weight: bold; width: 20px;">✓</td>
        <td style="padding: 16px 20px 16px 0; border-bottom: 1px solid #F5F1E9; line-height: 1.5;"><strong>Logistics Tracking</strong>: Monitor manufacturing progress and container assignments.</td>
      </tr>
      <tr>
        <td valign="top" style="padding: 16px 10px 16px 20px; color: #1E5B2E; font-weight: bold; width: 20px;">✓</td>
        <td style="padding: 16px 20px 16px 0; line-height: 1.5;"><strong>Export Documentation</strong>: Retrieve shipping invoices and quality certifications directly from your My Quotes and My Orders sections.</td>
      </tr>
    </table>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
      <tr>
        <td align="center" bgcolor="#1E5B2E" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(30, 91, 46, 0.25);">
          <a href="${frontendUrl}/dashboard" target="_blank" style="padding: 16px 36px; display: inline-block; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 1px; border: 1px solid #1E5B2E; border-radius: 6px;">
            Access Client Portal
          </a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate({ title: 'Welcome to Cocoveera', content });
};

export const getForgotPasswordTemplate = (name, otp) => {
  const content = `
    <h3 style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; color: #1E5B2E; margin-top: 0; font-weight: normal; margin-bottom: 20px;">Dear ${name},</h3>
    <p style="margin-bottom: 25px;">A password reset request has been received for your Cocoveera portal account. If you initiated this request, please use the following 6-digit security code to establish a new password:</p>
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto; background: linear-gradient(135deg, #FCFBF9, #FAF9F6); border: 2px dashed #9E7E53; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
      <tr>
        <td style="padding: 24px 50px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9E7E53; font-weight: bold;">Password Reset Code</p>
          <span style="font-family: Georgia, 'Times New Roman', Times, serif; font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #1E5B2E; display: block; margin-top: 5px; text-shadow: 1px 1px 0px rgba(255,255,255,0.9);">${otp}</span>
        </td>
      </tr>
    </table>
    
    <div style="background-color: #FAF9F6; border-left: 3px solid #9E7E53; padding: 15px 20px; border-radius: 4px; margin-top: 30px;">
      <p style="font-size: 13px; color: #666666; margin: 0; line-height: 1.5; font-style: italic;">This code will expire in 10 minutes. If you did not request this password reset, please disregard this email; your account security remains completely unaffected.</p>
    </div>
  `;
  return baseTemplate({ title: 'Reset Your Password', content });
};
