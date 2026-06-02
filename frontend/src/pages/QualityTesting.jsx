import React, { useState } from 'react';
import { apiClient } from '../context/AuthContext';
import { Search, FileDown, CheckCircle, Info, Palmtree, Settings, Box, Shield, Package, Ship } from 'lucide-react';
import PageHero from '../components/PageHero';

const QualityTesting = () => {
  const [batchCode, setBatchCode] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!batchCode.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await apiClient.get(`/testing/verify/${batchCode.trim()}`);
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setReport(null);
      setError(err.response?.data?.message || 'Laboratory report not found for this batch.');
    } finally {
      setLoading(false);
    }
  };

  const productionStages = [
    { title: 'Raw Material Collection', desc: 'Sourcing premium coconut husks from certified sustainable plantations', icon: Palmtree, color: 'bg-green-100 text-green-700' },
    { title: 'Processing', desc: 'Advanced machinery for fiber extraction and separation', icon: Settings, color: 'bg-blue-100 text-blue-700' },
    { title: 'Compression', desc: 'High-pressure compression into compact blocks for easy transport', icon: Box, color: 'bg-purple-100 text-purple-700' },
    { title: 'Quality Testing', desc: 'Comprehensive laboratory analysis ensuring premium standards', icon: Shield, color: 'bg-orange-100 text-orange-700' },
    { title: 'Packaging', desc: 'UV-stabilized packaging for maximum product protection', icon: Package, color: 'bg-pink-100 text-pink-700' },
    { title: 'Export', desc: 'Global shipping with optimized logistics and documentation', icon: Ship, color: 'bg-cyan-100 text-cyan-700' },
  ];

  return (
    <div className="pb-16 bg-white min-h-screen">
      <PageHero
        badge="MANUFACTURING STANDARDS"
        title="Production Process"
        titleAccent="& QA"
        subtitle="From raw husks to certified substrates: Review our manufacturing infrastructure and verify batch analysis scores."
        breadcrumbs={[{ label: 'Quality Testing', path: '/quality-testing' }]}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Production Process Flow */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 lg:p-10 rounded-3xl border border-stone-200 shadow-soft">
            <h3 className="font-poppins font-extrabold text-stone-900 text-2xl text-center mb-10">
              Our Streamlined Process
            </h3>

            {/* Alternating Vertical Timeline */}
            <div className="relative max-w-2xl mx-auto py-4">
              {/* Central vertical line for desktop */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-200 transform -translate-x-1/2 hidden md:block"></div>
              {/* Left vertical line for mobile */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-200 md:hidden"></div>

              <div className="space-y-12">
                {productionStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isEven = idx % 2 === 0;

                  return (
                    <div key={idx} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                      
                      {/* Icon */}
                      <div className={`absolute left-6 md:left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-2xl flex items-center justify-center z-10 ${stage.color} shadow-sm border-4 border-white`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      {/* Content Card */}
                      <div className={`w-full md:w-5/12 pl-20 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone-100 transition-transform duration-300 hover:-translate-y-1">
                          <h4 className="font-poppins font-bold text-stone-900 text-[15px] mb-2">{stage.title}</h4>
                          <p className="text-stone-500 text-[13px] leading-relaxed font-medium">{stage.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Batch Certificate Verification */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-soft">
            <h3 className="font-poppins font-extrabold text-stone-900 text-lg mb-2">
              Verify Batch QA Report
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed mb-6 font-medium">
              Enter the unique Batch Number stamped on your container invoice or pallet wrap to load chemical logs and download official Certificates of Analysis (COA).
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="E.g., BATCH-COCO-101"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  className="w-full border border-stone-250 rounded-xl py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold px-6 py-3 rounded-xl shadow transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Verification Result Showcase */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 text-red-700 text-xs p-5 rounded-2xl border border-red-150 flex items-start space-x-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-550" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">Verification Failed</strong>
                  {error}
                </div>
              </div>
            )}

            {!loading && searched && !error && !report && (
              <div className="bg-stone-50 border border-stone-150 p-6 rounded-2xl text-center text-stone-500 text-xs">
                Enter a batch code to lookup certified parameters.
              </div>
            )}

            {!loading && report && (
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-5 animate-fade-in text-stone-850">
                <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">BATCH NUMBER</span>
                    <span className="font-poppins font-extrabold text-stone-900 text-base">{report.batchNumber}</span>
                  </div>
                  <div className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-poppins font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>PASSED QA</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs font-semibold text-stone-705">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Product:</span>
                    <strong className="text-stone-900 font-bold">{report.productName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Tested By:</span>
                    <strong className="text-stone-900 font-bold">{report.testerName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Test Date:</span>
                    <strong className="text-stone-900 font-bold">{new Date(report.testDate).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Analytical Dashboard metrics */}
                <div className="space-y-4 border-t border-primary/10 pt-4">
                  <h4 className="font-poppins font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Chemical Analysis
                  </h4>

                  {/* EC Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>EC Level</span>
                      <span className="text-primary font-bold">{report.ecValue}</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  {/* pH Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>pH Balance</span>
                      <span className="text-primary font-bold">{report.phValue}</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  {/* Moisture Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Moisture Content</span>
                      <span className="text-primary font-bold">{report.moisturePercent}</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-primary/10 pt-4 flex">
                  <a
                    href={report.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-primary text-white hover:bg-primary-dark font-poppins text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-soft hover:shadow-md transition-all"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Certificate (PDF)</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QualityTesting;
