import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { API_URL } from "../../utils/config";
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle, Package, Truck, ShieldCheck, Globe, Star, HelpCircle } from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import SEO from "../../components/SEO";
import { navigateToProduct } from "../../utils/productNavigation";

import "./landingpageStyle.css";

const BuyCocopeatNewYork = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [openFaq, setOpenFaq] = useState(0);

    const productRef = useRef(null);
    const fetcher = url => axios.get(url).then(res => res.data.data);

    const { data: dbCategories = [] } = useSWR(
        `${API_URL}/categories`,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 600000 }
    );

    const { data: allProducts = [] } = useSWR(
        `${API_URL}/products`,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 600000 }
    );

    const filteredProducts = useMemo(() => {
        return allProducts
            .filter((product) => {
                const cat = (product.category || "").toLowerCase().trim();
                const name = (product.name || "").toLowerCase().trim();
                const filter = "cocopeat".toLowerCase();
                return cat.includes(filter) || name.includes(filter) || cat.includes("coir") || cat.includes("cocopeat");
            })
            .slice(0, 8);
    }, [allProducts]);

    const scrollProducts = (dir) => {
        const el = productRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 320, behavior: 'smooth' });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const benefits = [
        {
                "title": "Direct Import & Port Delivery",
                "text": "Seamless shipping logistics directly to NY / NJ ports and regional commercial distribution centers."
        },
        {
                "title": "Consistent Low EC Quality",
                "text": "Laboratory tested low electrical conductivity (EC < 0.5 mS/cm) safe for sensitive commercial crops."
        },
        {
                "title": "Bulk Cocopeat, Ready to Ship",
                "text": "Full container loads (FCL) of 5kg blocks, briquettes, and grow slabs ready for rapid export dispatch."
        },
        {
                "title": "Ideal for Hydroponic Growing",
                "text": "Perfect substrate balance for indoor hydroponic facilities, urban farms, and commercial greenhouses."
        },
        {
                "title": "Sustainable & Organic Medium",
                "text": "100% natural, eco-friendly coconut fiber supporting sustainable agricultural practices."
        },
        {
                "title": "Batch Tested & Certified",
                "text": "Accompanied by official phytosanitary and batch test reports for complete peace of mind."
        }
];

    const processSteps = [
        {
                "step": 1,
                "title": "Choose Your Cocopeat Grade",
                "text": "Select from washed low EC 5kg blocks, briquettes, or custom grow bags based on your crop specifications."
        },
        {
                "step": 2,
                "title": "Place Order & Specifications",
                "text": "Finalize container quantity, palletization preferences, and custom branding requirements."
        },
        {
                "step": 3,
                "title": "Quality Checked Before Dispatch",
                "text": "Every production lot undergoes rigorous lab testing for EC, pH, moisture, and expansion ratio."
        },
        {
                "step": 4,
                "title": "Packed for Safe Ocean Transit",
                "text": "Palletized and weather-sealed to protect against moisture and damage during sea transit."
        },
        {
                "step": 5,
                "title": "Shipped to New York Ports",
                "text": "Ocean freight shipping routed to New York / New Jersey port terminals with full documentation."
        },
        {
                "step": 6,
                "title": "Delivered to Your Doorstep",
                "text": "Customs clearance and final drayage delivery straight to your warehouse or greenhouse facility."
        }
];

    const faqs = [
        {
                "q": "How long does shipping take for cocopeat orders bound for New York?",
                "a": "Standard ocean freight transit from production export hubs to New York / New Jersey ports typically takes 25 to 35 days."
        },
        {
                "q": "What documentation accompanies shipments to New York, USA?",
                "a": "All shipments include USDA-compliant Phytosanitary Certificates, Certificates of Origin, Bill of Lading, and batch laboratory quality reports."
        },
        {
                "q": "Are custom EC levels available for commercial growers in NY?",
                "a": "Yes, we produce both triple-washed low EC (< 0.5 mS/cm) and high EC coir substrates tailored to your specific irrigation protocol."
        },
        {
                "q": "Can small commercial nurseries order pallet quantities instead of full containers?",
                "a": "We handle LCL (Less than Container Load) and full container load (FCL) orders to accommodate growing businesses."
        },
        {
                "q": "How can New York commercial growers request a price quote or sample?",
                "a": "Fill out our RFQ contact form online or speak directly with our export team for customized quotes."
        }
];

    const aboutParagraphs = [
        "Cocoveera is an international coir manufacturer exporting premium coconut growing media directly to commercial growers and distributors across New York State and the East Coast.",
        "We handle all export logistics, phytosanitary certifications, and customs documentation to ensure smooth container delivery to New York ports and regional warehouses."
];

    const testimonials = [
        {
            img: "https://randomuser.me/api/portraits/men/32.jpg",
            name: "James Carter",
            role: "Commercial Greenhouse Operator",
            text: "The quality and consistency of Cocoveera products have exceeded our expectations. Excellent moisture retention and fast delivery.",
        },
        {
            img: "https://randomuser.me/api/portraits/women/44.jpg",
            name: "Mark Reynolds",
            role: "Nursery Director",
            text: "Reliable bulk coir substrates with excellent low EC levels. We get uniform growth across all our greenhouse crops.",
        },
        {
            img: "https://randomuser.me/api/portraits/women/65.jpg",
            name: "Linda Torres",
            role: "Agricultural Product Distributor",
            text: "As a distributor, consistency across every shipment is key. Cocoveera delivers top-tier quality every single time.",
        }
    ];

    const siteUrl = "https://www.cocoveera.com";
    const pageUrl = `${siteUrl}/buy-cocopeat-new-york`;

    const schemaData = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
                { "@type": "ListItem", "position": 2, "name": "Buy Cocopeat in New York", "item": pageUrl }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Cocoveera",
            "url": siteUrl,
            "logo": `${siteUrl}/favicon.webp`
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                }
            }))
        }
    ];

    return (
        <div className="landing_page_parent">
            <SEO
                title="Buy Cocopeat in New York | Bulk Coir Export to NY, USA"
                description="Buy premium cocopeat in New York. Cocoveera is a direct global manufacturer exporting high quality low EC cocopeat blocks, bags, and substrates to NY & USA growers."
                url="/buy-cocopeat-new-york"
                schema={schemaData}
            />

            {/* Breadcrumb Navigation */}
            <div className="bg-emerald-950 text-white/80 py-2.5 px-4 sm:px-8 text-xs font-medium border-b border-emerald-900/50">
                <div className="max-w-7xl mx-auto flex items-center gap-2">
                    <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-emerald-400 font-semibold">Buy Cocopeat in New York</span>
                </div>
            </div>

            {/* HERO SECTION */}
            <section className="bd-hero relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/60 text-emerald-300 border border-emerald-700/50">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Premium Export Quality Coir Substrates
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Buy Cocopeat in New York
                        </h1>
                        <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
                            Supplying commercial growers, greenhouse operators, and agricultural distributors in New York with high-grade, low EC coconut coir substrates exported direct from factory.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link 
                                to="/contact" 
                                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm"
                            >
                                Request Wholesale Quote
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link 
                                to="/products" 
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 transition-all text-sm backdrop-blur-sm"
                            >
                                Explore Product Range
                            </Link>
                        </div>
                    </motion.div>
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-emerald-900/30">
                            <ImageWithFallback 
                                src="/landing-page-images/banner-bg.webp" 
                                alt="Buy Cocopeat in New York" 
                                className="w-full h-80 sm:h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex items-end p-6">
                                <div className="text-xs text-emerald-200 bg-emerald-950/90 backdrop-blur-md p-3.5 rounded-xl border border-emerald-800/50 flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Direct Bulk Supply & Worldwide Logistics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Global Cocopeat Supplier Serving New York</h2>
                        <div className="w-16 h-1 bg-emerald-600 mx-auto rounded-full"></div>
                        {aboutParagraphs.map((p, idx) => (
                            <p key={idx} className="text-sm text-stone-700 leading-relaxed">{p}</p>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENEFITS / ADVANTAGES */}
            <section className="py-16 bg-white border-y border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Why New York Growers Choose Us</h2>
                        <p className="text-sm text-stone-600 mt-2">Engineered for commercial performance, root health, and maximum crop yields.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((b, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                    0{idx + 1}
                                </div>
                                <h3 className="text-lg font-bold text-stone-900">{b.title}</h3>
                                <p className="text-sm text-stone-600 leading-relaxed">{b.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROCESS SECTION */}
            <section className="py-16 bg-emerald-950 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-bold">Order-to-Delivery Process to New York</h2>
                        <p className="text-sm text-emerald-200/80">Strict quality controls from raw husk sourcing to final shipping dispatch.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {processSteps.map((s, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/60 space-y-3">
                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 0{idx + 1}</div>
                                <h3 className="text-base font-bold text-white">{s.title}</h3>
                                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REAL PRODUCTS SLIDER / GRID */}
            <section className="py-16 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-stone-900">Featured Coir Substrate Range</h2>
                            <p className="text-sm text-stone-600">Explore real products available for bulk export</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => scrollProducts(-1)} className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => scrollProducts(1)} className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div ref={productRef} className="flex gap-6 overflow-x-auto scrollbar-none pb-4 snap-x">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((prod) => {
                                const prodSlug = prod.slug || prod._id;
                                return (
                                    <div key={prod._id} className="min-w-[280px] max-w-[300px] bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all snap-start flex flex-col justify-between">
                                        <div className="p-4 bg-stone-100 relative">
                                            <ImageWithFallback 
                                                src={prod.image || prod.images?.[0] || "/images/coco-peat.jpg"} 
                                                alt={prod.name} 
                                                className="w-full h-44 object-cover rounded-xl"
                                            />
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div>
                                                <h3 className="font-bold text-stone-900 text-base line-clamp-1">{prod.name}</h3>
                                                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.shortDescription || prod.description || "High quality coir substrate"}</p>
                                            </div>
                                             <button 
                                                onClick={(e) => navigateToProduct(prod, navigate, null, e)}
                                                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                                             >
                                                View Product Details
                                                <ArrowRight className="w-3.5 h-3.5" />
                                             </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full text-center py-8 text-stone-500 text-sm">
                                Loading products or browse our full catalog on the <Link to="/products" className="text-emerald-600 underline font-semibold">Products page</Link>.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-16 bg-white border-t border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">What Commercial Growers Say</h2>
                        <p className="text-sm text-stone-600 mt-2">Trusted by agricultural distributors, nurseries, and hydroponic growers worldwide.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">"{t.text}"</p>
                                <div className="pt-2 border-t border-stone-200 flex items-center gap-3">
                                    <img src={t.img} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                                    <div>
                                        <div className="text-xs font-bold text-stone-900">{t.name}</div>
                                        <div className="text-[11px] text-stone-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="py-16 bg-stone-50 border-t border-stone-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Frequently Asked Questions</h2>
                        <p className="text-sm text-stone-600">Got questions about wholesale orders, specifications, or logistics? Find answers below.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                    className="w-full p-5 text-left font-semibold text-stone-900 flex justify-between items-center gap-4 text-sm hover:text-emerald-700 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    <span className="text-emerald-600 text-lg font-bold">{openFaq === idx ? "−" : "+"}</span>
                                </button>
                                {openFaq === idx && (
                                    <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-16 bg-emerald-900 text-white text-center">
                <div className="max-w-4xl mx-auto px-4 space-y-6">
                    <h2 className="text-2xl sm:text-4xl font-extrabold">Ready to Order Bulk Substrates?</h2>
                    <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto">
                        Get factory-direct pricing, custom EC specifications, and export phytosanitary documentation for your next commercial growing season.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-2">
                        <Link 
                            to="/contact" 
                            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-8 py-3.5 rounded-xl shadow-lg text-sm transition-all"
                        >
                            Contact Sales Team
                        </Link>
                        <Link 
                            to="/about" 
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 text-sm transition-all"
                        >
                            About Cocoveera
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BuyCocopeatNewYork;
