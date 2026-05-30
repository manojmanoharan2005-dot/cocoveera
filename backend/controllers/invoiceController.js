import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import { generateInvoicePDF } from '../utils/InvoiceGenerator.js';

// @desc    Get all invoices for Admin
// @route   GET /api/invoices
// @access  Private/Admin
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('userId', 'name email').populate('orderId').sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user invoices
// @route   GET /api/invoices/myinvoices
// @access  Private
export const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id }).populate('orderId').sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get specific invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('userId', 'name email').populate('orderId');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user is admin or the owner of the invoice
    if (invoice.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/download
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const order = await Order.findById(invoice.orderId).populate('user', 'name email phone').populate('items.product', 'name');
    
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      customerName: order.user.name,
      customerEmail: order.user.email,
      customerPhone: order.user.phone,
      shippingAddress: order.shippingAddress,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: order.paymentGateway,
      totalAmount: invoice.totalAmount,
      items: order.items.map(item => ({
        productName: item.productName || (item.product && item.product.name) || 'Product',
        unitPrice: item.unitPrice,
        quantity: item.quantity
      }))
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ message: 'Server error while generating PDF' });
  }
};
