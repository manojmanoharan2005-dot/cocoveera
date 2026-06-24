import Razorpay from 'razorpay';

const rzp = new Razorpay({
  key_id: 'rzp_test_T54k6QiRESwdUW',
  key_secret: 'uncpTWCydq4sQQi6J18HM6Qr',
});

async function test() {
  try {
    const order = await rzp.orders.create({
      amount: 255000000,
      currency: 'INR',
      receipt: 'test_receipt_123',
    });
    console.log('SUCCESS:', order);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

test();
