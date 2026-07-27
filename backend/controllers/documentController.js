/**
 * File: backend/controllers/documentController.js
 * Purpose: Secure role-based controller for listing, viewing, and downloading B2B export documents.
 */
import Document from '../models/Document.js';

// @desc    Get current customer's documents
// @route   GET /api/documents/my-documents
// @access  Private
export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id })
      .populate('order', 'orderNumber orderStatus')
      .populate('quote', 'quoteNumber status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Securely view/preview document
// @route   GET /api/documents/:id/view
// @access  Private
export const viewDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Role-based authorization: customer can only view own documents, admin/manager/support can view all
    const isOwner = document.user.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager', 'support'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this document.' });
    }

    if (document.url) {
      return res.redirect(document.url);
    }

    res.status(404).json({ success: false, message: 'Document file URL not found.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Securely download document
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Role-based authorization
    const isOwner = document.user.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager', 'support'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this document.' });
    }

    if (document.url) {
      return res.redirect(document.url);
    }

    res.status(404).json({ success: false, message: 'Document download URL not found.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
