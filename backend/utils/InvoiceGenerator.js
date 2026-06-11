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

export const buildInvoiceDataFromOrder = (order) => {
  const isIndia = order.shippingAddress?.country?.toLowerCase() === 'india';
  let formattedPhone = order.user?.phone || '';
  if (formattedPhone && !formattedPhone.startsWith('+') && formattedPhone.length > 10) {
    const diff = formattedPhone.length - 10;
    formattedPhone = '+' + formattedPhone.substring(0, diff) + ' ' + formattedPhone.substring(diff);
  }

  return {
    invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
    orderId: order._id.toString().slice(-8).toUpperCase(),
    customerId: order.user?._id?.toString() || 'Guest',
    currency: order.user?.currency || (isIndia ? 'INR' : 'USD'),
    customerName: order.user?.name || 'Customer',
    customerEmail: order.user?.email || '',
    customerPhone: formattedPhone,
    shippingAddress: order.shippingAddress || {},
    containerType: order.shippingDetails?.containerType || order.recommendedContainer || '20 ft',
    containerUtilization: order.assignedContainer ? 100 : 0, 
    totalContainers: Math.ceil(order.totalContainers || 1),
    totalPieces: order.totalPieces || order.items.reduce((acc, curr) => acc + (curr.pieces || curr.quantity), 0),
    estimatedWeight: order.totalWeight || 0,
    estimatedVolume: order.totalVolume || 0,
    shippingMethod: order.shippingDetails?.shippingMethod || (isIndia ? 'Road Transport' : 'Sea Freight'),
    destinationCountry: order.shippingAddress?.country || 'Unknown',
    transitTime: order.shippingDetails?.transitTime || 'Standard ETA',
    items: order.items.map(item => ({
      productName: item.product?.name || item.productName || 'Product',
      sku: item.product?.slug ? item.product.slug.toUpperCase().substring(0, 8) : (item.product?._id?.toString().slice(-6) || 'COCO-ITEM'),
      quantity: item.quantity,
      unitPrice: item.unitPrice || item.price || item.product?.price || 0,
      pieces: item.pieces || item.quantity
    })),
    subtotal: order.items.reduce((acc, curr) => acc + (curr.quantity * (curr.unitPrice || curr.price || curr.product?.price || 0)), 0),
    discount: order.discount || 0,
    shippingCharge: order.shippingCharge || 0,
    tax: order.tax || 0,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentGateway || 'Card',
    transactionId: order.paymentId || 'N/A',
    paymentDate: order.paidAt ? new Date(order.paidAt).toLocaleDateString() : new Date().toLocaleDateString(),
    paymentStatus: order.paymentStatus || 'PENDING',
    orderDate: new Date(order.createdAt).toLocaleDateString(),
    status: order.orderStatus || 'PENDING'
  };
};

export const generateInvoicePDF = async (invoiceData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, autoFirstPage: true });
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
        INV: invoiceData.invoiceNumber,
        ORD: invoiceData.orderId,
        Cust: invoiceData.customerName,
        Total: `${getCurrencySymbol(invoiceData.currency)}${(invoiceData.totalAmount || 0).toFixed(2)}`
      });
      const qrBufferUrl = await QRCode.toDataURL(qrData);
      const base64Data = qrBufferUrl.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(base64Data, 'base64');

      // --- RENDER PDF ---

      // PAGE 1: Header, Info, Logistics
      generateHeader(doc, logoBuffer, invoiceData);
      generateCompanyAndCustomerInfo(doc, invoiceData);
      generateOrderAndLogisticsInfo(doc, invoiceData);
      
      // PRODUCT TABLE (Handles pagination)
      const finalY = generateProductTable(doc, invoiceData);

      // SUMMARIES & BOTTOM SECTION
      generateSummariesAndBottom(doc, invoiceData, qrBuffer, finalY);

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
  const rawStatus = invoice.status || invoice.paymentStatus || 'PAID';
  const statusStr = ['paid', 'confirmed', 'production', 'packed', 'loaded', 'shipped', 'delivered'].includes(rawStatus.toLowerCase()) ? 'PAID' : (rawStatus.toUpperCase());
  const statusColor = (statusStr === 'PENDING' || statusStr === 'UNPAID') ? '#D32F2F' : THEME.primary;
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
  doc.fillColor(THEME.primary).fontSize(11).font('Helvetica-Bold').text('BILL TO / SHIP TO:', 300, top);
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text(invoice.customerName, 300, top + 15);
  
  const address = invoice.shippingAddress || {};
  
  doc.fillColor(THEME.textLight).fontSize(9).font('Helvetica')
     .text(invoice.customerEmail, 300, top + 30)
     .text(invoice.customerPhone || '', 300, top + 42)
     .text(address.street || address.addressLine || 'Address not provided', 300, top + 54)
     .text(`${address.city || ''}, ${address.state || ''} ${address.postalCode || address.zipCode || ''}`, 300, top + 66)
     .text(address.country || '', 300, top + 78);

  generateHr(doc, top + 120, THEME.border, 1);
}

