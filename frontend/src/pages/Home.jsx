import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  Truck,
  Headphones,
  CheckCircle2,
  TrendingUp,
  Layers,
  Leaf,
  Globe2,
  FileSpreadsheet,
  Cpu,
  Bookmark
} from 'lucide-react';
import GlobalMap from '../components/GlobalMap';
import Certifications from '../components/Certifications';

const Home = () => {
  const [selectedCrop, setSelectedCrop] = useState('tomatoes');

  const cropsData = {
    tomatoes: {
      title: 'Tomatoes & Peppers Hydroponics',
      mix: '70% Coco Peat / 30% Husk Chips Blend',
      ec: '< 0.5 mS/cm (Buffered)',
      ph: '5.5 - 6.2',
      desc: 'Optimized capillary retention allows consistent water uptake, preventing blossom end rot and ensuring uniform fruit growth.',
      img: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=500&q=80'
    },
    berries: {
      title: 'Strawberry & Blueberry Substrates',
      mix: '50% Husk Chips / 50% Coir Fiber Mix',
      ec: '< 0.8 mS/cm (Low EC)',
      ph: '5.2 - 5.8',
      desc: 'High drainage properties mimic sandy soils. Promotes healthy root expansion and rapid run-off of salt accumulation.',
      img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=80'
    },
    cucumbers: {
      title: 'Cucumber & Melon Slabs',
      mix: '100% Buffered Premium Coco Peat',
      ec: '< 0.6 mS/cm',
      ph: '5.8 - 6.5',
      desc: 'Excellent air porosity indexes provide maximum root breathing, holding structural rigidity over multiple growing seasons.',
      img: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=500&q=80'
    },
    floriculture: {
      title: 'Roses & Gerbera Cut Flowers',
      mix: '80% Coco Peat / 20% Perlite or Chips Blend',
      ec: '< 0.4 mS/cm (Extra Buff)',
      ph: '5.6 - 6.4',
      desc: 'Ultra-low sodium and potassium values prevent leaf tip burns. Encourages continuous bud formation and vibrant petal colors.',
      img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80'
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      
      {/* SECTION 1: HERO BANNER (100% Organic Coco Substrates & Coir) */}
      <section className="relative min-h-screen flex items-center pt-32 pb-24 px-6 md:px-12 bg-accent">
        {/* Full-width bright greenhouse background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1920&q=80"
            alt="Organic Greenhouse Substrate"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-primary font-poppins text-xs font-bold uppercase tracking-widest bg-primary/10 py-1.5 px-3.5 rounded-md self-start border border-primary/10"
            >
              100% Natural & Organic Coir Manufacturer
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-extrabold text-stone-900 leading-tight"
            >
              Advanced Coconut <br />
              <span className="text-primary">Substrates & Peat</span> Exporters
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-stone-600 font-sans text-sm sm:text-base max-w-xl leading-relaxed font-medium"
            >
              Certified organic coco coir substrates engineered to yield healthier root structures and maximize commercial harvests in agricultural greenhouses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/products"
                className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold px-7 py-3.5 rounded-lg shadow-soft hover:shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="bg-white border border-stone-250 text-stone-700 hover:border-primary hover:text-primary font-poppins text-xs font-bold px-7 py-3.5 rounded-lg transition-all"
              >
                Request Quote
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating Statistics Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8 rounded-3xl shadow-premium border border-primary/10 max-w-md mx-auto space-y-6"
            >
              <h3 className="font-poppins font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-primary/5 pb-3">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
                <span>Export Operations</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Reach</span>
                  <strong className="text-2xl font-poppins font-extrabold text-primary">60+ Countries</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Experience</span>
                  <strong className="text-2xl font-poppins font-extrabold text-primary">15+ Years</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Standard</span>
                  <strong className="text-2xl font-poppins font-extrabold text-primary">ISO & OMRI</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Dispatched</span>
                  <strong className="text-2xl font-poppins font-extrabold text-primary">10k+ Tons/Yr</strong>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center text-xs font-semibold text-primary">
                Premium B2B Bulk Greenhouse Growing Media
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: COMPANY OVERVIEW / DIVISIONS SECTION */}
      <section className="py-20 px-6 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-secondary font-poppins text-xs font-bold uppercase tracking-widest">
                CORPORATE PROFILE
              </span>
              <h2 className="text-3xl font-poppins font-extrabold text-stone-900 leading-tight">
                Pioneering Horticultural Substrates
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-stone-500 text-xs leading-relaxed font-medium">
                Cocoveera manages specialized divisions focused on delivering standardized coir growing mediums to commercial floriculture and hydroponic growers around the globe.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Division 1: Cocoveera Exports */}
            <div className="bg-accent border border-stone-200 p-8 rounded-3xl space-y-4 hover:shadow-premium transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-extrabold text-stone-900 text-lg">
                Cocoveera Exports Division
              </h3>
              <p className="text-stone-500 text-xs leading-relaxed font-medium">
                Focuses on raw material washing, screening, and high-volume export shipping. We handle container logistics, customs documentation, phytosanitary audits, and bulk seaport cargo dispatch.
              </p>
              <ul className="text-xs space-y-2 pt-2 text-stone-750 font-bold">
                <li className="flex items-center gap-2">✓ Compressed 5kg Pith Blocks</li>
                <li className="flex items-center gap-2">✓ Natural Coir Fiber Bales</li>
                <li className="flex items-center gap-2">✓ Port-to-Port Freight Tracking</li>
              </ul>
            </div>

            {/* Division 2: Cocoveera Substrates */}
            <div className="bg-accent border border-stone-200 p-8 rounded-3xl space-y-4 hover:shadow-premium transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-secondary/5 flex items-center justify-center text-secondary">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-extrabold text-stone-900 text-lg">
                Cocoveera Substrates Division
              </h3>
              <p className="text-stone-500 text-xs leading-relaxed font-medium">
                Specializes in custom-formulated agricultural blends. We process layered grow bags, retail-ready peat briquettes, and customized chip-to-pith ratios tailored to specific crops.
              </p>
              <ul className="text-xs space-y-2 pt-2 text-stone-750 font-bold">
                <li className="flex items-center gap-2">✓ Layered Hydroponic Grow Slabs</li>
                <li className="flex items-center gap-2">✓ 650g Sun-dried Briquettes</li>
                <li className="flex items-center gap-2">✓ Tailored Chip-to-Pith Mixtures</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRODUCT APPLICATIONS / CROPS WE SERVE (Interactive Showcase) */}
      <section className="py-20 px-6 bg-accent border-b border-stone-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left selectors & explanation */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              AGRONOMY & APPLICATIONS
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 leading-tight">
              Substrate Blends for Specialized Crops
            </h2>
            <p className="text-stone-550 text-xs leading-relaxed font-medium">
              We process different physical properties for each crop. Click a crop below to view the customized chemical and moisture levels optimized for its root physiology.
            </p>

            <div className="flex flex-col space-y-2.5 pt-4">
              {Object.keys(cropsData).map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-bold font-poppins transition-all flex justify-between items-center ${
                    selectedCrop === crop
                      ? 'bg-primary text-white border-primary shadow-soft'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="capitalize">{crop === 'floriculture' ? 'Flowers & Roses' : crop}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Right interactive card details */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-premium grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-5 h-64 md:h-full relative overflow-hidden">
                <img
                  src={cropsData[selectedCrop].img}
                  alt={cropsData[selectedCrop].title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-7 p-8 space-y-6">
                <div>
                  <span className="text-secondary text-[10px] font-bold uppercase tracking-widest block">
                    CROP PREFERENCE
                  </span>
                  <h3 className="font-poppins font-extrabold text-stone-900 text-lg mt-1">
                    {cropsData[selectedCrop].title}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed mt-3 font-medium">
                    {cropsData[selectedCrop].desc}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-3.5 text-xs text-stone-700 font-bold">
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">Composition:</span>
                    <span>{cropsData[selectedCrop].mix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">Buffered EC:</span>
                    <span className="text-primary">{cropsData[selectedCrop].ec}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-semibold uppercase text-[10px]">pH Range:</span>
                    <span>{cropsData[selectedCrop].ph}</span>
                  </div>
                </div>

                <Link
                  to="/products"
                  className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3 px-5 rounded-lg w-full text-center block shadow-soft transition-colors"
                >
                  Configure Custom Order Specs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PRODUCTION PROCESS & TECHNICAL REFINEMENT */}
      <section className="py-20 px-6 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              QUALITY ASSURANCE YARDS
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 mt-2">
              Our Technical Refinement Process
            </h2>
            <p className="text-xs text-stone-500 mt-3 leading-relaxed font-medium">
              We process raw coir through physical refinement stages to ensure it meets strict agricultural standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { num: '01', title: 'Raw Aging & Leaching', desc: 'Raw coir is aged for six months, then flushed to reduce high potassium and sodium salts.' },
              { num: '02', title: 'Freshwater Washing', desc: 'Washed with low-EC freshwater until the runoff reaches strict electrical conductivity limits.' },
              { num: '03', title: 'Dust Screening', desc: 'Dried peat is put through mesh screeners to extract fine dust particles, securing optimal root porosity.' },
              { num: '04', title: 'Quality Audits & Loading', desc: 'Samples are laboratory-tested before compression into blocks, grow bags, or bulk bales.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-accent border border-stone-200 p-6 rounded-2xl relative shadow-soft hover:shadow-premium transition-shadow duration-300">
                <span className="text-primary font-poppins font-extrabold text-2xl opacity-40 block mb-4">{step.num}</span>
                <h4 className="font-poppins font-bold text-stone-850 text-sm mb-2">{step.title}</h4>
                <p className="text-stone-500 text-xs leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: GLOBAL NETWORK MAP */}
      <section className="py-20 px-6 bg-accent border-b border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-secondary font-poppins text-xs font-bold uppercase tracking-widest">
              GLOBAL EXPORT REGIONS
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 mt-2">
              Seaport Supply Network
            </h2>
            <p className="text-xs text-stone-500 mt-3 leading-relaxed font-medium">
              We dispatch shipping containers directly to ports in Europe, North America, Japan, and Australia.
            </p>
          </div>
          <GlobalMap />
        </div>
      </section>

      {/* SECTION 6: COMPLIANCE & CERTIFICATIONS */}
      <div className="bg-white">
        <Certifications />
      </div>

      {/* SECTION 7: GROWER TESTIMONIALS */}
      <section className="py-20 px-6 bg-accent border-t border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              CLIENT TESTIMONIALS
            </span>
            <h2 className="text-3xl font-poppins font-extrabold text-stone-900 mt-2">
              Trusted by Commercial Growers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'The buffered substrate holds EC levels consistent throughout our greenhouse cycle. Our tomato crop yield has improved significantly.',
                author: 'Dr. Alejandro Lopez',
                role: 'Director of Agronomy, Spain HortiGroup',
              },
              {
                quote: 'Their custom chip-to-pith ratios give us complete control over strawberry root hydration. The drainage is excellent.',
                author: 'Markus Vander',
                role: 'Proprietor, Holland Substrates Co.',
              },
              {
                quote: 'Phytosanitary paperwork is always cleared perfectly. Cocoveera is our exclusive supplier for bulk import containers.',
                author: 'Sato Yamamoto',
                role: 'Purchasing CPO, Tokyo Hydroponic Farms',
              },
            ].map((test, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-stone-200 shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow duration-300">
                <p className="text-stone-600 text-xs italic leading-relaxed font-medium">
                  "{test.quote}"
                </p>
                <div className="mt-6 pt-6 border-t border-stone-150">
                  <h4 className="font-poppins font-bold text-stone-900 text-xs">{test.author}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: B2B BULK INQUIRY BANNER */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-primary-dark text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="text-light-green font-poppins text-xs font-bold uppercase tracking-widest bg-white/10 py-1.5 px-3 rounded-lg">
            B2B PORT-TO-PORT ORDERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-poppins font-extrabold leading-tight">
            Order Certified Organic Coco Peat
          </h2>
          <p className="text-stone-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Contact our sales desk today to request bulk price lists and customized specifications reports for loaded containers.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/products"
              className="bg-white text-primary hover:bg-stone-50 font-poppins text-xs font-bold px-6 py-3 rounded-lg transition-all"
            >
              Request Custom Quote
            </Link>
            <Link
              to="/contact"
              className="border border-white/20 hover:bg-white/10 text-white font-poppins text-xs font-bold px-6 py-3 rounded-lg transition-all"
            >
              Contact Sales Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
