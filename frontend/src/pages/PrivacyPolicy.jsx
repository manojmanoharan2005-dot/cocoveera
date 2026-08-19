import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
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
      icon: <Eye className="w-6 h-6 text-[#2E7D32]" />,
      title: "1. Introduction",
      content: "Welcome to Cocoveera. We are committed to protecting your personal information and your right to privacy. This privacy policy applies to all information collected through our website and/or any related services, sales, marketing, or events."
    },
    {
      icon: <Database className="w-6 h-6 text-[#2E7D32]" />,
      title: "2. Information We Collect",
      content: "We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise when you contact us."
    },
    {
      icon: <Lock className="w-6 h-6 text-[#2E7D32]" />,
      title: "3. How We Use Your Information",
      content: "We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations."
    },
    {
      icon: <Shield className="w-6 h-6 text-[#2E7D32]" />,
      title: "4. Information Sharing",
      content: "We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations."
    },
    {
      icon: <Mail className="w-6 h-6 text-[#2E7D32]" />,
      title: "5. Contact Us",
      content: "If you have questions or comments about this notice, you may email us at supportdesk@cocoveera.com or by post to: Cocoveera Private Limited, 96/1, Vikas Layout, Kalluri Nagar, Anna Nagar, Peelamedu, Coimbatore, Tamil Nadu - 641004, India."
    }
  ];

  return (
    <>
      <SEO title="Privacy Policy" description="Privacy policy and data handling practices at Cocoveera." url="/privacy-policy" />
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
        {/* Futuristic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#2E7D32]/10 to-[#43A047]/5 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-tl from-[#D4A843]/10 to-transparent blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16 relative"
          >
            <div className="inline-flex items-center justify-center p-4 mb-6 rounded-2xl bg-gradient-to-br from-white to-stone-50 shadow-[0_8px_32px_rgba(46,125,50,0.15)] border border-stone-100">
              <Shield className="w-8 h-8 text-[#2E7D32]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-stone-800 to-[#2E7D32] mb-6 font-poppins tracking-tight">
              Privacy Policy
            </h1>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/50 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse shadow-[0_0_8px_rgba(46,125,50,0.6)]"></span>
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
                className="group relative bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-[28px] p-8 hover:bg-white transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(46,125,50,0.08)] overflow-hidden"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2E7D32]/0 via-[#2E7D32]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-[20px] bg-gradient-to-br from-stone-50 to-white border border-stone-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-3 font-poppins group-hover:text-[#2E7D32] transition-colors duration-300">
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

export default PrivacyPolicy;
