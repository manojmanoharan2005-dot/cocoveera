/**
 * File: backend/utils/InvoiceGenerator.js
 * Purpose: Premium Export Invoice Generator using PDFKit.
 */
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fetch from 'node-fetch';

const THEME = {
  primary: '#2E7D32', // Cocoveera Green
  secondary: '#FFFFFF',
  accent: '#F3F4F6', // Light Gray
  textMain: '#374151', // Dark Gray
  textLight: '#6B7280', // Gray
  border: '#E5E7EB', // Border Gray
};

export const generateInvoicePDF = async (invoiceData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      let buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Fetch Logo Image
      let logoBuffer = null;
      try {
        const logoUrl = process.env.LOGO_URL || 'https://res.cloudinary.com/dyrfiop7d/image/upload/v1779801371/cocoveera/branding/ewo6ljdta2dklg9kvbrs.jpg';
        const res = await fetch(logoUrl);
        logoBuffer = await res.buffer();
      } catch (err) {
        console.warn('Failed to fetch logo for invoice. Using fallback text.');
      }

      // Generate QR Code
      const qrData = JSON.stringify({
        invoiceNo: invoiceData.invoiceNumber,
        orderId: invoiceData.orderId,
        customerId: invoiceData.customerId,
        verificationUrl: `https://www.cocoveera.com/verify/${invoiceData.invoiceNumber}`,
      });
      const qrBufferUrl = await QRCode.toDataURL(qrData);
      
      // We need to parse base64 for pdfkit
      const base64Data = qrBufferUrl.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(base64Data, 'base64');

      // --- RENDER PDF ---
      
      // 1. HEADER SECTION
      generateHeader(doc, logoBuffer, invoiceData);
      
      // 2. COMPANY & CUSTOMER INFO
      generateCompanyAndCustomerInfo(doc, invoiceData);

      // 3. ORDER INFO & LOGISTICS & SHIPPING
      generateOrderAndLogisticsInfo(doc, invoiceData);

      // 4. PRODUCT DETAILS TABLE
      generateProductTable(doc, invoiceData);

      // 5. PAYMENT & DIGITAL SIGNATURE & QR
      generateBottomSection(doc, invoiceData, qrBuffer);

      // 6. FOOTER
      generateFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

function generateHeader(doc, logoBuffer, invoice) {
  // Top Left: Logo & Company Name
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, 40, 40, { width: 50 });
    } catch (e) {
      doc.fillColor(THEME.primary).fontSize(20).font('Helvetica-Bold').text('COCOVEERA', 40, 40);
    }
  } else {
    doc.fillColor(THEME.primary).fontSize(20).font('Helvetica-Bold').text('COCOVEERA', 40, 40);
  }

  doc.fillColor(THEME.primary).fontSize(16).font('Helvetica-Bold').text('COCOVEERA', 100, 45);
  doc.fillColor(THEME.textLight).fontSize(9).font('Helvetica').text('Premium Coconut Growing Media Exporters', 100, 65);

  // Top Right: TAX INVOICE
  doc.fillColor(THEME.primary).fontSize(22).font('Helvetica-Bold').text('TAX INVOICE', 0, 45, { align: 'right' });
  
  doc.fillColor(THEME.textMain).fontSize(9).font('Helvetica-Bold');
  doc.text('Invoice Number:', 360, 75);
  doc.font('Helvetica').text(invoice.invoiceNumber, 440, 75, { width: 115, align: 'right' });

  doc.font('Helvetica-Bold').text('Invoice Date:', 360, 95);
  doc.font('Helvetica').text(invoice.invoiceDate || formatDate(new Date()), 440, 95, { width: 115, align: 'right' });

  doc.font('Helvetica-Bold').text('Order Number:', 360, 115);
  doc.font('Helvetica').text(invoice.orderId, 440, 115, { width: 115, align: 'right' });

  doc.font('Helvetica-Bold').text('Status:', 360, 135);
  const statusStr = invoice.status || 'PAID';
  const statusColor = statusStr.toUpperCase() === 'UNPAID' ? '#D32F2F' : THEME.primary;
  doc.fillColor(statusColor).font('Helvetica-Bold').text(statusStr, 440, 135, { width: 115, align: 'right' });

  generateHr(doc, 155, THEME.primary, 2);
}

