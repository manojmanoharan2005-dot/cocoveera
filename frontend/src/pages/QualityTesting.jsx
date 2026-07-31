import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Palmtree, Settings, Box, Shield, Package, Ship, ArrowRight, CheckCircle2, Home } from 'lucide-react';
import PageHero from '../components/PageHero';
import ImageWithFallback from '../components/common/ImageWithFallback';

const QualityTesting = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const productionStages = [
    { 
      title: 'Raw Material Collection', 
      desc: 'Premium coconut husks are collected from carefully selected farms to ensure high-quality raw materials while promoting sustainable sourcing.', 
      icon: Palmtree, 
      color: 'bg-green-100 text-green-700',
      image: 'https://images.unsplash.com/photo-1616172655357-19dff30d5b12?auto=format&fit=crop&w=800&q=80',
      highlights: ['Premium Husk', 'Sustainable Farming', 'Fresh Collection'],
      ctaLabel: 'View Raw Materials',
      ctaLink: '/products'
    },
    { 
      title: 'Processing', 
      desc: 'Advanced machinery removes fibers, screens materials, washes impurities, and prepares premium cocopeat.', 
      icon: Settings, 
      color: 'bg-blue-100 text-blue-700',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      highlights: ['Fiber Separation', 'Dust Removal', 'Machine Processed'],
      ctaLabel: 'Learn Processing',
      ctaLink: '/products'
    },
    { 
      title: 'Compression', 
      desc: 'The processed cocopeat is compressed into export-grade blocks with high-density hydraulic technology.', 
      icon: Box, 
      color: 'bg-purple-100 text-purple-700',
      image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
      highlights: ['High Compression', 'Uniform Density', 'Export Standard'],
      ctaLabel: 'View Block Products',
      ctaLink: '/products'
    },
    { 
      title: 'Quality Testing', 
      desc: 'Every batch undergoes strict quality inspections including EC, pH, moisture, expansion ratio, and contamination testing.', 
      icon: Shield, 
      color: 'bg-orange-100 text-orange-700',
      image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
      highlights: ['EC Tested', 'pH Tested', 'Lab Certified'],
      ctaLabel: 'View Test Reports',
      ctaLink: '/quality-testing'
    },
    { 
      title: 'Packaging', 
      desc: 'Products are securely packed using UV-resistant export packaging to ensure safe transportation worldwide.', 
      icon: Package, 
      color: 'bg-pink-100 text-pink-700',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c75855?auto=format&fit=crop&w=800&q=80',
      highlights: ['UV Resistant', 'Secure Packing', 'Export Ready'],
      ctaLabel: 'View Packaging Specs',
      ctaLink: '/products'
    },
    { 
      title: 'Export', 
      desc: 'Products are palletized, container loaded, documented, and shipped globally following international export standards.', 
      icon: Ship, 
      color: 'bg-cyan-100 text-cyan-700',
      image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80',
      highlights: ['Container Loading', 'Global Shipping', 'Documentation Ready'],
      ctaLabel: 'View Shipping Network',
      ctaLink: '/substrates'
    },
    { 
      title: 'Delivered to Customer', 
      desc: 'From our global distribution centers directly to commercial greenhouses and garden enthusiasts worldwide.', 
      icon: Home, 
      color: 'bg-emerald-100 text-emerald-700',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4ce88?auto=format&fit=crop&w=800&q=80',
      highlights: ['Home Gardening', 'Greenhouse Ready', 'Commercial Farms'],
      ctaLabel: 'Shop Now',
      ctaLink: '/products'
    },
  ];

  return (
    <div className="pb-24 bg-stone-50 min-h-screen relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#2E7D32 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />

      <PageHero
        badge="MANUFACTURING STANDARDS"
        title="Production Process"
        titleAccent="& QA"
        subtitle="From raw husks to certified substrates: Review our manufacturing infrastructure and verify batch analysis scores."
        breadcrumbs={[{ label: 'Production Process', path: '/production-process' }]}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Alternating Vertical Timeline */}
        <div ref={containerRef} className="relative w-full py-16">
          
          {/* Background Timeline Axis */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-stone-200 transform -translate-x-1/2 rounded-full z-0"></div>
          
          {/* Animated Scroll Progress Line */}
          <motion.div 
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
            className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-primary-light transform -translate-x-1/2 rounded-full z-10"
          ></motion.div>

          <div className="space-y-16 lg:space-y-20">
            {productionStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isEven = idx % 2 === 0;

              return (
                <div key={idx} className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-0 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  
                  {/* IMAGE BLOCK */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={`w-full lg:w-1/2 ${isEven ? 'lg:pr-10' : 'lg:pl-10'} flex justify-center`}
                  >
                    <div className="relative w-full max-w-[420px] aspect-[16/11] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] group border-[5px] border-white bg-white z-20">
                      <ImageWithFallback 
                        src={stage.image}
                        alt={stage.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* Timeline Node (Mobile - In Flow) */}
                  <div className="lg:hidden flex items-center justify-center z-30 w-full relative -my-3">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center z-30 ${stage.color} shadow-lg border-[5px] border-white`}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                  </div>

                  {/* Timeline Node (Desktop - Absolute Center) */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className={`hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full items-center justify-center z-30 ${stage.color} shadow-xl border-[5px] border-white bg-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>

                  {/* CONTENT BLOCK */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 40 : -40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                    className={`w-full lg:w-1/2 ${isEven ? 'lg:pl-10' : 'lg:pr-10'} flex flex-col justify-center`}
                  >
                    <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-soft border border-stone-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 z-20">
                      
                      {/* Decorative Background Accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-stone-100/50 to-transparent rounded-bl-[3rem] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <span className={`text-4xl font-black opacity-[0.08] font-poppins ${stage.color.split(' ')[1]}`}>
                          0{idx + 1}
                        </span>
                        <h4 className="font-poppins font-extrabold text-stone-900 text-xl lg:text-2xl tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
                          {stage.title}
                        </h4>
                      </div>
                      
                      <p className="text-stone-500 text-sm leading-relaxed font-medium mb-6 relative z-10">
                        {stage.desc}
                      </p>

                      <div className="flex flex-col gap-2.5 relative z-10">
                        {stage.highlights.map((highlight, hIdx) => (
                          <motion.div 
                            key={hIdx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (hIdx * 0.1) }}
                            className="flex items-center gap-2.5 bg-stone-50/50 p-2 rounded-lg border border-stone-100/50 hover:bg-stone-50 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold text-stone-700 tracking-wide">{highlight}</span>
                          </motion.div>
                        ))}
                      </div>

                    </div>
                  </motion.div>

                </div>
              );
            })}
          </div>

          {/* Final Completion Node */}
          <div className="relative flex flex-col items-center justify-center pt-24 pb-8 z-30">
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(46,125,50,0.5)] border-[5px] border-white mb-6 relative"
            >
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50"></div>
              <CheckCircle2 className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h3 className="font-poppins font-extrabold text-primary text-2xl sm:text-3xl tracking-tight mb-2">
                From Farm to Your Home.
              </h3>
              <p className="text-stone-500 font-medium text-sm">
                A sustainable journey completing with you.
              </p>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QualityTesting;
