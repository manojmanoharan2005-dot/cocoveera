import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { API_URL } from "../../utils/config";
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle, Package, Truck, ShieldCheck, Globe, Star, HelpCircle } from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import SEO from "../../components/SEO";

import "./landingpageStyle.css";

const CocoCoirGrowBagsWholesale = () => {
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
                const filter = "grow bag".toLowerCase();
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
                "title": "Breathes Better",
                "text": "Superior aeration promotes vigorous root development and prevents root rot in high-density crops."
        },
        {
                "title": "Holds Water Just Right",
                "text": "Optimal water retention capacity ensures balanced moisture levels without waterlogging."
        },
        {
                "title": "Gentle on Every Plant",
                "text": "Low EC, triple-washed coir substrate safe for sensitive young roots and high-value crops."
        },
        {
                "title": "Built to Last",
                "text": "UV-stabilized poly bags engineered to withstand multi-year commercial greenhouse conditions."
        },
        {
                "title": "Better for the Planet",
                "text": "100% organic, renewable, and eco-friendly growing medium substituting peat moss."
        },
        {
                "title": "Available in Bulk",
                "text": "Direct factory export in container loads with custom sizing, pre-drilled plant/drain holes."
        }
];

    const processSteps = [
        {
                "step": 1,
                "title": "Sourcing Premium Coconut Husks",
                "text": "Selected raw coconut husks are processed for high fiber structural integrity."
        },
        {
                "step": 2,
                "title": "Washing & EC Buffering",
                "text": "Triple washed with clean fresh water to reduce electrical conductivity (EC < 0.5 mS/cm)."
        },
        {
                "step": 3,
                "title": "Sifting & Particle Blending",
                "text": "Precise mixing of coir pith and chips tailored for specific crop requirements."
        },
        {
                "step": 4,
                "title": "Compression & Sizing",
                "text": "Compressed into compact grow slabs for efficient sea freight and easy expansion."
        },
        {
                "step": 5,
                "title": "UV-Protected Poly Wrapping",
                "text": "Encased in heavy-duty white/black UV-protected co-extruded plastic bags."
        },
        {
                "step": 6,
                "title": "Quality Check & Container Dispatch",
                "text": "Strict moisture and expansion testing before container loading and export dispatch."
        }
];

    const faqs = [
        {
                "q": "What sizes and custom options are available for wholesale grow bags?",
                "a": "We offer standard slab sizes (e.g. 100x15x12 cm, 100x20x10 cm) as well as custom lengths, pre-cut plant holes, and pre-drilled drain slots upon request for container orders."
        },
        {
                "q": "Are these grow bags suitable for hydroponic berry and vegetable cultivation?",
                "a": "Yes, our grow bags are specifically designed for commercial hydroponic strawberries, blueberries, tomatoes, cucumbers, and peppers."
        },
        {
                "q": "How are coir grow bags shipped for bulk international export?",
                "a": "Grow slabs are compressed, UV-wrapped, palletized, and shrink-wrapped for safe ocean container transport directly to your port or facility."
        },
        {
                "q": "What blend ratio of coir pith and chips works best for grow bags?",
                "a": "We offer standard 70/30, 50/50, and 100% coir pith or husk chip blends depending on your climate, crop type, and irrigation system."
        },
        {
                "q": "How do I request a sample batch or wholesale price quote?",
                "a": "Contact our sales team through the RFQ form on our site to request sample packs or customized container pricing."
        }
];

    const aboutParagraphs = [
        "Cocoveera is a global coir manufacturer and substrate exporter committed to delivering high-performance growing solutions for modern commercial agriculture.",
        "Our coco coir grow bags are custom engineered to optimize root aeration, water drainage, and nutrient retention for greenhouse and hydroponic production."
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
    const pageUrl = `${siteUrl}/coco-coir-grow-bags-wholesale`;

    const schemaData = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
                { "@type": "ListItem", "position": 2, "name": "Coco Coir Grow Bags Wholesale", "item": pageUrl }
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
                title="Coco Coir Grow Bags Wholesale | Bulk Coir Substrates Supplier"
                description="High-performance coco coir grow bags wholesale for commercial greenhouses, hydroponics, berry production, and commercial horticulture."
                url="/coco-coir-grow-bags-wholesale"
                schema={schemaData}
            />

            {/* Breadcrumb Navigation */}
            <div className="bg-emerald-950 text-white/80 py-2.5 px-4 sm:px-8 text-xs font-medium border-b border-emerald-900/50">
                <div className="max-w-7xl mx-auto flex items-center gap-2">
                    <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-emerald-400 font-semibold">Coco Coir Grow Bags Wholesale</span>
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
                            Coco Coir Grow Bags Wholesale
                        </h1>
                        <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
                            Cocoveera manufactures and exports high-performance coco coir grow bags wholesale for commercial growers, berries, vegetables, and hydroponic setups worldwide.
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
                                alt="Coco Coir Grow Bags Wholesale" 
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
                        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Who is Cocoveera?</h2>
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
                        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Built for Better Growing</h2>
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
                        <h2 className="text-2xl sm:text-3xl font-bold">Making of Every Grow Bag</h2>
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
                                            <Link 
                                                to={`/product/${prodSlug}`}
                                                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
                                            >
                                                View Product Details
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
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

export default CocoCoirGrowBagsWholesale;