function generateCompanyAndCustomerInfo(doc, invoice) {
  const top = 175;

  // Company Info (Left)
  doc.fillColor(THEME.primary).fontSize(11).font('Helvetica-Bold').text('FROM:', 40, top);
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text('COCOVEERA', 40, top + 15);
  doc.fillColor(THEME.textLight).fontSize(9).font('Helvetica')
     .text('123 Export Trade Center', 40, top + 30)
     .text('Mumbai Port Zone, MH 400001, India', 40, top + 42)
     .text('GST: 27AABCT1234D1Z2', 40, top + 54)
     .text('IEC: 0312345678', 40, top + 66)
     .text('Email: servicedesk@cocoveera.com', 40, top + 78)
     .text('Phone: +91 98765 43210', 40, top + 90)
     .text('Web: www.cocoveera.com', 40, top + 102);

  // Customer Info (Right)
  doc.fillColor(THEME.primary).fontSize(11).font('Helvetica-Bold').text('BILL TO:', 300, top);
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text(invoice.customerName, 300, top + 15);
  
  const address = invoice.billingAddress || invoice.shippingAddress || {};
  
  doc.fillColor(THEME.textLight).fontSize(9).font('Helvetica')
     .text(invoice.customerEmail, 300, top + 30)
     .text(invoice.customerPhone || '', 300, top + 42)
     .text(address.street || address.addressLine || 'Address not provided', 300, top + 54)
     .text(`${address.city || ''}, ${address.state || ''} ${address.postalCode || address.zip || ''}`, 300, top + 66)
     .text(address.country || '', 300, top + 78);

  generateHr(doc, top + 120, THEME.border, 1);
}

function generateOrderAndLogisticsInfo(doc, invoice) {
  const top = 300;

  // Box 1: Export Logistics
  doc.rect(40, top, 240, 95).fillAndStroke(THEME.accent, THEME.border);
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('EXPORT LOGISTICS', 50, top + 10);
  doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
  
  doc.text('Container Type:', 50, top + 30).font('Helvetica').text(invoice.containerType || 'N/A', 140, top + 30);
  doc.font('Helvetica-Bold').text('Utilization:', 50, top + 45).font('Helvetica').text(`${invoice.containerUtilization || 0}%`, 140, top + 45);
  doc.font('Helvetica-Bold').text('Estimated Weight:', 50, top + 60).font('Helvetica').text(`${(invoice.estimatedWeight || 0).toLocaleString()} KG`, 140, top + 60);
  doc.font('Helvetica-Bold').text('Estimated Volume:', 50, top + 75).font('Helvetica').text(`${(invoice.estimatedVolume || 0).toFixed(2)} CBM`, 140, top + 75);

  // Box 2: Shipping Information
  doc.rect(315, top, 240, 95).fillAndStroke(THEME.accent, THEME.border);
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('SHIPPING INFORMATION', 325, top + 10);
  doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
  
  doc.text('Shipping Method:', 325, top + 30).font('Helvetica').text(invoice.shippingMethod || 'Sea Freight', 415, top + 30);
  doc.font('Helvetica-Bold').text('Origin:', 325, top + 45).font('Helvetica').text('India', 415, top + 45);
  doc.font('Helvetica-Bold').text('Destination:', 325, top + 60).font('Helvetica').text(invoice.destinationCountry || (invoice.shippingAddress ? invoice.shippingAddress.country : 'Unknown'), 415, top + 60);
  doc.font('Helvetica-Bold').text('Transit Time:', 325, top + 75).font('Helvetica').text(invoice.transitTime || 'Standard ETA', 415, top + 75);

}

