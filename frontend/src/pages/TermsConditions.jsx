import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { FileText, CheckCircle, AlertTriangle, RefreshCcw, HelpCircle } from 'lucide-react';

const TermsConditions = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const sections = [
    {
      icon: <CheckCircle className="w-6 h-6 text-[#D4A843]" />,
      title: "1. Agreement to Terms",
      content: "These Terms of Use constitute a legally binding agreement made between you and Cocoveera concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto."
    },
    {
      icon: <FileText className="w-6 h-6 text-[#D4A843]" />,
      title: "2. Products and Pricing",
      content: "All products, services, and prices are subject to change without notice. We reserve the right to limit quantities of any products or services that we offer. Product images are for illustrative purposes and actual products may vary."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-[#D4A843]" />,
      title: "3. Prohibited Activities",
      content: "You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us."
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-[#D4A843]" />,
      title: "4. Returns and Refunds",
      content: "Please review our Return Policy posted on the Site prior to making any purchases. All returns are subject to the terms and conditions outlined in the Return Policy."
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-[#D4A843]" />,
      title: "5. Contact Us",
      content: "In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at supportdesk@cocoveera.com."
    }
  ];

  return (
    <>
      <SEO title="Terms & Conditions" description="Terms and conditions for using Cocoveera." url="/terms-conditions" />
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
        {/* Futuristic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-[#D4A843]/10 to-[#F59E0B]/5 blur-[120px]" />
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-tr from-[#2E7D32]/10 to-transparent blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16 relative"
          >
            <div className="inline-flex items-center justify-center p-4 mb-6 rounded-2xl bg-gradient-to-br from-white to-stone-50 shadow-[0_8px_32px_rgba(212,168,67,0.15)] border border-stone-100">
              <FileText className="w-8 h-8 text-[#D4A843]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-stone-800 to-[#D4A843] mb-6 font-poppins tracking-tight">
              Terms & Conditions
            </h1>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/50 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A843] animate-pulse shadow-[0_0_8px_rgba(212,168,67,0.6)]"></span>
              <span className="text-sm font-semibold text-stone-700">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>

          {/* Content Sections */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {sections.map((section, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="group relative bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-[28px] p-8 hover:bg-white transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(212,168,67,0.08)] overflow-hidden"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4A843]/0 via-[#D4A843]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-[20px] bg-gradient-to-br from-stone-50 to-white border border-stone-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-3 font-poppins group-hover:text-[#D4A843] transition-colors duration-300">
                      {section.title}
                    </h2>
                    <p className="text-stone-600 leading-relaxed font-medium text-[15px]">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TermsConditions;
