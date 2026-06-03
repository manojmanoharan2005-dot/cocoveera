/**
 * File: frontend/src/pages/AdminReports.jsx
 * Purpose: React page component representing the AdminReports view.
 */
import { useEffect, useState } from 'react';
import { adminOrderService, adminTestingService, adminUserService } from '../services/adminService';
import {
  FileText,
  Download,
  Calendar,
  AlertCircle,
  Loader,
  TrendingUp,
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Date ranges
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const handleExport = async (type, format) => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (type === 'orders') {
        response = await adminOrderService.export(format, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
      } else if (type === 'users') {
        response = await adminUserService.export(format);
      }
      
      // In a real app, this would download a file
      // For this implementation, we'll just show a success message
      if (response && response.success) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully as ${format.toUpperCase()}`);
      }
    } catch (err) {
      setError(`Failed to export ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const ReportCard = ({ title, description, icon: Icon, onExportCsv, onExportPdf }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-3">
        {onExportCsv && (
          <button 
            onClick={onExportCsv}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            <Download size={16} />
            <span>CSV Excel</span>
          </button>
        )}
        {onExportPdf && (
          <button 
            onClick={onExportPdf}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
          >
            <FileText size={16} />
            <span>PDF Print</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports generator</h1>
            <p className="text-gray-600 mt-1">Generate and export business data</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar size={20} className="text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Date Range Control</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportCard 
            title="Sales & Revenue" 
            description="Comprehensive report of all completed transactions and revenue metrics."
            icon={TrendingUp}
            onExportCsv={() => handleExport('orders', 'csv')}
            onExportPdf={() => handleExport('orders', 'pdf')}
          />
          
          <ReportCard 
            title="User Database" 
            description="Export customer information, signup dates and geographical data."
            icon={FileText}
            onExportCsv={() => handleExport('users', 'csv')}
          />
          
          <ReportCard 
            title="Order Fulfillment" 
            description="Track order processing times, container statuses, and delivery metrics."
            icon={FileText}
            onExportCsv={() => handleExport('orders', 'csv')}
            onExportPdf={() => handleExport('orders', 'pdf')}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
