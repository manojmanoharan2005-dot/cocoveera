import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { API_URL } from "../../utils/config";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";
import { navigateToProduct } from "../../utils/productNavigation";

import "./landingpageStyle.css";

const SEOLandingPageTemplate = ({ pageData }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
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
    const { data: dbCategories = [], isLoading: loadingCategories } = useSWR(
        `${API_URL}/categories`,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 600000 }
    );

    const scrollProducts = (dir) => {
        const el = productRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 320, behavior: 'smooth' });
    };

    const { data: allProducts = [], isLoading: loadingProducts } = useSWR(
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

    const relevantProducts = useMemo(() => {
        const filterKeyword = (pageData.productFilterKeyword || "").toLowerCase().trim();
        return allProducts
            .filter((product) => {
                if (!product || product.isActive === false || product.isDeleted) return false;
                const category = (product.category || "").toLowerCase().trim();
                const name = (product.name || "").toLowerCase().trim();

                if (!filterKeyword) return true;

                return (
                    category.includes(filterKeyword) ||
                    name.includes(filterKeyword) ||
                    category.includes("coir") ||
                    category.includes("cocopeat") ||
                    name.includes("coir") ||
                    name.includes("cocopeat")
                );
            })
            .slice(0, 8);
    }, [allProducts, pageData.productFilterKeyword]);

    // Auto-scroll products
    useEffect(() => {
        const interval = setInterval(() => {
            const el = productRef.current;
            if (!el) return;

            if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: 320, behavior: 'smooth' });
            }
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Testimonial auto-rotation
    useEffect(() => {
        if (!pageData.testimonials || pageData.testimonials.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % pageData.testimonials.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [pageData.testimonials]);

    const siteUrl = "https://cocoveera.com";
    const pageUrl = `${siteUrl}${pageData.canonicalPath}`;

    const schemaData = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
                { "@type": "ListItem", "position": 2, "name": pageData.breadcrumbName, "item": pageUrl }
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
            "mainEntity": pageData.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question || faq.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer || faq.a
                }
            }))
        }
    ];

    const defaultBlogs = [
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
            link: "/products",
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

    return (
        <>
            <SEO
                title={pageData.metaTitle}
                exactTitle={true}
                description={pageData.metaDescription}
                canonical={pageUrl}
                url={pageData.canonicalPath}
                image={pageData.heroImage || "/landing-page-images/banner-product.webp"}
                keywords={pageData.keywords}
                schema={schemaData}
            />



            <main className="landing_page_parent">

                {/* ================= HERO ================= */}
                <section className="bd-hero">
                    <div className="container m-auto hero-container">

                        <div className="hero-content">
                            <span className="small-label">
                                {pageData.heroBadge || "PREMIUM COIR GROWING SOLUTIONS"}
                            </span>

                            <h1>
                                {pageData.heroH1}
                            </h1>

                            <p>
                                {pageData.heroDescription}
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
                                src={pageData.heroImage || "/landing-page-images/banner-product.webp"}
                                alt={pageData.heroImageAlt || pageData.heroH1}
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
                                {loadingCategories ? (
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
                                ) : dbCategories.map((dbCat, i) => {
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
                                                <div className="inline-flex items-center gap-1 text-primary font-bold text-xs group-hover:gap-2 transition-all duration-200 mt-auto">
                                                    VIEW CATEGORY <ArrowRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

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
                                    {pageData.aboutH2 || "Growing a Greener Future, Naturally"}
                                </h2>

                                {(pageData.aboutParagraphs || [
                                    "We are Cocoveera, a high-quality coir manufacturer and cocopeat supplier focused on supplying dependable growing media to customers across global markets.",
                                    "Our product range covers coco peat blocks, grow bags, coir chips, briquettes and other coir-based growing solutions, produced with attention to consistency, cleanliness and performance."
                                ]).map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}

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

                        <div className="section-heading text-center flex flex-col items-center mb-10">
                            <span>OUR PRODUCTS</span>

                            <h2 className="max-w-3xl mx-auto">
                                {pageData.productsH2 || "Discover Our Premium Range of Coir Substrates"}
                            </h2>

                            <p className="max-w-2xl mx-auto">
                                Discover our range of premium coconut coir products, carefully developed for agriculture, horticulture, nurseries and gardening.
                            </p>
                        </div>

                        <div className="max-w-7xl mx-auto px-6">

                            {loadingProducts ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <div key={index} className="product-card animate-pulse">
                                            <div className="w-full h-52 bg-stone-100 rounded-xl mb-4"></div>
                                            <div className="h-6 bg-stone-100 rounded w-3/4 mb-3"></div>
                                            <div className="h-4 bg-stone-100 rounded w-full mb-2"></div>
                                            <div className="h-4 bg-stone-100 rounded w-5/6 mb-5"></div>
                                            <div className="h-10 bg-stone-100 rounded-lg w-36"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : relevantProducts.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {relevantProducts.map((product) => {
                                            const mainImage = getProductImage(product);

                                            return (
                                                <div key={product._id} className="product-card">
                                                    <div className="w-full h-52 flex items-center justify-center overflow-hidden">
                                                        <ImageWithFallback
                                                            src={mainImage}
                                                            alt={product.name || "Coir Substrate Product"}
                                                            className="max-w-full max-h-full w-auto h-auto object-contain"
                                                            loading="lazy"
                                                        />
                                                    </div>

                                                    <h3>{product.name}</h3>

                                                    {product.description && (
                                                        <p>{product.description}</p>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={(e) => navigateToProduct(product, navigate, user, e)}
                                                        className="primary-btn w-fit inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        View Product <span>→</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-center mt-10">
                                        <Link
                                            to="/products"
                                            className="view-more-btn inline-flex items-center gap-1"
                                        >
                                            View More Products <span>→</span>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-stone-500">No matching products available at the moment.</p>
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
                                {pageData.benefitsTag || "BULK COIR ADVANTAGE"}
                            </span>
                            <h2>
                                {pageData.benefitsH2 || "Pros of Sourcing From Cocoveera"}
                            </h2>
                        </div>
                        <div className="benefits-grid mt-5">
                            {pageData.benefits.map((item, index) => (
                                <div className="benefit-card" key={index}>
                                    <div className="benefit-icon">
                                        <img src={item.icon || "/landing-page-images/icons/natural-safe.png"} alt="" />
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
                                Sustainable quality products trusted by growers worldwide for healthier plants and better results.
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
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                >
                                    {[0, 1, 2].map((offset) => {
                                        const index = (activeIndex + offset) % pageData.testimonials.length;
                                        const item = pageData.testimonials[index];
                                        if (!item) return null;

                                        return (
                                            <div className="testimonial-card" key={index}>
                                                <div className="stars">★★★★★</div>
                                                <p>"{item.text}"</p>
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
                                {pageData.processH2 || "Crafted with Care, Step by Step"}
                            </h2>
                            <p className="text-center">
                                {pageData.processSubtitle || "From raw coconut husk to premium coir substrates, here's how we do it."}
                            </p>
                        </div>
                        <div className="process-line">
                            {pageData.processSteps.map((stepItem, idx) => (
                                <div key={idx} className={`process-item step-${idx + 1}`}>
                                    <div className="process-icon">{idx + 1}</div>
                                    <strong>{stepItem.title}</strong>
                                    <p>{stepItem.text}</p>
                                </div>
                            ))}
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
                            {defaultBlogs.map((blog, index) => (
                                <Link to={blog.link || "/production-process"} key={index} className="blog-card block group hover:no-underline">
                                    <article className="h-full flex flex-col">
                                        <div className="blog-image">
                                            <img src={blog.image} alt={blog.title} />
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
                            <div className="why-choose-image">
                                <img src="/dashboard-bg.png" alt="Why choose Cocoveera" />
                                <div className="why-image-badge">
                                    <strong>100%</strong>
                                    <span>Natural Coir Solutions</span>
                                </div>
                            </div>
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
                                    We combine the power of natural coconut coir with responsible manufacturing to create reliable and sustainable growing solutions for modern agriculture, horticulture and gardening.
                                </p>
                                <div className="why-benefits">
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img src="/landing-page-images/icons/natural-safe.png" alt="" />
                                        </div>
                                        <div>
                                            <h3>100% Natural Materials</h3>
                                            <p>Made from natural and renewable coconut coir for a safe, plant-friendly growing environment.</p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img src="/landing-page-images/icons/sustainable-living.png" alt="" />
                                        </div>
                                        <div>
                                            <h3>Sustainably Made</h3>
                                            <p>Eco-friendly solutions created from renewable coconut resources.</p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img src="/landing-page-images/icons/premium-quality.png" alt="" />
                                        </div>
                                        <div>
                                            <h3>Consistent Quality</h3>
                                            <p>Carefully processed products designed for dependable performance and results.</p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img src="/landing-page-images/icons/wide-range.png" alt="" />
                                        </div>
                                        <div>
                                            <h3>Complete Product Range</h3>
                                            <p>Growing solutions for agriculture, horticulture, nurseries and gardening.</p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img src="/landing-page-images/icons/affordable-prices.png" alt="" />
                                        </div>
                                        <div>
                                            <h3>Competitive Pricing</h3>
                                            <p>Quality coconut coir products at competitive and practical prices.</p>
                                        </div>
                                    </div>
                                    <div className="why-benefit">
                                        <div className="why-icon">
                                            <img src="/landing-page-images/icons/fast-shipping.png" alt="" />
                                        </div>
                                        <div>
                                            <h3>Reliable Delivery</h3>
                                            <p>Efficient order processing and dependable delivery support for every customer.</p>
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
                                    <div className="faq-heading">
                                        <span className="section-tag">
                                            FREQUENTLY ASKED QUESTIONS
                                        </span>
                                        <h2>
                                            Everything You Need to <em>Know</em>
                                        </h2>
                                        <p>
                                            Find answers to common questions about our coconut coir products, growing solutions and services.
                                        </p>
                                    </div>
                                    <div className="faq-list">
                                        {pageData.faqs.map((faq, index) => (
                                            <motion.div
                                                className={`faq-item ${openFaq === index ? "active" : ""}`}
                                                key={index}
                                                initial={{ opacity: 0, y: 15 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                            >
                                                <button
                                                    className="faq-question"
                                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                    aria-expanded={openFaq === index}
                                                >
                                                    <span>{faq.question || faq.q}</span>
                                                    <span className="faq-icon">{openFaq === index ? "−" : "+"}</span>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {openFaq === index && (
                                                        <motion.div
                                                            className="faq-answer-wrapper"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        >
                                                            <div className="faq-answer">
                                                                <p>{faq.answer || faq.a}</p>
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
                                Discover sustainable coconut coir solutions designed to support healthier plants and a greener future.
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

export default SEOLandingPageTemplate;
