import React from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";

import "./landingpageStyle.css";
/**
 * Reusable SEO product landing page.
 *
 * Required pageData fields:
 * canonicalPath, breadcrumbName, metaTitle, metaDescription,
 * productName, productDescription, heroImage, heroImageAlt
 *
 * Optional sections:
 * heroBadge, keywords, category, sku, productHighlights, overviewH2,
 * overviewParagraphs, features, specifications, applications,
 * usageSteps, whyChooseH2, whyChooseParagraphs, faqs, ctaTitle,
 * ctaDescription, ctaButtonText, ctaButtonLink, relatedLinks,
 * organizationName, organizationUrl, organizationLogo
 */
const SEOProductPageTemplate = ({ pageData = {} }) => {
    const {
        canonicalPath = "",
        breadcrumbName = "",
        metaTitle = "",
        metaDescription = "",
        keywords = "",
        productName = "",
        productDescription = "",
        heroBadge = "COCOVEERA PREMIUM COIR PRODUCTS",
        heroImage = "/landing-page-images/banner-product.webp",
        heroImageAlt = productName,
        category = "Coconut Coir Growing Medium",
        sku = "",
        productHighlights = [],
        overviewH2 = `About ${productName}`,
        overviewParagraphs = [],
        features = [],
        specifications = [],
        applications = [],
        usageSteps = [],
        whyChooseSection = null,
        faqs = [],
        ctaTitle = `Enquire About ${productName}`,
        ctaDescription = "Contact Cocoveera for product details, bulk requirements and a quotation.",
        ctaButtonText = "Enquire Now",
        ctaButtonLink = "/contact",
        relatedLinks = [],
        organizationName = "Cocoveera",
        organizationUrl = "https://www.cocoveera.com",
        organizationLogo = "https://www.cocoveera.com/favicon.webp",
    } = pageData;

    const siteUrl = organizationUrl.replace(/\/$/, "");
    const canonicalUrl = `${siteUrl}${canonicalPath}`;

    const structuredSchema = [
        {
            "@context": "https://schema.org",
            "@type": "Product",
            name: productName,
            description: productDescription || metaDescription,
            image: heroImage.startsWith("http")
                ? heroImage
                : `${siteUrl}${heroImage}`,
            category,
            ...(sku ? { sku } : {}),
            brand: {
                "@type": "Brand",
                name: organizationName,
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: siteUrl,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Products",
                    item: `${siteUrl}/products`,
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: breadcrumbName || productName,
                    item: canonicalUrl,
                },
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: organizationName,
            url: siteUrl,
            logo: organizationLogo,
        },
        ...(faqs.length
            ? [
                {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: faqs.map((faq) => ({
                        "@type": "Question",
                        name: faq.question,
                        acceptedAnswer: {
                            "@type": "Answer",
                            text: faq.answer,
                        },
                    })),
                },
            ]
            : []),
    ];

    return (
        <main className="w-full overflow-hidden bg-white text-stone-800">
            <SEO
                title={metaTitle}
                description={metaDescription}
                url={canonicalPath}
                schema={structuredSchema}
                keywords={keywords}
            />

            {/* BREADCRUMB */}
            <nav
                aria-label="Breadcrumb"
                className="mx-auto w-full max-w-7xl px-5 pt-5 text-sm text-stone-500 sm:px-6 lg:px-8"
            >
                <ol className="flex flex-wrap items-center gap-2">
                    <li>
                        <Link to="/" className="transition hover:text-green-700">
                            Home
                        </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li>
                        <Link to="/products" className="transition hover:text-green-700">
                            Products
                        </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li className="font-medium text-stone-800" aria-current="page">
                        {breadcrumbName || productName}
                    </li>
                </ol>
            </nav>

            {/* HERO */}
            <section className="relative isolate">
                <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
                    <div className="order-2 lg:order-1">
                        {heroBadge && (
                            <span className="mb-5 inline-flex rounded-full bg-green-50 px-4 py-2 text-xs font-bold tracking-[0.16em] text-green-800">
                                {heroBadge}
                            </span>
                        )}

                        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                            {productName}
                        </h1>

                        <p className="mt-6 max-w-2xl text-base  text-stone-600 text-[15px]">
                            {productDescription}
                        </p>

                        {productHighlights.length > 0 && (
                            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                                {productHighlights.map((item, index) => (
                                    <li
                                        key={`${item}-${index}`}
                                        className="flex items-start gap-3 text-sm font-medium text-stone-700"
                                    >
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                                            ✓
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href={ctaButtonLink}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-900"
                            >
                                {ctaButtonText}
                                <span aria-hidden="true">→</span>
                            </a>
                            <a
                                href="#product-details"
                                className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-6 py-3.5 text-sm font-bold text-stone-700 transition hover:border-green-800 hover:text-green-800"
                            >
                                Product Details
                            </a>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-stone-100 bg-stone-50 p-5 shadow-sm sm:p-8">
                            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-green-100/70 blur-3xl" />
                            <img
                                src={heroImage}
                                alt={heroImageAlt}
                                className="relative z-10 mx-auto max-h-[440px] w-full object-contain"
                                loading="eager"
                                fetchPriority="high"
                            />
                            <p className="relative z-10 mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                {category}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT OVERVIEW */}
            <section
                id="product-details"
                className="bg-stone-50 py-10"
            >
                <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-12 lg:px-8">
                    <div className="lg:col-span-7">
                        <div className="section-heading !text-start">
                            <span className="text-xs font-bold tracking-[0.18em] text-green-800">
                                PRODUCT OVERVIEW
                            </span>
                            <h2 className="mt-3 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
                                {overviewH2}
                            </h2>
                        </div>

                        <div className="mt-6 space-y-4 text-base leading-8 text-stone-600">
                            {overviewParagraphs.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>

                    <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-5">
                        <h3 className="text-lg font-bold text-stone-900">
                            Product at a Glance
                        </h3>
                        <dl className="mt-5 divide-y divide-stone-100">
                            <div className="flex justify-between gap-4 py-3">
                                <dt className="text-sm text-stone-500">Product</dt>
                                <dd className="text-right text-sm font-semibold text-stone-800">
                                    {productName}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4 py-3">
                                <dt className="text-sm text-stone-500">Category</dt>
                                <dd className="text-right text-sm font-semibold text-stone-800">
                                    {category}
                                </dd>
                            </div>
                            {sku && (
                                <div className="flex justify-between gap-4 py-3">
                                    <dt className="text-sm text-stone-500">SKU</dt>
                                    <dd className="text-right text-sm font-semibold text-stone-800">
                                        {sku}
                                    </dd>
                                </div>
                            )}
                        </dl>
                        <a
                            href={ctaButtonLink}
                            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900"
                        >
                            Request Product Information
                        </a>
                    </aside>
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
            {/* FEATURES */}
            {features.length > 0 && (
                <section className="py-14 sm:py-20">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                        <div className="section-heading text-start">
                            <span className="text-xs font-bold tracking-[0.18em] text-green-800">
                                PRODUCT FEATURES
                            </span>
                            <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
                                Key Features of {productName}
                            </h2>
                        </div>

                        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <article
                                    key={index}
                                    className="rounded-2xl border border-stone-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-green-700 hover:shadow-lg"
                                >
                                    {feature.icon && (
                                        <img
                                            src={feature.icon}
                                            alt=""
                                            aria-hidden="true"
                                            className="mb-4 h-11 w-11 object-contain"
                                            loading="lazy"
                                        />
                                    )}
                                    <h3 className="text-lg font-bold text-stone-900">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-7 text-stone-600">
                                        {feature.text}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* SPECIFICATIONS */}
            {specifications.length > 0 && (
                <section className="bg-stone-50 py-10">
                    <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
                        <div className="section-heading text-start">
                            <span className="text-xs font-bold tracking-[0.18em] text-green-800">
                                PRODUCT INFORMATION
                            </span>
                            <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
                                Product Specifications
                            </h2>
                        </div>

                        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                            <dl className="divide-y divide-stone-200">
                                {specifications.map((spec, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-1 px-5 py-4 sm:grid-cols-2 sm:gap-6 sm:px-7"
                                    >
                                        <dt className="text-sm font-semibold text-stone-600">
                                            {spec.label}
                                        </dt>
                                        <dd className="text-sm leading-6 text-stone-900 sm:text-right">
                                            {spec.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </section>
            )}

            {/* APPLICATIONS */}
            {applications.length > 0 && (
                <section className="py-14 sm:py-20">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                        <div className="section-heading text-start">
                            <span className="text-xs font-bold tracking-[0.18em] text-green-800">
                                WHERE IT CAN BE USED
                            </span>
                            <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
                                Applications of {productName}
                            </h2>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {applications.map((application, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-5"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                                        ✓
                                    </span>
                                    <p className="text-sm font-medium leading-6 text-stone-700">
                                        {application}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* HOW TO USE */}
            {usageSteps.length > 0 && (
                <section className="bg-stone-50 py-10">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                        <div className="section-heading text-start">
                            <span className="text-xs font-bold tracking-[0.18em] text-green-800">
                                SIMPLE PRODUCT GUIDE
                            </span>
                            <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
                                How to Use {productName}
                            </h2>
                        </div>

                        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {usageSteps.map((step, index) => (
                                <article
                                    key={index}
                                    className="rounded-2xl border border-stone-200 bg-white p-6"
                                >
                                    <span className="text-3xl font-extrabold text-green-800">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <h3 className="mt-3 text-lg font-bold text-stone-900">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-7 text-stone-600">
                                        {step.text}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WHY CHOOSE */}
            {/* WHY CHOOSE - DYNAMIC PRODUCT SECTION */}

            {whyChooseSection && (
                <section className="why-choose-section py-10">
                    <div className="container mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">

                        {/* LEFT IMAGE */}
                        <div className="why-choose-image">
                            <img
                                src={whyChooseSection.image || "/landing-page-images/why-choose.webp"}
                                alt={whyChooseSection.imageAlt || "Why choose Cocoveera"}
                                loading="lazy"
                                decoding="async"
                            />
                            {whyChooseSection.badge && (
                                <div className="why-image-badge">
                                    <strong>{whyChooseSection.badge.value}</strong>
                                    <span>{whyChooseSection.badge.label}</span>
                                </div>
                            )}
                        </div>

                        {/* <div className="why-choose-image relative">
                            <div className="relative overflow-hidden rounded-3xl bg-stone-50">
                                <img
                                    src={whyChooseSection.image}
                                    alt={whyChooseSection.imageAlt || productName}
                                    className="mx-auto h-full w-full object-contain"
                                    loading="lazy"
                                />

                                {whyChooseSection.badge && (
                                    <div className="absolute bottom-7 left-7 rounded-2xl bg-green-900 px-5 py-4 text-white shadow-lg">
                                        <strong className="block text-2xl font-bold">
                                            {whyChooseSection.badge.value}
                                        </strong>

                                        <span className="text-xs font-medium">
                                            {whyChooseSection.badge.label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div> */}

                        {/* RIGHT CONTENT */}
                        <div className="why-choose-content">

                            {whyChooseSection.tag && (
                                <span className="text-xs font-bold tracking-[0.18em] text-green-800">
                                    {whyChooseSection.tag}
                                </span>
                            )}

                            <h2 className="mt-3 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
                                {whyChooseSection.title}
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base">
                                {whyChooseSection.description}
                            </p>

                            {/* DYNAMIC BENEFITS */}
                            {whyChooseSection.benefits?.length > 0 && (
                                <div className="mt-7 grid gap-5 sm:grid-cols-2">

                                    {whyChooseSection.benefits.map((benefit, index) => (
                                        <div
                                            key={`${benefit.title}-${index}`}
                                            className="flex items-start gap-3"
                                        >
                                            {benefit.icon && (
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 p-2">
                                                    <img
                                                        src={benefit.icon}
                                                        alt=""
                                                        aria-hidden="true"
                                                        className="h-full w-full object-contain"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-sm font-bold text-stone-900">
                                                    {benefit.title}
                                                </h3>

                                                <p className="mt-1 text-xs leading-6 text-stone-600">
                                                    {benefit.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            )}

                            {/* DYNAMIC CTA */}
                            {whyChooseSection.buttonText && (
                                <a
                                    href={whyChooseSection.buttonLink || "/contact"}
                                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-green-800 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-green-900"
                                >
                                    {whyChooseSection.buttonText}
                                    <span aria-hidden="true">→</span>
                                </a>
                            )}

                        </div>
                    </div>
                </section>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
                <section className="bg-stone-50 py-10">
                    <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
                        <div className="section-heading text-start">
                            <span className="text-xs font-bold tracking-[0.18em] text-green-800">
                                NEED TO KNOW
                            </span>
                            <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
                                Frequently Asked Questions
                            </h2>
                        </div>

                        <div className="mt-8 space-y-3">
                            {faqs.map((faq, index) => (
                                <details
                                    key={index}
                                    className="group rounded-xl border border-stone-200 bg-white p-5"
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-stone-900 marker:hidden">
                                        <span>{faq.question}</span>
                                        <span className="text-xl text-green-800 transition group-open:rotate-45">
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-4 border-t border-stone-100 pt-4 text-sm leading-7 text-stone-600">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* RELATED LINKS */}
            {relatedLinks.length > 0 && (
                <section className="py-12">
                    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-bold text-stone-900">
                            Explore More Coir Products
                        </h2>
                        <div className="mt-5 flex flex-wrap gap-3">
                            {relatedLinks.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.to}
                                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-green-800 hover:text-green-800"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="cta-section" id="contact">
                <div className="cta-overlay"></div>
                <div className="container m-auto cta-container">
                    <div className="cta-content">
                        <span className="section-tag">GROW WITH COCOVEERA</span>
                        <h2>
                            {ctaTitle}
                        </h2>
                        <p>
                            {ctaDescription}
                        </p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="primary-btn">
                                Enquire Now <span>→</span>
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

            {/* <section className="bg-green-900 py-14 text-white sm:py-16">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 sm:px-6 md:flex-row md:items-center lg:px-8">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold sm:text-3xl">
                            {ctaTitle}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-green-50 sm:text-base">
                            {ctaDescription}
                        </p>
                    </div>
                    <a
                        href={ctaButtonLink}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-green-900 transition hover:bg-green-50"
                    >
                        {ctaButtonText}
                        <span aria-hidden="true">→</span>
                    </a>
                </div>
            </section> */}
        </main>
    );
};

export default SEOProductPageTemplate;
