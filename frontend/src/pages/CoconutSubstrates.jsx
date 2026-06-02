import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Truck, FileCheck, Anchor, ShieldCheck, MapPin, ArrowRight, Navigation, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalMap from '../components/GlobalMap';
import PageHero from '../components/PageHero';

const CoconutSubstrates = () => {
  const [activeRegion, setActiveRegion] = useState('americas');

  const regionsData = {
    americas: {
      title: 'North & Central America / Caribbean',
      countries: ['United States', 'Canada', 'Mexico', 'Costa Rica', 'Panama', 'Guatemala', 'Dominican Republic', 'Honduras', 'El Salvador', 'Jamaica', 'Trinidad & Tobago'],
      ports: 'Los Angeles, Long Beach, Seattle, New York, Montreal, Veracruz, Puerto Limon',
      transit: '18 - 25 Days standard sailing time',
      docs: 'US/Canada customs bonds clearing assistance, phytosanitary import audits.'
    },
    europe: {
      title: 'European Union & United Kingdom',
      countries: ['United Kingdom', 'Netherlands', 'Germany', 'Spain', 'Italy', 'France', 'Portugal', 'Latvia', 'Ukraine'],
      ports: 'Rotterdam, Felixstowe, Hamburg, Valencia, Genoa, Le Havre, Lisbon',
      transit: '14 - 18 Days sailing time',
      docs: 'EU-standards chemical conformity certificates, phytosanitary clearing certificates.'
    },
    asiapacific: {
      title: 'Asia-Pacific & Oceania',
      countries: ['Japan', 'South Korea', 'Australia', 'New Zealand', 'China', 'Singapore'],
      ports: 'Tokyo, Yokohama, Busan, Melbourne, Sydney, Auckland, Shanghai',
      transit: '10 - 15 Days sailing time',
      docs: 'DAFF clearance compliance for Australia, phytosanitary quarantine clearance.'
    },
    middleeast: {
      title: 'Middle East & Central Asia',
      countries: ['Kuwait', 'Oman', 'Turkey', 'Israel', 'Turkmenistan', 'Kazakhstan'],
      ports: 'Jebel Ali, Shuwaikh, Salalah, Ambarli, Haifa',
      transit: '8 - 12 Days sailing time',
      docs: 'Certificate of Origin from Chamber of Commerce, SASO compliance for Saudi transit.'
    },
    africa: {
      title: 'African Continent',
      countries: ['South Africa', 'Egypt', 'Morocco', 'Mauritius', 'Kenya', 'Nigeria', 'Réunion'],
      ports: 'Durban, Port Elizabeth, Alexandria, Casablanca, Port Louis, Mombasa',
      transit: '12 - 16 Days sailing time',
      docs: 'SGS/Bureau Veritas inspection assistance, phytosanitary clearance certificates.'
    }
  };

  return (
    <div className="pb-16 bg-white min-h-screen">
      <PageHero
        badge="SUPPLY CHAIN"
        title="Global Network"
        titleAccent="& Distribution"
        subtitle="Exporting standardized coco peat substrates to commercial growers and seaport distribution hubs across five continents."
        breadcrumbs={[{ label: 'Global Network', path: '/substrates' }]}
      />

      {/* Interactive Distribution Map */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <GlobalMap />
      </section>

      {/* 2. CONTINENT-WISE EXPORT REGISTRY */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-accent/50 border border-stone-200 rounded-[2.5rem] p-6 lg:p-12 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-primary font-poppins text-[10px] font-bold uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-4 border border-primary/20">
              EXPORT REGISTRY
            </span>
            <h3 className="text-2xl md:text-3xl font-poppins font-extrabold text-stone-900">
              Geographic Distribution Network
            </h3>
            <p className="text-sm text-stone-500 mt-4 font-medium leading-relaxed">
              We coordinate container shipments and logistics document validation for the following global markets:
            </p>
          </div>

          {/* Premium Animated Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 bg-white p-2 rounded-2xl shadow-sm border border-stone-200 w-fit mx-auto relative z-20">
            {Object.keys(regionsData).map((key) => (
              <button
                key={key}
                onClick={() => setActiveRegion(key)}
                className={`relative px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest font-poppins transition-colors duration-300 ${
                  activeRegion === key
                    ? 'text-white'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                {activeRegion === key && (
                  <motion.div
                    layoutId="activeRegionTab"
                    className="absolute inset-0 bg-primary rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {key === 'asiapacific' ? 'Asia-Pacific' : key === 'middleeast' ? 'Middle East' : key}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Region Content Panel */}
          <div className="relative overflow-hidden bg-white p-8 lg:p-12 rounded-[2rem] border border-stone-200 shadow-premium">
            {/* Decorative watermark */}
            <Globe className="absolute -right-16 -bottom-16 w-96 h-96 text-stone-50 opacity-60 pointer-events-none" strokeWidth={0.5} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeRegion}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10"
              >
                {/* LEFT SIDE: Countries List */}
                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-secondary/20">
                      <MapPin className="w-3 h-3" /> ACTIVE EXPORT ZONE
                    </span>
                    <h4 className="font-poppins font-extrabold text-stone-900 text-3xl">
                      {regionsData[activeRegion].title}
                    </h4>
                  </div>
                  
                  <div>
                    <span className="text-[11px] text-stone-400 font-bold uppercase block tracking-widest mb-4">
                      Destinations Served
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {regionsData[activeRegion].countries.map((country, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-stone-50 border border-stone-200 text-stone-700 text-sm px-4 py-2 rounded-xl font-semibold transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary cursor-default shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary opacity-80" />
                          {country}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Logistics Details */}
                <div className="lg:col-span-5 bg-stone-50/80 rounded-3xl p-8 space-y-8 border border-stone-100 shadow-inner">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">
                      <Anchor className="w-4 h-4 text-stone-300" /> Primary Seaports
                    </div>
                    <p className="text-stone-800 font-bold text-sm leading-relaxed">
                      {regionsData[activeRegion].ports}
                    </p>
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-stone-200 to-transparent"></div>

                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">
                      <Navigation className="w-4 h-4 text-stone-300" /> Est. Sailing Time
                    </div>
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                      <Truck className="w-4 h-4" />
                      <span>{regionsData[activeRegion].transit}</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-stone-200 to-transparent"></div>

                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-3">
                      <FileText className="w-4 h-4 text-stone-300" /> Import Support Docs
                    </div>
                    <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-soft">
                      <p className="text-stone-600 text-xs font-semibold leading-relaxed">
                        {regionsData[activeRegion].docs}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 3. SEA FREIGHT LOGISTICS & CUSTOMS COMPLIANCE */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-10 shadow-soft">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              FREIGHT OPERATIONS
            </span>
            <h3 className="text-xl font-poppins font-extrabold text-stone-900 mt-1">
              Logistics & Border Clearance Standards
            </h3>
            <p className="text-xs text-stone-500 mt-2 font-medium">
              We secure customs approvals by maintaining international agriculture quarantine compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Seaport booking Coordination',
                desc: 'We coordinate with major shipping agents to book 40ft FCL container space, guaranteeing freight routing to your designated port terminal.',
                icon: Anchor,
              },
              {
                title: 'Phytosanitary inspection audits',
                desc: 'Every container is checked by plant health inspectors before loading, verifying it is 100% free of soil pathogens, pests, and weed seeds.',
                icon: FileCheck,
              },
              {
                title: 'Traceable Cargo weight checks',
                desc: 'We provide Verified Gross Mass (VGM) certificates and custom invoices, detailing exact EC, pH, and moisture parameters per pallet code.',
                icon: ShieldCheck,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-stone-850 text-sm">{item.title}</h4>
                    <p className="text-stone-500 text-xs mt-1.5 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact redirection CTA */}
      <div className="max-w-7xl mx-auto px-6 text-center">
        <Link
          to="/contact"
          className="bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3.5 px-8 rounded-lg shadow-soft inline-flex items-center space-x-1.5"
        >
          <span>Connect with Our Shipping Desk</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default CoconutSubstrates;
