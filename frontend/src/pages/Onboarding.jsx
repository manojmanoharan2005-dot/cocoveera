/**
 * File: frontend/src/pages/Onboarding.jsx
 * Purpose: Enterprise "How It Works" page explaining quotation, ordering, and payment process.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  BadgeCheck, 
  CreditCard, 
  Ship, 
  Check, 
  Headphones,
  Sparkles
} from 'lucide-react';
import SEO from '../components/SEO';

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// Reusable Step Card Component
const StepCard = ({ 
  stepNumber, 
  icons, 
  title, 
  description, 
  bullets
}) => {
  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="relative flex flex-col justify-between bg-white/90 backdrop-blur-xl rounded-[28px] border border-stone-200/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(46,125,50,0.12)] hover:border-[#2E7D32]/40 transition-all duration-300 group overflow-hidden"
    >
      {/* Top Accent Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#2E7D32] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <div>
        {/* Step Badge & Icons */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FFF4] border border-[#C6F6D5] text-[#2E7D32] flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-[#2E7D32] group-hover:text-white transition-all duration-300">
            {icons}
          </div>
          
          <span className="text-xs font-poppins font-black text-[#2E7D32] bg-[#E8F5E9] border border-[#C6F6D5] px-3 py-1 rounded-full uppercase tracking-widest">
            Step 0{stepNumber}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-poppins font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight group-hover:text-[#2E7D32] transition-colors mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Bullet Points Grid */}
      <div className="pt-6 border-t border-stone-100">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-3">
          Key Milestones
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {bullets.map((bullet, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 text-xs font-bold text-stone-800 bg-stone-50/80 group-hover:bg-[#F0FFF4] p-2.5 rounded-xl border border-stone-200/60 group-hover:border-[#C6F6D5] transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="truncate">{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function Onboarding() {
  const navigate = useNavigate();

  const stepsData = [
    {
      stepNumber: 1,
      icons: <FileText className="w-6 h-6" />,
      title: "Request a Quote",
      description: "Browse our products, select the required specifications, enter the quantity, and submit your Request for Quotation (RFQ). Our export team will review your requirements and prepare a customized quotation.",
      bullets: [
        "Browse Products",
        "Select Specifications",
        "Enter Quantity",
        "Submit RFQ"
      ]
    },
    {
      stepNumber: 2,
      icons: <BadgeCheck className="w-6 h-6" />,
      title: "Review & Accept Quote",
      description: "Receive your official quotation via your customer dashboard and email. Review the pricing, shipping terms, and quotation validity. Accept the quotation to confirm your order.",
      bullets: [
        "Receive Official Quotation",
        "Review Pricing & Terms",
        "Accept the Quote",
        "Order Confirmed"
      ]
    },
    {
      stepNumber: 3,
      icons: (
        <div className="flex items-center gap-1">
          <CreditCard className="w-5 h-5" />
          <span className="text-xs font-bold">+</span>
          <Ship className="w-5 h-5" />
        </div>
      ),
      title: "Payment & Shipment",
      description: "Complete your payment securely using the available payment methods. Once payment is confirmed, production begins, followed by quality inspection, container loading, shipment, and delivery of shipping documents.",
      bullets: [
        "Secure Payment",
        "Production Starts",
        "Quality Inspection",
        "Shipment & Delivery"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50 text-stone-900 font-sans selection:bg-[#2E7D32] selection:text-white pb-24 sm:pb-32">
      <SEO 
        title="How It Works - Quoting, Ordering & Payment Process"
        description="Learn how Cocoveera processes B2B export orders step-by-step from RFQ submission to quote acceptance, payment, and shipment."
        url="/how-it-works"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 space-y-12 sm:space-y-16">

        {/* ── HERO SECTION ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2E7D32] bg-[#F0FFF4] border border-[#C6F6D5] px-4 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Seamless B2B Export Workflow</span>
          </div>

          <h1 className="font-poppins font-black text-3xl sm:text-5xl text-stone-900 tracking-tight leading-tight">
            How It Works
          </h1>

          <p className="text-stone-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            From quotation request to secure payment and shipment in just three simple steps.
          </p>
        </motion.div>

        {/* ── STEP PROGRESS INDICATOR & CARDS ── */}
        <div className="relative">
          {/* Connecting Progress Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-[#2E7D32]/20 via-[#2E7D32] to-[#2E7D32]/20 -translate-y-1/2 z-0 rounded-full" />

          {/* Cards Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10"
          >
            {stepsData.map((step, index) => (
              <StepCard 
                key={step.stepNumber}
                stepNumber={step.stepNumber}
                icons={step.icons}
                title={step.title}
                description={step.description}
                bullets={step.bullets}
              />
            ))}
          </motion.div>
        </div>

        {/* ── BOTTOM CALL-TO-ACTION CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-[32px] bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white p-8 sm:p-12 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-stone-800"
        >
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2E7D32]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full uppercase tracking-wider">
                <Headphones className="w-3.5 h-3.5" />
                <span>Dedicated Export Desk</span>
              </div>
              <h2 className="font-poppins font-black text-2xl sm:text-3xl text-white tracking-tight">
                Need Assistance?
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm font-medium leading-relaxed">
                Our export specialists are available to guide you through every step of the quotation, ordering, and payment process.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto shrink-0">
              <button
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto bg-[#2E7D32] hover:bg-[#236327] text-white font-poppins text-xs font-extrabold px-7 py-4 rounded-2xl shadow-lg hover:shadow-[#2E7D32]/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Headphones className="w-4 h-4" />
                <span>Contact Export Team</span>
              </button>

              <button
                onClick={() => navigate('/request-quote')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-poppins text-xs font-extrabold px-7 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 backdrop-blur-md"
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Request a Quote</span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
