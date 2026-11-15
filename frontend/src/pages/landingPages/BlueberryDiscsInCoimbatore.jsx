import React from "react";
import SEOLandingPageTemplate from "./SEOLandingPageTemplate";

const pageData = {
    canonicalPath: "/blueberry-discs-in-coimbatore",
    breadcrumbName: "Blueberry Discs in Coimbatore",

    metaTitle: "Blueberry Discs in Coimbatore | Premium Coir Growing Discs",
    metaDescription:
        "Explore premium coir-based blueberry growing discs in Coimbatore from Cocoveera. Designed to support moisture retention, aeration and healthy root development.",

    keywords: `
        blueberry discs in Coimbatore,
        blueberry growing discs,
        coir discs for blueberry plants,
        blueberry plant growing medium,
        coconut coir growing discs,
        coir growing discs supplier,
        blueberry cultivation products,
        coir discs for gardening,
        natural coir growing medium,
        sustainable growing solutions,
        coconut coir products,
        Cocoveera blueberry discs,
        coir products in Coimbatore
    `,

    heroBadge: "PREMIUM COIR GROWING SOLUTIONS",
    heroH1: "Premium Blueberry Discs in Coimbatore",
    heroDescription:
        "Premium coir-based blueberry growing discs, sustainably crafted to provide excellent moisture retention, aeration and support for healthy root development.",
    heroImage: "/landing-page-images/banner-product.webp",
    heroImageAlt:
        "Premium coir-based blueberry growing discs for plant cultivation",

    productFilterKeyword: "blueberry",
    productsH2:
        "Explore Our Sustainable Coir Products for Modern Growing Needs",

    aboutH2: "Rooted in Nature, Committed to Quality",
    aboutParagraphs: [
        "At Cocoveera, we believe in turning nature's resources into sustainable solutions for modern agriculture. Our products are made from carefully processed coconut coir, offering natural, renewable and environmentally responsible alternatives for growers.",
        "Our range includes coir pith, coir blocks, grow bags, coir chips, briquettes and specialized growing products such as coir-based blueberry growing discs. We focus on delivering consistent quality, reliable performance and value to every customer.",
        "With a strong foundation in coconut coir processing and a commitment to sustainable sourcing, Cocoveera continues to supply products that support plant growth while reducing dependence on conventional growing materials."
    ],

    benefitsTag: "THE COCOVEERA ADVANTAGE",
    benefitsH2: "Benefits of Choosing Cocoveera",
    benefits: [
        {
            icon: "/landing-page-images/icons/natural-safe.png",
            title: "Natural & Safe",
            text: "Made from natural coconut coir for a plant-friendly growing solution."
        },
        {
            icon: "/landing-page-images/icons/sustainable-living.png",
            title: "Sustainable Living",
            text: "Eco-friendly growing solutions made using a renewable coconut resource."
        },
        {
            icon: "/landing-page-images/icons/premium-quality.png",
            title: "Premium Quality",
            text: "Carefully selected and processed coir products designed for consistent quality."
        },
        {
            icon: "/landing-page-images/icons/wide-range.png",
            title: "Wide Range",
            text: "Coir-based solutions for different gardening, nursery and growing requirements."
        },
        {
            icon: "/landing-page-images/icons/affordable-prices.png",
            title: "Affordable Prices",
            text: "Quality coir growing products offered at competitive prices."
        },
        {
            icon: "/landing-page-images/icons/fast-shipping.png",
            title: "Fast & Reliable Shipping",
            text: "Reliable delivery support to help customers receive their products on time."
        }
    ],

    testimonials: [
        {
            name: "Sarah Johnson",
            role: "Plant Enthusiast",
            text: "Excellent coir discs! My blueberry plants are healthier and growing beautifully."
        },
        {
            name: "David Miller",
            role: "Home Gardener",
            text: "Sustainable and easy to use. The quality is excellent and highly recommended."
        },
        {
            name: "Emily Davis",
            role: "Organic Farmer",
            text: "Great quality products with excellent results. Cocoveera is my trusted choice."
        },
        {
            name: "Michael",
            role: "Commercial Grower",
            text: "Consistent quality and excellent performance for our commercial growing needs."
        },
        {
            name: "Sophia Williams",
            role: "Nursery Owner",
            text: "The products are reliable and sustainable, making them perfect for our nursery."
        },
        {
            name: "James Wilson",
            role: "Farm Owner",
            text: "Excellent moisture retention and great results across different crops on our farm."
        }
    ],

    processH2: "From Nature to You: The Cocoveera Process",
    processSubtitle:
        "From sourcing coconut husks to preparing finished coir products, every stage is focused on quality and consistency.",
    processSteps: [
        {
            title: "Nature's Collection",
            text: "We source coconut husks from trusted farms as the raw material for our coir products."
        },
        {
            title: "Careful Processing",
            text: "The coconut material is processed to prepare coir for different growing applications."
        },
        {
            title: "Quality Testing",
            text: "Products are checked for quality and consistency before they are prepared for customers."
        },
        {
            title: "Eco-Friendly Packaging",
            text: "Finished coir products are packed carefully for handling and delivery."
        },
        {
            title: "Delivered to You",
            text: "We coordinate reliable delivery for customers and growing businesses."
        }
    ],

    faqs: [
        {
            question: "What are blueberry growing discs?",
            answer:
                "Blueberry growing discs are coir-based growing products intended for use in blueberry plant cultivation. Contact Cocoveera for product details and usage guidance."
        },
        {
            question: "What are blueberry discs made from?",
            answer:
                "The blueberry growing discs featured by Cocoveera are coir-based products made using coconut coir."
        },
        {
            question: "What are the benefits of coir-based growing discs?",
            answer:
                "Coir-based growing products can help provide moisture retention and aeration. The suitability and performance depend on the product specification and growing conditions."
        },
        {
            question: "Can I buy blueberry discs in Coimbatore?",
            answer:
                "Contact Cocoveera to enquire about blueberry growing discs, product availability, order quantities and delivery options in Coimbatore."
        },
        {
            question: "Are coir growing products suitable for nurseries and commercial growers?",
            answer:
                "Cocoveera offers coconut coir growing solutions for different customer requirements, including gardening, nursery and commercial growing applications. Contact the team to discuss your requirements."
        },
        {
            question: "How can I enquire about blueberry growing discs?",
            answer:
                "You can contact Cocoveera directly with your required quantity and application details to request product information and a quotation."
        }
    ]
};

const BlueberryDiscsInCoimbatore = () => {
    return <SEOLandingPageTemplate pageData={pageData} />;
};

export default BlueberryDiscsInCoimbatore;
