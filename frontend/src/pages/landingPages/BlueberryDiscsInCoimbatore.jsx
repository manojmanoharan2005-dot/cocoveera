import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useSWR from 'swr';
import axios from 'axios';
import { API_URL } from "../../utils/config";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import SEO from "../../components/SEO";

import "./landingpageStyle.css";

const BlueberryDiscsInCoimbatore = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showVideo, setShowVideo] = useState(false);

    const productRef = useRef(null);
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

    const benefits = [
        {
            icon: "/landing-page-images/icons/natural-safe.png",
            title: "Natural & Safe",
            text: "Made from natural coconut coir",
        },
        {
            icon: "/landing-page-images/icons/sustainable-living.png",
            title: "Sustainable Living",
            text: "Eco-friendly growing solutions",
        },
        {
            icon: "/landing-page-images/icons/premium-quality.png",
            title: "Premium Quality",
            text: "Carefully selected for better results",
        },
        {
            icon: "/landing-page-images/icons/wide-range.png",
            title: "Wide Range",
            text: "Solutions for every growing need",
        },
        {
            icon: "/landing-page-images/icons/affordable-prices.png",
            title: "Affordable Prices",
            text: "Best quality at competitive prices",
        },
        {
            icon: "/landing-page-images/icons/fast-shipping.png",
            title: "Fast Shipping",
            text: "Quick and reliable delivery",
        },
    ];

    const testimonials = [
        {
            img: "/landing-page-images/banner-product.webp",
            name: "Sarah Johnson",
            role: "Plant Enthusiast",
            text: "Excellent coir discs! My blueberry plants are healthier and growing beautifully.",
        },
        {
            img: "/landing-page-images/banner-product.webp",
            name: "David Miller",
            role: "Home Gardener",
            text: "Sustainable and easy to use. The quality is excellent and highly recommended.",
        },
        {
            img: "/landing-page-images/banner-product.webp",
            name: "Emily Davis",
            role: "Organic Farmer",
            text: "Great quality products with excellent results. Cocoveera is my trusted choice.",
        },
        {
            img: "/landing-page-images/banner-product.webp",
            name: "Michael",
            role: "Commercial Grower",
            text: "Consistent quality and excellent performance for our commercial growing needs.",
        },
        {
            img: "/landing-page-images/banner-product.webp",
            name: "Sophia Williams",
            role: "Nursery Owner",
            text: "The products are reliable and sustainable, making them perfect for our nursery.",
        },
        {
            img: "/landing-page-images/banner-product.webp",
            name: "James Wilson",
            role: "Farm Owner",
            text: "Excellent moisture retention and great results across different crops on our farm.",
        },
    ];

    const blogs = [
        {
            image: "/landing-page-images/blog.webp",
            category: "Blueberry Growing",
            title: "How to Use Coir Discs for Healthy Blueberry Plants",
            date: "August 2026",
            time: "5 min read",
        },
        {
            image: "/landing-page-images/blog.webp",
            category: "Sustainable Gardening",
            title: "Why Coir Products Are the Future of Gardening",
            date: "August 2026",
            time: "4 min read",
        },
        {
            image: "/landing-page-images/blog.webp",
            category: "Plant Care",
            title: "How to Choose the Right Growing Medium",
            date: "August 2026",
            time: "6 min read",
        },
        {
            image: "/landing-page-images/blog.webp",
            category: "Eco Living",
            title: "Sustainable Gardening: Small Steps, Big Impact",
            date: "August 2026",
            time: "5 min read",
        },
    ];

    const structuredSchema = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.cocoveera.com"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Blueberry Discs in Coimbatore",
                    "item": "https://www.cocoveera.com/blueberry-discs-in-coimbatore"
                }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Cocoveera",
            "url": "https://www.cocoveera.com",
            "logo": "https://www.cocoveera.com/favicon.webp",
            "description": "Manufacturer and exporter of premium coconut coir substrates, coir peat blocks, grow bags, and blueberry growing discs."
        }
    ];

    return (
        <div className="landing-page-root">
            <SEO 
                title="Blueberry Discs in Coimbatore"
                description="Premium coir-based blueberry growing discs in Coimbatore, sustainably crafted for excellent moisture retention, aeration, and healthy root development."
                url="/blueberry-discs-in-coimbatore"
                schema={structuredSchema}
            />

            {/* ================= HERO ================= */}
            <section className="bd-hero">
                <div className="container m-auto hero-container">

                    <div className="hero-content">
                        <span className="small-label">
                            PREMIUM COIR GROWING SOLUTIONS
                        </span>

                        <h1>
                            Blueberry Discs in{" "}
                            <span>Coimbatore</span>
                        </h1>

                        <p>
                            Premium coir-based blueberry growing discs,
                            sustainably crafted to provide excellent moisture
                            retention, aeration and healthy root development.
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
                            alt="Blueberry Growing Discs in Coimbatore"
                        />
                    </div>

                </div>
            </section>


            {/* ================= SERVICE BAR ================= */}
            <section className="service-bar-wrapper">
                <div className="container m-auto service-bar">

                    <div className="service-item">
                        <span>
                            <img src="/landing-page-images/icons/eco-friendly.png" alt="Eco-friendly products" />
                        </span>
                        <div>
                            <strong>Eco-Friendly</strong>
                            <small>Products</small>
                        </div>
                    </div>

                    <div className="service-item">
                        <span>
                            <img src="/landing-page-images/icons/fast-delivery.png" alt="Fast and reliable delivery" />
                        </span>
                        <div>
                            <strong>Fast & Reliable</strong>
                            <small>Delivery</small>
                        </div>
                    </div>

                    <div className="service-item">
                        <span>
                            <img src="/landing-page-images/icons/secure-payment.png" alt="Secure payments" />
                        </span>
                        <div>
                            <strong>Secure</strong>
                            <small>Payments</small>
                        </div>
                    </div>

                    <div className="service-item">
                        <span>
                            <img src="/landing-page-images/icons/dedicated-support.png" alt="Dedicated support" />
                        </span>
                        <div>
                            <strong>Dedicated</strong>
                            <small>Support</small>
                        </div>
                    </div>

                </div>
            </section>


            {/* ================= CATEGORIES ================= */}

            <section className="py-14 sm:py-20 px-5 sm:px-6 bg-white" id="products">
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
                                const displayImg = dbCat.image || "/landing-page-images/banner-product.webp";
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
                            aria-label="Previous products"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollProducts(1)}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all z-10"
                            aria-label="Next products"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= ABOUT ================= */}
            <section className="about-section" id="about">
                <div className="container m-auto">

                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-6">
                            <div className="about-content">
                                <span className="section-tag">
                                    WHY CHOOSE COCOVEERA?
                                </span>
                                <h2>
                                    Rooted in Nature, Committed to Quality
                                </h2>
                                <p>
                                    At Cocoveera, we believe in turning nature's resources into
                                    sustainable solutions for modern agriculture. Our products
                                    are made from carefully processed coconut coir, offering
                                    natural, renewable and environmentally responsible alternatives
                                    for growers and agricultural businesses.
                                </p>

                                <p>
                                    From high-quality coir pith and coir blocks to grow bags,
                                    coir chips, briquettes and specialized growing products,
                                    we focus on delivering consistent quality, reliable
                                    performance and value to every customer.
                                </p>

                                <p>
                                    With a strong foundation in coconut coir processing and a
                                    commitment to sustainable manufacturing, Cocoveera continues
                                    to develop products that support healthier plant growth while
                                    reducing dependence on conventional growing materials.
                                </p>

                                <ul>
                                    <li>
                                        <span>✓</span>
                                        100% Natural & Eco-Friendly Materials
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Sustainably Sourced Coconut Coir
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Consistent Quality & Performance
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Suitable for Modern Agriculture
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Grower-Focused Product Solutions
                                    </li>

                                    <li>
                                        <span>✓</span>
                                        Better for Plants, People & Planet
                                    </li>
                                </ul>

                                <Link to="/contact" className="primary-btn inline-flex items-center gap-2">
                                    Discover Our Story <span>→</span>
                                </Link>

                            </div>
                        </div>

                        <div className="lg:col-span-6">
                            <div className="about-video">

                                <img
                                    src="/landing-page-images/why-choose.webp"
                                    alt="Cocoveera sustainable coir processing facility"
                                />

                                <div
                                    className="play-button"
                                    onClick={() => setShowVideo(true)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setShowVideo(true);
                                        }
                                    }}
                                    aria-label="Play video"
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

                </div>
            </section>

            {/* ================= STATS ================= */}
            <section className="stats-section">
                <div className="container m-auto stats-grid">

                    <div className="stat">
                        <span>
                            <img src="/landing-page-images/icons/globe.png" alt="Global presence" />
                        </span>
                        <div>
                            <strong>15+</strong>
                            <small>Countries Served</small>
                        </div>
                    </div>

                    <div className="stat">
                        <span>
                            <img src="/landing-page-images/icons/rating-stars.png" alt="High ratings" />
                        </span>
                        <div>
                            <strong>50K+</strong>
                            <small>Happy Customers</small>
                        </div>
                    </div>

                    <div className="stat">
                        <span>
                            <img src="/landing-page-images/icons/sustainability.png" alt="Organic products" />
                        </span>
                        <div>
                            <strong>80+</strong>
                            <small>Organic Products</small>
                        </div>
                    </div>

                    <div className="stat">
                        <span>
                            <img src="/landing-page-images/icons/user-experience.png" alt="Customer satisfaction" />
                        </span>
                        <div>
                            <strong>99%</strong>
                            <small>Customer Satisfaction</small>
                        </div>
                    </div>

                </div>
            </section>


            {/* ================= BENEFITS ================= */}
            <section className="benefits-section">
                <div className="container m-auto">
                    <div className="about-content text-center">
                        <span className="section-tag">
                            THE COCOVEERA ADVANTAGE
                        </span>
                        <h2>
                            Benefits You Can Count On
                        </h2>
                    </div>
                    <div className="benefits-grid mt-5">

                        {benefits.map((item, index) => (
                            <div className="benefit-card" key={index}>

                                <div className="benefit-icon">
                                    <img src={`${item.icon}`} alt={item.title} />
                                </div>

                                <h3 className="font-bold">{item.title}</h3>

                                <p>{item.text}</p>

                            </div>
                        ))}

                    </div>

                </div>
            </section>


            {/* ================= TESTIMONIALS ================= */}
            <section className="testimonial-section" id="reviews">
                <div className="container m-auto testimonial-grid">

                    <div className="testimonial-intro">
                        <div className="about-content">
                            <span className="section-tag">
                                TRUSTED BY GROWERS WORLDWIDE
                            </span>
                            <h2>
                                Loved by Thousands,
                                <br />
                                Grown with Trust
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

                                                <div className="customer-avatar">
                                                    <img src={item.img} alt={item.name} />
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
                    <div className="section-heading">
                        <span>FROM NATURE TO YOU</span>

                        <h2>
                            The COCOVEERA Process
                        </h2>
                    </div>

                    <div className="process-line">

                        <div className="process-item">
                            <div className="process-icon">🌿</div>
                            <strong>Nature's Collection</strong>
                            <p>
                                We source the finest coconut husks
                                from trusted farms.
                            </p>
                        </div>

                        <div className="process-item">
                            <div className="process-icon">⚙</div>
                            <strong>Careful Processing</strong>
                            <p>
                                Advanced processing ensures
                                premium quality.
                            </p>
                        </div>

                        <div className="process-item">
                            <div className="process-icon">✓</div>
                            <strong>Quality Testing</strong>
                            <p>
                                Every product is tested for
                                quality and performance.
                            </p>
                        </div>

                        <div className="process-item">
                            <div className="process-icon">♻</div>
                            <strong>Eco-Friendly Packaging</strong>
                            <p>
                                Sustainable packaging for
                                a better planet.
                            </p>
                        </div>

                        <div className="process-item">
                            <div className="process-icon">🚚</div>
                            <strong>Delivered to You</strong>
                            <p>
                                Fast & reliable delivery
                                right to your doorstep.
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
                                From Our Blog
                            </h2>
                        </div>
                        <Link to="/products" className="view-all">
                            View All Products →
                        </Link>
                    </div>

                    <div className="blog-grid">

                        {blogs.map((blog, index) => (
                            <article className="blog-card" key={index}>

                                <div className="blog-image">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                    />
                                </div>

                                <div className="blog-content">

                                    <span className="font-bold">{blog.category}</span>

                                    <h3>{blog.title}</h3>

                                    <div className="blog-meta">
                                        <small>{blog.date}</small>
                                        <small>•</small>
                                        <small>{blog.time}</small>
                                    </div>

                                </div>

                            </article>
                        ))}

                    </div>

                </div>

            </section>


            {/* ================= NEWSLETTER ================= */}
            <section className="newsletter-section" id="contact">

                <div className="newsletter-overlay"></div>

                <div className="container m-auto newsletter-container">

                    <div>
                        <h2>Stay Connected, Grow Together</h2>

                        <p>
                            Subscribe to our newsletter for exclusive offers,
                            tips and updates.
                        </p>
                    </div>

                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            aria-label="Email address for newsletter"
                        />

                        <button type="submit">
                            Subscribe
                        </button>

                    </form>

                </div>

                <div className="newsletter-bottom m-auto container">

                    <div>
                        <span>◌</span>
                        <div>
                            <strong>Exclusive Offers</strong>
                            <small>Special discounts & deals</small>
                        </div>
                    </div>

                    <div>
                        <span>♧</span>
                        <div>
                            <strong>Gardening Tips</strong>
                            <small>Expert tips & guides</small>
                        </div>
                    </div>

                    <div>
                        <span>⌂</span>
                        <div>
                            <strong>New Arrivals</strong>
                            <small>Be the first to know</small>
                        </div>
                    </div>

                    <div>
                        <span>◉</span>
                        <div>
                            <strong>Sustainability Updates</strong>
                            <small>Our latest initiatives</small>
                        </div>
                    </div>

                </div>

            </section>

        </div>
    );
};

export default BlueberryDiscsInCoimbatore;
