/**
 * File: backend/utils/InvoiceGenerator.js
 * Purpose: Premium Export Invoice Generator using PDFKit.
 */
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fetch from 'node-fetch';
import { formatDateFriendly } from './dateFormatter.js';

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

  // ── Dynamic payment progress fields ─────────────────────────────────────────
  // Always computed from actual order data — never from stale inputs
  const totalAmount = order.totalAmount || 0;

  // Prefer stored amountPaid; fall back to computing from milestones if needed
  let amountPaid = order.amountPaid;
  if (amountPaid === undefined || amountPaid === null) {
    const milestones = order.paymentMilestones || [];
    amountPaid = milestones.length > 0
      ? milestones.filter(m => m.status === 'Paid').reduce((sum, m) => sum + (m.amount || 0), 0)
      : (order.paymentProgress === 100 ? totalAmount : (totalAmount * (order.paymentProgress || 0)) / 100);
  }

  const remainingAmount = order.remainingAmount !== undefined && order.remainingAmount !== null
    ? order.remainingAmount
    : Math.max(0, totalAmount - amountPaid);

  const paymentProgress = order.paymentProgress !== undefined
    ? order.paymentProgress
    : (totalAmount > 0 ? Math.min(100, Math.round((amountPaid / totalAmount) * 100)) : 0);

  const invoiceStatus =
    paymentProgress >= 100 ? 'PAID IN FULL' :
    paymentProgress > 0    ? `PARTIALLY PAID (${paymentProgress}%)` :
                             'PAYMENT PENDING';

  // Last payment date from history
  const paymentHistory = order.paymentHistory || [];
  const lastPaymentEntry = paymentHistory.length ? paymentHistory[paymentHistory.length - 1] : null;
  const lastPaymentDate = lastPaymentEntry?.paidAt
    ? new Date(lastPaymentEntry.paidAt).toLocaleDateString()
    : (order.paidAt ? new Date(order.paidAt).toLocaleDateString() : new Date().toLocaleDateString());

  // Milestone summary for invoice display
  const paymentMilestonesForInvoice = (order.paymentMilestones || []).map(m => ({
    milestoneType: m.milestoneType,
    percentage: m.percentage,
    amount: m.amount,
    status: m.status,
    paidAt: m.paidAt ? new Date(m.paidAt).toLocaleDateString() : null,
    transactionId: m.paymentId || null,
  }));

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
    expectedDeliveryDate: order.expectedDeliveryDate ? formatDateFriendly(order.expectedDeliveryDate) : 'N/A',
    items: order.items.map(item => ({
      productName: item.product?.name || item.productName || 'Product',
      sku: item.product?.slug ? item.product.slug.toUpperCase().substring(0, 8) : (item.product?._id?.toString().slice(-6) || 'COCO-ITEM'),
      quantity: item.quantity,
      unitPrice: item.unitPrice || item.price || item.product?.price || 0,
      pieces: item.pieces || item.quantity,
    })),
    subtotal: order.items.reduce((acc, curr) => acc + ((curr.pieces || curr.quantity) * (curr.unitPrice || curr.price || curr.product?.price || 0)), 0),
    discount: order.discount || 0,
    shippingCharge: order.shippingCharge || 0,
    tax: order.tax || 0,
    totalAmount,
    paymentMethod: order.paymentGateway || 'Card',
    transactionId: order.paymentId || (lastPaymentEntry?.transactionId) || 'N/A',
    paymentDate: lastPaymentDate,
    paymentStatus: order.paymentStatus || 'PENDING',
    orderDate: new Date(order.createdAt).toLocaleDateString(),
    status: order.orderStatus || 'PENDING',

    // ── Payment progress fields (always accurate) ────────────────────────
    paymentProgress,
    amountPaid,
    remainingAmount,
    invoiceStatus,
    paymentMilestones: paymentMilestonesForInvoice,
    lastPaymentDate,
    paymentSyncedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
  };
};

