import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SEOInternalLinks Component
 * Renders a compact, dark-themed SEO keyword internal linking directory
 * across all Cocoveera product-country landing pages, inspired by the
 * clean inline vertical-separator (|) layout reference.
 */
const LINK_GROUPS = [
  {
    "category": "Coco Peat Blocks",
    "links": [
      {
        "name": "Cocopeat Blocks Wholesale USA",
        "slug": "/cocopeat-blocks-wholesale-usa"
      },
      {
        "name": "Buffered Coco Peat Block 1kg in Japan",
        "slug": "/buffered-coco-peat-block-1kg-in-japan"
      },
      {
        "name": "Buffered Coco Peat Block 2kg in Spain",
        "slug": "/buffered-coco-peat-block-2kg-in-spain"
      },
      {
        "name": "Buffered Coco Peat Block 3kg in Japan",
        "slug": "/buffered-coco-peat-block-3kg-in-japan"
      },
      {
        "name": "Buffered Coco Peat Block 4.5kg in Singapore",
        "slug": "/buffered-coco-peat-block-45kg-in-singapore"
      },
      {
        "name": "Buffered Coco Peat Block 4kg in USA",
        "slug": "/buffered-coco-peat-block-4kg-in-usa"
      },
      {
        "name": "Buffered Coco Peat Block 5kg in Germany",
        "slug": "/buffered-coco-peat-block-5kg-in-germany"
      },
      {
        "name": "Buffered Coco Peat Block 650g in UAE",
        "slug": "/buffered-coco-peat-block-650g-in-uae"
      },
      {
        "name": "Natural Coco Peat Block 1kg in Vietnam",
        "slug": "/natural-coco-peat-block-1kg-in-vietnam"
      },
      {
        "name": "Natural Coco Peat Block 2kg in Singapore",
        "slug": "/natural-coco-peat-block-2kg-in-singapore"
      },
      {
        "name": "Natural Coco Peat Block 3kg in UK",
        "slug": "/natural-coco-peat-block-3kg-in-uk"
      },
      {
        "name": "Natural Coco Peat Block 4.5kg in Netherlands",
        "slug": "/natural-coco-peat-block-45kg-in-netherlands"
      },
      {
        "name": "Natural Coco Peat Block 4kg in South Korea",
        "slug": "/natural-coco-peat-block-4kg-in-south-korea"
      },
      {
        "name": "Natural Coco Peat Block 5kg in USA",
        "slug": "/natural-coco-peat-block-5kg-in-usa"
      },
      {
        "name": "Natural Coco Peat Block 650g in Saudi Arabia",
        "slug": "/natural-coco-peat-block-650g-in-saudi-arabia"
      },
      {
        "name": "Washed Low EC Coco Peat Block 1kg in Germany",
        "slug": "/washed-low-ec-coco-peat-block-1kg-in-germany"
      },
      {
        "name": "Washed Low EC Coco Peat Block 2kg in Vietnam",
        "slug": "/washed-low-ec-coco-peat-block-2kg-in-vietnam"
      },
      {
        "name": "Washed Low EC Coco Peat Block 3kg in Germany",
        "slug": "/washed-low-ec-coco-peat-block-3kg-in-germany"
      },
      {
        "name": "Washed Low EC Coco Peat Block 4.5kg in UAE",
        "slug": "/washed-low-ec-coco-peat-block-45kg-in-uae"
      },
      {
        "name": "Washed Low EC Coco Peat Block 4kg in Australia",
        "slug": "/washed-low-ec-coco-peat-block-4kg-in-australia"
      },
      {
        "name": "Washed Low EC Coco Peat Block 5kg in Netherlands",
        "slug": "/washed-low-ec-coco-peat-block-5kg-in-netherlands"
      },
      {
        "name": "Washed Low EC Coco Peat Block 650g in Japan",
        "slug": "/washed-low-ec-coco-peat-block-650g-in-japan"
      }
    ]
  },
  {
    "category": "Coco Peat Discs",
    "links": [
      {
        "name": "Coco Peat Disc 10cm in Japan",
        "slug": "/coco-peat-disc-10cm-in-japan"
      },
      {
        "name": "Coco Peat Disc 13.5cm in USA",
        "slug": "/coco-peat-disc-135cm-in-usa"
      },
      {
        "name": "Coco Peat Disc 16cm in South Korea",
        "slug": "/coco-peat-disc-16cm-in-south-korea"
      },
      {
        "name": "Coco Peat Disc 22cm in UK",
        "slug": "/coco-peat-disc-22cm-in-uk"
      },
      {
        "name": "Coco Peat Disc 25cm in Australia",
        "slug": "/coco-peat-disc-25cm-in-australia"
      },
      {
        "name": "Coco Peat Disc 30cm in UAE",
        "slug": "/coco-peat-disc-30cm-in-uae"
      },
      {
        "name": "Coco Peat Disc 35cm in Netherlands",
        "slug": "/coco-peat-disc-35cm-in-netherlands"
      },
      {
        "name": "Coco Peat Disc 40cm in Saudi Arabia",
        "slug": "/coco-peat-disc-40cm-in-saudi-arabia"
      },
      {
        "name": "Coco Peat Disc 4cm in Singapore",
        "slug": "/coco-peat-disc-4cm-in-singapore"
      },
      {
        "name": "Coco Peat Disc 6cm in Vietnam",
        "slug": "/coco-peat-disc-6cm-in-vietnam"
      },
      {
        "name": "Coco Peat Disc 7.5cm in Germany",
        "slug": "/coco-peat-disc-7.5cm-in-germany"
      },
      {
        "name": "Custom Size Coco Peat Disc in Spain",
        "slug": "/custom-size-coco-peat-disc-in-spain"
      }
    ]
  },
  {
    "category": "Coco Coir Bricks",
    "links": [
      {
        "name": "Coco Coir Brick Mix 5kg Grade Plus in UK",
        "slug": "/coco-coir-brick-mix-5kg-grade-plus-in-uk"
      },
      {
        "name": "Coco Coir Brick Mix 5kg Grade ++ in South Korea",
        "slug": "/coco-coir-brick-mix-5kg-grade-plus-plus-in-south-korea"
      },
      {
        "name": "Coco Coir Brick Mix 5kg in Spain",
        "slug": "/coco-coir-brick-mix-5kg-in-spain"
      },
      {
        "name": "Premium Coco Coir Brick 5kg Grade Plus in Saudi Arabia",
        "slug": "/premium-coco-coir-brick-5kg-grade-plus-in-saudi-arabia"
      },
      {
        "name": "Premium Coco Coir Brick 5kg Grade ++ in Netherlands",
        "slug": "/premium-coco-coir-brick-5kg-grade-plus-plus-in-netherlands"
      },
      {
        "name": "Premium Coco Coir Brick 5kg in UAE",
        "slug": "/premium-coco-coir-brick-5kg-in-uae"
      },
      {
        "name": "Pro Coco Coir Brick 5kg Grade Plus in Spain",
        "slug": "/pro-coco-coir-brick-5kg-grade-plus-in-spain"
      },
      {
        "name": "Pro Coco Coir Brick 5kg Grade ++ in Saudi Arabia",
        "slug": "/pro-coco-coir-brick-5kg-grade-plus-plus-in-saudi-arabia"
      },
      {
        "name": "Pro Coco Coir Brick 5kg in Australia",
        "slug": "/pro-coco-coir-brick-5kg-in-australia"
      }
    ]
  },
  {
    "category": "Coir Grow Bags",
    "links": [
      {
        "name": "Coco Coir Grow Bags Wholesale",
        "slug": "/coco-coir-grow-bags-wholesale"
      },
      {
        "name": "Buffered Coco Coir Grow Bag 50x20x11 cm in UK",
        "slug": "/buffered-coco-coir-grow-bag-50x20x11-cm-in-uk"
      },
      {
        "name": "Buffered Coco Coir Grow Bag 60x15x10 cm in Singapore",
        "slug": "/buffered-coco-coir-grow-bag-60x15x10-cm-in-singapore"
      },
      {
        "name": "Buffered Coco Coir Grow Bag 72x20x12 cm in Japan",
        "slug": "/buffered-coco-coir-grow-bag-72x20x12-cm-in-japan"
      },
      {
        "name": "Buffered Coco Coir Grow Bag 90x15x12 cm in Spain",
        "slug": "/buffered-coco-coir-grow-bag-90x15x12-cm-in-spain"
      },
      {
        "name": "Buffered Coir Grow Bag 12L (3 Gal) in Australia",
        "slug": "/buffered-coir-grow-bag-12l-3-gal-in-australia"
      },
      {
        "name": "Buffered Coir Grow Bag 15L (4 Gal) in Germany",
        "slug": "/buffered-coir-grow-bag-15l-4-gal-in-germany"
      },
      {
        "name": "Buffered Coir Grow Bag 18L (4.8 Gal) in UK",
        "slug": "/buffered-coir-grow-bag-18l-48-gal-in-uk"
      },
      {
        "name": "Buffered Coir Grow Bag 20L (5 Gal) in USA",
        "slug": "/buffered-coir-grow-bag-20l-5-gal-in-usa"
      },
      {
        "name": "Buffered Coir Grow Bag 25L (6.6 Gal) in UAE",
        "slug": "/buffered-coir-grow-bag-25l-66-gal-in-uae"
      },
      {
        "name": "Natural Coco Coir Grow Bag 50x20x11 cm in Australia",
        "slug": "/natural-coco-coir-grow-bag-50x20x11-cm-in-australia"
      },
      {
        "name": "Natural Coco Coir Grow Bag 60x15x10 cm in Saudi Arabia",
        "slug": "/natural-coco-coir-grow-bag-60x15x10-cm-in-saudi-arabia"
      },
      {
        "name": "Natural Coco Coir Grow Bag 72x20x12 cm in South Korea",
        "slug": "/natural-coco-coir-grow-bag-72x20x12-cm-in-south-korea"
      },
      {
        "name": "Natural Coco Coir Grow Bag 90x15x12 cm in Netherlands",
        "slug": "/natural-coco-coir-grow-bag-90x15x12-cm-in-netherlands"
      },
      {
        "name": "Natural Coir Grow Bag 12L (3 Gal) in Spain",
        "slug": "/natural-coir-grow-bag-12l-3-gal-in-spain"
      },
      {
        "name": "Natural Coir Grow Bag 15L (4 Gal) in Singapore",
        "slug": "/natural-coir-grow-bag-15l-4-gal-in-singapore"
      },
      {
        "name": "Natural Coir Grow Bag 18L (4.8 Gal) in Japan",
        "slug": "/natural-coir-grow-bag-18l-48-gal-in-japan"
      },
      {
        "name": "Natural Coir Grow Bag 20L (5 Gal) in Japan",
        "slug": "/natural-coir-grow-bag-20l-5-gal-in-japan"
      },
      {
        "name": "Natural Coir Grow Bag 25L (6.6 Gal) in Netherlands",
        "slug": "/natural-coir-grow-bag-25l-66-gal-in-netherlands"
      },
      {
        "name": "Washed Coco Coir Grow Bag 50x20x11 cm in USA",
        "slug": "/washed-coco-coir-grow-bag-50x20x11-cm-in-usa"
      },
      {
        "name": "Washed Coco Coir Grow Bag 60x15x10 cm in Vietnam",
        "slug": "/washed-coco-coir-grow-bag-60x15x10-cm-in-vietnam"
      },
      {
        "name": "Washed Coco Coir Grow Bag 72x20x12 cm in UAE",
        "slug": "/washed-coco-coir-grow-bag-72x20x12-cm-in-uae"
      },
      {
        "name": "Washed Coco Coir Grow Bag 90x15x12 cm in Germany",
        "slug": "/washed-coco-coir-grow-bag-90x15x12-cm-in-germany"
      },
      {
        "name": "Washed Coir Grow Bag 12L (3 Gal) in South Korea",
        "slug": "/washed-coir-grow-bag-12l-3-gal-in-south-korea"
      },
      {
        "name": "Washed Coir Grow Bag 15L (4 Gal) in UK",
        "slug": "/washed-coir-grow-bag-15l-4-gal-in-uk"
      },
      {
        "name": "Washed Coir Grow Bag 18L (4.8 Gal) in Vietnam",
        "slug": "/washed-coir-grow-bag-18l-48-gal-in-vietnam"
      },
      {
        "name": "Washed Coir Grow Bag 20L (5 Gal) in Germany",
        "slug": "/washed-coir-grow-bag-20l-5-gal-in-germany"
      },
      {
        "name": "Washed Coir Grow Bag 25L (6.6 Gal) in Saudi Arabia",
        "slug": "/washed-coir-grow-bag-25l-66-gal-in-saudi-arabia"
      }
    ]
  },
  {
    "category": "Coco Coir Grow Cubes",
    "links": [
      {
        "name": "Buffered Coco Coir Grow Cube in Saudi Arabia",
        "slug": "/buffered-coco-coir-grow-cube-in-saudi-arabia"
      },
      {
        "name": "Coco Coir Grow Cube 10x10x7 cm in Vietnam",
        "slug": "/coco-coir-grow-cube-10x10x7-cm-in-vietnam"
      },
      {
        "name": "Coco Coir Grow Cube 7x7x7 cm in Germany",
        "slug": "/coco-coir-grow-cube-7x7x7-cm-in-germany"
      },
      {
        "name": "Coco Coir Propagation Cube in Japan",
        "slug": "/coco-coir-propagation-cube-in-japan"
      },
      {
        "name": "Coco Cube Block 15x10x7 cm in USA",
        "slug": "/coco-cube-block-15x10x7-cm-in-usa"
      },
      {
        "name": "Coco Cube Block 20x10x7 cm in UAE",
        "slug": "/coco-cube-block-20x10x7-cm-in-uae"
      },
      {
        "name": "Custom Coco Coir Grow Cube in Spain",
        "slug": "/custom-coco-coir-grow-cube-in-spain"
      },
      {
        "name": "Hydroponic Coco Coir Grow Cube in South Korea",
        "slug": "/hydroponic-coco-coir-grow-cube-in-south-korea"
      },
      {
        "name": "Natural Coco Coir Cube in Netherlands",
        "slug": "/natural-coco-coir-cube-in-netherlands"
      },
      {
        "name": "Washed Low EC Coco Coir Cube in UK",
        "slug": "/washed-low-ec-coco-coir-cube-in-uk"
      }
    ]
  },
  {
    "category": "Substrate & Planting Mix Bags",
    "links": [
      {
        "name": "Berries Mix Substrate Bag in UK",
        "slug": "/berries-mix-substrate-bag-in-uk"
      },
      {
        "name": "Blueberry Mix Substrate Bag in Singapore",
        "slug": "/blueberry-mix-substrate-bag-in-singapore"
      },
      {
        "name": "Custom Coco Coir Mix Substrate Bag in Spain",
        "slug": "/custom-coco-coir-mix-substrate-bag-in-spain"
      },
      {
        "name": "Flowering Mix Substrate Bag in Netherlands",
        "slug": "/flowering-mix-substrate-bag-in-netherlands"
      },
      {
        "name": "Germination Mix Substrate Bag in South Korea",
        "slug": "/germination-mix-substrate-bag-in-south-korea"
      },
      {
        "name": "Hydroponic Mix Substrate Bag in Saudi Arabia",
        "slug": "/hydroponic-mix-substrate-bag-in-saudi-arabia"
      },
      {
        "name": "Propagation Mix Substrate Bag in Germany",
        "slug": "/propagation-mix-substrate-bag-in-germany"
      },
      {
        "name": "Raspberry Mix Substrate Bag in Vietnam",
        "slug": "/raspberry-mix-substrate-bag-in-vietnam"
      },
      {
        "name": "Strawberry Mix Substrate Bag in Australia",
        "slug": "/strawberry-mix-substrate-bag-in-australia"
      },
      {
        "name": "Vegetation Mix Substrate Bag in UAE",
        "slug": "/vegetation-mix-substrate-bag-in-uae"
      }
    ]
  },
  {
    "category": "Coir Fiber Bales, Ropes & Blankets",
    "links": [
      {
        "name": "Brown Coir Fiber Bale in Singapore",
        "slug": "/brown-coir-fiber-bale-in-singapore"
      },
      {
        "name": "Coconut Coir Twine Rope in Saudi Arabia",
        "slug": "/coconut-coir-twine-rope-in-saudi-arabia"
      },
      {
        "name": "Coir Erosion Control Blanket in UK",
        "slug": "/coir-erosion-control-blanket-in-uk"
      },
      {
        "name": "Coir Erosion Control Log in USA",
        "slug": "/coir-erosion-control-log-in-usa"
      },
      {
        "name": "Curled Coconut Coir Rope in USA",
        "slug": "/curled-coconut-coir-rope-in-usa"
      },
      {
        "name": "Geotextile Grade Coir Fiber Bale in Vietnam",
        "slug": "/geotextile-grade-coir-fiber-bale-in-vietnam"
      },
      {
        "name": "Mattress Grade Coir Fiber Bale in South Korea",
        "slug": "/mattress-grade-coir-fiber-bale-in-south-korea"
      },
      {
        "name": "Twisted Coconut Coir Rope in UAE",
        "slug": "/twisted-coconut-coir-rope-in-uae"
      },
      {
        "name": "White Coir Fiber Bale in Saudi Arabia",
        "slug": "/white-coir-fiber-bale-in-saudi-arabia"
      }
    ]
  },
  {
    "category": "Briquettes & Wholesale Substrates",
    "links": [
      {
        "name": "Blueberry Discs in Coimbatore",
        "slug": "/blueberry-discs-in-coimbatore"
      },
      {
        "name": "Buy Cocopeat in New York",
        "slug": "/buy-cocopeat-new-york"
      },
      {
        "name": "Coco Coir Briquettes Bulk",
        "slug": "/coco-coir-briquettes-bulk"
      },
      {
        "name": "Coco Coir Wholesale Supplier USA",
        "slug": "/coco-coir-wholesale-supplier-usa"
      },
      {
        "name": "Buffered Coco Husk Chips Briquette in USA",
        "slug": "/buffered-coco-husk-chips-briquette-usa"
      },
      {
        "name": "Coco Husk Chips Briquette in Germany",
        "slug": "/coco-husk-chips-briquette-germany"
      },
      {
        "name": "Natural Coco Peat Briquette in Australia",
        "slug": "/natural-coco-peat-briquette-australia"
      },
      {
        "name": "Natural+ Coco Peat Briquette in Saudi Arabia",
        "slug": "/natural-plus-coco-peat-briquette-saudi-arabia"
      },
      {
        "name": "Washed Coco Husk Chips Briquette in UK",
        "slug": "/washed-coco-husk-chips-briquette-uk"
      }
    ]
  }
];

