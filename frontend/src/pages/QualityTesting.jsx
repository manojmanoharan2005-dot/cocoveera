import React, { useState } from 'react';
import { apiClient } from '../context/AuthContext';
import { Search, FileDown, FlaskConical, ShieldCheck, ThermometerSnowflake, Ruler, Factory, Sun, CheckCircle, Info } from 'lucide-react';

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
    { step: '01', title: 'Raw Husk Sourcing', desc: 'Aged raw husks are collected from the South India coconut belt and stored for six months to stabilize the organic fibers.' },
    { step: '02', title: 'Washing & Buffering', desc: 'Raw coir is thoroughly washed in freshwater pools and buffered with calcium nitrate to displace sodium and potassium ions.' },
    { step: '03', title: 'Natural Sun Drying', desc: 'Washed peat is spread across concrete drying yards, utilizing natural sunlight to reduce moisture levels below 20%.' },
    { step: '04', title: 'Mechanical Screening', desc: 'Peat runs through rotary screeners to extract fine dust particles under 1mm, securing optimum root aeration.' },
    { step: '05', title: 'Compaction & Packing', desc: 'Sifted peat is compressed at a 5:1 ratio into blocks or grow bags, then wrapped in UV-protected polythene.' },
    { step: '06', title: 'Lab Verification', desc: 'Samples from each pallet are audited for EC, pH, and moisture. Only approved batches are loaded for seaport shipping.' },
  ];

  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      {/* Page Header */}
      <section className="bg-primary text-white py-12 px-6 mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 space-y-2">
          <span className="text-secondary-light font-poppins text-xs font-bold uppercase tracking-widest bg-white/10 py-1 px-3 rounded-lg">
            MANUFACTURING STANDARDS
          </span>
          <h1 className="text-3xl sm:text-5xl font-poppins font-extrabold mt-1">
            Production Process & QA
          </h1>
          <p className="text-stone-105 text-xs sm:text-sm max-w-lg mx-auto mt-3 leading-relaxed font-medium">
            From raw husks to certified substrates: Review our manufacturing infrastructure and verify batch analysis scores.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Production Process Flow */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-soft">
            <h3 className="font-poppins font-extrabold text-stone-900 text-lg mb-2">
              Our Six Production Stages
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed mb-8 font-medium">
              We maintain a rigorous quality assurance flow at our Cochin and Pollachi yards to guarantee crop safety and substrate consistency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {productionStages.map((stage, idx) => (
                <div key={idx} className="border border-stone-200 p-5 rounded-2xl bg-accent hover:bg-white hover:shadow-soft transition-all duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-primary font-poppins font-extrabold text-lg opacity-40">{stage.step}</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                      {idx === 0 && <Factory className="w-4 h-4" />}
                      {idx === 1 && <FlaskConical className="w-4 h-4" />}
                      {idx === 2 && <Sun className="w-4 h-4" />}
                      {idx === 3 && <Ruler className="w-4 h-4" />}
                      {idx === 4 && <Factory className="w-4 h-4" />}
                      {idx === 5 && <ShieldCheck className="w-4 h-4" />}
                    </div>
                  </div>
                  <h4 className="font-poppins font-bold text-stone-850 text-sm">{stage.title}</h4>
                  <p className="text-stone-550 text-[11px] mt-1.5 leading-relaxed font-medium">{stage.desc}</p>
                </div>
              ))}
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
