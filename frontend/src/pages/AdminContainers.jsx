import { useEffect, useState } from 'react';
import { adminContainerService } from '../services/adminService';
import {
  Search,
  Loader,
  AlertCircle,
  Filter,
  Plus,
  Edit2,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminContainers() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [pagination, setPagination] = useState({});

  // Filters & Search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    containerNumber: '',
    containerType: '20FT',
    destination: '',
    eta: '',
    status: 'preparing',
  });

  const containerStatuses = ['preparing', 'loaded', 'at_port', 'exported', 'delivered'];

  const fetchContainers = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await adminContainerService.getAll(page, 10, status, search);
      setContainers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load containers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [page, search, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');

      if (selectedContainer) {
        // Update existing container
        await adminContainerService.updateLogistics(selectedContainer._id, {
          destination: formData.destination,
          eta: formData.eta,
        });
      } else {
        // Create new container
        await adminContainerService.create({
          containerNumber: formData.containerNumber,
          containerType: formData.containerType,
          destination: formData.destination,
          eta: formData.eta,
        });
      }

      setFormData({
        containerNumber: '',
        containerType: '20FT',
        destination: '',
        eta: '',
        status: 'preparing',
      });
      setSelectedContainer(null);
      setShowForm(false);
      fetchContainers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save container');
    }
  };

  const handleEdit = (container) => {
    setFormData({
      containerNumber: container.containerNumber,
      containerType: container.containerType,
      destination: container.destination || '',
      eta: container.eta ? new Date(container.eta).toISOString().split('T')[0] : '',
      status: container.status,
    });
    setSelectedContainer(container);
    setShowForm(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      preparing: 'bg-yellow-100 text-yellow-800',
      loaded: 'bg-blue-100 text-blue-800',
      at_port: 'bg-purple-100 text-purple-800',
      exported: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Containers</h1>
            <p className="text-gray-600 mt-1">Track and manage shipping containers</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedContainer(null);
              setFormData({
                containerNumber: '',
                containerType: '20FT',
                destination: '',
                eta: '',
                status: 'preparing',
              });
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>New Container</span>
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
                placeholder="Search container number..."
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
              {containerStatuses.map((s) => (
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
                  {selectedContainer ? 'Edit Container' : 'New Container'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Container Number *
                      </label>
                      <input
                        type="text"
                        name="containerNumber"
                        value={formData.containerNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            containerNumber: e.target.value,
                          }))
                        }
                        placeholder="e.g., CONT-001"
                        disabled={!!selectedContainer}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Container Type *
                      </label>
                      <select
                        name="containerType"
                        value={formData.containerType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            containerType: e.target.value,
                          }))
                        }
                        disabled={!!selectedContainer}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="20FT">20 FT</option>
                        <option value="40FT">40 FT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destination
                      </label>
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            destination: e.target.value,
                          }))
                        }
                        placeholder="e.g., Singapore"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ETA
                      </label>
                      <input
                        type="date"
                        name="eta"
                        value={formData.eta}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            eta: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      {selectedContainer ? 'Update Container' : 'Create Container'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedContainer(null);
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

        {/* Containers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {containers.map((container) => (
                <div key={container._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {container.containerNumber}
                    </h3>
                    <button
                      onClick={() => handleEdit(container)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      <span className="text-sm text-gray-600">{container.containerType}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TrendingUp size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Progress: {container.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${container.progressPercentage}%` }}
                      />
                    </div>

                    {container.destination && (
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{container.destination}</span>
                      </div>
                    )}

                    {container.eta && (
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          ETA: {new Date(container.eta).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          container.status
                        )}`}
                      >
                        {container.status.charAt(0).toUpperCase() + container.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600">
                      {container.orders?.length || 0} orders assigned
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {containers.length} of {pagination.total} containers
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
