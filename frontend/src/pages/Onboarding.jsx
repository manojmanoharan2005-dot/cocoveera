import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, Search, Plus, Minus, Package, ShieldCheck, CheckCircle2,
  FileText, ArrowDownRight, ArrowUpRight, Zap, Download, Truck, Ship,
  Clock, CreditCard, ChevronRight, Anchor, Factory, Check, HelpCircle,
  ExternalLink, Layers, Award, Sparkles, AlertCircle, FileCheck, RefreshCw, Eye
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Homepage & Search', subtitle: 'Browse & search coconut substrates', category: 'Discovery' },
  { id: 2, title: 'Product Details', subtitle: 'Select specifications & quantities', category: 'Discovery' },
  { id: 3, title: 'Live Container', subtitle: 'Real-time 3D fill & weight check', category: 'Planning' },
  { id: 4, title: 'Request Quote', subtitle: 'Submit RFQ with shipping address', category: 'Planning' },
  { id: 5, title: 'My Quotes Dashboard', subtitle: 'Instant quotation review status', category: 'Negotiation' },
  { id: 6, title: 'Quote Approved', subtitle: 'Review pricing, PDF & validity', category: 'Negotiation' },
  { id: 7, title: 'Accept Quote', subtitle: 'One-click quote to order conversion', category: 'Negotiation' },
  { id: 8, title: 'My Orders', subtitle: 'Automated milestone order tracking', category: 'Fulfillment' },
  { id: 9, title: '40% Advance Payment', subtitle: 'Proforma invoice & wire transfer', category: 'Payment' },
  { id: 10, title: 'Production & QC', subtitle: 'Sieving, EC testing & packaging', category: 'Production' },
  { id: 11, title: '60% Production Payment', subtitle: 'Milestone progress update', category: 'Payment' },
  { id: 12, title: 'Container Loading', subtitle: 'Palletized loading photos & seals', category: 'Logistics' },
  { id: 13, title: '80% Shipping Payment', subtitle: 'Port dispatch confirmation', category: 'Payment' },
  { id: 14, title: 'Ocean Freight Tracking', subtitle: 'Live vessel & ETA monitoring', category: 'Logistics' },
  { id: 15, title: 'Delivery & Documents', subtitle: 'Tax Invoice, B/L, COO & Reports', category: 'Completion' }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');
  const stepRefs = useRef({});

  // IntersectionObserver to sync sticky sidebar step highlight as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      for (let i = STEPS.length; i >= 1; i--) {
        const el = stepRefs.current[i];
        if (el && el.offsetTop <= scrollPos) {
          setActiveStep(i);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStep = (id) => {
    setActiveStep(id);
    const el = stepRefs.current[id];
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const filteredSteps = STEPS.filter(s => 
    s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
    `step ${s.id}`.includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-stone-900 font-sans selection:bg-[#2E7D32] selection:text-white">
      
      {/* ── TOP NAV / HEADER BAR ── */}
      <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-white py-3.5 px-4 sm:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.webp" alt="Cocoveera" className="h-9 object-contain" />
              <span className="font-poppins font-black text-base text-white tracking-wider hidden sm:inline">
                COCO<span className="text-emerald-400">VEERA</span>
              </span>
            </Link>
            <span className="h-4 w-px bg-stone-700 hidden sm:block" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 animate-spin text-emerald-300" />
              Interactive B2B Ordering Manual
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/products"
              className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-black font-poppins transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER SECTION ── */}
      <section className="relative py-14 px-4 sm:px-8 bg-gradient-to-b from-stone-900 via-stone-900 to-[#122413] text-white border-b border-stone-800 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4CAF50_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>90% Visual Walkthrough • 10% Text • Zero Reading Required</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-poppins font-black tracking-tight leading-tight max-w-4xl mx-auto">
            How to Buy Coconut Substrates on <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-200">Cocoveera</span>
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            Follow this 15-step interactive visual guide to learn how to request quotations, track 3D container loading, manage milestone payments, and download export documentation.
          </p>

          {/* Quick Step Search / Filter */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search any step (e.g. Quote, Container, 40% Payment, Delivery)..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-medium transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN BODY WITH STICKY PROGRESS SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── STICKY SIDEBAR (LEFT: 3 COLS) ── */}
        <aside className="lg:col-span-3 sticky top-20 hidden lg:block bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3 max-h-[82vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-poppins font-black text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2E7D32]" />
              <span>Ordering Workflow</span>
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32]">
              {activeStep} / 15
            </span>
          </div>

          {/* STEP NAVIGATION BUTTONS */}
          <div className="space-y-1">
            {STEPS.map((step) => {
              const isActive = activeStep === step.id;
              const isPassed = activeStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => scrollToStep(step.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer group ${
                    isActive 
                      ? 'bg-[#2E7D32] text-white shadow-md font-bold ring-2 ring-[#2E7D32]/20' 
                      : isPassed 
                        ? 'bg-stone-50 text-stone-700 hover:bg-emerald-50/60' 
                        : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-white text-[#2E7D32]' 
                      : isPassed 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300'
                  }`}>
                    {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                  </span>

                  <div className="truncate">
                    <div className="text-xs font-extrabold truncate">{step.title}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-stone-400'}`}>
                      {step.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── STEP CONTENT CARDS (RIGHT: 9 COLS) ── */}
        <main className="lg:col-span-9 space-y-16">
          
          {/* STEP 1: HOMEPAGE & SEARCH */}
          <section ref={el => stepRefs.current[1] = el} id="step-1" className="scroll-mt-24 space-y-4">
            <StepHeader number={1} title="Homepage & Search" category="Discovery" subtitle="Locate products via header navigation or visual search" />
            
            {/* UI SCREEN CONTAINER */}
            <MockupContainer title="Cocoveera B2B Homepage — Search & Categories">
              <div className="bg-stone-900 text-white p-6 space-y-6 relative overflow-hidden rounded-b-xl">
                
                {/* Search Bar Annotation Box */}
                <div className="relative bg-stone-800 border-2 border-emerald-400 rounded-2xl p-4 shadow-lg">
                  <HighlightBadge number={1} label="Search Bar" position="top-right" />
                  <div className="flex items-center gap-3 bg-stone-900 px-4 py-3 rounded-xl border border-stone-700">
                    <Search className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-semibold text-stone-300">Search "5kg Cocopeat Block", "Grow Bags", "Coco Chips"...</span>
                    <span className="ml-auto bg-emerald-600 text-white text-xs px-3 py-1 rounded-lg font-bold">Search</span>
                  </div>
                </div>

                {/* Categories & Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                  
                  {/* Category Highlight */}
                  <div className="bg-stone-800 border-2 border-red-500 rounded-xl p-4 relative">
                    <HighlightBadge number={2} label="Product Categories" position="top-right" color="red" />
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2">Category Filter</div>
                    <ul className="space-y-1.5 text-xs text-stone-300 font-medium">
                      <li className="bg-emerald-900/60 text-emerald-200 px-2.5 py-1 rounded-lg font-bold border border-emerald-600">✔ Cocopeat Blocks (5kg)</li>
                      <li className="px-2.5 py-1">✔ Open Top Grow Bags</li>
                      <li className="px-2.5 py-1">✔ Coco Chips & Briquettes</li>
                    </ul>
                  </div>

                  {/* Browse Products */}
                  <div className="sm:col-span-2 bg-stone-800 border-2 border-emerald-500 rounded-xl p-4 relative flex flex-col justify-between">
                    <HighlightBadge number={3} label="Browse Products" position="top-right" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-white">Popular Substrate Blocks</span>
                      <span className="text-[10px] font-bold text-emerald-400">Showing 12 Export Items</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-stone-900 p-3 rounded-xl border border-stone-700 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-900/40 rounded-lg flex items-center justify-center font-black text-amber-400 text-xs">5KG</div>
                        <div>
                          <div className="text-xs font-bold text-white">5kg Cocopeat Block</div>
                          <div className="text-[10px] text-emerald-400 font-bold">$2.80 / Block</div>
                        </div>
                      </div>
                      <div className="bg-stone-900 p-3 rounded-xl border border-stone-700 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-900/40 rounded-lg flex items-center justify-center font-black text-emerald-400 text-xs">BAG</div>
                        <div>
                          <div className="text-xs font-bold text-white">Grow Bag 100cm</div>
                          <div className="text-[10px] text-emerald-400 font-bold">$1.95 / Bag</div>
                        </div>
                      </div>
                    </div>

                    {/* Red Connecting Arrow */}
                    <div className="mt-4 flex items-center justify-end gap-2 text-red-400 font-black text-xs animate-bounce">
                      <span>Click Product to View Details</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 2: PRODUCT DETAILS */}
          <section ref={el => stepRefs.current[2] = el} id="step-2" className="scroll-mt-24 space-y-4">
            <StepHeader number={2} title="Product Details & Quantity Selector" category="Discovery" subtitle="Adjust specs, pallet requirements, and order container volume" />
            
            <MockupContainer title="Product Details — 5kg Cocopeat Block">
              <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative rounded-b-xl border border-stone-200">
                
                {/* Left: Product Image Box */}
                <div className="relative bg-stone-100 rounded-2xl p-6 border-2 border-stone-300 flex flex-col items-center justify-center group">
                  <HighlightBadge number={1} label="High-Res Product Asset" position="top-left" />
                  <div className="w-44 h-44 bg-gradient-to-br from-amber-800 to-amber-950 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white p-4 text-center">
                    <Package className="w-12 h-12 text-amber-400 mb-2" />
                    <span className="font-poppins font-black text-sm">5KG COCOPEAT BLOCK</span>
                    <span className="text-[10px] text-amber-200 mt-1">Washed • Low EC &lt; 0.5 mS/cm</span>
                  </div>
                </div>

                {/* Right: Quantity & Live Container Preview Trigger */}
                <div className="space-y-4 relative">
                  <div>
                    <h4 className="font-poppins font-black text-lg text-stone-900">5kg High Expansion Cocopeat Block</h4>
                    <p className="text-xs text-stone-500 font-medium">B2B Wholesale Container Pricing • Minimum 1 Container</p>
                  </div>

                  {/* Quantity Selector Highlight */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-500 relative space-y-2">
                    <HighlightBadge number={2} label="Quantity Selector (+ / -)" position="top-right" />
                    <label className="block text-xs font-black text-[#2E7D32] uppercase tracking-wider">Select Container Quantity</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border-2 border-emerald-600 bg-white rounded-xl overflow-hidden shadow-sm">
                        <button className="px-3 py-2 text-emerald-800 font-black hover:bg-emerald-100"><Minus className="w-4 h-4" /></button>
                        <span className="px-4 py-2 font-black text-sm text-stone-900">1.00</span>
                        <button className="px-3 py-2 text-emerald-800 font-black hover:bg-emerald-100"><Plus className="w-4 h-4" /></button>
                      </div>
                      <span className="text-xs font-bold text-stone-600">FCL Container (40ft High Cube)</span>
                    </div>
                  </div>

                  {/* Live Container Preview Card Highlight */}
                  <div className="p-4 bg-stone-900 text-white rounded-2xl border-2 border-red-500 relative space-y-2">
                    <HighlightBadge number={3} label="Live Container Preview" position="top-right" color="red" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Live Cargo Visualizer</span>
                      <span className="text-[10px] font-extrabold bg-emerald-700 text-white px-2 py-0.5 rounded-md">100% Filled</span>
                    </div>
                    <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full rounded-full" />
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-stone-350 pt-1">
                      <span>Pallet Count: 24 Pallets</span>
                      <span>Total Net Wt: 26.4 MT</span>
                    </div>
                  </div>

                  {/* Red Arrow Pointer */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 font-black text-xs">
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-red-600 stroke-[3]" />
                      Click "+" or adjust quantity to automatically compute container fill.
                    </span>
                  </div>

                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 3: LIVE CONTAINER VISUALIZER */}
          <section ref={el => stepRefs.current[3] = el} id="step-3" className="scroll-mt-24 space-y-4">
            <StepHeader number={3} title="Live Container Cargo Simulator" category="Planning" subtitle="Inspect volume utilization, weight limits and pallet placement in real time" />
            
            <MockupContainer title="Real-Time 3D Container Fill Visualizer">
              <div className="bg-stone-950 p-6 rounded-b-xl relative text-white space-y-6">
                
                {/* 3D Container Model Box */}
                <div className="relative h-64 bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-emerald-500 rounded-2xl flex items-center justify-center overflow-hidden">
                  <HighlightBadge number={1} label="3D Interactive Canvas" position="top-left" />
                  
                  {/* Wireframe Container Graphic */}
                  <div className="w-4/5 h-40 border-2 border-emerald-400/80 rounded-lg relative flex items-center justify-evenly p-2 bg-emerald-950/30">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-poppins font-black text-2xl text-emerald-400/40 uppercase tracking-widest">40FT HIGH CUBE CONTAINER</span>
                    </div>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-10 h-28 bg-amber-800/80 border border-amber-400/60 rounded flex flex-col justify-end p-1 shadow-md z-10">
                        <div className="w-full h-3 bg-amber-500/80 rounded-sm mb-1"></div>
                        <span className="text-[8px] font-black text-white text-center">PLT {i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                  <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 text-center">
                    <HighlightBadge number={2} label="Fill %" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Container Fill</span>
                    <span className="text-lg font-black text-emerald-400 font-poppins">100.0%</span>
                  </div>

                  <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 text-center">
                    <HighlightBadge number={3} label="Weight" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Gross Weight</span>
                    <span className="text-lg font-black text-emerald-400 font-poppins">26.40 MT</span>
                  </div>

                  <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 text-center">
                    <HighlightBadge number={4} label="Volume CBM" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Volume CBM</span>
                    <span className="text-lg font-black text-emerald-400 font-poppins">68.2 CBM</span>
                  </div>

                  <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 text-center">
                    <HighlightBadge number={5} label="Items" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Blocks</span>
                    <span className="text-lg font-black text-emerald-400 font-poppins">5,280 Units</span>
                  </div>
                </div>

                {/* Next Step Arrow */}
                <div className="p-4 bg-emerald-950 border border-emerald-600/80 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-emerald-200 font-medium">
                    When container setup is verified, click <strong className="text-white">Request Quote</strong> to send specifications directly to our export managers.
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shrink-0 shadow-lg">
                    <span>Request Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 4: REQUEST QUOTE */}
          <section ref={el => stepRefs.current[4] = el} id="step-4" className="scroll-mt-24 space-y-4">
            <StepHeader number={4} title="Request Official Quotation (RFQ)" category="Planning" subtitle="Provide delivery country, destination port, and custom packaging instructions" />
            
            <MockupContainer title="Request Quote Modal — Destination & Specifications">
              <div className="bg-white p-6 rounded-b-xl border border-stone-200 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left 2 Cols: RFQ Form */}
                  <div className="md:col-span-2 space-y-4">
                    
                    <div className="p-3 bg-stone-50 border-2 border-emerald-500 rounded-xl relative space-y-2">
                      <HighlightBadge number={1} label="Destination Country & Port" position="top-right" />
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider">Destination Country &amp; Discharge Port</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800">🇺🇸 United States</div>
                        <div className="p-2 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800">Port of Rotterdam (NL)</div>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border-2 border-red-500 rounded-xl relative space-y-2">
                      <HighlightBadge number={2} label="Custom Packing & Notes" position="top-right" color="red" />
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider">Special Packaging / Palletizing Notes</label>
                      <div className="p-2.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-600">
                        "Require heat-treated ISPM 15 wooden pallets with corner edge guards &amp; private label plastic film print."
                      </div>
                    </div>

                  </div>

                  {/* Right Col: Container Summary & Submit */}
                  <div className="bg-stone-900 text-white p-4 rounded-xl space-y-4 relative border-2 border-emerald-500 flex flex-col justify-between">
                    <HighlightBadge number={3} label="Selected Products & Submit" position="top-right" />
                    
                    <div>
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2">Quote Summary</div>
                      <div className="text-xs space-y-1 font-medium text-stone-300">
                        <div className="flex justify-between"><span>Container:</span><span className="font-bold text-white">40FT HC</span></div>
                        <div className="flex justify-between"><span>Substrate:</span><span className="font-bold text-white">5kg Block</span></div>
                        <div className="flex justify-between"><span>Quantity:</span><span className="font-bold text-white">1.00 FCL</span></div>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2">
                      <span>Submit Request Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 5: MY QUOTES DASHBOARD */}
          <section ref={el => stepRefs.current[5] = el} id="step-5" className="scroll-mt-24 space-y-4">
            <StepHeader number={5} title="My Quotes Dashboard & Review Status" category="Negotiation" subtitle="Monitor submitted RFQs while export managers calculate FOB / CIF pricing" />
            
            <MockupContainer title="Customer Dashboard — My Quotes Tab">
              <div className="bg-white p-6 rounded-b-xl border border-stone-200 space-y-4">
                
                {/* Dashboard Table Mockup */}
                <div className="overflow-hidden border border-stone-200 rounded-xl shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-poppins font-black uppercase text-[10px] tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="p-3">RFQ Number</th>
                        <th className="p-3">Container Type</th>
                        <th className="p-3">Destination Port</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      <tr className="bg-amber-50/60 border-l-4 border-l-amber-500">
                        <td className="p-3 font-bold text-stone-900">#QT-2026-9041</td>
                        <td className="p-3 text-stone-600">1x 40FT High Cube</td>
                        <td className="p-3 text-stone-600">Port of Rotterdam (NL)</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            Pending Review
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700">Under Evaluation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Explanation Glassmorphic Box */}
                <div className="p-4 bg-emerald-900/90 text-white rounded-xl border border-emerald-600 flex items-start gap-3 shadow-md">
                  <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="text-emerald-300 font-bold block">What happens during Pending Review?</strong>
                    <p className="text-stone-200 leading-relaxed font-medium">
                      Our commercial export desk calculates ocean freight rates, customs clearance, port handling fees, and volume discounts. Response time is usually under 2 business hours.
                    </p>
                  </div>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 6: QUOTE APPROVED */}
          <section ref={el => stepRefs.current[6] = el} id="step-6" className="scroll-mt-24 space-y-4">
            <StepHeader number={6} title="Official Quote Approval & PDF Download" category="Negotiation" subtitle="Receive finalized FOB/CIF quotation with pricing breakdown and validity window" />
            
            <MockupContainer title="Approved Quotation View — #QT-2026-9041">
              <div className="bg-white p-6 rounded-b-xl border border-stone-200 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  <div className="p-3 bg-stone-50 border-2 border-emerald-500 rounded-xl relative text-center">
                    <HighlightBadge number={1} label="Quotation Number" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Quote ID</span>
                    <span className="text-sm font-black text-stone-900 font-poppins">#QT-2026-9041</span>
                  </div>

                  <div className="p-3 bg-stone-50 border-2 border-emerald-500 rounded-xl relative text-center">
                    <HighlightBadge number={2} label="Negotiated Unit Price" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">FOB Unit Price</span>
                    <span className="text-sm font-black text-emerald-700 font-poppins">$2.65 / Block</span>
                  </div>

                  <div className="p-3 bg-stone-50 border-2 border-red-500 rounded-xl relative text-center">
                    <HighlightBadge number={3} label="Quote Validity" position="top-right" color="red" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Validity Window</span>
                    <span className="text-sm font-black text-red-600 font-poppins">14 Days Remaining</span>
                  </div>

                  <div className="p-3 bg-emerald-900 text-white rounded-xl border-2 border-emerald-400 relative text-center flex flex-col justify-center items-center">
                    <HighlightBadge number={4} label="Download PDF" position="top-right" />
                    <button className="flex items-center gap-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-white">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 7: ACCEPT QUOTE */}
          <section ref={el => stepRefs.current[7] = el} id="step-7" className="scroll-mt-24 space-y-4">
            <StepHeader number={7} title="Accept Quote & Convert to Active Order" category="Negotiation" subtitle="One-click acceptance locks container allocation and generates proforma order" />
            
            <MockupContainer title="Quotation Action Panel — Accept & Lock Order">
              <div className="bg-stone-900 text-white p-6 rounded-b-xl relative space-y-6">
                
                <div className="p-6 bg-gradient-to-r from-emerald-950 to-stone-900 border-2 border-emerald-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative shadow-xl">
                  <HighlightBadge number={1} label="Accept Quote Button" position="top-left" />
                  
                  <div>
                    <h4 className="font-poppins font-black text-lg text-white">Ready to Lock Your Shipment?</h4>
                    <p className="text-xs text-emerald-200 font-medium mt-1">
                      Accepting this quote reserves 1x 40FT HC Container production batch and generates milestone payment terms.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button className="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-poppins font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>ACCEPT QUOTE NOW</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-xs">
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                  <span>Clicking "Accept Quote" automatically creates order #ORD-2026-9041 under My Orders.</span>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 8: MY ORDERS */}
          <section ref={el => stepRefs.current[8] = el} id="step-8" className="scroll-mt-24 space-y-4">
            <StepHeader number={8} title="Automated Order Conversion & Status Tracker" category="Fulfillment" subtitle="View order stage, payment milestones, and fulfillment progress" />
            
            <MockupContainer title="Customer Dashboard — My Orders Tab">
              <div className="bg-white p-6 rounded-b-xl border border-stone-200 space-y-6">
                
                <div className="p-4 bg-stone-50 border-2 border-emerald-500 rounded-2xl space-y-4 relative">
                  <HighlightBadge number={1} label="Order Status & Progress Bar" position="top-right" />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-stone-900">Order #ORD-2026-9041</span>
                      <span className="text-[10px] text-stone-400 block">Created Jul 27, 2026 • 1x 40FT HC</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-[#2E7D32] rounded-full text-xs font-black border border-emerald-300">
                      Processing • 40% Milestone Due
                    </span>
                  </div>

                  {/* Progress Milestone Line */}
                  <div className="relative pt-2">
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 w-[10%] rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-stone-500 pt-2 uppercase">
                      <span className="text-emerald-700">0% Confirmed</span>
                      <span>40% Advance</span>
                      <span>60% Production</span>
                      <span>80% Loading</span>
                      <span>100% Delivered</span>
                    </div>
                  </div>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 9: 40% ADVANCE PAYMENT */}
          <section ref={el => stepRefs.current[9] = el} id="step-9" className="scroll-mt-24 space-y-4">
            <StepHeader number={9} title="40% Advance Milestone Payment" category="Payment" subtitle="Download Proforma Invoice, initiate SWIFT wire transfer & upload payment slip" />
            
            <MockupContainer title="Milestone Payment Portal — 40% Advance ($5,596.80)">
              <div className="bg-stone-900 text-white p-6 rounded-b-xl border border-stone-800 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="p-4 bg-stone-800 border-2 border-emerald-500 rounded-xl relative space-y-2">
                    <HighlightBadge number={1} label="Pay Now / Wire Details" position="top-right" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Wire Transfer (SWIFT)</span>
                    <div className="text-xs space-y-1 text-stone-300 font-medium">
                      <div>Bank: <strong>HDFC Bank India</strong></div>
                      <div>SWIFT: <strong>HDFCINBBXXX</strong></div>
                      <div>Account: <strong>502000889120</strong></div>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-800 border-2 border-red-500 rounded-xl relative space-y-2">
                    <HighlightBadge number={2} label="Upload Payment Proof" position="top-right" color="red" />
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Payment Slip Upload</span>
                    <div className="p-3 bg-stone-900 border border-stone-700 rounded-lg text-center cursor-pointer hover:border-emerald-400">
                      <CreditCard className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-white block">Click to Upload Bank Slip</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950 border-2 border-emerald-400 rounded-xl relative flex flex-col justify-between">
                    <HighlightBadge number={3} label="Milestone Auto-Update" position="top-right" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Milestone Status</span>
                      <span className="text-sm font-black text-white block mt-1">40% Payment Confirmed</span>
                    </div>
                    <div className="text-[10px] text-emerald-200 font-medium mt-2">
                      Raw coir block processing and washing begins upon 40% receipt.
                    </div>
                  </div>

                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 10: PRODUCTION & QC */}
          <section ref={el => stepRefs.current[10] = el} id="step-10" className="scroll-mt-24 space-y-4">
            <StepHeader number={10} title="Factory Production & Quality Control" category="Production" subtitle="Sieving, washing, EC/pH testing, block compression and pallet shrink wrapping" />
            
            <MockupContainer title="Factory Production Visual Tracker">
              <div className="bg-white p-6 rounded-b-xl border border-stone-200 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="p-4 bg-stone-50 border-2 border-emerald-500 rounded-xl relative text-center space-y-2">
                    <HighlightBadge number={1} label="Manufacturing" position="top-right" />
                    <Factory className="w-8 h-8 text-[#2E7D32] mx-auto" />
                    <h5 className="font-poppins font-black text-xs text-stone-900">Coir Processing</h5>
                    <p className="text-[11px] text-stone-500 font-medium">Triple-washed, sun-dried &amp; sieved to remove fiber fines.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border-2 border-emerald-500 rounded-xl relative text-center space-y-2">
                    <HighlightBadge number={2} label="Quality Check (EC & pH)" position="top-right" />
                    <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h5 className="font-poppins font-black text-xs text-stone-900">Lab Testing</h5>
                    <p className="text-[11px] text-stone-500 font-medium">EC &lt; 0.5 mS/cm • pH 5.8-6.5 • Moisture &lt; 15%</p>
                  </div>

                  <div className="p-4 bg-stone-50 border-2 border-emerald-500 rounded-xl relative text-center space-y-2">
                    <HighlightBadge number={3} label="Pallet Packing" position="top-right" />
                    <Package className="w-8 h-8 text-amber-700 mx-auto" />
                    <h5 className="font-poppins font-black text-xs text-stone-900">Export Palletizing</h5>
                    <p className="text-[11px] text-stone-500 font-medium">220 blocks per pallet, shrink wrapped with edge guards.</p>
                  </div>

                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 11: 60% PAYMENT */}
          <section ref={el => stepRefs.current[11] = el} id="step-11" className="scroll-mt-24 space-y-4">
            <StepHeader number={11} title="60% Production Completion Milestone" category="Payment" subtitle="Second milestone invoice released upon production completion inspection" />
            
            <MockupContainer title="Production Progress Invoice — 60% Milestone">
              <div className="bg-stone-900 text-white p-6 rounded-b-xl border border-stone-800 space-y-4">
                
                <div className="p-4 bg-stone-800 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-4 relative">
                  <HighlightBadge number={1} label="60% Progress Update" position="top-left" />
                  
                  <div>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Milestone 2 Reached</span>
                    <span className="text-sm font-bold text-white">Production Finished &amp; QC Verified</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-400 block">Milestone Amount</span>
                    <span className="text-lg font-black text-emerald-400 font-poppins">$2,798.40</span>
                  </div>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 12: CONTAINER LOADING */}
          <section ref={el => stepRefs.current[12] = el} id="step-12" className="scroll-mt-24 space-y-4">
            <StepHeader number={12} title="Container Stuffing & Port Dispatch Photos" category="Logistics" subtitle="High-resolution loading inspection photos and container seal verification" />
            
            <MockupContainer title="Stuffing Inspection & Container Seal Photos">
              <div className="bg-white p-6 rounded-b-xl border border-stone-200 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="p-3 bg-stone-100 rounded-xl border-2 border-emerald-500 relative text-center">
                    <HighlightBadge number={1} label="Pallet Inspection" position="top-right" />
                    <div className="h-28 bg-amber-900/20 rounded-lg flex items-center justify-center mb-2">
                      <Package className="w-10 h-10 text-amber-800" />
                    </div>
                    <span className="text-xs font-bold text-stone-800">24 Pallets Checked</span>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl border-2 border-emerald-500 relative text-center">
                    <HighlightBadge number={2} label="Stuffing Process" position="top-right" />
                    <div className="h-28 bg-emerald-900/20 rounded-lg flex items-center justify-center mb-2">
                      <Truck className="w-10 h-10 text-emerald-800" />
                    </div>
                    <span className="text-xs font-bold text-stone-800">Container Loaded</span>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl border-2 border-red-500 relative text-center">
                    <HighlightBadge number={3} label="Customs Seal Tag" position="top-right" color="red" />
                    <div className="h-28 bg-red-900/20 rounded-lg flex items-center justify-center mb-2">
                      <ShieldCheck className="w-10 h-10 text-red-800" />
                    </div>
                    <span className="text-xs font-bold text-stone-800">Seal #IND-902811</span>
                  </div>

                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 13: 80% PAYMENT */}
          <section ref={el => stepRefs.current[13] = el} id="step-13" className="scroll-mt-24 space-y-4">
            <StepHeader number={13} title="80% Port Dispatch Payment Milestone" category="Payment" subtitle="Third milestone release upon container gate-in at export terminal" />
            
            <MockupContainer title="Port Terminal Gate-In Confirmation — 80% Payment">
              <div className="bg-stone-900 text-white p-6 rounded-b-xl border border-stone-800">
                
                <div className="p-4 bg-emerald-950 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-4 relative">
                  <HighlightBadge number={1} label="80% Confirmed" position="top-left" />
                  <div>
                    <span className="text-xs font-black text-emerald-400 uppercase">Container at Port Terminal</span>
                    <p className="text-xs text-stone-300 font-medium">Customs clearance completed &amp; vessel loading scheduled.</p>
                  </div>
                  <span className="text-sm font-black text-white bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-500">
                    80% Milestone Complete
                  </span>
                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 14: SHIPMENT */}
          <section ref={el => stepRefs.current[14] = el} id="step-14" className="scroll-mt-24 space-y-4">
            <StepHeader number={14} title="Ocean Freight Shipment & Live Vessel Tracking" category="Logistics" subtitle="Real-time vessel GPS location, bill of lading draft & estimated arrival date" />
            
            <MockupContainer title="Live Ocean Cargo Radar & Shipping Details">
              <div className="bg-stone-950 text-white p-6 rounded-b-xl border border-stone-800 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="p-3 bg-stone-900 border-2 border-emerald-500 rounded-xl relative text-center">
                    <HighlightBadge number={1} label="Tracking Number" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Container ID</span>
                    <span className="text-xs font-black text-emerald-400 font-poppins">MSKU-9821049</span>
                  </div>

                  <div className="p-3 bg-stone-900 border-2 border-emerald-500 rounded-xl relative text-center">
                    <HighlightBadge number={2} label="Shipping Line" position="top-right" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Carrier</span>
                    <span className="text-xs font-black text-white font-poppins">Maersk Line (Vessel 402E)</span>
                  </div>

                  <div className="p-3 bg-stone-900 border-2 border-red-500 rounded-xl relative text-center">
                    <HighlightBadge number={3} label="ETA Date" position="top-right" color="red" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Estimated Arrival</span>
                    <span className="text-xs font-black text-red-400 font-poppins">Aug 18, 2026 (Rotterdam)</span>
                  </div>

                </div>

              </div>
            </MockupContainer>
          </section>


          {/* STEP 15: DELIVERED & DOCUMENTS */}
          <section ref={el => stepRefs.current[15] = el} id="step-15" className="scroll-mt-24 space-y-4">
            <StepHeader number={15} title="Order Completion & Digital Export Document Vault" category="Completion" subtitle="Download all 5 official shipping documents for port release & customs entry" />
            
            <MockupContainer title="Export Document Hub — Complete Order #ORD-2026-9041">
              <div className="bg-white p-6 rounded-b-xl border border-stone-200 space-y-6">
                
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#2E7D32]" />
                    <div>
                      <h4 className="font-poppins font-black text-sm text-stone-900">Shipment Delivered &amp; Cleared</h4>
                      <p className="text-xs text-stone-600 font-medium">All 5 compliance export documents are verified and available for download.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#2E7D32] text-white text-xs font-black rounded-lg uppercase">Completed</span>
                </div>

                {/* 5 Export Document Buttons Highlight */}
                <div className="p-4 bg-stone-900 text-white rounded-2xl border-2 border-emerald-500 space-y-3 relative">
                  <HighlightBadge number={1} label="5 Downloadable Export Documents" position="top-right" />
                  
                  <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">Official Certificate Vault</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    
                    <div className="p-2.5 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> Tax Invoice</span>
                      <Download className="w-3.5 h-3.5 text-stone-400 cursor-pointer hover:text-white" />
                    </div>

                    <div className="p-2.5 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> Packing List</span>
                      <Download className="w-3.5 h-3.5 text-stone-400 cursor-pointer hover:text-white" />
                    </div>

                    <div className="p-2.5 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2"><Anchor className="w-4 h-4 text-emerald-400" /> Bill of Lading (B/L)</span>
                      <Download className="w-3.5 h-3.5 text-stone-400 cursor-pointer hover:text-white" />
                    </div>

                    <div className="p-2.5 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-400" /> Certificate of Origin</span>
                      <Download className="w-3.5 h-3.5 text-stone-400 cursor-pointer hover:text-white" />
                    </div>

                    <div className="p-2.5 bg-stone-800 border border-stone-700 rounded-xl flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Quality Certificate</span>
                      <Download className="w-3.5 h-3.5 text-stone-400 cursor-pointer hover:text-white" />
                    </div>

                  </div>
                </div>

              </div>
            </MockupContainer>
          </section>

        </main>
      </div>

    </div>
  );
}

