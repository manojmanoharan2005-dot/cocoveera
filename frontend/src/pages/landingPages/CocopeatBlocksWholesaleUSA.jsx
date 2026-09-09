import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useSWR from 'swr';
import { API_URL } from "../../utils/config";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import SEO from "../../components/SEO";

import "./landingpageStyle.css";

const CocopeatBlocksWholesaleUSA = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
    const [showAllProducts, setShowAllProducts] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    const productRef = useRef(null);

    const optimizeImage = (url) => {
        if (!url) return '';
        if (url.includes('cloudinary.com') && !url.includes('/upload/f_auto,q_auto')) {
            return url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
        }
        return url;
    };

    const fetcher = url => axios.get(url).then(res => res.data.data);
    const { data: dbCategories = [], isLoading } = useSWR(
        `${API_URL}/categories`,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 600000 }
    );

    const sortedCategories = dbCategories;

    const scrollProducts = (dir) => {
        const el = productRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 320, behavior: 'smooth' });
    };

    const { data: cocopeatProducts = [], isLoading: loadingCocopeatProducts } = useSWR(
        `${API_URL}/products`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 600000,
        }
    );

    const getProductImage = (product) => {
        if (!product) return null;
        if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
            return product.images[0];
        }
        if (typeof product.image === 'string' && product.image) {
            return product.image;
        }
        if (Array.isArray(product.image) && product.image.length > 0 && product.image[0]) {
            return product.image[0];
        }
        if (product.imageUrl) return product.imageUrl;
        if (product.image_url) return product.image_url;
        return null;
    };

    const latestCocopeatProducts = useMemo(() => {
        return cocopeatProducts
            .filter((product) => {
                if (!product || product.isActive === false || product.isDeleted) return false;
                const category = (product.category || "").toLowerCase().trim();
                const name = (product.name || "").toLowerCase().trim();

                return (
                    category === "cocopeat blocks" ||
                    category.includes("cocopeat blocks") ||
                    category.includes("cocopeat block") ||
                    category.includes("coir block") ||
                    category.includes("coco peat block") ||
                    name.includes("cocopeat block") ||
                    name.includes("coir block")
                );
            })
            .slice(0, 8);
    }, [cocopeatProducts]);

    // Auto-scroll products
    useEffect(() => {
        const interval = setInterval(() => {
            const el = productRef.current;
            if (!el) return;

            // If we've reached the end, scroll back to 0
            if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: 320, behavior: 'smooth' });
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 3500);

        return () => clearInterval(interval);
    }, []);


    const categories = [
        {
            image: "/images/blueberry-disc.jpg",
            title: "Blueberry Discs",
            text: "Premium growing discs",
        },
        {
            image: "/images/coco-peat.jpg",
            title: "Coco Peat",
            text: "Perfect for plants & gardens",
        },
        {
            image: "/images/coir-logs.jpg",
            title: "Coir Logs",
            text: "Sustainable & biodegradable",
        },
        {
            image: "/images/garden-essentials.jpg",
            title: "Garden Essentials",
            text: "Everything for a green space",
        },
        {
            image: "/images/coco-pots.jpg",
            title: "Coconut Pots",
            text: "Natural & durable planters",
        },
    ];

    const benefits = [
        {
            icon: "/landing-page-images/icons/natural-safe.png",
            title: "100% Natural Coir",
            text: "Our bulk cocopeat blocks are made from 100% natural coconut coir, free from harmful chemicals — safe for plants, soil, and people.",
        },
        {
            icon: "/landing-page-images/icons/sustainable-living.png",
            title: "Eco-Friendly Choice",
            text: "Every block supports eco-friendly growing, made from a renewable coconut by-product that reduces waste and cuts environmental impact.",
        },
        {
            icon: "/landing-page-images/icons/premium-quality.png",
            title: "Screened & Tested",
            text: "Each bulk cocopeat block is processed and screened for consistent texture, low salt content, and better water retention for healthier roots.",
        },
        {
            icon: "/landing-page-images/icons/wide-range.png",
            title: "Flexible Grades & Sizes",
            text: "From low to high EC cocopeat blocks, compressed to loose, small to bulk sizes — we offer cocopeat blocks suited to every growing need.",
        },
        {
            icon: "/landing-page-images/icons/affordable-prices.png",
            title: "Bulk Value Pricing",
            text: "Buying in bulk means better value per block, without compromising on the quality your plants and soil deserve.",
        },
        {
            icon: "/landing-page-images/icons/fast-shipping.png",
            title: "Fast, Dependable Delivery",
            text: "Place a bulk cocopeat block order and get it delivered quickly and reliably, so your growing schedule is never delayed.",
        },
    ];

    const testimonials = [
        {
            name: "Mark Reynolds",
            role: "Nursery Owner",
            text: "We tested the cocopeat blocks for some of our nursery plants and were happy with the texture after expansion. The material provided good moisture retention without feeling overly compact. We would consider using it for more of our growing applications.",
        },
        {
            name: "James Carter",
            role: "Home Gardener",
            text: "Good quality coco peat blocks at a fair wholesale price. Would like to see even faster shipping next time, but overall very satisfied.",
        },
        {
            name: "Linda Torres",
            role: "Agricultural Product Distributor",
            text: "As a distributor, I need consistency across every batch — Cocoveera's compressed blocks have been reliable, and their team was responsive when we had questions.",
        },
        {
            name: "Daniel T",
            role: "Hydroponic Grower",
            text: "The cocopeat blocks arrived well compressed and were easy to hydrate and prepare for use. We liked the structure of the growing medium and how evenly it held moisture. It has been a practical addition to our growing setup.",
        },
    ];

    const blogs = [
        {
            image: "/landing-page-images/blog.webp",
            category: "Commercial Cultivation",
            title: "Washed vs Buffered Cocopeat Blocks for Agriculture",
            link: "/production-process",
            date: "Technical Guide",
            time: "4 min read",
        },
        {
            image: "/landing-page-images/blog.webp",
            category: "Growing Media",
            title: "Optimizing Moisture Retention with Coco Substrates",
            link: "/products?category=Cocopeat%20Blocks",
            date: "Technical Guide",
            time: "5 min read",
        },
        {
            image: "/landing-page-images/blog.webp",
            category: "Global Logistics",
            title: "Container Load Export & Bulk Freight Logistics",
            link: "/global-network",
            date: "Supply Chain",
            time: "6 min read",
        },
        {
            image: "/landing-page-images/blog.webp",
            category: "Quality Testing",
            title: "Understanding Low EC Standards for Greenhouse Crops",
            link: "/production-process",
            date: "Quality Assurance",
            time: "5 min read",
        },
    ];

    const faqs = [
        {
            question: "What is the wholesale price of cocopeat blocks per pallet?",
            answer:
                "Wholesale pricing depends on the block grade, weight, quantity, packaging, and destination. Contact Cocoveera for a quotation based on your requirements."
        },
        {
            question: "How long does coco peat last?",
            answer:
                "Cocopeat can remain usable for multiple growing cycles when properly managed. Its lifespan depends on the application, growing conditions, crop, and how the material is maintained."
        },
        {
            question: "Who are the leading exporters of coco peat in India?",
            answer:
                "India is one of the major sources of cocopeat and coir-based growing media. Indian exporters supply different grades and formats, including cocopeat blocks, to international horticultural and agricultural markets."
        },
        {
            question: "Can I buy bulk coco peat blocks for wholesale distribution in the USA?",
            answer:
                "Yes. Cocoveera supplies bulk cocopeat blocks for distributors, commercial growers, nurseries, and other B2B buyers. Contact us with your required quantity and destination."
        },
        {
            question: "What is the export price for a container load of cocopeat blocks?",
            answer:
                "Container-load pricing depends on the product grade, block weight, packaging, quantity, and destination. Contact Cocoveera for a customized export quotation."
        },
        {
            question: "What are the dimensions of a 5kg cocopeat block?",
            answer:
                "The dimensions of a 5kg coco peat block depend on its compression and product specification. Contact Cocoveera for the exact dimensions and technical specifications of the 5kg block."
        },
        {
            question: "Are washed and buffered cocopeat blocks available?",
            answer:
                "Yes. Cocoveera offers washed and buffered coco peat blocks, along with Natural, Mix, Pro, and Premium grades for different growing requirements."
        },
        {
            question: "Can I order cocopeat blocks in bulk?",
            answer:
                "Yes. Cocoveera supplies bulk coco peat blocks for commercial agriculture, horticulture, nurseries, greenhouses, distributors, and other B2B requirements."
        },
        {
            question: "What sizes of cocopeat blocks are available?",
            answer:
                "Cocoveera offers cocopeat blocks in multiple weights, including 650g, 1kg, 2kg, 3kg, 4kg, 4.5kg, and 5kg, depending on the selected grade."
        },
    ];


    const siteUrl = "https://cocoveera.com";
    const pageUrl = `${siteUrl}/cocopeat-blocks-wholesale-usa`;

    const schemaData = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
                { "@type": "ListItem", "position": 2, "name": "Cocopeat Blocks Wholesale USA", "item": pageUrl }
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
                "name": faq.question || faq.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer || faq.a
                }
            }))
        }
    ];

    return (
        <>
            <SEO
                title="Cocopeat Blocks Wholesale USA | Bulk Cocopeat Supplier"
                exactTitle={true}
                description="Buy cocopeat blocks wholesale in the USA from Cocoveera. Source bulk compressed, low-EC cocopeat blocks for commercial growers, nurseries and distributors."
                canonical="https://cocoveera.com/cocopeat-blocks-wholesale-usa"
                url="/cocopeat-blocks-wholesale-usa"
                image="/landing-page-images/banner-product.webp"
                keywords={`
        cocopeat blocks,
        wholesale USA,
        bulk cocopeat blocks,
        5kg cocopeat block supplier,
        compressed cocopeat blocks,
        cocopeat block price,
        washed cocopeat blocks low EC,
        cocopeat blocks for agriculture,
        wholesale coir pith blocks,
        low EC coco peat block,
        cocopeat supplier,
        buy bulk coco peat blocks for wholesale distribution USA,
        coco peat blocks wholesale price per pallet,
        low EC coco peat blocks for commercial growers,
        coco peat block supplier with phytosanitary certificate,
        coco peat blocks container load export price
    `}
                schema={schemaData}
            />
            {/* Breadcrumb Navigation */}
            <div className="bg-emerald-950 text-white/80 py-2.5 px-4 sm:px-8 text-xs font-medium border-b border-emerald-900/50">
                <div className="max-w-7xl mx-auto flex items-center gap-2">
                    <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-emerald-400 font-semibold">Cocopeat Blocks Wholesale USA</span>
                </div>
            </div>

            <main className="landing_page_parent">

                {/* ================= HERO ================= */}
                <section className="bd-hero">
                    <div className="container m-auto hero-container">

                        <div className="hero-content">
                            <span className="small-label">
                                PREMIUM COIR GROWING SOLUTIONS
                            </span>

                            <h1>
                                Premium Cocopeat Blocks Wholesale in the USA
                            </h1>

                            <p>
                                High-quality compressed cocopeat blocks designed for commercial growing, agriculture, nurseries, and large-scale cultivation. Cocoveera supplies reliable cocopeat blocks wholesale, offering a practical and efficient growing medium for professional growers and wholesale buyers.
                            </p>

                            <div className="hero-features">
                                <div>
                                    <span className="feature-icon">🌿</span>
                                    <span>
                                        <strong>100% Natural</strong>
                                        <small>Organic Coir</small>
                                    </span>
                                </div>

                                <div>
                                    <span className="feature-icon">♻️</span>
                                    <span>
                                        <strong>Sustainable</strong>
                                        <small>Eco-Friendly</small>
                                    </span>
                                </div>

                                <div>
                                    <span className="feature-icon">✓</span>
                                    <span>
                                        <strong>Trusted Quality</strong>
                                        <small>Premium Products</small>
                                    </span>
                                </div>
                            </div>

                            <div className="hero-buttons">
                                <a href="#products" className="primary-btn">
                                    Shop Our Products <span>→</span>
                                </a>

                                <a href="#about" className="secondary-btn">
                                    Learn More <span>⊙</span>
                                </a>
                            </div>
                        </div>

                        <div className="hero-product">
                            <div className="product-glow"></div>
                            <div className="quality-badge">
                                <div>
                                    <strong>+2</strong>
                                    <small>YEARS OF<br />EXCELLENCE</small>
                                </div>
                            </div>
                            <img
                                src="/landing-page-images/banner-product.webp"
                                alt="Premium compressed cocopeat blocks for wholesale supply"
                            />
                        </div>

                    </div>
                </section>


                {/* ================= SERVICE BAR ================= */}
                <section className="service-bar-wrapper">
                    <div className="container m-auto service-bar">

                        <div className="service-item">
                            <span>
                                <img src="/landing-page-images/icons/eco-friendly.png" alt="" />
                            </span>
                            <div>
                                <strong>Eco-Friendly</strong>
                                <small>Products</small>
                            </div>
                        </div>

                        <div className="service-item">
                            <span>
                                <img src="/landing-page-images/icons/fast-delivery.png" alt="" />
                            </span>
                            <div>
                                <strong>Fast & Reliable</strong>
                                <small>Delivery</small>
                            </div>
                        </div>

                        <div className="service-item">
                            <span>
                                <img src="/landing-page-images/icons/secure-payment.png" alt="" />
                            </span>
                            <div>
                                <strong>Secure</strong>
                                <small>Payments</small>
                            </div>
                        </div>

                        <div className="service-item">
                            <span>
                                <img src="/landing-page-images/icons/dedicated-support.png" alt="" />
                            </span>
                            <div>
                                <strong>Dedicated</strong>
                                <small>Support</small>
                            </div>
                        </div>

                    </div>
                </section>


                {/* ================= CATEGORIES ================= */}
                <section className="py-14 sm:py-20 px-5 sm:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-end justify-between mb-8 sm:mb-12">
                            <div className="section-heading text-start">
                                <span>EXPLORE OUR CATEGORIES</span>
                                <h2>
                                    Sustainable Solutions,{" "}
                                    <em>Naturally Yours</em>
                                </h2>
                                <p>
                                    High-quality coconut-based products for every need.
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="hidden md:inline-flex items-center gap-2 border border-stone-200 hover:border-primary hover:text-primary text-stone-600 font-poppins text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                            >
                                VIEW ALL PRODUCTS <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Scrollable Products Carousel */}
                        <div className="relative">
                            <div
                                ref={productRef}
                                className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {isLoading ? (
                                    // Skeleton Loaders
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <div key={`skel-${i}`} className="w-[85vw] xs:w-[75vw] sm:w-[260px] md:w-[280px] snap-start bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-soft flex-shrink-0 flex flex-col">
                                            <div className="h-48 w-full bg-stone-200 animate-pulse"></div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="h-4 bg-stone-200 animate-pulse rounded w-2/3 mb-4"></div>
                                                <div className="h-3 bg-stone-200 animate-pulse rounded w-full mb-2"></div>
                                                <div className="h-3 bg-stone-200 animate-pulse rounded w-4/5 mb-4"></div>
                                                <div className="mt-auto h-4 bg-stone-200 animate-pulse rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : sortedCategories.map((dbCat, i) => {
                                    const displayImg = optimizeImage(dbCat.image);
                                    const link = `/products?category=${encodeURIComponent(dbCat.name)}`;
                                    const desc = dbCat.description || `Explore our premium range of ${dbCat.name} engineered for global growers.`;

                                    return (
                                        <motion.div
                                            key={dbCat._id || i}
                                            onClick={() => navigate(link)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    navigate(link);
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.5 }}
                                            whileHover={{ y: -8, scale: 1.02, rotateX: 2, rotateY: -2, boxShadow: "0 0 40px rgba(46,125,50,0.25)" }}
                                            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                                            className="w-[85vw] xs:w-[75vw] sm:w-[260px] md:w-[280px] snap-start bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-soft transition-all duration-300 group flex-shrink-0 flex flex-col relative cursor-pointer"
                                        >
                                            {/* Glass reflection highlight */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
                                            <div className="relative h-48 w-full overflow-hidden flex items-center justify-center p-3 bg-stone-50 flex-shrink-0">
                                                <div className="h-full aspect-square rounded-[1.5rem] overflow-hidden flex items-center justify-center relative">
                                                    <ImageWithFallback
                                                        src={displayImg}
                                                        alt={dbCat.name}
                                                        className="w-full h-full object-contain mix-blend-multiply brightness-[1.05] contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                {dbCat.tag && (
                                                    <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                                                        {dbCat.tag}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="font-poppins font-bold text-stone-900 text-sm mb-2 leading-tight">{dbCat.name}</h3>
                                                <p className="text-stone-500 text-xs leading-relaxed mb-4 flex-grow line-clamp-3">{desc}</p>
                                                <div
                                                    className="inline-flex items-center gap-1 text-primary font-bold text-xs group-hover:gap-2 transition-all duration-200 mt-auto"
                                                >
                                                    VIEW CATEGORY <ArrowRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => scrollProducts(-1)}
                                className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all z-10"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scrollProducts(1)}
                                className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all z-10"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* ================= ABOUT US ================= */}
                <section className="about-section" id="about">
                    <div className="container m-auto">
                        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                            {/* Content */}
                            <div className="about-content">
                                <span className="section-tag">
                                    WHO WE ARE
                                </span>

                                <h2>
                                    Growing a Greener Future, Naturally
                                </h2>
                                <p>
                                    We are Cocoveera, a  high-quality coir manufacturer and cocopeat supplier focused on supplying dependable growing media to customers across global markets. We work with coconut as a natural resource, carefully processing its coir into products suited for modern cultivation and commercial growing needs.
                                </p>
                                <p>
                                    Our product range covers coco peat blocks, grow bags, coir chips, briquettes and other coir-based growing solutions, produced with attention to consistency, cleanliness and performance. Every product is developed with the practical requirements of growers and agricultural businesses in mind.
                                </p>
                                <p>
                                    Our goal is simple — to make high-quality coconut-based growing solutions more accessible to businesses worldwide while creating greater value from a renewable agricultural resource.
                                </p>

                                {/* Feature List */}
                                <ul className="about-list">
                                    <li>
                                        <span>✓</span>
                                        100% Natural Coconut Coir
                                    </li>
                                    <li>
                                        <span>✓</span>
                                        Sustainable & Eco-Friendly Solutions
                                    </li>
                                    <li>
                                        <span>✓</span>
                                        High-Quality Growing Products
                                    </li>
                                    <li>
                                        <span>✓</span>
                                        Reliable Solutions for Modern Agriculture
                                    </li>
                                </ul>
                                <a href="#contact" className="primary-btn">
                                    Discover Our Story <span>→</span>
                                </a>
                            </div>

                            {/* Image / Video */}
                            <div className="about-video">

                                <img
                                    src="/landing-page-images/why-choose.webp"
                                    alt="About Cocoveera"
                                />

                                <div
                                    className="play-button"
                                    onClick={() => setShowVideo(true)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <span>▶</span>
                                </div>

                                <div className="about-highlight">
                                    <strong>100%</strong>
                                    <span>Natural Coir Solutions</span>
                                </div>

                            </div>

                        </div>

                        {/* Video Popup */}
                        {showVideo && (
                            <div
                                className="video-modal"
                                onClick={() => setShowVideo(false)}
                            >
                                <div
                                    className="video-modal-content"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="video-close"
                                        onClick={() => setShowVideo(false)}
                                        aria-label="Close video"
                                    >
                                        &times;
                                    </button>

                                    <video
                                        src="/company-trail-video.mp4"
                                        controls
                                        autoPlay
                                        playsInline
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ================= PRODUCTS ================= */}
                <section className="products-section" id="products">
                    <div className="container m-auto">

                        {/* Heading */}
                        <div className="section-heading text-center flex flex-col items-center mb-10">
                            <span>OUR PRODUCTS</span>

                            <h2 className="max-w-3xl mx-auto">
                                Beyond Bulk Coco Peat Blocks, Discover More from our{" "}
                                <em>Other Range of Products</em>
                            </h2>

                            <p className="max-w-2xl mx-auto">
                                Discover our range of premium coconut coir products,
                                carefully developed for agriculture, horticulture,
                                nurseries and gardening.
                            </p>
                        </div>

                        {/* Product Grid */}
                        <div className="max-w-7xl mx-auto px-6">

                            {loadingCocopeatProducts ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="product-card animate-pulse"
                                        >
                                            <div className="w-full h-52 bg-stone-100 rounded-xl mb-4"></div>

                                            <div className="h-6 bg-stone-100 rounded w-3/4 mb-3"></div>

                                            <div className="h-4 bg-stone-100 rounded w-full mb-2"></div>

                                            <div className="h-4 bg-stone-100 rounded w-5/6 mb-5"></div>

                                            <div className="h-10 bg-stone-100 rounded-lg w-36"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : latestCocopeatProducts.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                                        {latestCocopeatProducts.map((product) => {
                                            const mainImage = getProductImage(product);

                                            return (
                                                <div
                                                    key={product._id}
                                                    className="product-card"
                                                >

                                                    {/* Product Image */}
                                                    <div className="w-full h-52 flex items-center justify-center overflow-hidden">
                                                        <ImageWithFallback
                                                            src={mainImage}
                                                            alt={product.name || "Compressed Cocopeat Block"}
                                                            className="max-w-full max-h-full w-auto h-auto object-contain"
                                                            loading="lazy"
                                                        />
                                                    </div>

                                                    {/* Product Heading */}
                                                    <h3>
                                                        {product.name}
                                                    </h3>

                                                    {/* Product Description */}
                                                    {product.description && (
                                                        <p>
                                                            {product.description}
                                                        </p>
                                                    )}

                                                    {/* View Product */}
                                                    <Link
                                                        to={`/product/${product.slug || product._id}`}
                                                        className="primary-btn w-fit inline-flex items-center gap-1"
                                                    >
                                                        View Product
                                                        <span>→</span>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* View More Products */}
                                    <div className="flex justify-center mt-10">
                                        <Link
                                            to="/products?category=Cocopeat%20Blocks"
                                            className="view-more-btn inline-flex items-center gap-1"
                                        >
                                            View More Products
                                            <span>→</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-stone-500">
                                        No cocopeat block products available.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </section>

                {/* ================= STATS ================= */}
                <section className="stats-section">
                    <div className="container m-auto stats-grid">

                        <div className="stat">
                            <span>
                                <img src="/landing-page-images/icons/globe.png" alt="" />
                            </span>
                            <div>
                                <strong>Global Reach</strong>
                                <small>Export Network</small>
                            </div>
                        </div>

                        <div className="stat">
                            <span>
                                <img src="/landing-page-images/icons/rating-stars.png" alt="" />
                            </span>
                            <div>
                                <strong>B2B Supply</strong>
                                <small>Commercial Partners</small>
                            </div>
                        </div>

                        <div className="stat">
                            <span>
                                <img src="/landing-page-images/icons/sustainability.png" alt="" />
                            </span>
                            <div>
                                <strong>100% Organic</strong>
                                <small>Natural Coir Media</small>
                            </div>
                        </div>

                        <div className="stat">
                            <span>
                                <img src="/landing-page-images/icons/user-experience.png" alt="" />
                            </span>
                            <div>
                                <strong>Lab Tested</strong>
                                <small>Quality Assurance</small>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ================= BENEFITS ================= */}
                <section className="benefits-section">
                    <div className="container m-auto">
                        <div className="about-content text-center">
                            <span className="section-tag">
                                BULK COCOPEAT BLOCKS ADVANTAGE
                            </span>
                            <h2>
                                Pros of Sourcing From Cocoveera
                            </h2>
                        </div>
                        <div className="benefits-grid mt-5">

                            {benefits.map((item, index) => (
                                <div className="benefit-card" key={index}>

                                    <div className="benefit-icon">
                                        <img src={`${item.icon}`} alt="" />
                                    </div>

                                    <h3 className="font-bold">{item.title}</h3>

                                    <p>{item.text}</p>

                                </div>
                            ))}

                        </div>

                    </div>
                </section>


                {/* ================= TESTIMONIALS ================= */}
                <section className="testimonial-section">
                    <div className="container m-auto testimonial-grid">
                        <div className="testimonial-intro">
                            <div className="about-content">
                                <span className="section-tag">
                                    THE COCOVEERA EXPERIENCE
                                </span>
                                <h2>
                                    What Growers Say About Cocoveera
                                </h2>
                            </div>
                            <p>
                                Sustainable quality products trusted by growers
                                worldwide for healthier plants and better results.
                            </p>

                            <a href="#reviews" className="primary-btn">
                                See All Reviews <span>→</span>
                            </a>

                        </div>

                        <div className="testimonial-slider">

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    className="testimonial-row"
                                    initial={{ opacity: 0, x: 60 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -60 }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {[0, 1, 2].map((offset) => {
                                        const index =
                                            (activeIndex + offset) % testimonials.length;

                                        const item = testimonials[index];

                                        return (
                                            <div className="testimonial-card" key={index}>

                                                <div className="stars">
                                                    ★★★★★
                                                </div>

                                                <p>
                                                    "{item.text}"
                                                </p>

                                                <div className="customer">

                                                    <div className="w-10 h-10 rounded-full bg-[#2E7D32] text-white flex items-center justify-center font-bold font-poppins text-sm flex-shrink-0">
                                                        {item.name.charAt(0)}
                                                    </div>

                                                    <div>
                                                        <strong>{item.name}</strong>

                                                        <small>{item.role}</small>
                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    })}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </div>
                </section>


                {/* ================= PROCESS ================= */}
                <section className="process-section">
                    <div className="container m-auto">
                        <div className="section-heading text-center">
                            <span>OUR PROCESS</span>
                            <h2>
                                Crafted with Care, Step by Step
                            </h2>
                            <p className="text-center">
                                From raw coconut husk to premium compressed cocopeat blocks, here's how we do it.
                            </p>
                        </div>
                        <div className="process-line">
                            {/* Step 1 */}
                            <div className="process-item step-1">
                                <div className="process-icon">1</div>
                                <strong>Sourcing the Coconut Husk</strong>
                                <p>
                                    We collect fresh coconut husks from trusted local farms, ensuring a consistent, sustainable supply of raw coco coir for every batch.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="process-item step-2">
                                <div className="process-icon">2</div>
                                <strong>Retting & Fiber Extraction</strong>
                                <p>
                                    The husks are soaked and processed to separate coco coir fibers from the pith, preparing the raw coco pith for further refinement.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="process-item step-3">
                                <div className="process-icon">3</div>
                                <strong>Washing & Buffering</strong>
                                <p>
                                    The extracted coco peat is thoroughly washed and buffered to remove excess salts and balance EC levels, ensuring it's safe for all plant types.
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="process-item step-4">
                                <div className="process-icon">4</div>
                                <strong>Drying & Screening</strong>
                                <p>
                                    The washed coco pith is dried and screened to remove debris, giving a fine, consistent texture that meets our coco peat block specifications.
                                </p>
                            </div>

                            {/* Step 5 */}
                            <div className="process-item step-5">
                                <div className="process-icon">5</div>
                                <strong>Compression Into Blocks & Bricks</strong>
                                <p>
                                    The finished coco peat is compressed into coir pith compressed blocks and coconut coir bricks, engineered for a reliable expansion ratio once rehydrated.
                                </p>
                            </div>

                            {/* Step 6 */}
                            <div className="process-item step-6">
                                <div className="process-icon">6</div>
                                <strong>Quality Check, Packaging & Export-Ready Dispatch</strong>
                                <p>
                                    Each coco peat block is quality-checked, packed in sizes like our 5kg coco peat block, and prepared for bulk pallet or container load export for wholesale buyers in the USA and beyond.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= BLOG ================= */}
                <section className="blog-section">

                    <div className="container m-auto">

                        <div className="blog-heading">
                            <div className="section-heading">
                                <span className="text-start">GROWING KNOWLEDGE • SUSTAINABLE LIVING</span>
                                <h2 className="text-start">
                                    Technical Guides & Resources
                                </h2>
                            </div>
                            <Link to="/production-process" className="view-all">
                                Explore Guides →
                            </Link>
                        </div>

                        <div className="blog-grid">

                            {blogs.map((blog, index) => (
                                <Link to={blog.link || "/production-process"} key={index} className="blog-card block group hover:no-underline">
                                    <article className="h-full flex flex-col">

                                        <div className="blog-image">
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                            />
                                        </div>

                                        <div className="blog-content flex-grow flex flex-col">

                                            <span className="font-bold">{blog.category}</span>

                                            <h3>{blog.title}</h3>

                                            <div className="blog-meta mt-auto">
                                                <small>{blog.date}</small>
                                                <small>•</small>
                                                <small>{blog.time}</small>
                                            </div>

                                        </div>

                                    </article>
                                </Link>
                            ))}

                        </div>

                    </div>

                </section>

                {/* ================= WHY CHOOSE US ================= */}
                <section className="why-choose-section">
                    <div className="container m-auto">
                        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* ================= LEFT IMAGE ================= */}
                            <div className="why-choose-image">
                                <img
                                    src="/dashboard-bg.png"
                                    alt="Why choose Cocoveera"
                                />
                                <div className="why-image-badge">
                                    <strong>100%</strong>
                                    <span>Natural Coir Solutions</span>
                                </div>
                            </div>
                            {/* ================= RIGHT CONTENT ================= */}
                            <div className="why-choose-content">
                                <span className="section-tag">
                                    WHY CHOOSE COCOVEERA?
                                </span>
                                <h2 className="font-bold">
                                    Rooted in Nature,
                                    <br />
                                    <em>Committed to Quality</em>
                                </h2>
                                <p className="why-intro">
                                    We combine the power of natural coconut coir with
                                    responsible manufacturing to create reliable and
                                    sustainable growing solutions for modern agriculture,
                                    horticulture and gardening.
                                </p>
                                {/* Benefits */}
                                <div className="why-benefits">
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img
                                                src="/landing-page-images/icons/natural-safe.png"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <h3>100% Natural Materials</h3>
                                            <p>
                                                Made from natural and renewable coconut
                                                coir for a safe, plant-friendly growing
                                                environment.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img
                                                src="/landing-page-images/icons/sustainable-living.png"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <h3>Sustainably Made</h3>
                                            <p>
                                                Eco-friendly solutions created from
                                                renewable coconut resources.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img
                                                src="/landing-page-images/icons/premium-quality.png"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <h3>Consistent Quality</h3>
                                            <p>
                                                Carefully processed products designed
                                                for dependable performance and results.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img
                                                src="/landing-page-images/icons/wide-range.png"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <h3>Complete Product Range</h3>
                                            <p>
                                                Growing solutions for agriculture,
                                                horticulture, nurseries and gardening.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img
                                                src="/landing-page-images/icons/affordable-prices.png"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <h3>Competitive Pricing</h3>
                                            <p>
                                                Quality coconut coir products at
                                                competitive and practical prices.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img
                                                src="/landing-page-images/icons/fast-shipping.png"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <h3>Reliable Delivery</h3>
                                            <p>
                                                Efficient order processing and dependable
                                                delivery support for every customer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= FAQ ================= */}
                <section className="faq-section" id="faq">
                    <div className="container m-auto">
                        <div className="flex justify-center">
                            <div className="w-full lg:w-10/12">
                                <div className="faq-wrapper">
                                    {/* FAQ Header */}
                                    <div className="faq-heading">
                                        <span className="section-tag">
                                            FREQUENTLY ASKED QUESTIONS
                                        </span>
                                        <h2>
                                            Everything You Need to <em>Know</em>
                                        </h2>
                                        <p>
                                            Find answers to common questions about our
                                            coconut coir products, growing solutions and services.
                                        </p>
                                    </div>
                                    {/* FAQ Accordion */}
                                    <div className="faq-list">
                                        {faqs.map((faq, index) => (
                                            <motion.div
                                                className={`faq-item ${openFaq === index ? "active" : ""
                                                    }`}
                                                key={index}
                                                initial={{ opacity: 0, y: 15 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: index * 0.05,
                                                }}
                                            >
                                                <button
                                                    className="faq-question"
                                                    onClick={() =>
                                                        setOpenFaq(
                                                            openFaq === index ? null : index
                                                        )
                                                    }
                                                    aria-expanded={openFaq === index}
                                                >
                                                    <span>{faq.question}</span>

                                                    <span className="faq-icon">
                                                        {openFaq === index ? "−" : "+"}
                                                    </span>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {openFaq === index && (
                                                        <motion.div
                                                            className="faq-answer-wrapper"
                                                            initial={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                height: "auto",
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.3,
                                                                ease: "easeInOut",
                                                            }}
                                                        >
                                                            <div className="faq-answer">
                                                                <p>{faq.answer}</p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= CTA ================= */}
                <section className="cta-section" id="contact">
                    <div className="cta-overlay"></div>
                    <div className="container m-auto cta-container">
                        <div className="cta-content">
                            <span className="section-tag">GROW WITH COCOVEERA</span>
                            <h2>
                                Grow Better. Grow Naturally.
                            </h2>
                            <p>
                                Discover sustainable coconut coir solutions designed
                                to support healthier plants and a greener future.
                            </p>
                             <div className="cta-buttons">
                                <Link to="/products" className="primary-btn">
                                    Explore Our Products <span>→</span>
                                </Link>
                                <Link to="/contact" className="secondary-btn">
                                    Get In Touch
                                </Link>
                            </div>
                        </div>
                        <div className="cta-features">
                            <div>
                                <span>✓</span>
                                <div>
                                    <strong>Natural Products</strong>
                                    <small>Made from quality coconut coir</small>
                                </div>
                            </div>
                            <div>
                                <span>✓</span>
                                <div>
                                    <strong>Sustainable Solutions</strong>
                                    <small>Better for plants and the planet</small>
                                </div>
                            </div>
                            <div>
                                <span>✓</span>
                                <div>
                                    <strong>Consistent Quality</strong>
                                    <small>Reliable growing performance</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default CocopeatBlocksWholesaleUSA;