const SEOInternalLinks = () => {
  return (
    <section 
      aria-label="SEO Product and Country Directory" 
      className="bg-[#121e12] border-t border-white/10 text-stone-300 py-10 sm:py-12"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 border-b border-white/10 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 block mb-1">
            Global Product Directory
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-poppins text-white tracking-tight">
            Popular Searches &amp; International Coir Substrates
          </h2>
          <p className="mt-2 text-xs text-stone-400 max-w-4xl leading-relaxed">
            Browse Cocoveera&apos;s export-grade coconut coir substrates, compressed blocks, grow bags, cubes, and erosion control media customized for commercial horticulture, berry cultivation, and greenhouse growers worldwide.
          </p>
        </div>

        {/* Categorized Inline Links */}
        <div className="space-y-4">
          {LINK_GROUPS.map((group, groupIdx) => (
            <div 
              key={groupIdx} 
              className="border-b border-white/5 pb-3.5 last:border-b-0 last:pb-0"
            >
              <div className="text-[11.5px] sm:text-xs leading-relaxed text-stone-400 flex flex-wrap items-baseline">
                {/* Category Label */}
                <strong className="text-emerald-400 font-semibold mr-2 shrink-0">
                  {group.category}:
                </strong>

                {/* Inline Keyword Links with | Separator */}
                <div className="inline">
                  {group.links.map((link, linkIdx) => (
                    <React.Fragment key={link.slug || linkIdx}>
                      <Link
                        to={link.slug}
                        className="text-stone-300 hover:text-white hover:text-emerald-300 transition-colors duration-150 inline-block py-0.5"
                      >
                        {link.name}
                      </Link>
                      {linkIdx < group.links.length - 1 && (
                        <span 
                          className="text-stone-600 mx-2 select-none inline-block font-light" 
                          aria-hidden="true"
                        >
                          |
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SEOInternalLinks;