function generateOrderAndLogisticsInfo(doc, invoice) {
  const top = 305;

  const usedCap = invoice.totalContainers || 0;
  const isWhole = Number.isInteger(usedCap);
  const remainingCap = isWhole ? 0 : (1 - (usedCap % 1));
  const utilization = isWhole ? 100 : Math.round((usedCap % 1) * 100);

  // Box 1: Export Logistics
  doc.rect(40, top, 240, 110).fillAndStroke(THEME.accent, THEME.border);
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('EXPORT LOGISTICS', 50, top + 10);
  doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
  
  doc.text('Container Type:', 50, top + 30).font('Helvetica').text(invoice.containerType || 'N/A', 140, top + 30);
  doc.font('Helvetica-Bold').text('Total Containers:', 50, top + 45).font('Helvetica').text(usedCap.toFixed(2), 140, top + 45);
  doc.font('Helvetica-Bold').text('Total Pieces:', 50, top + 60).font('Helvetica').text(Math.round(invoice.totalPieces || 0).toLocaleString(), 140, top + 60);
  doc.font('Helvetica-Bold').text('Estimated Weight:', 50, top + 75).font('Helvetica').text(`${(invoice.estimatedWeight || 0).toLocaleString()} KG`, 140, top + 75);
  doc.font('Helvetica-Bold').text('Estimated Volume:', 50, top + 90).font('Helvetica').text(`${(invoice.estimatedVolume || 0).toFixed(2)} CBM`, 140, top + 90);

  // Box 2: Shipping Information
  doc.rect(315, top, 240, 110).fillAndStroke(THEME.accent, THEME.border);
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('SHIPPING INFORMATION', 325, top + 10);
  doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
  
  doc.text('Shipping Method:', 325, top + 30).font('Helvetica').text(invoice.shippingMethod || 'Sea Freight', 415, top + 30);
  doc.font('Helvetica-Bold').text('Origin Port:', 325, top + 45).font('Helvetica').text(invoice.portOfLoading || 'Origin Port', 415, top + 45);
  doc.font('Helvetica-Bold').text('Destination Port:', 325, top + 60).font('Helvetica').text(invoice.portOfDischarge || 'Destination Port', 415, top + 60);
  doc.font('Helvetica-Bold').text('Incoterms:', 325, top + 75).font('Helvetica').text(invoice.incoterms || 'FOB', 415, top + 75);
  doc.font('Helvetica-Bold').text('Transit Time:', 325, top + 90).font('Helvetica').text(invoice.transitTime || 'TBD', 415, top + 90);
}

