/**
 * File: frontend/src/pages/account/Invoices.jsx
 * Purpose: Enterprise Export Documentation Dashboard.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Eye, Download, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { apiClient } from '../../context/AuthContext';
import PDFModal from '../../components/common/PDFModal';
import SEO from '../../components/SEO';

const documentTypesList = [
  { key: 'quotationPdf', name: 'Official Quotation', desc: 'Detailed commercial quotation proposal for coir export.' },
  { key: 'proformaInvoicePdf', name: 'Proforma Invoice', desc: 'Proforma Invoice generated upon acceptance of quotation.' },
  { key: 'commercialInvoicePdf', name: 'Commercial Invoice', desc: 'Final Commercial Invoice detailing product codes, quantities & totals.' },
  { key: 'packingListPdf', name: 'Packing List', desc: 'Complete cargo packing layout details including pallets, weight & volume.' },
  { key: 'certificateOfOriginPdf', name: 'Certificate Of Origin', desc: 'Official origin certificate for Indian coir cargo.' },
  { key: 'billOfLadingPdf', name: 'Bill Of Lading', desc: 'Carrier document detailing shipper, consignee, and destination port.' },
  { key: 'phytosanitaryPdf', name: 'Phytosanitary Certificate', desc: 'Plant health certificate for coir materials.' },
  { key: 'fumigationPdf', name: 'Fumigation Certificate', desc: 'Detailed chemical treatment verification for export substrates.' },
  { key: 'weightPdf', name: 'Weight Certificate', desc: 'VGM (Verified Gross Mass) container weighing report.' },
  { key: 'inspectionPdf', name: 'Inspection Certificate', desc: 'Quality inspection and container seal certificate.' },
  { key: 'loadingReportPdf', name: 'Container Loading Report', desc: 'Palletized loading configuration and container photos.' },
  { key: 'qualityReportPdf', name: 'Quality Report', desc: 'pH, EC, sand content, and moisture testing results.' }
];

export default function Invoices() {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedDocName, setSelectedDocName] = useState('');
  const [selectedDocNum, setSelectedDocNum] = useState('');

  // Fetch documents list with 5-second polling interval for auto-refresh
  const { data: dbDocuments, isLoading, error } = useQuery(
    ['my-documents'],
    async () => {
      const res = await apiClient.get('/documents/my-documents');
      return res.data.data;
    },
    {
      refetchInterval: 5000,
      staleTime: 4000,
      refetchOnWindowFocus: true,
    }
  );

  const getDocFromDb = (typeKey) => {
    if (!dbDocuments) return null;
    return dbDocuments.find(d => d.type === typeKey);
  };

  const handlePreview = (doc) => {
    const token = sessionStorage.getItem('cocoveera_token');
    const viewUrl = `${apiClient.defaults.baseURL}/documents/${doc._id}/view?token=${token}`;
    setPdfUrl(viewUrl);
    setSelectedDocName(doc.name);
    setSelectedDocNum(doc.order?.orderNumber || doc.quote?.quoteNumber || 'DOC');
    setPdfModalOpen(true);
  };

  const handleDownload = async (doc) => {
    try {
      const res = await apiClient.get(`/documents/${doc._id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Could not download file. Please try again later.');
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Documents & Export Invoices - Cocoveera" />
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-50 text-[#2E7D32] rounded-2xl flex items-center justify-center shadow-inner">
          <FileText className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-poppins">Documents & Invoices</h1>
          <p className="text-stone-500 font-semibold text-sm">Access your official quotes, invoices, and global export documentations.</p>
        </div>
      </div>

      {isLoading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm animate-pulse space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-stone-100 rounded-xl" />
                <div className="w-20 h-5 bg-stone-100 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-4 bg-stone-100 rounded" />
                <div className="w-5/6 h-3 bg-stone-100 rounded" />
              </div>
              <div className="border-t border-stone-100 pt-4 flex gap-2">
                <div className="flex-1 h-9 bg-stone-100 rounded-xl" />
                <div className="flex-1 h-9 bg-stone-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 max-w-5xl mx-auto shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider mb-1">Failed to fetch documents</h4>
            <p className="text-sm font-semibold">{error.message || 'Please check your connection and try again.'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentTypesList.map((docType) => {
            const dbDoc = getDocFromDb(docType.key);
            const isAvailable = !!dbDoc && dbDoc.status === 'Available';
            
            return (
              <div
                key={docType.key}
                className={`bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#2E7D32]/30 ${
                  isAvailable ? 'bg-gradient-to-br from-white to-[#F9FCF9]' : ''
                }`}
              >
                <div>
                  {/* Status Indicator */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isAvailable ? 'bg-[#EAF4EA] text-[#2E7D32]' : 'bg-stone-100 text-stone-400'
                    }`}>
                      <FileText className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      isAvailable 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {isAvailable ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Available
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-extrabold text-stone-900 font-poppins mb-1">{docType.name}</h3>
                  <p className="text-stone-500 text-xs font-semibold leading-relaxed mb-4">{docType.desc}</p>
                </div>

                <div className="space-y-4 mt-auto">
                  {/* Metadata */}
                  <div className="border-t border-stone-100 pt-3 text-[10px] text-stone-400 font-bold space-y-0.5">
                    <div className="flex justify-between">
                      <span>Generated Date:</span>
                      <span className="text-stone-700">
                        {isAvailable ? new Date(dbDoc.generatedDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Generated By:</span>
                      <span className="text-stone-700">{isAvailable ? dbDoc.generatedBy : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAvailable && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handlePreview(dbDoc)}
                        className="flex-1 min-h-[38px] bg-stone-100 hover:bg-stone-250 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => handleDownload(dbDoc)}
                        className="flex-1 min-h-[38px] bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF Preview Modal */}
      <PDFModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={pdfUrl}
        quoteNumber={selectedDocNum}
        title={selectedDocName}
      />
    </div>
  );
}
