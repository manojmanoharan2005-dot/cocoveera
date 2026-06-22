import { useEffect, useState } from 'react';
import { adminInquiryService } from '../../services/adminService';
import {
  MessageSquare,
  Search,
  Loader,
  AlertCircle,
  Eye,
  Trash2,
  Filter,
  Download,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  X
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard states
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    pending: 0,
    replied: 0,
    closed: 0
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await adminInquiryService.getAll();
      if (response.success) {
        setInquiries(response.data);
        calculateStats(response.data);
      }
    } catch (err) {
      setError('Failed to load inquiries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      new: data.filter(i => i.status === 'New').length,
      pending: data.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length,
      replied: data.filter(i => i.status === 'Replied').length,
      closed: data.filter(i => i.status === 'Closed').length,
    });
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminInquiryService.updateStatus(id, newStatus);
      fetchInquiries();
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await adminInquiryService.delete(id);
        fetchInquiries();
        setSelectedInquiry(null);
      } catch (err) {
        setError('Failed to delete inquiry');
      }
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.email.toLowerCase().includes(search.toLowerCase()) ||
      inq.company.toLowerCase().includes(search.toLowerCase()) ||
      inq.inquiryId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter ? inq.status === statusFilter : true;
    const matchesType = typeFilter ? inq.inquiryType === typeFilter : true;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">B2B Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage global export and product inquiries</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-medium text-sm">Total</span>
              <MessageSquare className="text-gray-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-4">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-5 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-blue-700 font-medium text-sm">New</span>
              <Clock className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-900 mt-4">{stats.new}</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-100 p-5 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-orange-700 font-medium text-sm">Pending</span>
              <Loader className="text-orange-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-orange-900 mt-4">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-5 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-green-700 font-medium text-sm">Replied</span>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-900 mt-4">{stats.replied}</p>
          </div>
          <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <span className="text-gray-600 font-medium text-sm">Closed</span>
              <XCircle className="text-gray-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-4">{stats.closed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ID, Name, Email, Company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] bg-white min-w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Replied">Replied</option>
              <option value="Closed">Closed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] bg-white min-w-[180px]"
            >
              <option value="">All Inquiry Types</option>
              <option value="Product Inquiry">Product Inquiry</option>
              <option value="Bulk Order Inquiry">Bulk Order</option>
              <option value="Container Load Planning">Container Planning</option>
              <option value="Pricing Request">Pricing Request</option>
              <option value="Sample Request">Sample Request</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader size={32} className="animate-spin text-[#2E7D32]" />
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">No inquiries found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inquiry ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type & Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedInquiry(inq)}>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-[#1E5B2E]">{inq.inquiryId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{inq.name}</p>
                        <p className="text-xs text-gray-500">{inq.company} • {inq.country}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{inq.inquiryType}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{inq.productName || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inq.status)}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInquiry(inq);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedInquiry.inquiryId}</h3>
                  <p className="text-sm text-gray-500">Submitted on {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                    className={`text-sm font-medium border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] ${getStatusColor(selectedInquiry.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Replied">Replied</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button onClick={() => setSelectedInquiry(null)} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-200">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Message Details</h4>
                    <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                      <p className="text-gray-800 whitespace-pre-wrap font-serif leading-relaxed text-sm">
                        {selectedInquiry.message}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Product Requirements</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div>
                        <span className="block text-gray-500 mb-1">Inquiry Type</span>
                        <span className="font-medium text-gray-900">{selectedInquiry.inquiryType}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Product Category</span>
                        <span className="font-medium text-gray-900">{selectedInquiry.productCategory || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Specific Product</span>
                        <span className="font-medium text-gray-900">{selectedInquiry.productName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Required Quantity</span>
                        <span className="font-medium text-gray-900">
                          {selectedInquiry.requiredQuantity ? `${selectedInquiry.requiredQuantity} ${selectedInquiry.unitType}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Monthly Requirement</span>
                        <span className="font-medium text-gray-900">{selectedInquiry.monthlyRequirement || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-1">Target Market</span>
                        <span className="font-medium text-gray-900">{selectedInquiry.targetMarket || 'N/A'}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column - Client Info */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Client Information</h4>
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs mb-0.5">Name</span>
                        <span className="font-semibold text-gray-900">{selectedInquiry.name}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs mb-0.5">Company</span>
                        <span className="font-medium text-gray-900">{selectedInquiry.company}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs mb-0.5">Email</span>
                        <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">{selectedInquiry.email}</a>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs mb-0.5">Phone</span>
                        <a href={`tel:${selectedInquiry.phone}`} className="text-gray-900 hover:text-blue-600">{selectedInquiry.phone}</a>
                      </div>
                      {selectedInquiry.whatsapp && (
                        <div>
                          <span className="block text-gray-500 text-xs mb-0.5">WhatsApp</span>
                          <span className="text-gray-900">{selectedInquiry.whatsapp}</span>
                        </div>
                      )}
                      <div>
                        <span className="block text-gray-500 text-xs mb-0.5">Location</span>
                        <span className="text-gray-900">{selectedInquiry.city ? `${selectedInquiry.city}, ` : ''}{selectedInquiry.country}</span>
                      </div>
                    </div>
                  </div>

                  {selectedInquiry.files && selectedInquiry.files.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Attachments</h4>
                      <div className="space-y-3">
                        {selectedInquiry.files.map((file, idx) => (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition group"
                          >
                            <div className="p-2 bg-white rounded shadow-sm group-hover:text-blue-600">
                              <Download size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700 truncate">
                              Attachment {idx + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=RE: Cocoveera Inquiry ${selectedInquiry.inquiryId}`}
                      className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#1E5B2E] text-white py-2.5 rounded-xl font-medium transition shadow-sm"
                    >
                      <Mail size={18} />
                      Reply via Email
                    </a>
                    <button
                      onClick={() => handleDelete(selectedInquiry._id)}
                      className="w-full mt-3 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2.5 rounded-xl font-medium transition"
                    >
                      <Trash2 size={18} />
                      Delete Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
