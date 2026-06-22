import React, { useState, useEffect } from 'react';
import { FileText, Loader, Download, AlertCircle } from 'lucide-react';
import apiClient from '../../utils/apiClient';

export default function CustomerTestingReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/testing/my-orders');
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load testing reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Report Available':
        return 'bg-green-100 text-green-800';
      case 'Testing Requested':
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Payment Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-stone-200/60 shadow-sm p-6 sm:p-8">
      <div className="mb-6 border-b border-stone-100 pb-4">
        <h2 className="text-xl font-poppins font-black text-stone-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2E7D32]" />
          My Testing Reports
        </h2>
        <p className="text-sm font-semibold text-stone-500 mt-1">
          View and download your requested professional product quality tests.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-8 h-8 text-[#2E7D32] animate-spin mb-4" />
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Loading Reports...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-100">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-poppins font-bold text-stone-700">No testing reports found</h3>
          <p className="text-xs font-semibold text-stone-500 mt-1">You haven't requested any product tests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-y border-stone-200 text-xs font-poppins font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-4 text-xs font-bold font-mono text-stone-600">
                    {report._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {report.productId?.images?.[0] && (
                        <img src={report.productId.images[0]} alt="" className="w-8 h-8 rounded-md object-cover bg-stone-100" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-stone-900">{report.productId?.name || 'Unknown Product'}</p>
                        <p className="text-[10px] text-stone-500 font-semibold">{report.productId?.category || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-stone-700">
                    {report.packageId?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                      report.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {report.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${getStatusColor(report.testingStatus)}`}>
                      {report.testingStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {report.reportUrl ? (
                      <a
                        href={report.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 text-[#2E7D32] p-2 rounded-lg transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
