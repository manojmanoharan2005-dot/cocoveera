/**
 * File: backend/utils/generateInvoice.js
 * Purpose: Utility helper functions used across the backend.
 */
import PDFDocument from 'pdfkit';

const generateInvoicePdf = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc
        .fillColor('#2E7D32')
        .fontSize(24)
        .text('COCOVEERA', { align: 'right' })
        .fontSize(10)
        .fillColor('#666666')
        .text('Premium Export Quality Coco Peat', { align: 'right' })
        .moveDown();

      // Invoice Title
      doc
        .fillColor('#333333')
        .fontSize(20)
        .text('INVOICE', 50, 50);
      
      // Order Info
      doc
        .fontSize(10)
        .text(`Order ID: ${order._id.toString().slice(-8).toUpperCase()}`, 50, 80)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 95)
        .text(`Status: ${order.paymentStatus.toUpperCase()}`, 50, 110)
        .text(`Gateway: ${order.paymentGateway.toUpperCase()}`, 50, 125);

      doc.moveDown(2);

      // Bill To
      doc
        .fontSize(12)
        .fillColor('#2E7D32')
        .text('Bill To:', 50, 160)
        .fillColor('#333333')
        .fontSize(10)
        .text(user.name, 50, 175)
        .text(user.email, 50, 190)
        .text(user.phone || '', 50, 205);

      // Ship To
      doc
        .fontSize(12)
        .fillColor('#2E7D32')
        .text('Ship To:', 300, 160)
        .fillColor('#333333')
        .fontSize(10)
        .text(order.shippingAddress?.addressLine || 'N/A', 300, 175)
        .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`, 300, 190)
        .text(`${order.shippingAddress?.country || ''} - ${order.shippingAddress?.postalCode || ''}`, 300, 205);

      doc.moveDown(3);

      // Table Header
      const tableTop = 260;
      doc
        .fontSize(10)
        .fillColor('#2E7D32')
        .text('Item', 50, tableTop)
        .text('Qty', 280, tableTop, { width: 90, align: 'right' })
        .text('Unit Price', 370, tableTop, { width: 90, align: 'right' })
        .text('Amount', 470, tableTop, { width: 90, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).strokeColor('#dddddd').stroke();

      // Items
      let i = 0;
      let y = tableTop + 25;
      doc.fillColor('#333333');
      for (const item of order.items) {
        let name = item.productName;
        if (!name && item.product) {
          name = item.product.name || 'Product';
        }
        
        doc
          .fontSize(10)
          .text(name, 50, y)
          .text(item.quantity.toString(), 280, y, { width: 90, align: 'right' })
          .text(`₹${item.unitPrice.toLocaleString('en-IN')}`, 370, y, { width: 90, align: 'right' })
          .text(`₹${(item.quantity * item.unitPrice).toLocaleString('en-IN')}`, 470, y, { width: 90, align: 'right' });

        y += 20;
        i++;
      }

      doc.moveTo(50, y + 10).lineTo(560, y + 10).strokeColor('#dddddd').stroke();
      y += 20;

      // Totals
      const subtotal = order.totalAmount - (order.shippingCharge || 0);
      
      doc
        .fontSize(10)
        .text('Subtotal:', 370, y, { width: 90, align: 'right' })
        .text(`₹${subtotal.toLocaleString('en-IN')}`, 470, y, { width: 90, align: 'right' });
      y += 15;

      doc
        .text('Shipping:', 370, y, { width: 90, align: 'right' })
        .text(`₹${(order.shippingCharge || 0).toLocaleString('en-IN')}`, 470, y, { width: 90, align: 'right' });
      y += 15;

      doc
        .fontSize(12)
        .fillColor('#2E7D32')
        .text('Grand Total:', 370, y, { width: 90, align: 'right' })
        .text(`₹${order.totalAmount.toLocaleString('en-IN')}`, 470, y, { width: 90, align: 'right' });

      doc.moveDown(4);
      doc
        .fillColor('#666666')
        .fontSize(10)
        .text('Thank you for your business. For any queries, please contact support@cocoveera.com', 50, doc.y, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generateInvoicePdf;
