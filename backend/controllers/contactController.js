/**
 * File: backend/controllers/contactController.js
 * Purpose: Handles the business logic and request processing for contact operations.
 */
import { sendContactInquiryEmail, sendInquiryConfirmationEmail } from '../utils/mailer.js';
import Inquiry from '../models/Inquiry.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Submit a contact inquiry form
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req, res) => {
  const { 
    name, email, phone, whatsapp, company, country, city, 
    inquiryType, productCategory, productName, requiredQuantity, 
    unitType, monthlyRequirement, targetMarket, expectedOrderFrequency, 
    message 
  } = req.body;

  try {
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message.' });
    }

    let fileUrls = [];
    if (req.files && req.files.length > 0) {
      fileUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploadResult = await uploadToCloudinary(file.buffer, 'cocoveera_inquiries');
          return uploadResult.secure_url;
        })
      );
    }

    const newInquiry = await Inquiry.create({
      name, email, phone: phone || '', whatsapp, company: company || 'Not Provided', country: country || 'Not Provided', city,
      inquiryType: inquiryType || 'General Inquiry', 
      productCategory, productName, requiredQuantity, unitType,
      monthlyRequirement, targetMarket, expectedOrderFrequency,
      message,
      files: fileUrls,
      status: 'New',
      emailStatus: 'Pending'
    });

    // Dispatch emails asynchronously in the background so API response is instant
    setImmediate(async () => {
      try {
        await sendContactInquiryEmail(newInquiry).catch(err => console.error("Internal admin mail error:", err));
        await sendInquiryConfirmationEmail(newInquiry);
        await Inquiry.findByIdAndUpdate(newInquiry._id, { emailStatus: 'Sent' });
      } catch (emailErr) {
        console.error('Confirmation email failed to send:', emailErr);
        await Inquiry.findByIdAndUpdate(newInquiry._id, { emailStatus: 'Failed' });
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Your inquiry was successfully received. Our global sales team will respond within 24 hours.',
      inquiryId: newInquiry.inquiryId,
    });
  } catch (error) {
    console.error('Error handling contact form:', error);
    res.status(500).json({ success: false, message: 'Failed to process inquiry. Please try again later.' });
  }
};
