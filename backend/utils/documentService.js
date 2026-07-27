/**
 * File: backend/utils/documentService.js
 * Purpose: Enterprise document service for automated PDF generation, Cloudinary uploading, and emailing.
 */
import fs from 'fs';
import path from 'path';
import Counter from '../models/Counter.js';
import Document from '../models/Document.js';
import Timeline from '../models/Timeline.js';
import Notification from '../models/Notification.js';
import Email from '../models/Email.js';
import Order from '../models/Order.js';
import Quote from '../models/Quote.js';
import { generateInvoicePDF, buildInvoiceDataFromOrder } from './InvoiceGenerator.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const DOCUMENT_NAMES = {
  quotationPdf: 'Official Quotation',
  proformaInvoicePdf: 'Proforma Invoice',
  commercialInvoicePdf: 'Commercial Invoice',
  packingListPdf: 'Packing List',
  certificateOfOriginPdf: 'Certificate Of Origin',
  billOfLadingPdf: 'Bill Of Lading',
  qualityReportPdf: 'Quality Report',
  loadingReportPdf: 'Container Loading Report',
  phytosanitaryPdf: 'Phytosanitary Certificate',
  receiptPdf: 'Payment Receipt',
  fumigationPdf: 'Fumigation Certificate',
  weightPdf: 'Weight Certificate',
  inspectionPdf: 'Inspection Certificate',
  exportDeclarationPdf: 'Export Declaration',
};

// Sequential value counter generator
export const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
};

// Strict B2B sequential number mapping
export const generateSequentialNumber = async (prefix) => {
  const year = new Date().getFullYear();
  const seq = await getNextSequenceValue(`${prefix}-${year}`);
  const formattedSeq = String(seq).padStart(6, '0');
  return `${prefix}-${year}-${formattedSeq}`;
};

