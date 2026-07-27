import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Plus, Minus, Package, ShieldCheck, CheckCircle2,
  FileText, Download, CreditCard, ChevronRight, Check, HelpCircle,
  Clock, Store, MessageSquare, MousePointer, Sparkles, Layers,
  ChevronDown, ArrowDown
} from 'lucide-react';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] text-[#111827] font-sans selection:bg-[#2E7D32] selection:text-white pb-32">
      
      {/* ── ELEGANT STICKY HEADER ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]/80 px-4 sm:px-8 py-4 sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-ping" />
            <div>
              <h1 className="text-lg sm:text-xl font-poppins font-black text-[#111827] tracking-tight">
                How to Use Cocoveera
              </h1>
              <p className="text-xs text-[#6B7280] font-medium">
                Visual Product Walkthrough • From Quote Request to Order &amp; Payment
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#2E7D32] bg-[#F0FFF4] border border-[#C6F6D5] px-3.5 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-4 h-4 text-[#2E7D32]" />
            <span>Linear &amp; Framer Interactive Guide</span>
          </div>
        </div>
      </header>

      {/* ── MAIN FLOW CONTAINER (MAX 1140PX WIDTH) ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-24">

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: HOW TO REQUEST A QUOTE (GREEN ACCENT IDENTITY)
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="bg-white rounded-[28px] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 sm:p-12 space-y-10 relative overflow-hidden"
        >
          {/* Subtle Ambient Section Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E8F5E9]/50 via-transparent to-transparent rounded-full pointer-events-none blur-3xl" />

          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6 relative z-10">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white flex items-center justify-center font-poppins font-black text-base shadow-md">
                1
              </span>
              <div>
                <span className="text-[10px] font-black text-[#2E7D32] uppercase tracking-widest bg-[#E8F5E9] border border-[#C6F6D5] px-2.5 py-0.5 rounded-full">
                  Phase 1 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#111827] tracking-tight mt-1">
                  How to Request a Quote
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] bg-[#F0FFF4] px-3.5 py-1.5 rounded-xl border border-[#C6F6D5]">
              <span>Marketplace ➔ Product ➔ Live Container ➔ RFQ</span>
            </div>
          </div>

          {/* FLOWING SCREEN 1: MARKETPLACE */}
          <div className="space-y-4">
            <FlowLabel step="①" title="Browse Products" desc="Select 5kg Cocopeat Block or Grow Bags from the substrate marketplace catalog." />
            
            <FigmaBrowserWindow url="cocoveera.com/dashboard" accentColor="green">
              <div className="p-6 bg-[#F8FAFC]">
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 rounded-2xl border-2 border-[#2E7D32] shadow-[0_8px_30px_rgba(46,125,50,0.08)] relative flex items-center justify-between gap-4 transition-all"
                >
                  <PulsingClickBadge number="①" label="Click Product Card" color="green" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#E8F5E9] border border-[#C6F6D5] rounded-2xl flex items-center justify-center font-black text-[#2E7D32] text-xs shadow-inner">
                      5KG
                    </div>
                    <div>
                      <h4 className="font-poppins font-black text-sm text-[#111827]">5kg High Expansion Block</h4>
                      <p className="text-xs text-[#2E7D32] font-bold mt-0.5">$2.80 / Block • FCL Container Shipping</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-black text-[#2E7D32] bg-[#F0FFF4] px-4 py-2 rounded-xl border border-[#C6F6D5] shadow-xs">
                    <MousePointer className="w-4 h-4 text-[#2E7D32] animate-bounce" />
                    <span>View Product Details</span>
                  </div>
                </motion.div>
              </div>
            </FigmaBrowserWindow>
          </div>

          {/* ELEGANT SVG CURVED CONNECTOR 1 */}
          <CurvedSvgConnector label="Opening Product Details &amp; Quantity Controls" accentColor="#2E7D32" />

          {/* FLOWING SCREEN 2: PRODUCT DETAILS & QUANTITY METER */}
          <div className="space-y-4">
            <FlowLabel step="② & ③" title="Adjust Quantity &amp; Verify Live Container" desc="Click '+' to select container quantity; live 3D visualizer computes total weight and fill percentage automatically." />
            
            <FigmaBrowserWindow url="cocoveera.com/products/5kg-cocopeat-block" accentColor="green">
              <div className="p-6 bg-[#F8FAFC] space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Quantity Control Mockup */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    className="bg-white p-6 rounded-2xl border-2 border-[#2E7D32] space-y-4 relative shadow-[0_8px_30px_rgba(46,125,50,0.06)]"
                  >
                    <PulsingClickBadge number="②" label="Click + to Add Quantity" color="green" />
                    
                    <span className="text-xs font-black text-[#2E7D32] uppercase tracking-wider block">Quantity Selector</span>
                    
                    <div className="flex items-center justify-between p-3.5 bg-[#F0FFF4] rounded-xl border border-[#C6F6D5]">
                      <span className="text-xs font-bold text-[#111827]">Container Quantity:</span>
                      <div className="flex items-center border-2 border-[#2E7D32] bg-white rounded-xl overflow-hidden shadow-xs">
                        <button className="px-3 py-1.5 text-[#2E7D32] font-black hover:bg-[#E8F5E9]"><Minus className="w-4 h-4" /></button>
                        <span className="px-4 py-1.5 font-black text-sm">1.00</span>
                        <button className="px-3.5 py-1.5 bg-[#2E7D32] text-white font-black flex items-center gap-1.5 shadow-xs">
                          <Plus className="w-4 h-4" />
                          <MousePointer className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Live Container Fill Simulator */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    className="bg-white p-6 rounded-2xl border-2 border-[#2E7D32] space-y-4 relative shadow-[0_8px_30px_rgba(46,125,50,0.06)]"
                  >
                    <PulsingClickBadge number="③" label="Container Auto-Updates" color="green" />
                    
                    <span className="text-xs font-black text-[#2E7D32] uppercase tracking-wider block">Live Cargo Visualizer</span>
                    
                    <div className="space-y-2 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                      <div className="flex justify-between text-xs font-bold text-[#2E7D32]">
                        <span>Capacity Filled:</span>
                        <span>100% (40FT High Cube)</span>
                      </div>
                      <div className="h-3.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: '0%' }}
                          whileInView={{ width: '100%' }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]"
                        />
                      </div>
                    </div>
                  </motion.div>

                </div>

              </div>
            </FigmaBrowserWindow>
          </div>

          {/* ELEGANT SVG CURVED CONNECTOR 2 */}
          <CurvedSvgConnector label="Clicking Request Quote Button" accentColor="#2E7D32" />

          {/* FLOWING SCREEN 3: RFQ MODAL FORM & SUBMIT */}
          <div className="space-y-4">
            <FlowLabel step="④ & ⑤" title="Fill Address &amp; Submit RFQ" desc="Enter destination country, discharge port, and click Submit RFQ to send specifications to our export desk." />
            
            <FigmaBrowserWindow url="cocoveera.com/products/rfq-modal" accentColor="green">
              <div className="p-6 bg-[#F8FAFC]">
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white p-6 rounded-2xl border-2 border-[#2E7D32] space-y-6 relative shadow-[0_8px_30px_rgba(46,125,50,0.08)]"
                >
                  <PulsingClickBadge number="④ &amp; ⑤" label="Fill Address &amp; Submit" color="green" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase">Destination Country</span>
                      <div className="text-xs font-black text-[#111827]">🇺🇸 United States</div>
                    </div>
                    <div className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase">Discharge Port</span>
                      <div className="text-xs font-black text-[#111827]">Port of Rotterdam (NL)</div>
                    </div>
                  </div>

                  <button className="w-full py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white font-poppins font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <MousePointer className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>Submit RFQ Request</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  </button>
                </motion.div>
              </div>
            </FigmaBrowserWindow>
          </div>

        </motion.section>


        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: HOW TO PLACE AN ORDER (LIGHT BLUE ACCENT IDENTITY)
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="bg-white rounded-[28px] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 sm:p-12 space-y-10 relative overflow-hidden"
        >
          {/* Subtle Ambient Section Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#EEF2FF]/70 via-transparent to-transparent rounded-full pointer-events-none blur-3xl" />

          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6 relative z-10">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-white flex items-center justify-center font-poppins font-black text-base shadow-md">
                2
              </span>
              <div>
                <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest bg-[#EEF2FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
                  Phase 2 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#111827] tracking-tight mt-1">
                  How to Place an Order
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] bg-[#EEF2FF] px-3.5 py-1.5 rounded-xl border border-[#BFDBFE]">
              <span>My Quotes ➔ Review PDF ➔ Accept Quote ➔ My Orders</span>
            </div>
          </div>

          {/* FLOWING SCREEN 1: MY QUOTES DASHBOARD */}
          <div className="space-y-4">
            <FlowLabel step="① & ②" title="Open Approved Quotation" desc="Go to My Quotes in customer dashboard and click on approved quotation." />
            
            <FigmaBrowserWindow url="cocoveera.com/quotes" accentColor="blue">
              <div className="p-6 bg-[#F8FAFC]">
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 rounded-2xl border-2 border-[#3B82F6] shadow-[0_8px_30px_rgba(59,130,246,0.08)] relative flex items-center justify-between gap-4 transition-all"
                >
                  <PulsingClickBadge number="① &amp; ②" label="Open Approved Quote" color="blue" />
                  
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-[#3B82F6]" />
                    <div>
                      <h4 className="font-poppins font-black text-sm text-[#111827]">Quote #QT-2026-9041</h4>
                      <span className="text-xs font-bold text-[#1D4ED8] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">Status: Approved</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-black text-[#1D4ED8] bg-[#EEF2FF] px-3.5 py-2 rounded-xl border border-[#BFDBFE]">
                    <MousePointer className="w-4 h-4 text-[#1D4ED8] animate-bounce" />
                    <span>View Quote Details</span>
                  </div>
                </motion.div>
              </div>
            </FigmaBrowserWindow>
          </div>

          {/* ELEGANT SVG CURVED CONNECTOR */}
          <CurvedSvgConnector label="Reviewing Pricing &amp; Locking Container Order" accentColor="#3B82F6" />

          {/* FLOWING SCREEN 2: QUOTE DETAILS & ACCEPT BUTTON */}
          <div className="space-y-4">
            <FlowLabel step="③, ④ & ⑤" title="Review PDF &amp; Click Accept Quote" desc="Review unit FOB price and validity window. Click Accept Quote to automatically create order under My Orders." />
            
            <FigmaBrowserWindow url="cocoveera.com/quotes/QT-2026-9041" accentColor="blue">
              <div className="p-6 bg-[#F8FAFC] space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* PDF Download Mockup */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    className="bg-white p-6 rounded-2xl border-2 border-[#3B82F6] space-y-4 relative shadow-[0_8px_30px_rgba(59,130,246,0.06)]"
                  >
                    <PulsingClickBadge number="③" label="Review PDF Quote" color="blue" />
                    
                    <span className="text-xs font-black text-[#1D4ED8] uppercase tracking-wider block">Quotation Details</span>
                    <div className="flex justify-between text-xs font-bold text-[#111827]">
                      <span>FOB Unit Price:</span>
                      <span className="text-[#1D4ED8]">$2.65 / Block</span>
                    </div>
                    <button className="w-full py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1D4ED8] flex items-center justify-center gap-1.5 shadow-xs">
                      <Download className="w-4 h-4 text-[#1D4ED8]" />
                      <span>Download Official PDF Quote</span>
                    </button>
                  </motion.div>

                  {/* Accept Quote Primary Action Mockup */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    className="bg-[#EEF2FF] p-6 rounded-2xl border-2 border-[#3B82F6] space-y-4 relative shadow-[0_8px_30px_rgba(59,130,246,0.08)] flex flex-col justify-between"
                  >
                    <PulsingClickBadge number="④ &amp; ⑤" label="Click Accept ➔ Order Created" color="blue" />
                    
                    <p className="text-xs text-[#1E40AF] font-medium">
                      Locks container stock batch and creates order automatically under My Orders.
                    </p>

                    <button className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-poppins font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <MousePointer className="w-4 h-4 text-blue-200 animate-pulse" />
                      <span>ACCEPT QUOTE NOW</span>
                    </button>
                  </motion.div>

                </div>

              </div>
            </FigmaBrowserWindow>
          </div>

        </motion.section>


        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: HOW TO COMPLETE PAYMENT (LIGHT AMBER ACCENT IDENTITY)
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="bg-white rounded-[28px] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 sm:p-12 space-y-10 relative overflow-hidden"
        >
          {/* Subtle Ambient Section Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FEF3C7]/60 via-transparent to-transparent rounded-full pointer-events-none blur-3xl" />

          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6 relative z-10">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#B45309] text-white flex items-center justify-center font-poppins font-black text-base shadow-md">
                3
              </span>
              <div>
                <span className="text-[10px] font-black text-[#B45309] uppercase tracking-widest bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
                  Phase 3 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-poppins font-black text-[#111827] tracking-tight mt-1">
                  How to Complete Payment
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-3.5 py-1.5 rounded-xl border border-[#FDE68A]">
              <span>My Orders ➔ Pay Now ➔ Wire Transfer ➔ Upload Proof ➔ Verified</span>
            </div>
          </div>

          {/* FLOWING SCREEN 1: MY ORDERS & PAY NOW */}
          <div className="space-y-4">
            <FlowLabel step="① & ②" title="Open My Orders &amp; Click Pay Now" desc="Select order in My Orders tab and click Pay Now for 40% advance milestone." />
            
            <FigmaBrowserWindow url="cocoveera.com/orders" accentColor="amber">
              <div className="p-6 bg-[#F8FAFC]">
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 rounded-2xl border-2 border-[#D97706] shadow-[0_8px_30px_rgba(217,119,6,0.08)] relative flex items-center justify-between gap-4 transition-all"
                >
                  <PulsingClickBadge number="① &amp; ②" label="Open Orders &amp; Click Pay Now" color="amber" />
                  
                  <div>
                    <h4 className="font-poppins font-black text-sm text-[#111827]">Order #ORD-2026-9041</h4>
                    <span className="text-xs font-bold text-[#B45309]">Status: 40% Advance Due</span>
                  </div>

                  <button className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-poppins font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5">
                    <MousePointer className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                    <span>Pay Now</span>
                  </button>
                </motion.div>
              </div>
            </FigmaBrowserWindow>
          </div>

          {/* ELEGANT SVG CURVED CONNECTOR */}
          <CurvedSvgConnector label="Executing Bank Wire Transfer &amp; Uploading Payment Slip" accentColor="#D97706" />

          {/* FLOWING SCREEN 2: PAYMENT PORTAL & MILESTONE CONFIRMATION */}
          <div className="space-y-4">
            <FlowLabel step="③, ④ & ⑤" title="Upload Payment Proof &amp; Auto-Update Milestone" desc="Select SWIFT bank transfer details, upload bank receipt slip, and milestone progress updates automatically." />
            
            <FigmaBrowserWindow url="cocoveera.com/orders/ORD-2026-9041/payment" accentColor="amber">
              <div className="p-6 bg-[#F8FAFC] space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Wire Details & Upload Slip */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    className="bg-white p-6 rounded-2xl border-2 border-[#D97706] space-y-4 relative shadow-[0_8px_30px_rgba(217,119,6,0.06)]"
                  >
                    <PulsingClickBadge number="③ &amp; ④" label="Select SWIFT &amp; Upload Slip" color="amber" />
                    
                    <span className="text-xs font-black text-[#B45309] uppercase tracking-wider block">Wire Transfer Details</span>
                    <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs font-bold text-[#B45309]">
                      Bank: HDFC Bank India • SWIFT: HDFCINBBXXX
                    </div>
                    <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#111827] text-center cursor-pointer flex items-center justify-center gap-2 shadow-2xs">
                      <CreditCard className="w-4 h-4 text-[#D97706]" />
                      <span>Click to Upload Payment Proof</span>
                    </div>
                  </motion.div>

                  {/* Verified Milestone Status */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    className="bg-[#FEF3C7] p-6 rounded-2xl border-2 border-[#D97706] space-y-4 relative shadow-[0_8px_30px_rgba(217,119,6,0.08)] flex flex-col justify-between"
                  >
                    <PulsingClickBadge number="⑤" label="Progress Automatically Updates" color="amber" />
                    
                    <div className="space-y-2">
                      <div className="text-xs font-black text-[#B45309]">Milestone Progress: 40% Confirmed</div>
                      <div className="h-3.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: '0%' }}
                          whileInView={{ width: '40%' }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706]"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-[#B45309] font-bold flex items-center gap-2 pt-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                      <span>Production begins automatically.</span>
                    </div>
                  </motion.div>

                </div>

              </div>
            </FigmaBrowserWindow>
          </div>

        </motion.section>

      </main>

    </div>
  );
}

/* ── REUSABLE ULTRA-PREMIUM FIGMA / STRIPE COMPONENTS ── */

function FigmaBrowserWindow({ url, accentColor = 'green', children }) {
  const borderAccent = accentColor === 'blue' ? 'border-[#BFDBFE]' : accentColor === 'amber' ? 'border-[#FDE68A]' : 'border-[#C6F6D5]';

  return (
    <div className={`w-full bg-white rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.03)] overflow-hidden border-2 ${borderAccent}`}>
      {/* BROWSER BAR */}
      <div className="bg-[#F8FAFC] px-5 py-3 flex items-center justify-between border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E5E7EB] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#E5E7EB] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#E5E7EB] inline-block" />
        </div>
        
        <div className="bg-white px-6 py-1.5 rounded-xl text-xs text-[#6B7280] font-mono font-medium truncate border border-[#E5E7EB] max-w-xs sm:max-w-md shadow-2xs">
          https://{url}
        </div>

        <div className="text-[10px] font-extrabold text-[#2E7D32] uppercase tracking-widest hidden sm:block">
          Cocoveera Enterprise UI
        </div>
      </div>

      {children}
    </div>
  );
}

function FlowLabel({ step, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-poppins font-black text-xs shadow-xs shrink-0 mt-0.5">
        {step}
      </span>
      <div>
        <h3 className="text-base font-poppins font-black text-[#111827]">
          {title}
        </h3>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function PulsingClickBadge({ number, label, color = 'green' }) {
  const bgClass = color === 'blue' ? 'bg-[#2563EB]' : color === 'amber' ? 'bg-[#D97706]' : 'bg-[#2E7D32]';

  return (
    <div className="absolute -top-3.5 -right-2 z-20 flex items-center gap-1.5">
      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${bgClass} text-white shadow-md uppercase tracking-wider ring-2 ring-white flex items-center gap-1.5`}>
        <MousePointer className="w-3.5 h-3.5 text-white animate-pulse" />
        <span>{number}</span>
        <span className="opacity-90">• {label}</span>
      </span>
    </div>
  );
}

function CurvedSvgConnector({ label, accentColor = '#2E7D32' }) {
  return (
    <div className="py-6 flex flex-col items-center justify-center space-y-2 relative">
      <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-xs text-[#111827]">
        {label}
      </span>
      
      {/* Curved Animated SVG Arrow */}
      <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="overflow-visible">
        <path 
          d="M 30 0 Q 45 20 30 35" 
          stroke={accentColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          fill="none" 
          strokeDasharray="4 4" 
        />
        <polygon points="25,32 35,32 30,39" fill={accentColor} />
      </svg>
    </div>
  );
}