export const generateInvoicePDF = async (invoiceData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, autoFirstPage: true, bufferPages: true });
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

      const isQuote = invoiceData.isQuotation || invoiceData.documentType === 'quotationPdf';
      const watermarkText = invoiceData.watermarkText || (
        isQuote 
          ? 'OFFICIAL QUOTE' 
          : (invoiceData.paymentProgress === 100 || invoiceData.paymentStatus === 'PAID'
              ? 'PAID' 
              : (invoiceData.paymentProgress > 0 
                  ? `PARTIALLY PAID (${invoiceData.paymentProgress}%)` 
                  : 'PAYMENT PENDING'))
      );

      doc.on('pageAdded', () => {
        drawWatermark(doc, watermarkText);
      });
      drawWatermark(doc, watermarkText);

      // PAGE 1: Header, Info, Logistics
      generateHeader(doc, logoBuffer, invoiceData);
      generateCompanyAndCustomerInfo(doc, invoiceData);
      const logisticsBottomY = generateOrderAndLogisticsInfo(doc, invoiceData);
      
      // PRODUCT TABLE (Handles pagination dynamically below Shipping Info)
      const finalY = generateProductTable(doc, invoiceData, logisticsBottomY);

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

  doc.fillColor(THEME.primary).fontSize(22).font('Helvetica-Bold').text('Cocoveera', 100, 40);
  doc.fillColor(THEME.textLight).fontSize(9).font('Helvetica-Oblique').text('Premium Coir substrates exports\nand Quality testing', 100, 65);

  // Top Right: Title mapping
  const isQuote = invoice.isQuotation || invoice.documentType === 'quotationPdf';
  let title = 'TAX INVOICE';
  if (isQuote) {
    title = 'QUOTATION';
  } else if (invoice.documentType === 'proformaInvoicePdf') {
    title = 'PROFORMA INVOICE';
  } else if (invoice.documentType === 'commercialInvoicePdf') {
    title = 'COMMERCIAL INVOICE';
  } else if (invoice.documentType === 'receiptPdf') {
    title = 'PAYMENT RECEIPT';
  } else if (invoice.documentType === 'packingListPdf') {
    title = 'PACKING LIST';
  } else if (invoice.documentType === 'billOfLadingPdf') {
    title = 'BILL OF LADING';
  } else if (invoice.documentType === 'certificateOfOriginPdf') {
    title = 'CERTIFICATE OF ORIGIN';
  } else if (invoice.documentType === 'phytosanitaryPdf') {
    title = 'PHYTOSANITARY CERTIFICATE';
  } else if (invoice.documentType === 'fumigationPdf') {
    title = 'FUMIGATION CERTIFICATE';
  } else if (invoice.documentType === 'weightPdf') {
    title = 'WEIGHT CERTIFICATE';
  } else if (invoice.documentType === 'inspectionPdf') {
    title = 'INSPECTION CERTIFICATE';
  } else if (invoice.documentType === 'loadingReportPdf') {
    title = 'CONTAINER LOADING REPORT';
  } else if (invoice.documentType === 'qualityReportPdf') {
    title = 'QUALITY REPORT';
  } else if (invoice.documentType === 'exportDeclarationPdf') {
    title = 'EXPORT DECLARATION';
  }

  doc.fillColor(THEME.primary).fontSize(16).font('Helvetica-Bold').text(title, 0, 40, { align: 'right' });
  
  doc.fillColor(THEME.textMain).fontSize(8.5).font('Helvetica-Bold');
  const numLabel = isQuote ? 'Quote Number:' : 'Invoice Number:';
  
  let currentY = 70;
  doc.font('Helvetica-Bold').text(numLabel, 340, currentY);
  doc.font('Helvetica').text(invoice.invoiceNumber, 440, currentY, { width: 115, align: 'right' });

  currentY += 18;
  const dateLabel = isQuote ? 'Quote Date:' : 'Invoice Date:';
  doc.font('Helvetica-Bold').text(dateLabel, 340, currentY);
  doc.font('Helvetica').text(invoice.invoiceDate || formatDate(new Date()), 440, currentY, { width: 115, align: 'right' });

  if (!isQuote) {
    currentY += 18;
    doc.font('Helvetica-Bold').text('Order Number:', 340, currentY);
    doc.font('Helvetica').text(invoice.orderId || 'N/A', 440, currentY, { width: 115, align: 'right' });
  }

  currentY += 18;
  doc.font('Helvetica-Bold').text('Status:', 340, currentY);
  const rawStatus = invoice.status || invoice.paymentStatus || 'PAID';
  const statusStr = isQuote ? rawStatus.toUpperCase() : (['paid', 'confirmed', 'production', 'packed', 'loaded', 'shipped', 'delivered'].includes(rawStatus.toLowerCase()) ? 'PAID' : (rawStatus.toUpperCase()));
  const statusColor = (statusStr === 'PENDING' || statusStr === 'UNPAID') ? '#D32F2F' : THEME.primary;
  doc.fillColor(statusColor).font('Helvetica-Bold').text(statusStr, 440, currentY, { width: 115, align: 'right' });

  generateHr(doc, 150, THEME.primary, 2);
}