/* ── HELPER COMPONENTS ── */

function StepHeader({ number, title, category, subtitle }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-poppins font-black text-sm shadow-md">
          {number}
        </span>
        <span className="text-xs font-black uppercase tracking-widest text-[#2E7D32] bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Step {number} • {category}
        </span>
      </div>
      <h2 className="text-xl sm:text-2xl font-poppins font-black text-stone-900 tracking-tight">
        {title}
      </h2>
      <p className="text-xs text-stone-600 font-medium">
        {subtitle}
      </p>
    </div>
  );
}

function MockupContainer({ title, children }) {
  return (
    <div className="w-full bg-stone-900 rounded-2xl shadow-xl overflow-hidden border border-stone-700">
      {/* MAC-STYLE BROWSER HEADER BAR */}
      <div className="bg-stone-900 px-4 py-2.5 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
        </div>
        
        <div className="bg-stone-800 px-6 py-1 rounded-md text-[11px] text-stone-400 font-mono font-medium truncate max-w-xs sm:max-w-md">
          https://cocoveera.com/app/{title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
        </div>

        <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest hidden sm:block">
          Interactive UI Mockup
        </div>
      </div>

      {/* SCREEN CONTENT */}
      {children}
    </div>
  );
}

function HighlightBadge({ number, label, position = 'top-right', color = 'green' }) {
  const isRed = color === 'red';

  return (
    <div className={`absolute z-20 flex items-center gap-1.5 ${
      position === 'top-right' ? '-top-3 -right-2' : 
      position === 'top-left' ? '-top-3 -left-2' : 
      position === 'bottom-right' ? '-bottom-3 -right-2' : '-bottom-3 -left-2'
    }`}>
      <span className={`w-5 h-5 rounded-full ${isRed ? 'bg-red-600' : 'bg-emerald-600'} text-white text-[10px] font-black flex items-center justify-center shadow-lg ring-2 ring-white animate-pulse`}>
        {number}
      </span>
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isRed ? 'bg-red-950 text-red-200 border border-red-700' : 'bg-emerald-950 text-emerald-200 border border-emerald-700'} shadow-md uppercase tracking-wider`}>
        {label}
      </span>
    </div>
  );
}
