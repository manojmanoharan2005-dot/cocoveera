import React from "react";
import SEOLandingPageTemplate from "./SEOLandingPageTemplate";

const pageData = {
    canonicalPath: "/buy-cocopeat-new-york",
    breadcrumbName: "Buy Cocopeat in New York",
    metaTitle: "Buy Cocopeat in New York | Bulk Coir Export to NY Ports",
    metaDescription: "Source premium bulk cocopeat and coir substrates imported directly from India to New York ports. Low EC cocopeat blocks, briquettes and grow bags for NY commercial growers.",
    keywords: `
        buy cocopeat in New York,
        bulk cocopeat NY,
        cocopeat export to New York,
        coir substrate New York,
        5kg cocopeat blocks NY port,
        commercial coir supplier NY,
        hydroponic cocopeat New York
    `,
    heroBadge: "EXPORT DIRECT TO NEW YORK PORTS",
    heroH1: "Buy Cocopeat in New York",
    heroDescription: "Direct container import of premium low-EC coconut coir blocks, briquettes, and grow bags shipped straight from our India manufacturing facilities to New York / New Jersey port terminals for regional commercial growers and soil blenders.",
    heroImage: "/landing-page-images/banner-product.webp",
    heroImageAlt: "Bulk export of cocopeat blocks and coir substrates bound for New York",
    productFilterKeyword: "cocopeat",
    productsH2: "Explore Our Full Export Range of Cocopeat Substrates for New York",
    aboutH2: "Direct Coir Substrate Export to New York Commercial Growers",
    aboutParagraphs: [
        "Cocoveera is an international coir manufacturer exporting premium coconut growing media directly to commercial growers and distributors across New York State and the East Coast.",
        "We handle all export logistics, phytosanitary certifications, and customs documentation to ensure smooth container delivery to New York ports and regional warehouses."
    ],
    benefitsTag: "NEW YORK BULK EXPORT ADVANTAGE",
    benefitsH2: "Why Commercial Buyers in NY Partner with Cocoveera",
    benefits: [
        {
            icon: "/landing-page-images/icons/natural-safe.png",
            title: "Direct Import & Port Delivery",
            text: "Seamless shipping logistics directly to NY / NJ ports and regional commercial distribution centers."
        },
        {
            icon: "/landing-page-images/icons/sustainable-living.png",
            title: "Consistent Low EC Quality",
            text: "Laboratory tested low electrical conductivity (EC < 0.5 mS/cm) safe for sensitive commercial crops."
        },
        {
            icon: "/landing-page-images/icons/premium-quality.png",
            title: "Bulk Cocopeat, Ready to Ship",
            text: "Full container loads (FCL) of 5kg blocks, briquettes, and grow slabs ready for rapid export dispatch."
        },
        {
            icon: "/landing-page-images/icons/wide-range.png",
            title: "Ideal for Hydroponic Growing",
            text: "Perfect substrate balance for indoor hydroponic facilities, urban farms, and commercial greenhouses."
        },
        {
            icon: "/landing-page-images/icons/affordable-prices.png",
            title: "Sustainable & Organic Medium",
            text: "100% natural, eco-friendly coconut fiber supporting sustainable agricultural practices."
        },
        {
            icon: "/landing-page-images/icons/fast-shipping.png",
            title: "Batch Tested & Certified",
            text: "Accompanied by official phytosanitary and batch test reports for complete peace of mind."
        }
    ],
    testimonials: [
        {
            name: "James Carter",
            role: "Commercial Greenhouse Operator",
            text: "Our ocean freight container shipment arrived at New York port right on schedule. The product quality and buffering were top-tier."
        },
        {
            name: "Linda Torres",
            role: "Agricultural Product Distributor",
            text: "Working with Cocoveera for East Coast container loads has streamlined our supply chain. Reliable low-EC coir every single batch."
        },
        {
            name: "Mark Reynolds",
            role: "Nursery Owner",
            text: "The export documentation and Phytosanitary Certificates were handled flawlessly, making customs clearance smooth in NY."
        }
    ],
    processH2: "Export Process from India to New York",
    processSubtitle: "Seamless end-to-end container shipment from factory dispatch to NY port delivery.",
    processSteps: [
        {
            title: "Choose Your Cocopeat Grade",
            text: "Select from washed low EC 5kg blocks, briquettes, or custom grow bags based on your crop specifications."
        },
        {
            title: "Place Order & Specifications",
            text: "Finalize container quantity, palletization preferences, and custom branding requirements."
        },
        {
            title: "Quality Checked Before Dispatch",
            text: "Every production lot undergoes rigorous lab testing for EC, pH, moisture, and expansion ratio."
        },
        {
            title: "Packed for Safe Ocean Transit",
            text: "Palletized and weather-sealed to protect against moisture and damage during sea transit."
        },
        {
            title: "Shipped to New York Ports",
            text: "Ocean freight shipping routed to New York / New Jersey port terminals with full documentation."
        },
        {
            title: "Delivered to Your Facility",
            text: "Customs clearance and final drayage delivery straight to your warehouse or greenhouse facility."
        }
    ],
    faqs: [
        {
            question: "How long does shipping take for cocopeat orders bound for New York?",
            answer: "Standard ocean freight transit from production export hubs to New York / New Jersey ports typically takes 25 to 35 days."
        },
        {
            question: "What documentation accompanies shipments to New York, USA?",
            answer: "All shipments include USDA-compliant Phytosanitary Certificates, Certificates of Origin, Bill of Lading, and batch laboratory quality reports."
        },
        {
            question: "Are custom EC levels available for commercial growers in NY?",
            answer: "Yes, we produce both triple-washed low EC (< 0.5 mS/cm) and high EC coir substrates tailored to your specific irrigation protocol."
        },
        {
            question: "Can small commercial nurseries order pallet quantities instead of full containers?",
            answer: "We handle LCL (Less than Container Load) and full container load (FCL) orders to accommodate growing businesses."
        },
        {
            question: "How can New York commercial growers request a price quote or sample?",
            answer: "Fill out our RFQ contact form online or speak directly with our export team for customized quotes."
        }
    ]
};

const BuyCocopeatNewYork = () => {
    return <SEOLandingPageTemplate pageData={pageData} />;
};

export default BuyCocopeatNewYork;