function generateProductTable(doc, invoice) {
  let i;
  let invoiceTableTop = 440;
  const curr = getCurrencySymbol(invoice.currency);
  
  const drawTableHeader = (y) => {
    doc.rect(40, y, 515, 25).fill(THEME.primary);
    doc.fillColor(THEME.secondary).font('Helvetica-Bold').fontSize(8);
    
    doc.text('Product Name', 50, y + 8, { width: 140 });
    doc.text('SKU', 190, y + 8, { width: 60 });
    doc.text('Containers', 250, y + 8, { width: 55, align: 'center' });
    doc.text('Total Pieces', 310, y + 8, { width: 50, align: 'right' });
    doc.text('Unit Price', 370, y + 8, { width: 70, align: 'right' });
    doc.text('Subtotal', 450, y + 8, { width: 95, align: 'right' });
    return y + 25;
  };

  let position = drawTableHeader(invoiceTableTop);
  
  for (i = 0; i < (invoice.items || []).length; i++) {
    const item = invoice.items[i];
    
    if (position > 700) {
      // Add new page and redraw header
      generateFooter(doc);
      doc.addPage();
      generatePageHeader(doc, invoice);
      position = drawTableHeader(100);
    }

    if (i % 2 === 0) {
      doc.rect(40, position, 515, 30).fill(THEME.accent);
    }
    
    doc.fillColor(THEME.textMain).font('Helvetica').fontSize(8);
    
    doc.text(item.productName, 50, position + 10, { width: 140 });
    doc.text(item.sku || 'N/A', 190, position + 10, { width: 60 });
    doc.text(item.quantity.toFixed(2), 250, position + 10, { width: 55, align: 'center' });
    doc.text(Math.round(item.pieces || 0).toLocaleString(), 310, position + 10, { width: 50, align: 'right' });
    doc.text(`${curr}${(item.unitPrice || 0).toFixed(2)}`, 370, position + 10, { width: 70, align: 'right' });
    doc.text(`${curr}${(item.unitPrice * (item.pieces || 0)).toFixed(2)}`, 450, position + 10, { width: 95, align: 'right' });

    position += 30;
  }

  generateHr(doc, position, THEME.primary, 1);
  return position;
}

