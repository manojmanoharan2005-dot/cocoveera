import React from "react";
import SEOLandingPageTemplate from "./SEOLandingPageTemplate";

const pageData = {
    canonicalPath: "/coco-coir-briquettes-bulk",
    breadcrumbName: "Coco Coir Briquettes Bulk",
    metaTitle: "Coco Coir Briquettes Bulk | 650g Compact Coir Bricks",
    metaDescription: "Buy compressed 650g coco coir briquettes in bulk from Cocoveera. High-expansion, low-EC coir bricks for potting mixes, commercial nurseries and retail distribution.",
    keywords: `
        coco coir briquettes bulk,
        650g coir brick wholesale,
        compressed coco peat briquettes,
        bulk coir bricks supplier,
        low EC coir briquettes,
        cocopeat bricks bulk export
    `,
    heroBadge: "COMPACT & HIGH EXPANSION MEDIA",
    heroH1: "Coco Coir Briquettes Bulk",
    heroDescription: "High-density 650g compressed coco coir briquettes engineered for maximum expansion, low electrical conductivity, and easy handling for commercial potting, retail bundling, and nursery production.",
    heroImage: "/landing-page-images/banner-product.webp",
    heroImageAlt: "Bulk compressed 650g coco coir briquettes for commercial supply",
    productFilterKeyword: "briquette",
    productsH2: "Discover Our Range of Coir Briquettes & Compact Substrates",
    aboutH2: "Precision Compressed Coir Media for Global Buyers",
    aboutParagraphs: [
        "Cocoveera is a trusted coir manufacturer specializing in compressed 650g briquettes, 5kg blocks, and custom coir substrates for agricultural markets worldwide.",
        "Our bulk coir briquettes offer exceptional expansion yield, high cation exchange capacity, and clean, uniform fiber texture for professional growers and soil mix blenders."
    ],
    benefitsTag: "COIR BRIQUETTES ADVANTAGE",
    benefitsH2: "Key Benefits of Sourcing Bulk Coir Briquettes",
    benefits: [
        {
            icon: "/landing-page-images/icons/natural-safe.png",
            title: "Space-Saving & Compact",
            text: "Compressed 650g briquettes minimize shipping volume and warehouse storage space requirements."
        },
        {
            icon: "/landing-page-images/icons/sustainable-living.png",
            title: "Consistent, Low EC Quality",
            text: "Washed to guarantee low electrical conductivity (EC < 0.5 mS/cm) for healthy root development."
        },
        {
            icon: "/landing-page-images/icons/premium-quality.png",
            title: "Built for Bulk & Export",
            text: "Uniformly dimensioned for efficient automated retail packaging or bulk container loading."
        },
        {
            icon: "/landing-page-images/icons/wide-range.png",
            title: "Trusted Manufacturer",
            text: "Direct factory production ensures strict quality control and competitive wholesale pricing."
        },
        {
            icon: "/landing-page-images/icons/affordable-prices.png",
            title: "Versatile for Every Grower",
            text: "Ideal for potting mixes, seed germination, microgreens, soil amendment, and home gardening."
        },
        {
            icon: "/landing-page-images/icons/fast-shipping.png",
            title: "Rapid Expansion Yield",
            text: "Expands quickly when hydrated, providing 8 to 9 liters of fluffy, premium growing substrate per briquette."
        }
    ],
    testimonials: [
        {
            name: "James Carter",
            role: "Commercial Greenhouse Operator",
            text: "The 650g briquettes expand incredibly fast. Consistent yield of 8+ liters per block makes mixing potting soil effortless."
        },
        {
            name: "Linda Torres",
            role: "Agricultural Product Distributor",
            text: "Our retail customers love the clean custom shrink wrapping. High sales velocity and excellent feedback."
        },
        {
            name: "Mark Reynolds",
            role: "Nursery Owner",
            text: "Great low EC parameters. We use these briquettes for seed starting plugs and seedling trays with outstanding germination rates."
        }
    ],
    processH2: "Manufacturing Process of Coir Briquettes",
    processSubtitle: "High-pressure hydraulic compression and strict quality control.",
    processSteps: [
        {
            title: "Collecting Coconut Husks",
            text: "Fresh coconut husks gathered from sustainable plantations for quality coir extraction."
        },
        {
            title: "Extracting the Coir Fiber",
            text: "De-husking and mechanical separation of long fibers from fine coir pith."
        },
        {
            title: "Washing & Buffering for Low EC",
            text: "Thorough fresh-water washing and calcium buffering to remove sodium and potassium ions."
        },
        {
            title: "Drying & Quality Screening",
            text: "Sun drying on concrete yards followed by double sieving to remove excess sand and fine dust."
        },
        {
            title: "Hydraulic Compression into Briquettes",
            text: "Compressed into uniform 650g briquettes using high-pressure hydraulic presses."
        },
        {
            title: "Quality Check & Export Wrapping",
            text: "Inspected for weight, density, and expansion before shrink-wrapping and palletization."
        }
    ],
    faqs: [
        {
            question: "What is the expansion volume of a 650g coco coir briquette?",
            answer: "Each 650g briquette yields approximately 8 to 9 liters of moist, airy growing medium when hydrated with water."
        },
        {
            question: "What is the difference between washed low EC and unwashed briquettes?",
            answer: "Washed low EC briquettes have sodium and chloride leached out (EC < 0.5 mS/cm), making them safe for sensitive plants, whereas high EC unwashed coir is meant for general landscaping or non-sensitive applications."
        },
        {
            question: "Can briquettes be custom wrapped or retail branded?",
            answer: "Yes, we offer private label packaging, custom color wraps, barcode printing, and master carton bundling for retail distributors."
        },
        {
            question: "How many briquettes fit into a 40ft shipping container?",
            answer: "A standard 40ft High Cube container holds approximately 24,000 to 26,000 individual 650g briquettes palletized and shrink-wrapped."
        },
        {
            question: "How do I request wholesale pricing for bulk briquettes?",
            answer: "Contact our export sales team via the RFQ quote request page to receive volume tiered pricing."
        }
    ]
};

const CocoCoirBriquettesBulk = () => {
    return <SEOLandingPageTemplate pageData={pageData} />;
};

export default CocoCoirBriquettesBulk;