function generateCompanyAndCustomerInfo(doc, invoice) {
  const top = 162;

  // Company Info (Left)
  doc.fillColor(THEME.primary).fontSize(11).font('Helvetica-Bold').text('FROM:', 40, top);
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text('COCOVEERA', 40, top + 15);
  
  const companyLines = [
    '96/1, Vikas Layout,',
    'Kalluri Nagar,',
    'Anna Nagar,',
    'Peelamedu,',
    'Coimbatore,',
    'Tamil Nadu – 641004\n',
    'GST: 33OOTPK6234P1ZV',
    'Email: servicedesk@cocoveera.com',
    'Web: www.cocoveera.com'
  ];

  doc.fillColor(THEME.textLight).fontSize(8.5).font('Helvetica')
     .text(companyLines.join('\n'), 40, top + 28, { width: 240 });

  // Customer Info (Right)
  doc.fillColor(THEME.primary).fontSize(11).font('Helvetica-Bold').text('BILL TO / SHIP TO:', 300, top);
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text(invoice.customerName, 300, top + 15);
  
  const address = invoice.shippingAddress || {};
  
  const cityState = [address.city, address.state].filter(Boolean).join(', ');
  const zip = address.postalCode || address.zipCode || '';
  const cityStateZip = [cityState, zip].filter(Boolean).join(' ');

  const customerLines = [
    address.addressLine1 || address.street || address.addressLine || '',
    address.addressLine2 || '',
    cityStateZip,
    address.country,
    invoice.customerEmail,
    invoice.customerPhone
  ].filter(val => val && val.trim() !== '');

  doc.fillColor(THEME.textLight).fontSize(8.5).font('Helvetica')
     .text(customerLines.join('\n'), 300, top + 28, { width: 240 });

  generateHr(doc, top + 138, THEME.border, 1);
}

const isValueEmptyOrPlaceholder = (val) => {
  if (val === undefined || val === null) return true;
  const str = String(val).trim();
  const placeholders = [
    'origin port',
    'destination port',
    'standard eta',
    'n/a',
    'address not provided',
    '0 kg',
    '0 cbm',
    'tbd',
    '',
    '-'
  ];
  if (placeholders.includes(str.toLowerCase())) return true;
  if (str === '0' || str === '0.00') return true;
  return false;
};

