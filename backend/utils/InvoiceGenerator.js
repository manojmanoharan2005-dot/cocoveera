import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      generateHeader(doc);
      generateCustomerInformation(doc, invoiceData);
      generateInvoiceTable(doc, invoiceData);
      generateFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

function generateHeader(doc) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('COCOVEERA', 50, 57)
    .fontSize(10)
    .text('Cocoveera Inc.', 200, 50, { align: 'right' })
    .text('123 Coconut Street', 200, 65, { align: 'right' })
    .text('Mumbai, India 400001', 200, 80, { align: 'right' })
    .text('GST: 27AABCT1234D1Z2', 200, 95, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Invoice', 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.invoiceNumber, 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text('Payment Status:', 50, customerInformationTop + 30)
    .text(invoice.paymentStatus, 150, customerInformationTop + 30)
    .text('Payment Method:', 50, customerInformationTop + 45)
    .text(invoice.paymentMethod || 'Online', 150, customerInformationTop + 45)

    .font('Helvetica-Bold')
    .text(invoice.customerName, 300, customerInformationTop)
    .font('Helvetica')
    .text(invoice.customerEmail, 300, customerInformationTop + 15)
    .text(invoice.customerPhone || 'N/A', 300, customerInformationTop + 30)
    .text(
      invoice.shippingAddress ? `${invoice.shippingAddress.addressLine}, ${invoice.shippingAddress.city}, ${invoice.shippingAddress.country}` : 'N/A',
      300,
      customerInformationTop + 45,
      { width: 200 }
    )
    .moveDown();

  generateHr(doc, 265);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Unit Cost',
    'Quantity',
    'Line Total'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  let position = 0;
  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.productName,
      formatCurrency(item.unitPrice),
      item.quantity,
      formatCurrency(item.unitPrice * item.quantity)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = position + 30;
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    'Subtotal',
    formatCurrency(subtotal)
  );

  const taxPosition = subtotalPosition + 20;
  // Assume 18% tax or derived from invoiceData
  const tax = invoice.taxAmount || (subtotal * 0.18);
  generateTableRow(
    doc,
    taxPosition,
    '',
    '',
    'GST (18%)',
    formatCurrency(tax)
  );

  const duePosition = taxPosition + 25;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    duePosition,
    '',
    '',
    'Total Due',
    formatCurrency(invoice.totalAmount)
  );
  doc.font('Helvetica');
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      'Terms & Conditions: Payment is due within 15 days. Subject to Mumbai jurisdiction.',
      50,
      700,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y, { width: 250 })
    .text(unitCost, 280, y, { width: 90, align: 'right' })
    .text(quantity, 370, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return '$' + (cents).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + '/' + month + '/' + day;
}
