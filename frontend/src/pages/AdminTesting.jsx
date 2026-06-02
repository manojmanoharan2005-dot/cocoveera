import { useEffect, useState } from 'react';
import { adminTestingService } from '../services/adminService';
import {
  Search,
  Loader,
  AlertCircle,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminTesting() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [pagination, setPagination] = useState({});

  // Filters & Search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    productName: '',
    batchNumber: '',
    ecValue: '',
    phValue: '',
    moisturePercent: '',
    testerName: '',
    remarks: '',
  });

  const reportStatuses = ['pending', 'approved', 'rejected'];

  const fetchReports = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await adminTestingService.getAll(page, 10, status, search);
      setReports(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load testing reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      if (selectedReport) {
        await adminTestingService.update(selectedReport._id, formData);
      } else {
        await adminTestingService.create(formData);
      }

      setFormData({
        productName: '',
        batchNumber: '',
        ecValue: '',
        phValue: '',
        moisturePercent: '',
        testerName: '',
        remarks: '',
      });
      setSelectedReport(null);
      setShowForm(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report');
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminTestingService.approve(id, '');
      fetchReports();
    } catch (err) {
      setError('Failed to approve report');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminTestingService.reject(id, 'Rejected by admin');
      fetchReports();
    } catch (err) {
      setError('Failed to reject report');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle className="text-green-600" size={20} />;
    if (status === 'rejected') return <XCircle className="text-red-600" size={20} />;
    return <Clock className="text-yellow-600" size={20} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Testing</h1>
            <p className="text-gray-600 mt-1">Manage product quality reports</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedReport(null);
              setFormData({
                productName: '',
                batchNumber: '',
                ecValue: '',
                phValue: '',
                moisturePercent: '',
                testerName: '',
                remarks: '',
              });
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>New Report</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by product or batch..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {reportStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter size={20} className="mx-auto" />
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedReport ? 'Edit Report' : 'New Testing Report'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            productName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch Number *
                      </label>
                      <input
                        type="text"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            batchNumber: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        EC Value *
                      </label>
                      <input
                        type="text"
                        name="ecValue"
                        value={formData.ecValue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ecValue: e.target.value,
                          }))
                        }
                        placeholder="e.g., 0.35 mS/cm"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        pH Value *
                      </label>
                      <input
                        type="text"
                        name="phValue"
                        value={formData.phValue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phValue: e.target.value,
                          }))
                        }
                        placeholder="e.g., 6.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moisture % *
                      </label>
                      <input
                        type="text"
                        name="moisturePercent"
                        value={formData.moisturePercent}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            moisturePercent: e.target.value,
                          }))
                        }
                        placeholder="e.g., 14.2%"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tester Name *
                      </label>
                      <input
                        type="text"
                        name="testerName"
                        value={formData.testerName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            testerName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      {selectedReport ? 'Update Report' : 'Create Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedReport(null);
                      }}
                      className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reports Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      EC
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      pH
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Moisture
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {report.productName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {report.batchNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.ecValue}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.phValue}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.moisturePercent}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex items-center">
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye size={18} />
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(report._id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(report._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {reports.length} of {pagination.total} reports
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
