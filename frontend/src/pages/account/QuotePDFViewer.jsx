import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../context/AuthContext';
import { AlertCircle, FileText, ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import SEO from '../../components/SEO';

export default function QuotePDFViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null); // 403, 404, or generic
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPdf = async () => {
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage('');
    try {
      const response = await apiClient.get(`/quotes/${id}/view-pdf`, {
        responseType: 'blob'
      });

      // Revoke old URL if it exists
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }

      // Create blob URL for local iframe display
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Failed to fetch quotation PDF:', error);
      const status = error.response?.status || 500;
      setErrorStatus(status);

      // Attempt to extract text error from blob response
      try {
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          setErrorMessage(json.message || 'Error occurred while loading the document.');
        } else {
          setErrorMessage(error.response?.data?.message || 'Network error occurred while fetching PDF.');
        }
      } catch (e) {
        setErrorMessage('Failed to fetch the quotation PDF file.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPdf();
    }
    
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  const handleClose = () => {
    try {
      // If opened in a new tab, close it
      window.close();
    } catch (e) {
      // Fallback
      navigate('/quotes');
    }
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <SEO title="Loading Quotation PDF..." />
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200/80 max-w-sm w-full flex flex-col items-center text-center space-y-4">
          <Loader className="w-12 h-12 text-[#2E7D32] animate-spin" />
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-poppins">Fetching Document</h2>
            <p className="text-sm text-stone-500 font-semibold mt-1">Please wait while we secure and prepare your quotation PDF.</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. 403 ACCESS DENIED STATE
  if (errorStatus === 403) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <SEO title="Access Denied - Cocoveera" />
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200/80 max-w-md w-full flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 text-red-650 rounded-2xl flex items-center justify-center shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 font-poppins uppercase tracking-wider">Access Denied (403)</h2>
            <p className="text-sm text-stone-500 font-semibold mt-2">
              {errorMessage || 'You do not have authorization to view this quotation document.'}
            </p>
            <p className="text-xs text-stone-400 font-medium mt-1">
              Please make sure you are logged in with the email address linked to the original quote request.
            </p>
          </div>
          <button
            onClick={() => navigate('/quotes')}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-black rounded-xl transition shadow flex items-center gap-2 cursor-pointer border-none"
          >
            <ArrowLeft size={16} />
            <span>Back to My Quotes</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. 404 NOT FOUND STATE (PDF NOT GENERATED/FOUND)
  if (errorStatus === 404) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <SEO title="Quotation PDF Not Available - Cocoveera" />
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200/80 max-w-md w-full flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 bg-stone-100 text-stone-500 rounded-2xl flex items-center justify-center shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 font-poppins uppercase tracking-wider">Quotation PDF Not Available</h2>
            <p className="text-sm text-stone-500 font-semibold mt-2">
              {errorMessage || 'The requested quotation document PDF has not been generated or is unavailable.'}
            </p>
            <p className="text-xs text-stone-400 font-medium mt-1">
              This usually happens if the quote request is still under review or pending official admin approval.
            </p>
          </div>
          <button
            onClick={() => navigate('/quotes')}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-black rounded-xl transition shadow flex items-center gap-2 cursor-pointer border-none"
          >
            <ArrowLeft size={16} />
            <span>Back to My Quotes</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. OTHER GENERIC/NETWORK ERRORS
  if (errorStatus) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <SEO title="Error Loading Document - Cocoveera" />
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200/80 max-w-md w-full flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 font-poppins uppercase tracking-wider">Failed to Load PDF</h2>
            <p className="text-sm text-stone-500 font-semibold mt-2">
              {errorMessage || 'A network error or connection timeout occurred while fetching the document.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/quotes')}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer border-none"
            >
               Back
            </button>
            <button
              onClick={fetchPdf}
              className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2 cursor-pointer border-none"
            >
              <RefreshCw size={14} className="shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. SUCCESSFUL INLINE EMBED VIEW
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <SEO title="View Quotation Document - Cocoveera" />
      
      {/* Top Header Controls bar */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleClose}
            className="px-3.5 py-1.5 bg-stone-150 hover:bg-stone-200 text-stone-750 text-xs font-bold rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Close View</span>
          </button>
          <span className="text-stone-300">|</span>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#2E7D32]" />
            <span className="text-sm font-extrabold text-stone-850 font-poppins">Official Quotation Proposal</span>
          </div>
        </div>
        
        <div className="text-[10px] font-black uppercase text-stone-400 tracking-wider hidden sm:block">
          Cocoveera Export Portal
        </div>
      </header>

      {/* Main Fullscreen PDF Viewport */}
      <div className="flex-1 w-full relative">
        <iframe
          src={`${pdfUrl}#toolbar=1`}
          className="absolute inset-0 w-full h-full border-none bg-stone-100"
          title="Quotation PDF Viewer"
        />
      </div>
    </div>
  );
}