// Send email with Brevo API and store logs
const sendAndLogEmail = async (subject, htmlContent, toEmail, toName, attachment, uploadUrl) => {
  const isMockEmail = !process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.startsWith('mock_');
  
  if (isMockEmail) {
    console.log(`[Brevo Mock] Simulating email sending to ${toEmail} for subject: ${subject}`);
    await Email.create({
      to: toEmail,
      subject: subject,
      body: htmlContent,
      attachments: attachment ? [{ name: attachment.name, url: uploadUrl }] : [],
      status: 'sent',
    });
    return;
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: 'COCOVEERA Export Desk', email: 'supportdesk@cocoveera.com' };
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.replyTo = { email: process.env.ADMIN_EMAIL || 'coirsystemadmin@gmail.com', name: 'Cocoveera Admin' };

    if (attachment) {
      sendSmtpEmail.attachment = [
        {
          name: attachment.name,
          content: attachment.content, // Base64 content
        }
      ];
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email successfully sent to ${toEmail} via Brevo`);

    // Log email
    await Email.create({
      to: toEmail,
      subject: subject,
      body: htmlContent,
      attachments: attachment ? [{ name: attachment.name, url: uploadUrl }] : [],
      status: 'sent',
    });
  } catch (error) {
    console.error('Brevo API Error in documentService:', error);
    // Log failed email
    await Email.create({
      to: toEmail,
      subject: subject,
      body: htmlContent,
      attachments: attachment ? [{ name: attachment.name, url: uploadUrl }] : [],
      status: 'failed',
      error: error.message,
    });
  }
};

// Map quote details to PDF layout input
export const buildInvoiceDataFromQuote = (quote) => {
  const isIndia = quote.shippingAddress?.country?.toLowerCase() === 'india';
  const qty = quote.containerDetails?.quantity || 1;
  const totalAmt = quote.convertedAmount || 0;
  
  return {
    invoiceNumber: quote.quoteNumber,
    orderId: quote.rfq?.toString().slice(-8).toUpperCase() || 'N/A',
    customerId: quote.user?._id?.toString() || 'Guest',
    currency: quote.currency || 'USD',
    customerName: quote.user?.name || quote.email,
    customerEmail: quote.email,
    customerPhone: quote.user?.phone || '',
    shippingAddress: quote.shippingAddress || {},
    containerType: quote.containerDetails?.containerSize || '20 FT',
    totalContainers: qty,
    totalPieces: quote.products?.reduce((acc, curr) => acc + (curr.pieces || curr.quantity || 0), 0) || 0,
    estimatedWeight: quote.products?.reduce((acc, curr) => acc + (curr.weight || 0), 0) || 0,
    estimatedVolume: quote.products?.reduce((acc, curr) => acc + (curr.volume || 0), 0) || 0,
    shippingMethod: isIndia ? 'Road Transport' : 'Sea Freight',
    destinationCountry: quote.shippingAddress?.country || 'Unknown',
    transitTime: 'Standard ETA',
    expectedDeliveryDate: quote.estimatedProductionTime || 'N/A',
    items: quote.products?.map(item => ({
      productName: item.productName || 'Product',
      sku: item.product?._id?.toString().slice(-6) || 'COCO-ITEM',
      quantity: item.quantity || 1,
      unitPrice: qty > 0 ? (totalAmt / qty) : totalAmt,
      pieces: item.quantity || 0
    })) || [],
    subtotal: totalAmt,
    discount: 0,
    shippingCharge: 0,
    tax: 0,
    totalAmount: totalAmt,
    paymentMethod: 'Wire Transfer',
    transactionId: 'N/A',
    paymentDate: new Date().toLocaleDateString(),
    paymentStatus: 'PENDING',
    orderDate: new Date(quote.createdAt).toLocaleDateString(),
    status: quote.status || 'PENDING',
    isQuotation: true,
    documentType: 'quotationPdf'
  };
};

// Automate PDF generation, Cloudinary uploading, email notification & DB updates
export const generateAndStoreDocument = async ({ orderId, quoteId, type, user, dataOverrides = {} }) => {
  try {
    let invoiceData = {};
    let order = null;
    let quote = null;
    let targetUser = user;

    if (orderId) {
      order = await Order.findById(orderId).populate('user').populate('items.product');
      if (order && !targetUser) {
        targetUser = order.user;
      }
      invoiceData = buildInvoiceDataFromOrder(order);
      invoiceData.documentType = type;
      if (type === 'receiptPdf') {
        invoiceData.status = 'PAID';
        invoiceData.paymentStatus = 'PAID';
      }
    } else if (quoteId) {
      quote = await Quote.findById(quoteId).populate('user').populate('products.product');
      if (quote && !targetUser) {
        targetUser = quote.user;
      }
      invoiceData = buildInvoiceDataFromQuote(quote);
      invoiceData.documentType = type;
    }

    // Apply manual data overrides
    invoiceData = { ...invoiceData, ...dataOverrides };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Upload to Cloudinary
    const docName = DOCUMENT_NAMES[type] || 'Export Document';
    const folder = `cocoveera_documents/${type}`;
    const uploadResult = await uploadToCloudinary(pdfBuffer, folder);

    // Save/Update Document in DB
    let documentRecord = await Document.findOne({
      order: orderId || null,
      quote: quoteId || null,
      type: type,
    });

    if (!documentRecord) {
      documentRecord = new Document({
        order: orderId || null,
        quote: quoteId || null,
        user: targetUser?._id || quote?.user || order?.user,
        name: docName,
        type: type,
        generatedBy: 'Cocoveera System',
      });
    }

    documentRecord.url = uploadResult.secure_url;
    documentRecord.publicId = uploadResult.public_id;
    documentRecord.status = 'Available';
    documentRecord.generatedDate = new Date();
    await documentRecord.save();

    // Save locally for compatibility with legacy view-pdf controllers
    try {
      const localDir = path.join('uploads', orderId ? 'orders' : 'quotes');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      const fileName = orderId 
        ? `invoice_${orderId}.pdf` 
        : `quote_${quoteId}.pdf`;
      const localPath = path.join(localDir, fileName);
      fs.writeFileSync(localPath, pdfBuffer);
      
      if (order) order.pdfPath = localPath;
      if (quote) quote.pdfPath = localPath;
    } catch (localErr) {
      console.warn('Failed to save a local copy of the PDF:', localErr);
    }

    // Sync field back to Order/Quote
    if (order) {
      order[type] = uploadResult.secure_url;
      if (type === 'proformaInvoicePdf' || type === 'commercialInvoicePdf') {
        order.invoiceUrl = uploadResult.secure_url;
      }
      await order.save();

      // Create Order Timeline
      await Timeline.create({
        order: order._id,
        status: type,
        title: `${docName} Generated`,
        description: `Document '${docName}' was automatically generated and uploaded.`,
      });
    } else if (quote) {
      quote[type] = uploadResult.secure_url;
      quote.pdfUrl = uploadResult.secure_url;
      await quote.save();
    }

    // Create in-app notification
    if (targetUser) {
      await Notification.create({
        user: targetUser._id,
        title: `New Document: ${docName}`,
        message: `Your ${docName} has been successfully generated and is available in your dashboard.`,
        type: 'document',
      });
    }

    // Send email with PDF attachment
    const emailSubject = `${docName} Generated - Cocoveera Export`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 10px;">${docName} Available</h2>
        <p>Dear ${targetUser?.name || 'Partner'},</p>
        <p>We are writing to let you know that your official <strong>${docName}</strong> has been generated and uploaded to the Cocoveera ERP portal.</p>
        <p>The document is attached directly to this email and is always available for preview & download on your client dashboard under <strong>Documents & Invoices</strong>.</p>
        <br/>
        <p>For any queries or modifications, please respond to this email or reach us at servicedesk@cocoveera.com.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 11px; color: #888;">This is an automated system notification from Cocoveera Export Platform.</p>
      </div>
    `;

    const recipientEmail = targetUser?.email || quote?.email || order?.user?.email;
    if (recipientEmail) {
      const pdfBase64 = pdfBuffer.toString('base64');
      const attachment = {
        content: pdfBase64,
        name: `${docName.replace(/\s+/g, '_')}.pdf`,
        type: 'application/pdf',
      };

      await sendAndLogEmail(
        emailSubject,
        emailHtml,
        recipientEmail,
        targetUser?.name || 'Partner',
        attachment,
        uploadResult.secure_url
      );
    }

    return documentRecord;
  } catch (error) {
    console.error(`[documentService] Error generating/storing ${type}:`, error);
    throw error;
  }
};