function generateProductTable(doc, invoice) {
  let i;
  const invoiceTableTop = 420;
  const curr = getCurrencySymbol(invoice.currency);

  doc.rect(40, invoiceTableTop, 515, 25).fill(THEME.primary);
  doc.fillColor(THEME.secondary).font('Helvetica-Bold').fontSize(9);
  
  doc.text('Product Name', 50, invoiceTableTop + 8, { width: 190 });
  doc.text('SKU', 250, invoiceTableTop + 8, { width: 70 });
  doc.text('Qty', 330, invoiceTableTop + 8, { width: 40, align: 'right' });
  doc.text('Unit Price', 380, invoiceTableTop + 8, { width: 80, align: 'right' });
  doc.text('Subtotal', 470, invoiceTableTop + 8, { width: 75, align: 'right' });

  let position = invoiceTableTop + 25;
  
  for (i = 0; i < (invoice.items || []).length; i++) {
    const item = invoice.items[i];
    
    // Background alternating color
    if (i % 2 === 0) {
      doc.rect(40, position, 515, 30).fill(THEME.accent);
    }
    
    doc.fillColor(THEME.textMain).font('Helvetica').fontSize(9);
    
    doc.text(item.productName, 50, position + 10, { width: 190 });
    doc.text(item.sku || 'N/A', 250, position + 10, { width: 70 });
    doc.text(item.quantity, 330, position + 10, { width: 40, align: 'right' });
    doc.text(`${curr}${(item.unitPrice || 0).toFixed(2)}`, 380, position + 10, { width: 80, align: 'right' });
    doc.text(`${curr}${(item.unitPrice * item.quantity || 0).toFixed(2)}`, 470, position + 10, { width: 75, align: 'right' });

    position += 30;
  }

  generateHr(doc, position, THEME.primary, 1);

  // ORDER SUMMARY (Bottom Right)
  const summaryTop = position + 15;
  const subtotal = invoice.subtotal || invoice.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const discount = invoice.discount || 0;
  const shipping = invoice.shippingCharge || 0;
  const tax = invoice.tax || 0;
  const total = invoice.totalAmount || (subtotal - discount + shipping + tax);

  doc.font('Helvetica-Bold').fontSize(9);
  
  doc.text('Items Total:', 350, summaryTop, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}${subtotal.toFixed(2)}`, 460, summaryTop, { width: 85, align: 'right' });

  doc.font('Helvetica-Bold').text('Product Discount:', 350, summaryTop + 15, { width: 100, align: 'right' })
     .font('Helvetica').fillColor(THEME.primary).text(`- ${curr}${discount.toFixed(2)}`, 460, summaryTop + 15, { width: 85, align: 'right' });

  doc.fillColor(THEME.textMain).font('Helvetica-Bold').text('Shipping Charges:', 350, summaryTop + 30, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}${shipping.toFixed(2)}`, 460, summaryTop + 30, { width: 85, align: 'right' });

  doc.font('Helvetica-Bold').text('Tax / GST:', 350, summaryTop + 45, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}${tax.toFixed(2)}`, 460, summaryTop + 45, { width: 85, align: 'right' });

  generateHr(doc, summaryTop + 65, THEME.border, 1);

  doc.fillColor(THEME.primary).font('Helvetica-Bold').fontSize(12)
     .text('GRAND TOTAL:', 300, summaryTop + 75, { width: 150, align: 'right' })
     .text(`${curr}${total.toFixed(2)}`, 460, summaryTop + 75, { width: 85, align: 'right' });
}

function generateBottomSection(doc, invoice, qrBuffer) {
  // We place this roughly at y=600 depending on items
  // Assuming a static layout for simplicity or checking current y
  const bottomY = Math.max(doc.y + 40, 600);

  // QR Code
  doc.image(qrBuffer, 40, bottomY, { width: 70 });
  doc.fillColor(THEME.textLight).fontSize(7).font('Helvetica')
     .text('Scan to verify authentic', 40, bottomY + 75)
     .text('Cocoveera export document.', 40, bottomY + 85);

  // Payment Info
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('PAYMENT INFORMATION', 150, bottomY);
  doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
  doc.text('Method:', 150, bottomY + 15).font('Helvetica').text(invoice.paymentMethod || 'Razorpay', 230, bottomY + 15);
  doc.font('Helvetica-Bold').text('Transaction Ref:', 150, bottomY + 30).font('Helvetica').text(invoice.transactionId || 'N/A', 230, bottomY + 30);
  doc.font('Helvetica-Bold').text('Paid Date:', 150, bottomY + 45).font('Helvetica').text(invoice.paymentDate || formatDate(new Date()), 230, bottomY + 45);
  doc.font('Helvetica-Bold').text('Status:', 150, bottomY + 60).fillColor(THEME.primary).font('Helvetica-Bold').text(invoice.paymentStatus || 'COMPLETED', 230, bottomY + 60);

  // Digital Signature
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text('AUTHORIZED SIGNATURE', 380, bottomY, { align: 'center', width: 150 });
  
  // Fake Signature Line
  doc.moveTo(380, bottomY + 50).lineTo(530, bottomY + 50).lineWidth(1).strokeColor(THEME.border).stroke();
  
  doc.fillColor(THEME.primary).fontSize(16).font('Helvetica-Bold').text('Cocoveera', 380, bottomY + 25, { align: 'center', width: 150 });
  
  doc.fillColor(THEME.textLight).fontSize(7).font('Helvetica')
     .text('Company Seal', 380, bottomY + 55, { align: 'center', width: 150 })
     .text('Generated By Cocoveera ERP System', 380, bottomY + 65, { align: 'center', width: 150 });
}

function generateFooter(doc) {
  const footerY = 750;
  generateHr(doc, footerY, THEME.primary, 2);
  
  doc.fillColor(THEME.primary).fontSize(12).font('Helvetica-Bold')
     .text('Thank You For Choosing Cocoveera', 40, footerY + 10, { align: 'center', width: 515 });

  doc.fillColor(THEME.textLight).fontSize(8).font('Helvetica')
     .text('Verification: team@cocoveera.com | Support: servicedesk@cocoveera.com', 40, footerY + 25, { align: 'center', width: 515 })
     .text('Website: www.cocoveera.com', 40, footerY + 37, { align: 'center', width: 515 });
}

function generateHr(doc, y, color, width) {
  doc.strokeColor(color).lineWidth(width).moveTo(40, y).lineTo(555, y).stroke();
}

function getCurrencySymbol(currencyStr) {
  const curr = (currencyStr || 'INR').toUpperCase();
  const map = {
    'INR': 'Rs. ',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'د.إ',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$'
  };
  return map[curr] || '$';
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