function generateOrderAndLogisticsInfo(doc, invoice) {
  const top = 310;
  const boxWidth = 240;
  const paddingX = 10;
  const labelWidth = 90;
  const valWidth = boxWidth - labelWidth - paddingX * 2; // 130px flexible value width

  const usedCap = invoice.totalContainers || 0;
  const totalPieces = invoice.totalPieces || (invoice.items || []).reduce((acc, item) => acc + (item.pieces || item.quantity || 0), 0);

  // Clean Destination Port: Display ONLY port/city (e.g. "Hamburg, Germany"), NEVER full street address
  let cleanDestPort = invoice.portOfDischarge;
  if (!cleanDestPort || cleanDestPort.includes('\n') || cleanDestPort.length > 40 || cleanDestPort.includes('Street') || cleanDestPort.includes('Road')) {
    const city = invoice.shippingAddress?.city;
    const country = invoice.shippingAddress?.country || invoice.destinationCountry;
    cleanDestPort = [city, country].filter(Boolean).join(', ') || 'Destination Port';
  }

  const box1Fields = [
    { label: 'Container Type:', value: invoice.containerType },
    { label: 'Total Containers:', value: usedCap ? usedCap.toFixed(2) : '' },
    { label: 'Total Pieces:', value: totalPieces ? Math.round(totalPieces).toLocaleString() : '' },
    { label: 'Estimated Weight:', value: invoice.estimatedWeight ? `${Number(invoice.estimatedWeight).toLocaleString()} KG` : '' },
    { label: 'Estimated Volume:', value: invoice.estimatedVolume ? `${Number(invoice.estimatedVolume).toFixed(2)} CBM` : '' },
  ].filter(f => !isValueEmptyOrPlaceholder(f.value));

  const box2Fields = [
    { label: 'Shipping Method:', value: invoice.shippingMethod },
    { label: 'Origin Port:', value: invoice.portOfLoading },
    { label: 'Destination Port:', value: cleanDestPort },
    { label: 'Incoterms:', value: invoice.incoterms },
    { label: 'Transit Time:', value: invoice.transitTime },
    { label: 'Expected Delivery:', value: invoice.expectedDeliveryDate },
  ].filter(f => !isValueEmptyOrPlaceholder(f.value));

  // Dynamically calculate Box 1 height
  doc.fontSize(8);
  let box1HeightNeeded = 30; // Header offset
  box1Fields.forEach(f => {
    doc.font('Helvetica-Bold');
    const lH = doc.heightOfString(f.label, { width: labelWidth });
    doc.font('Helvetica');
    const vH = doc.heightOfString(String(f.value), { width: valWidth });
    box1HeightNeeded += Math.max(lH, vH) + 4;
  });

  // Dynamically calculate Box 2 height
  let box2HeightNeeded = 30; // Header offset
  box2Fields.forEach(f => {
    doc.font('Helvetica-Bold');
    const lH = doc.heightOfString(f.label, { width: labelWidth });
    doc.font('Helvetica');
    const vH = doc.heightOfString(String(f.value), { width: valWidth });
    box2HeightNeeded += Math.max(lH, vH) + 4;
  });

  const finalBoxHeight = Math.max(120, box1HeightNeeded + 10, box2HeightNeeded + 10);

  // Render Box 1 (Export Logistics)
  doc.rect(40, top, boxWidth, finalBoxHeight).fillAndStroke(THEME.accent, THEME.border);
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('EXPORT LOGISTICS', 50, top + 10);

  let b1Y = top + 30;
  box1Fields.forEach(field => {
    const valStr = String(field.value);
    doc.fontSize(8);
    doc.font('Helvetica-Bold');
    const lH = doc.heightOfString(field.label, { width: labelWidth });
    doc.font('Helvetica');
    const vH = doc.heightOfString(valStr, { width: valWidth });
    const rowH = Math.max(lH, vH);

    doc.fillColor(THEME.textMain).font('Helvetica-Bold').text(field.label, 50, b1Y, { width: labelWidth });
    doc.font('Helvetica').text(valStr, 50 + labelWidth, b1Y, { width: valWidth });

    b1Y += rowH + 4;
  });

  // Render Box 2 (Shipping Information)
  doc.rect(315, top, boxWidth, finalBoxHeight).fillAndStroke(THEME.accent, THEME.border);
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('SHIPPING INFORMATION', 325, top + 10);

  let b2Y = top + 30;
  box2Fields.forEach(field => {
    const valStr = String(field.value);
    doc.fontSize(8);
    doc.font('Helvetica-Bold');
    const lH = doc.heightOfString(field.label, { width: labelWidth });
    doc.font('Helvetica');
    const vH = doc.heightOfString(valStr, { width: valWidth });
    const rowH = Math.max(lH, vH);

    doc.fillColor(THEME.textMain).font('Helvetica-Bold').text(field.label, 325, b2Y, { width: labelWidth });
    doc.font('Helvetica').text(valStr, 325 + labelWidth, b2Y, { width: valWidth });

    b2Y += rowH + 4;
  });

  return top + finalBoxHeight;
}

function generateProductTable(doc, invoice, startY = 440) {
  let i;
  let invoiceTableTop = startY + 15; // Product table dynamically positions below Shipping Information!
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
    
    if (position > 680) {
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
    doc.text((item.quantity || 1).toFixed(2), 250, position + 10, { width: 55, align: 'center' });
    doc.text(Math.round(item.pieces || item.quantity || 0).toLocaleString(), 310, position + 10, { width: 50, align: 'right' });
    doc.text(`${curr}${(item.unitPrice || 0).toFixed(2)}`, 370, position + 10, { width: 70, align: 'right' });
    const itemSubtotal = item.subtotal !== undefined ? item.subtotal : ((item.unitPrice || 0) * (item.quantity || 1));
    doc.text(`${curr}${itemSubtotal.toFixed(2)}`, 450, position + 10, { width: 95, align: 'right' });

    position += 30;
  }

  generateHr(doc, position, THEME.primary, 1);
  return position;
}

