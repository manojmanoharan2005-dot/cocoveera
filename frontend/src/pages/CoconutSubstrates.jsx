import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Truck, FileCheck, Anchor, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import GlobalMap from '../components/GlobalMap';

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
    <div className="pt-24 pb-16 bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-primary text-white py-12 px-6 mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 space-y-2">
          <span className="text-secondary-light font-poppins text-xs font-bold uppercase tracking-widest bg-white/10 py-1 px-3 rounded-lg">
            SUPPLY CHAIN
          </span>
          <h1 className="text-3xl sm:text-5xl font-poppins font-extrabold mt-1">
            Global Network & Distribution
          </h1>
          <p className="text-stone-105 text-xs sm:text-sm max-w-lg mx-auto mt-3 leading-relaxed font-medium">
            Exporting standardized coco peat substrates to commercial growers and seaport distribution hubs across five continents.
          </p>
        </div>
      </section>

      {/* Interactive Distribution Map */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <GlobalMap />
      </section>

      {/* 2. CONTINENT-WISE EXPORT REGISTRY */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-accent border border-stone-200 rounded-3xl p-6 lg:p-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              EXPORT REGISTRY
            </span>
            <h3 className="text-xl font-poppins font-extrabold text-stone-900 mt-1">
              Geographic Distribution Network
            </h3>
            <p className="text-xs text-stone-500 mt-2 font-medium">
              We coordinate container shipments and logistics document validation for the following global markets:
            </p>
          </div>

          {/* Region Tabs Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.keys(regionsData).map((key) => (
              <button
                key={key}
                onClick={() => setActiveRegion(key)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-poppins transition-all ${
                  activeRegion === key
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {key === 'asiapacific' ? 'Asia-Pacific' : key === 'middleeast' ? 'Middle East' : key}
              </button>
            ))}
          </div>

          {/* Selected Region details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-soft">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-secondary font-poppins text-[10px] font-bold uppercase tracking-widest">
                ACTIVE EXPORT ZONE
              </span>
              <h4 className="font-poppins font-extrabold text-stone-900 text-base">
                {regionsData[activeRegion].title}
              </h4>
              
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block tracking-wider mb-2">Destinations Served</span>
                <div className="flex flex-wrap gap-1.5">
                  {regionsData[activeRegion].countries.map((country, idx) => (
                    <span
                      key={idx}
                      className="bg-accent border border-stone-200 text-stone-700 text-xs px-3 py-1 rounded-md font-semibold"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-8 space-y-4 text-xs font-semibold text-stone-705">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block tracking-widest">Primary Seaports</span>
                <p className="text-stone-850 mt-1 font-bold">{regionsData[activeRegion].ports}</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block tracking-widest">Est. Sailing Time</span>
                <div className="flex items-center gap-1.5 text-primary mt-1 font-bold">
                  <Truck className="w-4 h-4" />
                  <span>{regionsData[activeRegion].transit}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block tracking-widest">Import Support Docs</span>
                <p className="text-stone-500 mt-1 font-medium leading-relaxed">{regionsData[activeRegion].docs}</p>
              </div>
            </div>
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
