import React from "react";
import SEOLandingPageTemplate from "./SEOLandingPageTemplate";

const pageData = {
    canonicalPath: "/coco-coir-wholesale-supplier-usa",
    breadcrumbName: "Coco Coir Wholesale Supplier USA",
    metaTitle: "Coco Coir Wholesale Supplier USA | Bulk Coir Exporter",
    metaDescription: "Leading coco coir wholesale supplier serving commercial growers across the USA. High quality, lab-tested low EC coir blocks, grow bags and chips directly imported from India.",
    keywords: `
        coco coir wholesale supplier USA,
        bulk coir supplier,
        coir export India to USA,
        commercial coir substrates,
        low EC coir supplier,
        coir pith container load,
        wholesale grow media USA
    `,
    heroBadge: "LEADING B2B COIR EXPORTER",
    heroH1: "coco coir wholesale supplier USA",
    heroDescription: "Direct factory export of premium coconut coir substrates, compressed blocks, grow bags, and custom formulations designed for commercial agriculture, greenhouse operators, and soil blenders in the USA.",
    heroImage: "/landing-page-images/banner-product.webp",
    heroImageAlt: "Coco coir wholesale supplier servicing commercial growers in the USA",
    productFilterKeyword: "coir",
    productsH2: "Explore Our Full B2B Product Line for USA Commercial Buyers",
    aboutH2: "Trusted Global Manufacturer & Direct Export Supplier",
    aboutParagraphs: [
        "Cocoveera is a premier manufacturer and exporter of organic coconut coir substrates, supplying commercial growers, greenhouse operators, and soil mix blenders worldwide.",
        "With years of experience in coir processing, washing, buffering, and quality testing, we deliver reliable bulk coir growing media that meets the highest international standards."
    ],
    benefitsTag: "SUPPLIER ADVANTAGE",
    benefitsH2: "Why Leading Commercial Buyers Partner with Cocoveera",
    benefits: [
        {
            icon: "/landing-page-images/icons/natural-safe.png",
            title: "Dependable Bulk Supply Chain",
            text: "Continuous year-round production capacity guaranteeing timely container shipments to USA ports."
        },
        {
            icon: "/landing-page-images/icons/sustainable-living.png",
            title: "Consistent Growing Quality",
            text: "Lab-verified EC, pH, and moisture parameters across every production batch."
        },
        {
            icon: "/landing-page-images/icons/premium-quality.png",
            title: "USA Export & Customs Support",
            text: "Full assistance with USDA phytosanitary requirements, customs clearance, and port logistics."
        },
        {
            icon: "/landing-page-images/icons/wide-range.png",
            title: "Solutions for Commercial Buyers",
            text: "Tailored formulations for commercial greenhouses, berry growers, and soil blenders."
        },
        {
            icon: "/landing-page-images/icons/affordable-prices.png",
            title: "Sustainable Substrate Choice",
            text: "100% renewable, eco-friendly peat moss alternative helping growers reduce carbon footprint."
        },
        {
            icon: "/landing-page-images/icons/fast-shipping.png",
            title: "Direct Factory Value",
            text: "Competitive wholesale container pricing straight from our manufacturing facilities."
        }
    ],
    testimonials: [
        {
            name: "James Carter",
            role: "Commercial Greenhouse Operator",
            text: "Partnering with Cocoveera as our primary coir supplier has given us peace of mind. Consistent quality and reliable container schedules."
        },
        {
            name: "Linda Torres",
            role: "Agricultural Product Distributor",
            text: "Direct factory communication, complete phytosanitary certificates, and unbeatable wholesale pricing. Highly recommended."
        },
        {
            name: "Mark Reynolds",
            role: "Nursery Owner",
            text: "The low EC levels are always within specification. We've seen significant improvements in root health since switching to Cocoveera."
        }
    ],
    processH2: "Our Wholesale Supply & Export Process",
    processSubtitle: "Rigorous quality control and streamlined international container shipping.",
    processSteps: [
        {
            title: "Substrate Audit & Requirement Analysis",
            text: "We consult with your agronomy team to identify the exact coir grade, EC level, and blend ratio needed."
        },
        {
            title: "Custom Quote & Order Confirmation",
            text: "Receive transparent wholesale container quotes including freight options to your designated USA port or facility."
        },
        {
            title: "Batch Buffering & Quality Testing",
            text: "Substrates undergo thorough washing, buffering, and lab testing to ensure compliance with specifications."
        },
        {
            title: "Secure Palletization & Packing",
            text: "Compressed products are palletized, corner-guarded, and shrink-wrapped for marine transport safety."
        },
        {
            title: "Export Clearance & Ocean Freight",
            text: "Complete export documentation, phytosanitary issuance, and ocean freight shipment to USA ports."
        },
        {
            title: "On-Time Arrival & Delivery",
            text: "Smooth port discharge and final transport to your greenhouse, farm, or distribution hub."
        }
    ],
    faqs: [
        {
            question: "Why choose Cocoveera as your USA coir wholesale supplier?",
            answer: "We combine direct factory manufacturing with rigorous quality control, verified lab testing, low EC guarantees, and end-to-end container export service."
        },
        {
            question: "Do you provide phytosanitary and export compliance certificates for USA import?",
            answer: "Yes, every export container is inspected and issued an official Phytosanitary Certificate meeting USDA-APHIS import standards."
        },
        {
            question: "What is the minimum order quantity (MOQ) for USA bulk orders?",
            answer: "Our standard minimum order quantity for wholesale pricing is one 20ft or 40ft High Cube sea container. LCL options are also available."
        },
        {
            question: "Can you supply custom blends of coir pith, fiber, and chips?",
            answer: "Yes, we produce custom physical blends (e.g., 70/30 coir pith/chips, 50/50 mix, or coarse husk chips) to suit specific crop drainage requirements."
        },
        {
            question: "How do we establish a long-term wholesale supply contract?",
            answer: "Reach out to our global sales director via our website contact form or request a callback to discuss annual supply agreements and scheduled container deliveries."
        }
    ]
};

const CocoCoirWholesaleSupplierUSA = () => {
    return <SEOLandingPageTemplate pageData={pageData} />;
};

export default CocoCoirWholesaleSupplierUSA;
