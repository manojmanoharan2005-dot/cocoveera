/**
 * File: frontend/src/pages/admin/AdminQuoteRequests.jsx
 * Purpose: Admin dashboard view for tracking and managing RFQ Quote Requests.
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminQuoteRequestService } from '../../services/adminService';
import {
  Search,
  Loader,
  AlertCircle,
  Filter,
  Eye,
  Trash2,
  Calendar,
  Globe
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { formatDateFriendly } from '../../utils/dateFormatter';

export default function AdminQuoteRequests() {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  // Filters & Search — seed status from URL ?status= param (sidebar deep-links)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [country, setCountry] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Sync status filter when URL ?status changes (browser back/forward or sidebar click)
  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    setStatus(urlStatus);
    setPage(1);
  }, [searchParams]);

  const fetchQuoteRequests = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await adminQuoteRequestService.getAll(
        page,
        10,
        search,
        status,
        country,
        '',
        dateFilter
      );
      setRequests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load quote requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuoteRequests();
  }, [page, search, status, country, dateFilter]);

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote request?')) {
      try {
        await adminQuoteRequestService.delete(id);
        fetchQuoteRequests();
      } catch (err) {
        setError('Failed to delete quote request');
      }
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setCountry('');
    setDateFilter('');
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quote Requests (RFQs)</h1>
            <p className="text-gray-600 mt-1">Review export quote requests and manage customer statuses</p>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Search Customer */}
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by customer, company, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Status */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="INFO_REQUESTED">Info Requested</option>
              <option value="CUSTOMER_REPLIED">Customer Replied</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Filter Country */}
            <div className="relative">
              <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Country..."
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            {/* Filter Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer bg-white"
            >
              <Filter size={16} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow text-gray-500 font-medium">
            No quote requests found matching your filters.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status Badge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Expected Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Approved Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => {
                    const displayProducts = req.products && req.products.length > 0
                      ? req.products
                      : (req.product?.name ? [{
                          product: req.product,
                          productName: req.product.name,
                        }] : []);

                    return (
                      <tr key={req._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          <div>{req.contactPerson}</div>
                          <div className="text-xs text-gray-400 font-normal">{req.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {req.companyName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          <div className="space-y-1">
                            {displayProducts.map((p, pIdx) => (
                              <div key={pIdx} className="font-semibold text-gray-900">
                                {p.productName || p.product?.name || 'Deleted Product'}
                              </div>
                            ))}
                            <span className="inline-block text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100 mt-1">
                              {req.containerSize}
                            </span>
                          </div>
                        </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {req.country}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : req.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : req.status === 'INFO_REQUESTED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : req.status === 'CUSTOMER_REPLIED'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : req.status === 'NEW'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {req.expectedDeliveryDate ? formatDateFriendly(req.expectedDeliveryDate) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {req.emailSent ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                            req.emailStatus === 'opened'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : req.emailStatus === 'replied'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : req.emailStatus === 'failed'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            ✓ {req.emailStatus ? req.emailStatus.toUpperCase() : 'SENT'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium">Not Sent</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-3 flex items-center">
                        <a
                          href={`/admin/quote-requests/${req._id}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 font-bold text-xs uppercase"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(req._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1 bg-transparent border-none cursor-pointer font-bold text-xs uppercase"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 px-4">
                <span className="text-sm text-gray-700 font-semibold">
                  Page {pagination.currentPage} of {pagination.pages}
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-bold transition disabled:opacity-50 bg-white cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-bold transition disabled:opacity-50 bg-white cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
