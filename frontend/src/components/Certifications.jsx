/**
 * File: frontend/src/components/Certifications.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React from 'react';
import { Award, ShieldCheck, CheckCircle2, Leaf, Globe } from 'lucide-react';

const Certifications = () => {
  const certs = [
    { name: 'ISO 9001:2015', authority: 'Quality Management System', icon: ShieldCheck, desc: 'Ensuring export quality and standard consistency.' },
    { name: 'OMRI Listed', authority: 'Organic Materials Review Institute', icon: Leaf, desc: 'Certified for organic crop production usage.' },
    { name: 'Control Union Certified', authority: 'Global Agriculture Standard', icon: Globe, desc: 'Eco-compliance and sustainable supply chain.' },
    { name: 'USDA Organic', authority: 'US Department of Agriculture', icon: Award, desc: 'Compliance with federal organic guidelines.' },
    { name: 'Phytosanitary Certified', authority: 'National Plant Protection Org', icon: CheckCircle2, desc: 'Completely free from pests and weed seeds.' }
  ];

  return (
    <div className="py-12 bg-white border-y border-stone-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <span className="text-secondary font-poppins text-xs font-bold uppercase tracking-widest">
          COMPLIANCE & STANDARDS
        </span>
        <h3 className="text-2xl font-poppins font-bold text-stone-900 mt-1">
          Accredited Export Credentials
        </h3>
      </div>
      
      {/* Sliding Marquee style layout using Flex / Wrap for compatibility */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {certs.map((cert, idx) => {
            const IconComponent = cert.icon;
            return (
              <div 
                key={idx} 
                className="bg-accent-light p-6 rounded-2xl border border-stone-100 flex flex-col items-center text-center hover:shadow-luxury hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center text-primary mb-4 transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h4 className="font-poppins font-bold text-stone-800 text-sm">
                  {cert.name}
                </h4>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-1">
                  {cert.authority}
                </p>
                <p className="text-xs text-stone-500 mt-2 font-medium">
                  {cert.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Certifications;
