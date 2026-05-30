import { useState, useEffect } from 'react';
import { adminSettingsService } from '../../services/adminSettingsService';
import { Plus, Trash2, Save, Edit2 } from 'lucide-react';

export default function ShippingSettingsTab({ setError, setSuccess }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    country: '',
    baseCharge: 0,
    chargePerKg: 0,
    freeShippingThreshold: 0,
    estimatedDeliveryDays: '5-7 business days',
    isActive: true,
  });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await adminSettingsService.getShippingRules();
      setRules(res.data);
    } catch (err) {
      setError('Failed to fetch shipping rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await adminSettingsService.updateShippingRule(editingId, formData);
        setSuccess('Shipping rule updated successfully');
      } else {
        await adminSettingsService.createShippingRule(formData);
        setSuccess('Shipping rule created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      fetchRules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save shipping rule');
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      country: rule.country,
      baseCharge: rule.baseCharge,
      chargePerKg: rule.chargePerKg,
      freeShippingThreshold: rule.freeShippingThreshold || 0,
      estimatedDeliveryDays: rule.estimatedDeliveryDays,
      isActive: rule.isActive,
    });
    setEditingId(rule._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipping rule?')) {
      try {
        await adminSettingsService.deleteShippingRule(id);
        setSuccess('Shipping rule deleted successfully');
        fetchRules();
      } catch (err) {
        setError('Failed to delete shipping rule');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Rules Configuration</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              country: '',
              baseCharge: 0,
              chargePerKg: 0,
              freeShippingThreshold: 0,
              estimatedDeliveryDays: '5-7 business days',
              isActive: true,
            });
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          <span>Add Rule</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g. US, IN, Rest of World"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Charge (INR)</label>
              <input
                type="number"
                name="baseCharge"
                value={formData.baseCharge}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charge Per Kg (INR)</label>
              <input
                type="number"
                name="chargePerKg"
                value={formData.chargePerKg}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (INR)</label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={formData.freeShippingThreshold}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Days</label>
              <input
                type="text"
                name="estimatedDeliveryDays"
                value={formData.estimatedDeliveryDays}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 border border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">Rule is Active</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Save size={16} className="inline mr-2" />
              {editingId ? 'Update Rule' : 'Save Rule'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && !showForm ? (
        <p className="text-gray-500">Loading shipping rules...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Country</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Base Charge</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Per Kg</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Free Above</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Delivery</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{rule.country}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">₹{rule.baseCharge}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">₹{rule.chargePerKg}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {rule.freeShippingThreshold ? `₹${rule.freeShippingThreshold}` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rule.estimatedDeliveryDays}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm flex justify-center space-x-3">
                    <button onClick={() => handleEdit(rule)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(rule._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No shipping rules configured. Add a new rule to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