function generateSummariesAndBottom(doc, invoice, qrBuffer, finalY) {
  const curr = getCurrencySymbol(invoice.currency);
  
  // Check if we need a new page for summaries
  if (finalY > 550) {
    generateFooter(doc);
    doc.addPage();
    generatePageHeader(doc, invoice);
    finalY = 100;
  }

  const summaryTop = finalY + 15;
  
  const subtotal = invoice.subtotal || invoice.items.reduce((acc, item) => acc + (item.unitPrice * (item.pieces || 0)), 0);
  const discount = invoice.discount || 0;
  const shipping = invoice.shippingCharge || 0;
  const tax = invoice.tax || 0;
  const total = invoice.totalAmount || (subtotal - discount + shipping + tax);
  // Right Column: Grand Total Summary
  doc.font('Helvetica-Bold').fontSize(9).fillColor(THEME.textMain);
  doc.text('Items Total:', 350, summaryTop + 20, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}${subtotal.toFixed(2)}`, 460, summaryTop + 20, { width: 85, align: 'right' });

  doc.font('Helvetica-Bold').text('Discount:', 350, summaryTop + 35, { width: 100, align: 'right' })
     .font('Helvetica').fillColor(THEME.primary).text(`${curr}${discount.toFixed(2)}`, 460, summaryTop + 35, { width: 85, align: 'right' });

  doc.fillColor(THEME.textMain).font('Helvetica-Bold').text('Delivery Charges:', 350, summaryTop + 50, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}${shipping.toFixed(2)}`, 460, summaryTop + 50, { width: 85, align: 'right' });
     
  doc.font('Helvetica-Bold').text('Handling Charges:', 350, summaryTop + 65, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}0.00`, 460, summaryTop + 65, { width: 85, align: 'right' });

  doc.font('Helvetica-Bold').text('Tax / GST:', 350, summaryTop + 80, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}${tax.toFixed(2)}`, 460, summaryTop + 80, { width: 85, align: 'right' });

  generateHr(doc, summaryTop + 90, THEME.border, 1);

  doc.fillColor(THEME.primary).font('Helvetica-Bold').fontSize(14)
     .text('GRAND TOTAL:', 250, summaryTop + 105, { width: 170, align: 'right' })
     .text(`${curr}${total.toFixed(2)}`, 425, summaryTop + 105, { width: 120, align: 'right' });

  const bottomY = Math.max(summaryTop + 140, 650);

  // QR Code
  doc.image(qrBuffer, 40, bottomY, { width: 70 });
  doc.fillColor(THEME.textLight).fontSize(7).font('Helvetica')
     .text('Scan to verify authentic', 40, bottomY + 75)
     .text('Cocoveera export document.', 40, bottomY + 85);

  // Payment Info
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('PAYMENT INFORMATION', 150, bottomY);
  doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
  doc.text('Method:', 150, bottomY + 15).font('Helvetica').text(invoice.paymentMethod || 'Not specified', 230, bottomY + 15);
  doc.font('Helvetica-Bold').text('Transaction Ref:', 150, bottomY + 30).font('Helvetica').text(invoice.transactionId || 'N/A', 230, bottomY + 30);
  doc.font('Helvetica-Bold').text('Paid Date:', 150, bottomY + 45).font('Helvetica').text(invoice.paymentDate || formatDate(new Date()), 230, bottomY + 45);
  const paymentStatus = (invoice.paymentStatus || 'PENDING').toUpperCase();
  const paymentStatusColor = paymentStatus === 'PENDING' || paymentStatus === 'UNPAID' ? '#D32F2F' : THEME.primary;
  doc.font('Helvetica-Bold').text('Status:', 150, bottomY + 60).fillColor(paymentStatusColor).font('Helvetica-Bold').text(paymentStatus, 230, bottomY + 60);

  // Digital Signature
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text('AUTHORIZED SIGNATURE', 380, bottomY, { align: 'center', width: 150 });
  
  // Fake Signature Line
  doc.moveTo(380, bottomY + 50).lineTo(530, bottomY + 50).lineWidth(1).strokeColor(THEME.border).stroke();
  
  doc.fillColor(THEME.primary).fontSize(16).font('Helvetica-Bold').text('Cocoveera', 380, bottomY + 25, { align: 'center', width: 150 });
  
  doc.fillColor(THEME.textLight).fontSize(7).font('Helvetica')
     .text('Company Seal', 380, bottomY + 55, { align: 'center', width: 150 })
     .text('Generated By Cocoveera ERP System', 380, bottomY + 65, { align: 'center', width: 150 });
     
  generateFooter(doc);
}

function generatePageHeader(doc, invoice) {
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('COCOVEERA - Invoice Continuation', 40, 40);
  doc.fillColor(THEME.textMain).fontSize(8).text(`Invoice Number: ${invoice.invoiceNumber}`, 40, 55);
  generateHr(doc, 70, THEME.border, 1);
}

function generateFooter(doc) {
  const footerY = 750;
  generateHr(doc, footerY, THEME.primary, 2);
  
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold')
     .text('Thank You For Choosing Cocoveera', 40, footerY + 10, { align: 'center', width: 515 });

  doc.fillColor(THEME.textLight).fontSize(7).font('Helvetica')
     .text('Verification: team@cocoveera.com | Support: servicedesk@cocoveera.com', 40, footerY + 25, { align: 'center', width: 515 })
     .text('Website: www.cocoveera.com', 40, footerY + 35, { align: 'center', width: 515 });
}

function generateHr(doc, y, color, width) {
  doc.strokeColor(color).lineWidth(width).moveTo(40, y).lineTo(555, y).stroke();
}

function getCurrencySymbol(currencyStr) {
  const curr = (currencyStr || 'USD').toUpperCase();
  const map = {
    'INR': 'Rs. ',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED ',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$'
  };
  return map[curr] || `${curr} `;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
