import { generateInvoicePDF } from '../utils/InvoiceGenerator.js';
import { sendOrderConfirmationWithInvoice } from '../utils/EmailService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const testInvoice = async () => {
  try {
    console.log('Generating PDF...');
    
    const invoiceData = {
      invoiceNumber: 'INV-2026-0001',
      orderId: 'ORD-123456',
      customerId: 'CUST-001',
      currency: 'USD',
      customerName: 'Global Coir Imports',
      customerEmail: 'coirsystemadmin@gmail.com',
      customerPhone: '+1 555-0198',
      shippingAddress: {
        street: '456 Import Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      },
      containerType: '20FT FCL Container',
      containerUtilization: 72,
      estimatedWeight: 10000,
      estimatedVolume: 21.6,
      shippingMethod: 'Sea Freight',
      destinationCountry: 'USA',
      transitTime: '30-45 Days',
      items: [
        { productName: 'Premium 5kg Coco Peat Block', sku: 'CP-5KG-01', quantity: 2000, unitPrice: 2.50 },
        { productName: 'Washed Coco Chips 50L', sku: 'CC-50L-01', quantity: 500, unitPrice: 4.00 }
      ],
      subtotal: 7000,
      discount: 700,
      shippingCharge: 1500,
      tax: 0,
      totalAmount: 7800,
      paymentMethod: 'Wire Transfer',
      transactionId: 'WT-987654321',
      paymentDate: '03/06/2026',
      paymentStatus: 'PAID',
      orderDate: '03/06/2026'
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);
    console.log('PDF Generated successfully. Size:', pdfBuffer.length, 'bytes');

    console.log('Sending email...');
    await sendOrderConfirmationWithInvoice(
      'coirsystemadmin@gmail.com',
      invoiceData.orderId,
      invoiceData,
      pdfBuffer
    );
    
    console.log('Test email sent successfully to coirsystemadmin@gmail.com!');
    process.exit(0);
  } catch (error) {
    console.error('Error in test script:', error);
    process.exit(1);
  }
};

testInvoice();
