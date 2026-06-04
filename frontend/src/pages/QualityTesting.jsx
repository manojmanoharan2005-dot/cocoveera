import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Palmtree, Settings, Box, Shield, Package, Ship } from 'lucide-react';
import PageHero from '../components/PageHero';

const QualityTesting = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
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

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Production Process Flow */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-8 lg:p-10 rounded-3xl border border-stone-200 shadow-soft">
            <h3 className="font-poppins font-extrabold text-stone-900 text-2xl text-center mb-10">
              Our Streamlined Process
            </h3>

            {/* Alternating Vertical Timeline */}
            <div ref={containerRef} className="relative max-w-4xl mx-auto py-8">
              {/* Background Line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-stone-100 transform md:-translate-x-1/2 rounded-full z-0"></div>
              {/* Scroll Progress Line */}
              <motion.div 
                style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
                className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light transform md:-translate-x-1/2 rounded-full z-0"
              ></motion.div>

              <div className="space-y-16">
                {productionStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isEven = idx % 2 === 0;

                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 40, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, y: 0, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.7, delay: idx * 0.1, type: "spring", stiffness: 100 }}
                      className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}
                    >
                      
                      {/* Icon */}
                      <motion.div 
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        className={`absolute left-6 md:left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-10 ${stage.color} shadow-lg border-4 border-white cursor-pointer`}
                      >
                        <Icon className="w-8 h-8" />
                      </motion.div>

                      {/* Content Card */}
                      <div className={`w-full md:w-5/12 pl-24 md:pl-0 ${isEven ? 'md:pr-20' : 'md:pl-20'}`}>
                        <motion.div 
                          whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
                          className="bg-white p-8 rounded-3xl shadow-soft border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300"
                        >
                          {/* Accent Gradient Line */}
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/30 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <h4 className="font-poppins font-extrabold text-stone-900 text-lg mb-3">{stage.title}</h4>
                          <p className="text-stone-500 text-sm leading-relaxed font-medium">{stage.desc}</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
};

export default QualityTesting;
