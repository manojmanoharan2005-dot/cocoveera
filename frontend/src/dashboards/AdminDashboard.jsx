/**
 * File: frontend/src/dashboards/AdminDashboard.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState, useEffect } from 'react';
import { apiClient, useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  FileText,
  FlaskConical,
  Truck,
  Users,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  UserCheck,
  Check,
  X,
  FileDown,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Forms state
  // Product Creation
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'Coir Pith Blocks',
    packageSize: '',
    price: 350,
    stock: 100,
    ph: '5.5 - 6.5',
    ec: '< 0.5 mS/cm',
    moisture: '< 20%',
    compressionRatio: '5:1',
    fiberLength: 'Under 2cm',
    expansionVolume: '15 Liters/kg',
    sandContent: '< 2%',
    imageUrls: '',
    benefits: '',
    applications: '',
  });

  // Quote replying
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  // Lab Report logging
  const [newReport, setNewReport] = useState({
    productId: '',
    batchNumber: '',
    ecValue: '0.35 mS/cm',
    phValue: '6.0',
    moisturePercent: '16.5%',
    compressionRatio: '5:1',
    fiberContent: '3.8%',
    testerName: 'QA Lab Specialist',
    status: 'passed',
    pdfUrl: '',
  });
  const [reportSuccess, setReportSuccess] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [prodRes, quoteRes, orderRes, usersRes, reportsRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/quotes'),
        apiClient.get('/orders'),
        apiClient.get('/users'),
        apiClient.get('/testing')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (quoteRes.data.success) setQuotes(quoteRes.data.data);
      if (orderRes.data.success) setOrders(orderRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
      if (reportsRes.data.success) setReports(reportsRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to sync administrative dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Product Add handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...newProduct,
        benefits: newProduct.benefits.split(',').map((b) => b.trim()),
        applications: newProduct.applications.split(',').map((a) => a.trim()),
        imageUrls: newProduct.imageUrls ? [newProduct.imageUrls] : []
      };
      const res = await apiClient.post('/products', payload);
      if (res.data.success) {
        setProducts([...products, res.data.data]);
        setNewProduct({
          name: '',
          description: '',
          category: 'Coir Pith Blocks',
          packageSize: '',
          price: 350,
          stock: 100,
          ph: '5.5 - 6.5',
          ec: '< 0.5 mS/cm',
          moisture: '< 20%',
          compressionRatio: '5:1',
          fiberLength: 'Under 2cm',
          expansionVolume: '15 Liters/kg',
          sandContent: '< 2%',
          imageUrls: '',
          benefits: '',
          applications: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Remove product from export catalog?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  // Quote replying submit handler
  const handleQuoteReplySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setReplySuccess(false);
    try {
      const res = await apiClient.put(`/quotes/${selectedQuote._id}/reply`, {
        pricingProposed: Number(proposedPrice),
        replyMessage,
        status: 'replied'
      });
      if (res.data.success) {
        setReplySuccess(true);
        setTimeout(() => {
          setSelectedQuote(null);
          setProposedPrice('');
          setReplyMessage('');
          setReplySuccess(false);
          fetchAdminData();
        }, 1500);
      }
    } catch (err) {
      setError('Error replying to quote.');
    }
  };

  // Lab testing report creation handler
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setReportSuccess(false);
    try {
      const res = await apiClient.post('/testing', newReport);
      if (res.data.success) {
        setReportSuccess(true);
        setReports([...reports, res.data.data]);
        setNewReport({
          productId: '',
          batchNumber: '',
          ecValue: '0.35 mS/cm',
          phValue: '6.0',
          moisturePercent: '16.5%',
          compressionRatio: '5:1',
          fiberContent: '3.8%',
          testerName: 'QA Lab Specialist',
          status: 'passed',
          pdfUrl: '',
        });
        setTimeout(() => setReportSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting report.');
    }
  };

  const handleUpdateTracking = async (orderId, newStatus) => {
    try {
      const res = await apiClient.put(`/orders/${orderId}/tracking`, { trackingStatus: newStatus });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      setError('Failed to update cargo status.');
    }
  };

  // Global calculations
  const totalRevenue = orders.reduce((sum, o) => o.paymentStatus === 'paid' ? sum + o.totalAmount : sum, 0);
  const totalClients = usersList.filter(u => u.role === 'user').length;
  const pendingQuotesCount = quotes.filter(q => q.status === 'pending').length;

  return (
    <div className="pt-24 pb-16 bg-accent-light min-h-screen">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-3xl border border-stone-150 shadow-sm h-fit space-y-6">
          <div className="flex items-center space-x-3 pb-6 border-b border-stone-100">
            <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <h3 className="font-poppins font-extrabold text-stone-900 text-sm">Control Tower</h3>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Administrator</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            {['Overview', 'Products Manager', 'Quotes Replier', 'Lab Registry', 'Logistics Tracker', 'Users Directory'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setError(null);
                }}
                className={`w-full text-left font-poppins text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center space-x-2.5 ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {tab === 'Overview' && <Briefcase className="w-4 h-4" />}
                {tab === 'Products Manager' && <Layers className="w-4 h-4" />}
                {tab === 'Quotes Replier' && <FileText className="w-4 h-4" />}
                {tab === 'Lab Registry' && <FlaskConical className="w-4 h-4" />}
                {tab === 'Logistics Tracker' && <Truck className="w-4 h-4" />}
                {tab === 'Users Directory' && <Users className="w-4 h-4" />}
                <span>{tab}</span>
              </button>
            ))}
            <hr className="border-stone-100 my-2" />
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out of the Admin Control Center?')) {
                  logout();
                  navigate('/');
                }
              }}
              className="w-full text-left font-poppins text-xs font-bold py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-all flex items-center space-x-2.5"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Action Content Panel */}
        <main className="lg:col-span-9 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-650 text-xs p-3 rounded-lg border border-red-100 font-semibold">
              {error}
            </div>
          )}

          {/* OVERVIEW PANEL */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Core analytics blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-3xl border border-stone-155 shadow-sm flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase block leading-none">Total Revenue</span>
                    <strong className="text-lg font-poppins font-extrabold text-stone-900 mt-1 block">₹{totalRevenue.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-stone-155 shadow-sm flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/5 text-secondary flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase block leading-none">Clients</span>
                    <strong className="text-lg font-poppins font-extrabold text-stone-900 mt-1 block">{totalClients}</strong>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-stone-155 shadow-sm flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase block leading-none">Open Quotes</span>
                    <strong className="text-lg font-poppins font-extrabold text-stone-900 mt-1 block">{pendingQuotesCount}</strong>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-stone-155 shadow-sm flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase block leading-none">Lab Audits</span>
                    <strong className="text-lg font-poppins font-extrabold text-stone-900 mt-1 block">{reports.length}</strong>
                  </div>
                </div>
              </div>

              {/* Logs review */}
              <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-4">
                <h3 className="text-base font-poppins font-extrabold text-stone-900">
                  Global Export Operations Summary
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Review recent bulk cargo requests and analytical certificates dispatched to destination ports.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center text-xs font-semibold text-stone-600 bg-accent-light p-4 rounded-xl border border-stone-150">
                  <div>Catalog Items: {products.length}</div>
                  <div>Dispatched Orders: {orders.length}</div>
                  <div>Seeded Admin: admin@cocoveera.com</div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS MANAGER */}
          {activeTab === 'Products Manager' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
              <h3 className="text-lg font-poppins font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                Manage Export Catalog
              </h3>

              {/* Add product form */}
              <form onSubmit={handleAddProduct} className="bg-accent-light p-6 rounded-2xl border border-stone-150 space-y-4 text-stone-850">
                <h4 className="text-xs font-poppins font-extrabold text-stone-900">Add New Substrate Product</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Product Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white font-medium"
                    >
                      <option>Coir Pith Blocks</option>
                      <option>Grow Bags</option>
                      <option>Coir Discs</option>
                      <option>Erosion Control</option>
                      <option>Other Coir Products</option>
                      <option>Hobby Gardening</option>
                      <option>Custom Solutions</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Packing / Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 5kg Blocks"
                      value={newProduct.packageSize}
                      onChange={(e) => setNewProduct({ ...newProduct, packageSize: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Base Price (INR)</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Stock Tons</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Description</label>
                  <textarea
                    rows="2"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Product Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. Unsplash URL"
                      value={newProduct.imageUrls}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrls: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3 w-full rounded-lg shadow-sm flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Insert Product</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Product catalog List */}
              <div className="space-y-3">
                {products.map((prod) => (
                  <div key={prod._id} className="flex justify-between items-center border border-stone-150 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                    <div>
                      <h4 className="font-poppins font-bold text-stone-850 text-sm">{prod.name}</h4>
                      <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                        Category: {prod.category} | base: ₹{prod.price}/ton | stock: {prod.stock}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(prod._id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUOTES REPLIER */}
          {activeTab === 'Quotes Replier' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
              <h3 className="text-lg font-poppins font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                Review & Reply Client Quotes
              </h3>

              {quotes.length === 0 ? (
                <p className="text-stone-550 text-xs py-6 text-center font-medium">No incoming quote requests.</p>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote._id} className="border border-stone-150 rounded-2xl p-5 hover:bg-stone-50 transition-colors">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="font-poppins font-bold text-stone-850 text-sm">{quote.product?.name}</h4>
                          <p className="text-[10px] text-stone-400 font-medium">
                            Client: {quote.user?.name} ({quote.user?.email}) | Quantity: {quote.quantity} {quote.unitType}
                          </p>
                        </div>
                        <span className={`text-[10px] font-poppins font-bold px-3 py-1 rounded-full uppercase border ${
                          quote.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-250' : 'bg-green-55 text-green-600 border border-green-200'
                        }`}>
                          {quote.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-semibold text-stone-600 bg-accent-light p-3 rounded-lg border border-stone-150">
                        <div>Req Spec: pH={quote.specificationsRequested.ph}, EC={quote.specificationsRequested.ec}, Moisture={quote.specificationsRequested.moisture}</div>
                        <div>Shipping: {quote.shippingAddress.addressLine}, {quote.shippingAddress.city}, {quote.shippingAddress.country}</div>
                      </div>

                      {quote.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedQuote(quote);
                              setProposedPrice(quote.product.price * quote.quantity);
                            }}
                            className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm"
                          >
                            Prepare Proposal Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedQuote && (
                <div className="fixed inset-0 bg-stone-500/30 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                  <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-150">
                    <div className="bg-accent border-b border-stone-150 p-6 flex justify-between items-center text-stone-900">
                      <h3 className="font-poppins font-bold text-sm">Reviewing Quote: {selectedQuote.product?.name}</h3>
                      <button onClick={() => setSelectedQuote(null)} className="text-stone-500 hover:text-stone-900 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleQuoteReplySubmit} className="p-6 space-y-4">
                      {replySuccess ? (
                        <div className="text-center py-6">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                            <Check className="w-6 h-6" />
                          </div>
                          <h4 className="font-poppins font-bold text-sm text-stone-850">Proposal Sent</h4>
                          <p className="text-[11px] text-stone-500">Email sent to {selectedQuote.user?.name}.</p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-stone-600 mb-1">
                              Proposed Package Price (INR Total)
                            </label>
                            <input
                              type="number"
                              value={proposedPrice}
                              onChange={(e) => setProposedPrice(e.target.value)}
                              className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary font-bold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-600 mb-1">
                              Sales Note / Transit Information
                            </label>
                            <textarea
                              rows="3"
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Include shipping port terms (FOB/CIF) and estimated sailing date..."
                              className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
                              required
                            ></textarea>
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setSelectedQuote(null)}
                              className="w-1/3 border border-stone-200 text-stone-600 py-2.5 rounded-lg text-xs font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="w-2/3 bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-2.5 rounded-lg shadow"
                            >
                              Send Proposal
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LAB REGISTRY */}
          {activeTab === 'Lab Registry' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
              <h3 className="text-lg font-poppins font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                Log Laboratory Test Reports
              </h3>

              {reportSuccess && (
                <div className="bg-primary/5 text-primary text-xs p-3 rounded-lg border border-primary/10 font-semibold">
                  Test Report logged and added to verified database successfully.
                </div>
              )}

              <form onSubmit={handleReportSubmit} className="bg-accent-light p-6 rounded-2xl border border-stone-150 space-y-4 text-stone-850">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Target Product</label>
                    <select
                      value={newReport.productId}
                      onChange={(e) => setNewReport({ ...newReport, productId: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white font-medium"
                      required
                    >
                      <option value="">Select Substrate...</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Batch Number (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. BATCH-COCO-101"
                      value={newReport.batchNumber}
                      onChange={(e) => setNewReport({ ...newReport, batchNumber: e.target.value.toUpperCase() })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white uppercase font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">EC Level</label>
                    <input
                      type="text"
                      value={newReport.ecValue}
                      onChange={(e) => setNewReport({ ...newReport, ecValue: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">pH Balance</label>
                    <input
                      type="text"
                      value={newReport.phValue}
                      onChange={(e) => setNewReport({ ...newReport, phValue: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Moisture content</label>
                    <input
                      type="text"
                      value={newReport.moisturePercent}
                      onChange={(e) => setNewReport({ ...newReport, moisturePercent: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Compression Ratio</label>
                    <input
                      type="text"
                      value={newReport.compressionRatio}
                      onChange={(e) => setNewReport({ ...newReport, compressionRatio: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Fiber Content</label>
                    <input
                      type="text"
                      value={newReport.fiberContent}
                      onChange={(e) => setNewReport({ ...newReport, fiberContent: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Tester Name</label>
                    <input
                      type="text"
                      value={newReport.testerName}
                      onChange={(e) => setNewReport({ ...newReport, testerName: e.target.value })}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3 px-6 rounded-lg shadow-sm"
                  >
                    Register Audit Report
                  </button>
                </div>
              </form>

              {/* Reports list */}
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div key={rep._id} className="flex justify-between items-center border border-stone-150 p-4 rounded-xl hover:bg-stone-50 transition-all">
                    <div>
                      <h4 className="font-poppins font-bold text-stone-850 text-xs">Batch: {rep.batchNumber} ({rep.productName})</h4>
                      <p className="text-[10px] text-stone-400 font-medium">
                        pH={rep.phValue} | EC={rep.ecValue} | Moisture={rep.moisturePercent} | auditor: {rep.testerName}
                      </p>
                    </div>
                    <a
                      href={rep.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-stone-600 hover:text-primary transition-colors p-2 rounded bg-accent-light"
                    >
                      <FileDown className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOGISTICS TRACKER */}
          {activeTab === 'Logistics Tracker' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
              <h3 className="text-lg font-poppins font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                Logistics and Shipping Tracker
              </h3>

              {orders.length === 0 ? (
                <p className="text-stone-550 text-xs py-6 text-center font-medium">No customer orders logged.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-stone-150 rounded-2xl p-5 text-stone-800">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-2 mb-3">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold block">ORDER REF</span>
                          <strong className="text-xs text-stone-800">{order._id}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 font-bold block">CLIENT EMAIL</span>
                          <strong className="text-xs text-stone-800">{order.user?.email}</strong>
                        </div>
                      </div>

                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1">
                          <span>{item.product?.name}</span>
                          <strong className="text-stone-700">{item.quantity} units @ ₹{item.unitPrice}</strong>
                        </div>
                      ))}

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-4 border-t border-stone-100 gap-4">
                        <div className="text-xs">
                          Total Value: <strong className="text-primary text-sm">₹{order.totalAmount} INR</strong>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-[10px] font-bold text-stone-500 uppercase">Cargo Status:</label>
                          <select
                            value={order.trackingStatus}
                            onChange={(e) => handleUpdateTracking(order._id, e.target.value)}
                            className="border border-stone-250 rounded-lg p-2 text-xs focus:outline-none focus:border-primary font-semibold bg-white"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS DIRECTORY */}
          {activeTab === 'Users Directory' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-6">
              <h3 className="text-lg font-poppins font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                Registered Partner Accounts
              </h3>

              <div className="space-y-3">
                {usersList.map((userAcc) => (
                  <div key={userAcc._id} className="flex justify-between items-center border border-stone-150 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                    <div>
                      <h4 className="font-poppins font-bold text-stone-850 text-sm flex items-center space-x-1.5">
                        <span>{userAcc.name}</span>
                        {userAcc.role === 'admin' && (
                          <span className="text-[9px] bg-red-50 text-red-650 border border-red-150 font-bold px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                        Email: {userAcc.email} | Phone: {userAcc.phone} | Created: {new Date(userAcc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {userAcc.role === 'user' && (
                      <span className="text-[10px] bg-primary/5 text-primary border border-primary/20 px-2 py-1 rounded-lg font-bold flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>CLIENT</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
