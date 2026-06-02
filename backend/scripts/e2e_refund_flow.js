import fetch from 'node-fetch';

const base = 'http://localhost:5003/api';
const j = (b) => JSON.stringify(b);

async function run() {
  console.log('1) Create test user (googleLogin)');
  let res = await fetch(base + '/auth/google', { method: 'post', headers: { 'content-type': 'application/json' }, body: j({ email: 'smokeuser' + Date.now() + '@example.com', name: 'Smoke User', googleId: 'gid' + Date.now() }) });
  let user = await res.json();
  console.log(' -> user created', user.success);
  const userToken = user.token;

  console.log('2) Fetch products');
  res = await fetch(base + '/products');
  const products = await res.json();
  const prod = products.data[0];
  console.log(' -> product', prod.slug);

  console.log('3) Create order as user');
  const orderBody = { items: [{ product: prod._id, productName: prod.name, quantity: 1, unitPrice: prod.price }], totalAmount: prod.price, paymentGateway: 'mock', total: prod.price };
  res = await fetch(base + '/orders', { method: 'post', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + userToken }, body: j(orderBody) });
  const orderRes = await res.json();
  console.log(' -> order created', orderRes.success);
  const orderId = orderRes.data._id;

  console.log('4) Confirm payment (mock) as user');
  res = await fetch(base + '/payments/confirm', { method: 'post', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + userToken }, body: j({ orderId, status: 'success', gateway: 'mock', paymentId: 'tx_' + Date.now() }) });
  const confirm = await res.json();
  console.log(' -> confirm', confirm.success);

  console.log('5) Request refund as user');
  res = await fetch(base + '/payments/refund', { method: 'post', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + userToken }, body: j({ paymentId: orderId, reason: 'Customer requested refund via smoke test' }) });
  const refundReq = await res.json();
  console.log(' -> refund request result', refundReq.success, refundReq.message || '');
  const paymentDoc = refundReq.data;
  if (!paymentDoc) {
    console.log('No payment doc returned, aborting');
    return;
  }
  console.log(' -> payment doc id', paymentDoc._id);

  console.log('6) Admin login to approve');
  res = await fetch(base + '/auth/login', { method: 'post', headers: { 'content-type': 'application/json' }, body: j({ email: 'coirsystemadmin@gmail.com', password: 'Admin@123' }) });
  const admin = await res.json();
  const adminToken = admin.token;

  res = await fetch(`${base}/payments/refund/${paymentDoc._id}/approve`, { method: 'patch', headers: { authorization: 'Bearer ' + adminToken } });
  const approve = await res.json();
  console.log(' -> approve result', approve.success, approve.message || '');
  console.log('Final payment status:', approve.data && approve.data.status);
}

run().catch(e => console.error('ERR', e));