function generateSummariesAndBottom(doc, invoice, qrBuffer, finalY) {
  const curr = getCurrencySymbol(invoice.currency);
  const isQuote = invoice.isQuotation || invoice.documentType === 'quotationPdf';
  
  if (finalY > 540) {
    generateFooter(doc);
    doc.addPage();
    generatePageHeader(doc, invoice);
    finalY = 100;
  }

  const summaryTop = finalY + 15;
  
  const subtotal = invoice.subtotal || invoice.items.reduce((acc, item) => acc + (item.subtotal || ((item.unitPrice || 0) * (item.quantity || 1))), 0);
  const discount = invoice.discount || 0;
  const shipping = invoice.shippingCharge || 0;
  const tax = invoice.tax || 0;
  const total = invoice.totalAmount || (subtotal - discount + shipping + tax);

  // Right Column: Grand Total Summary
  let currentSummaryY = summaryTop + 10;
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(THEME.textMain);
  doc.text('Items Total:', 350, currentSummaryY, { width: 100, align: 'right' })
     .font('Helvetica').text(`${curr}${subtotal.toFixed(2)}`, 460, currentSummaryY, { width: 85, align: 'right' });
  currentSummaryY += 15;

  const charges = [
    { label: 'Discount:', value: discount, isDiscount: true },
    { label: 'Freight Charges:', value: invoice.freightCharges },
    { label: 'Packing Charges:', value: invoice.packingCharges },
    { label: 'Handling Charges:', value: invoice.handlingCharges },
    { label: 'Insurance Charges:', value: invoice.insuranceCharges },
    { label: 'Shipping Charges:', value: invoice.shippingCharge },
    { label: 'Tax / GST:', value: tax }
  ];

  charges.forEach(charge => {
    if (charge.value && charge.value > 0) {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(THEME.textMain);
      doc.text(charge.label, 350, currentSummaryY, { width: 100, align: 'right' });
      
      if (charge.isDiscount) {
        doc.font('Helvetica').fillColor(THEME.primary).text(`-${curr}${charge.value.toFixed(2)}`, 460, currentSummaryY, { width: 85, align: 'right' });
      } else {
        doc.font('Helvetica').text(`${curr}${charge.value.toFixed(2)}`, 460, currentSummaryY, { width: 85, align: 'right' });
      }
      currentSummaryY += 15;
    }
  });

  generateHr(doc, currentSummaryY, THEME.border, 1);
  currentSummaryY += 10;

  doc.fillColor(THEME.primary).font('Helvetica-Bold').fontSize(11)
     .text('GRAND TOTAL:', 250, currentSummaryY, { width: 170, align: 'right' })
     .text(`${curr}${total.toFixed(2)}`, 425, currentSummaryY, { width: 120, align: 'right' });
  currentSummaryY += 15;

  if (!isQuote) {
    const amtPaid = invoice.amountPaid !== undefined ? invoice.amountPaid : (total * ((invoice.paymentProgress || 0) / 100));
    const remBal = invoice.remainingAmount !== undefined ? invoice.remainingAmount : Math.max(0, total - amtPaid);

    doc.fillColor(THEME.textMain).font('Helvetica-Bold').fontSize(9)
       .text('Amount Paid:', 250, currentSummaryY, { width: 170, align: 'right' })
       .font('Helvetica').text(`${curr}${amtPaid.toFixed(2)}`, 425, currentSummaryY, { width: 120, align: 'right' });
    currentSummaryY += 14;

    const remColor = remBal === 0 ? THEME.primary : '#D32F2F';
    doc.fillColor(remColor).font('Helvetica-Bold').fontSize(9)
       .text('Outstanding Balance:', 250, currentSummaryY, { width: 170, align: 'right' })
       .text(`${curr}${remBal.toFixed(2)}`, 425, currentSummaryY, { width: 120, align: 'right' });
    currentSummaryY += 15;
  }

  const bottomY = Math.max(currentSummaryY + 20, 640);

  // Left Column: Payment Info or Quotation Terms
  if (isQuote) {
    doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('QUOTATION TERMS', 40, bottomY);
    doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
    
    let termsY = bottomY + 15;
    const terms = [
      { label: 'Payment Terms:', value: invoice.paymentTerms },
      { label: 'Quote Validity:', value: invoice.quoteValidity ? `${invoice.quoteValidity} Days` : '' },
      { label: 'Production Time:', value: invoice.productionTime },
      { label: 'Transit Time:', value: invoice.transitTime },
    ];

    terms.forEach(term => {
      if (!isValueEmptyOrPlaceholder(term.value)) {
        doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold').text(term.label, 40, termsY);
        doc.font('Helvetica').text(String(term.value), 130, termsY);
        termsY += 15;
      }
    });
  } else {
    doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text('PAYMENT MILESTONE SUMMARY', 40, bottomY);
    doc.fillColor(THEME.textMain).fontSize(8).font('Helvetica-Bold');
    
    const progress = invoice.paymentProgress !== undefined ? invoice.paymentProgress : 0;
    const statusText = progress === 100 ? 'PAID IN FULL (Payment Completed)' : (progress > 0 ? `PARTIALLY PAID (${progress}%)` : 'PAYMENT PENDING');
    const statusColor = progress === 100 ? THEME.primary : (progress > 0 ? '#D97706' : '#D32F2F');

    doc.text('Payment Progress:', 40, bottomY + 15).font('Helvetica').text(`${progress}% Paid`, 150, bottomY + 15);
    doc.font('Helvetica-Bold').text('Payment Method:', 40, bottomY + 30).font('Helvetica').text(invoice.paymentMethod || 'Wire Transfer', 150, bottomY + 30);
    doc.font('Helvetica-Bold').text('Transaction Ref:', 40, bottomY + 45).font('Helvetica').text(invoice.transactionId || 'N/A', 150, bottomY + 45);
    doc.font('Helvetica-Bold').text('Status:', 40, bottomY + 60).fillColor(statusColor).font('Helvetica-Bold').text(statusText, 150, bottomY + 60);
  }

  // Right Column: Digital Signature
  doc.fillColor(THEME.textMain).fontSize(10).font('Helvetica-Bold').text('AUTHORIZED SIGNATURE', 380, bottomY, { align: 'center', width: 175 });
  
  // Signature Line
  doc.moveTo(395, bottomY + 45).lineTo(540, bottomY + 45).lineWidth(1).strokeColor(THEME.border).stroke();
  
  doc.fillColor(THEME.textLight).fontSize(8).font('Helvetica')
     .text('Company Seal', 380, bottomY + 50, { align: 'center', width: 175 })
     .text('Generated By Cocoveera ERP System', 380, bottomY + 62, { align: 'center', width: 175 });
     
  generateFooter(doc);
}

