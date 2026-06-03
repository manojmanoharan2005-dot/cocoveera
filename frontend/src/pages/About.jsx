/**
 * File: frontend/src/pages/About.jsx
 * Purpose: React page component representing the About view.
 */
import React, { useState, useRef } from 'react';
import { Target, Lightbulb, Compass, Sun, ShieldCheck, Factory, Award, Leaf, Play, X } from 'lucide-react';
import PageHero from '../components/PageHero';

const About = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const inlineVideoRef = useRef(null);

  return (
    <div className="pb-16 bg-white">
      <PageHero
        badge="CORPORATE HERITAGE"
        title="About"
        titleAccent="Cocoveera"
        subtitle="Over a decade of manufacturing excellence, supplying solar-powered organic coir growing media to global agronomists."
        breadcrumbs={[{ label: 'About Us', path: '/about' }]}
      />

      {/* 1. Legacy & Company Divisions */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              OUR HERITAGE & DIVISIONS
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 leading-tight">
              A Decade of High-Quality Coir Manufacturing
            </h2>
            <p className="text-stone-500 text-xs leading-relaxed font-medium">
              Established in Cochin, India, Cocoveera began as an organic coir fiber processing unit. Recognizing the international agricultural transition toward hydroponics, we scaled our facilities to provide standardized substrates. Today, we operate two distinct divisions to cater to bulk import and grower specifications:
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center flex-shrink-0 mt-1 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-stone-900 text-sm">Cocoveera Exports Division</h4>
                  <p className="text-stone-500 text-xs mt-1 font-medium">
                    Manages high-volume washing yards, mechanical screening, and compressed 5kg block formatting. This division handles container logistics, customs clearance, and port-to-port sea transit documentation.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-secondary/5 text-secondary flex items-center justify-center flex-shrink-0 mt-1 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-stone-900 text-sm">Cocoveera Substrates Division</h4>
                  <p className="text-stone-500 text-xs mt-1 font-medium">
                    Processes tailored agricultural blends, layered grow bags, 650g briquettes, and customized chip-to-pith ratios engineered for hydroponic cucumber, berry, and tomato crops.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            {/* Video Thumbnail Container */}
            <div 
              className={`group/video relative aspect-video lg:aspect-[4/3] w-full rounded-[2rem] overflow-hidden shadow-premium ${!isVideoOpen ? 'cursor-pointer' : ''} bg-black`}
              onMouseEnter={() => {
                if (!isVideoOpen && inlineVideoRef.current) inlineVideoRef.current.play();
              }}
              onMouseLeave={() => {
                if (!isVideoOpen && inlineVideoRef.current) {
                  inlineVideoRef.current.pause();
                  inlineVideoRef.current.currentTime = 0;
                }
              }}
              onClick={() => {
                if (!isVideoOpen && inlineVideoRef.current) {
                  setIsVideoOpen(true);
                  inlineVideoRef.current.muted = false;
                  inlineVideoRef.current.currentTime = 0;
                  inlineVideoRef.current.play();
                }
              }}
            >
              {/* Image */}
              <img
                src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=700&q=80"
                alt="Cocoveera processing facility video"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isVideoOpen ? 'opacity-0 pointer-events-none' : 'group-hover/video:opacity-0'}`}
              />
              
              {/* Inline Hover Video */}
              <video 
                ref={inlineVideoRef}
                src="/company-trail-video.mp4"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isVideoOpen ? 'opacity-100 z-20' : 'opacity-0 group-hover/video:opacity-100'}`}
                muted={!isVideoOpen}
                loop={!isVideoOpen}
                controls={isVideoOpen}
                playsInline
              />
              
              {/* Play Button */}
              {!isVideoOpen && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsVideoOpen(true);
                      if (inlineVideoRef.current) {
                        inlineVideoRef.current.muted = false;
                        inlineVideoRef.current.currentTime = 0;
                        inlineVideoRef.current.play();
                      }
                    }}
                    className="w-20 h-20 bg-white/95 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 group-hover/video:scale-125 group-hover/video:bg-primary"
                  >
                    <Play className="w-8 h-8 text-primary fill-primary ml-1.5 transition-colors duration-300 group-hover/video:text-white group-hover/video:fill-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Floating Badge (15+ Years) */}
            <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 bg-primary text-white px-7 py-6 rounded-2xl shadow-2xl border-[6px] border-white z-10">
              <div className="font-poppins font-extrabold text-4xl leading-none mb-1 text-center">15+</div>
              <div className="text-[11px] font-bold leading-tight tracking-wide text-white/90 text-center">
                Years of<br />Excellence
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Solar Powered & Sustainability Commitments */}
      <section className="py-16 px-6 bg-accent border-y border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative order-last lg:order-first">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 shadow-soft">
              <img
                src="/solar-facility.png"
                alt="Solar panels on factory roof"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-secondary font-poppins text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-primary" />
              <span>100% SOLAR-POWERED MANUFACTURING</span>
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 leading-tight">
              Minimizing Our Footprint, Maximizing Growth
            </h2>
            <p className="text-stone-500 text-xs leading-relaxed font-medium">
              We believe sustainable horticulture starts in our factories. All manufacturing plants, mechanical screeners, compression chambers, and laboratory testing facilities are powered by 100% renewable solar energy arrays.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex gap-2 items-start">
                <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-poppins font-bold text-stone-850 text-xs">Zero Waste Policy</h4>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed font-medium">
                    Raw byproduct coconut fibers are processed for geo-textiles and mattress upholstery, ensuring zero organic waste.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <Sun className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-poppins font-bold text-stone-850 text-xs">Water Recirculation</h4>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed font-medium">
                    We utilize biological filtration in our leaching pools, recycling up to 80% of wash water back into processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Production Facilities & Geographic Location */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              INFRASTRUCTURE & LOCATION
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 mt-2">
              Strategic Proximity to Raw Materials
            </h2>
            <p className="text-xs text-stone-500 mt-3 leading-relaxed font-medium">
              Our factories are situated within the major coconut farming belts of Cochin and Pollachi in South India, guaranteeing continuous supply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Cochin Export Facility',
                desc: 'Located adjacent to the seaport, this unit handles high-volume container cargo formatting, loading, and logistics clearance.',
                icon: Factory,
              },
              {
                title: 'Pollachi Washing Yards',
                desc: 'Situated in the heart of the coir farming zone. Features washing yards to flush salts and natural sun-drying concrete fields.',
                icon: Sun,
              },
              {
                title: 'In-House Testing Labs',
                desc: 'Equipped with EC/pH scanners. We analyze organic samples from each pallet to issue Certificates of Analysis.',
                icon: ShieldCheck,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-accent border border-stone-200 p-6 rounded-2xl shadow-soft">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-poppins font-bold text-stone-850 text-sm">{item.title}</h4>
                  <p className="text-stone-500 text-xs mt-2 leading-relaxed font-medium">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Technical Expertise / Custom Solutions */}
      <section className="py-16 px-6 bg-accent border-t border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              CUSTOM SUBSTRATES MIXES
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 leading-tight">
              Custom Formulation Capacity
            </h2>
            <p className="text-stone-550 text-xs leading-relaxed font-medium">
              Different crops require specific chemical limits and physical textures. We formulate customized blends of coir pith, husk chips, and fiber. Our facility supports over 150 unique specifications recipes to control air porosity and water holding capacity for international greenhouses.
            </p>
            <div className="flex gap-4">
              <div className="bg-white px-5 py-3.5 rounded-xl border border-stone-200 shadow-soft text-center">
                <span className="font-poppins font-extrabold text-primary text-xl">150+</span>
                <span className="text-[10px] text-stone-400 font-bold block uppercase mt-1">Custom Blends</span>
              </div>
              <div className="bg-white px-5 py-3.5 rounded-xl border border-stone-200 shadow-soft text-center">
                <span className="font-poppins font-extrabold text-primary text-xl">100%</span>
                <span className="text-[10px] text-stone-400 font-bold block uppercase mt-1">Trace-Certified</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 shadow-soft">
              <img
                src="/custom-formulation.png"
                alt="Substrate mixture preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Mission, Vision & Values Statements */}
      <section className="py-16 px-6 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              OUR STATEMENT
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 mt-2">
              Mission, Vision & Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Our Mission',
                desc: 'To support growers worldwide with sustainable, low-EC coir substrates, enabling high-yield hydroponic crops and minimizing resource wastage.',
                icon: Target,
              },
              {
                title: 'Our Vision',
                desc: 'To establish Cocoveera as the international benchmark for quality testing transparency and solar-powered manufacturing in the agricultural export sector.',
                icon: Lightbulb,
              },
              {
                title: 'Our Core Values',
                desc: 'Grower-focused partnership, strict laboratory consistency, organic integrity, and environmental accountability.',
                icon: Compass,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-accent border border-stone-200 p-8 rounded-2xl shadow-soft">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-poppins font-extrabold text-stone-900 text-base mb-3">
                    {item.title}
                  </h3>
                  <p className="text-stone-550 text-xs leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
