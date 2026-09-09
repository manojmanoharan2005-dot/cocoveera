import React from "react";
import SEOLandingPageTemplate from "./SEOLandingPageTemplate";

const pageData = {
    canonicalPath: "/coco-coir-grow-bags-wholesale",
    breadcrumbName: "Coco Coir Grow Bags Wholesale",
    metaTitle: "Coco Coir Grow Bags Wholesale | Bulk Coir Substrate Slabs",
    metaDescription: "Source coco coir grow bags wholesale directly from Cocoveera. Premium UV-treated grow slabs for hydroponic greenhouses, commercial growers and nurseries.",
    keywords: `
        coco coir grow bags wholesale,
        bulk grow bags,
        coir grow slabs,
        hydroponic grow bags supplier,
        coir pith grow bags,
        wholesale grow bags USA,
        custom coir grow bags,
        greenhouse grow slabs export
    `,
    heroBadge: "HYDROPONIC & GREENHOUSE SUBSTRATES",
    heroH1: "Coco Coir Grow Bags Wholesale",
    heroDescription: "High-performance UV-treated coir grow bags and compressed slabs custom-engineered for greenhouse hydroponics, commercial berry production, and high-density vegetable cultivation.",
    heroImage: "/landing-page-images/banner-product.webp",
    heroImageAlt: "Coco coir grow bags wholesale for commercial hydroponic greenhouses",
    productFilterKeyword: "grow bag",
    productsH2: "Explore Our Full Range of Hydroponic Grow Bags & Coir Substrates",
    aboutH2: "Custom Engineered Substrates for Commercial Agriculture",
    aboutParagraphs: [
        "Cocoveera is a global coir manufacturer and substrate exporter committed to delivering high-performance growing solutions for modern commercial agriculture.",
        "Our coco coir grow bags are custom engineered to optimize root aeration, water drainage, and nutrient retention for greenhouse and hydroponic production."
    ],
    benefitsTag: "COMMERCIAL GROW BAG ADVANTAGE",
    benefitsH2: "Why Commercial Greenhouse Operators Choose Our Grow Bags",
    benefits: [
        {
            icon: "/landing-page-images/icons/natural-safe.png",
            title: "Breathes Better",
            text: "Superior aeration promotes vigorous root development and prevents root rot in high-density crops."
        },
        {
            icon: "/landing-page-images/icons/sustainable-living.png",
            title: "Holds Water Just Right",
            text: "Optimal water retention capacity ensures balanced moisture levels without waterlogging."
        },
        {
            icon: "/landing-page-images/icons/premium-quality.png",
            title: "Gentle on Every Plant",
            text: "Low EC, triple-washed coir substrate safe for sensitive young roots and high-value crops."
        },
        {
            icon: "/landing-page-images/icons/wide-range.png",
            title: "Built to Last",
            text: "UV-stabilized poly bags engineered to withstand multi-year commercial greenhouse conditions."
        },
        {
            icon: "/landing-page-images/icons/affordable-prices.png",
            title: "Better for the Planet",
            text: "100% organic, renewable, and eco-friendly growing medium substituting peat moss."
        },
        {
            icon: "/landing-page-images/icons/fast-shipping.png",
            title: "Available in Bulk",
            text: "Direct factory export in container loads with custom sizing, pre-drilled plant and drain holes."
        }
    ],
    testimonials: [
        {
            name: "James Carter",
            role: "Commercial Greenhouse Operator",
            text: "Cocoveera grow bags have transformed our berry yields. Consistent drainage and pre-drilled drain holes saved us labor during installation."
        },
        {
            name: "Linda Torres",
            role: "Agricultural Product Distributor",
            text: "Outstanding quality control. The low EC parameters are consistently maintained across container loads shipped to our facility."
        },
        {
            name: "Mark Reynolds",
            role: "Nursery Owner",
            text: "Dependable container export supplier. The UV-resistant poly sleeves held up perfectly under intense greenhouse conditions."
        }
    ],
    processH2: "Making of Every Grow Bag",
    processSubtitle: "Strict quality controls from raw husk sourcing to final container shipping dispatch.",
    processSteps: [
        {
            title: "Sourcing Premium Coconut Husks",
            text: "Selected raw coconut husks are processed for high fiber structural integrity."
        },
        {
            title: "Washing & EC Buffering",
            text: "Triple washed with clean fresh water to reduce electrical conductivity (EC < 0.5 mS/cm)."
        },
        {
            title: "Sifting & Particle Blending",
            text: "Precise mixing of coir pith and chips tailored for specific crop requirements."
        },
        {
            title: "Compression & Sizing",
            text: "Compressed into compact grow slabs for efficient sea freight and easy expansion."
        },
        {
            title: "UV-Protected Poly Wrapping",
            text: "Encased in heavy-duty white/black UV-protected co-extruded plastic bags."
        },
        {
            title: "Quality Check & Container Dispatch",
            text: "Strict moisture and expansion testing before container loading and export dispatch."
        }
    ],
    faqs: [
        {
            question: "What sizes and custom options are available for wholesale grow bags?",
            answer: "We offer standard slab sizes (e.g. 100x15x12 cm, 100x20x10 cm) as well as custom lengths, pre-cut plant holes, and pre-drilled drain slots upon request for container orders."
        },
        {
            question: "Are these grow bags suitable for hydroponic berry and vegetable cultivation?",
            answer: "Yes, our grow bags are specifically designed for commercial hydroponic strawberries, blueberries, tomatoes, cucumbers, and peppers."
        },
        {
            question: "How are coir grow bags shipped for bulk international export?",
            answer: "Grow slabs are compressed, UV-wrapped, palletized, and shrink-wrapped for safe ocean container transport directly to your port or facility."
        },
        {
            question: "What blend ratio of coir pith and chips works best for grow bags?",
            answer: "We offer standard 70/30, 50/50, and 100% coir pith or husk chip blends depending on your climate, crop type, and irrigation system."
        },
        {
            question: "How do I request a sample batch or wholesale price quote?",
            answer: "Contact our sales team through the RFQ form on our site to request sample packs or customized container pricing."
        }
    ]
};

const CocoCoirGrowBagsWholesale = () => {
    return <SEOLandingPageTemplate pageData={pageData} />;
};

export default CocoCoirGrowBagsWholesale;