function generatePageHeader(doc, invoice) {
  const isQuote = invoice.isQuotation || invoice.documentType === 'quotationPdf';
  const headerText = isQuote ? 'COCOVEERA - Quotation Continuation' : 'COCOVEERA - Invoice Continuation';
  const numberText = isQuote ? `Quote Number: ${invoice.invoiceNumber}` : `Invoice Number: ${invoice.invoiceNumber}`;
  
  doc.fillColor(THEME.primary).fontSize(10).font('Helvetica-Bold').text(headerText, 40, 40);
  doc.fillColor(THEME.textMain).fontSize(8).text(numberText, 40, 55);
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

function drawWatermark(doc, text = 'OFFICIAL DOCUMENT') {
  doc.save();
  // Very light opacity (5–8%)
  doc.opacity(0.07);
  
  const x = doc.page.width / 2;
  const y = doc.page.height / 2;
  
  // Center of page translation
  doc.translate(x, y);
  
  // Diagonal rotation
  doc.rotate(-45);
  
  const fontSize = text.length > 15 ? 70 : (text.length > 10 ? 90 : 120);
  doc.fillColor('#2E7D32')
     .fontSize(fontSize)
     .font('Helvetica-Bold')
     .text(text.toUpperCase(), -300, -35, { width: 600, align: 'center' });
  
  doc.restore();
}
