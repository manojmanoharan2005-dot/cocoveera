import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://cocoveera.onrender.com/api';
const BASE_URL = 'https://www.cocoveera.com';

function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`);
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching ${endpoint} for sitemap:`, error);
    return [];
  }
}

function generateXml(urls) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  urls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${url}</loc>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}

async function generateSitemap() {
  console.log('Generating sitemap...');
  const [products] = await Promise.all([
    fetchData('products')
  ]);

    const staticPages = [
    '/',
    '/about',
    '/products',
    '/contact',
    '/production-process',
    '/global-network',
    '/how-it-works',
    '/privacy-policy',
    '/terms-conditions',
    '/berries-mix-substrate-bag-in-uk',
    '/blueberry-discs-in-coimbatore',
    '/blueberry-mix-substrate-bag-in-singapore',
    '/brown-coir-fiber-bale-in-singapore',
    '/buffered-coco-coir-grow-bag-50x20x11-cm-in-uk',
    '/buffered-coco-coir-grow-bag-60x15x10-cm-in-singapore',
    '/buffered-coco-coir-grow-bag-72x20x12-cm-in-japan',
    '/buffered-coco-coir-grow-bag-90x15x12-cm-in-spain',
    '/buffered-coco-coir-grow-cube-in-saudi-arabia',
    '/buffered-coco-husk-chips-briquette-usa',
    '/buffered-coco-peat-block-1kg-in-japan',
    '/buffered-coco-peat-block-2kg-in-spain',
    '/buffered-coco-peat-block-3kg-in-japan',
    '/buffered-coco-peat-block-4.5kg-in-singapore',
    '/buffered-coco-peat-block-4kg-in-usa',
    '/buffered-coco-peat-block-5kg-in-germany',
    '/buffered-coco-peat-block-650g-in-uae',
    '/buffered-coir-grow-bag-12l-3-gal-in-australia',
    '/buffered-coir-grow-bag-15l-4-gal-in-germany',
    '/buffered-coir-grow-bag-18l-48-gal-in-uk',
    '/buffered-coir-grow-bag-20l-5-gal-in-usa',
    '/buffered-coir-grow-bag-25l-66-gal-in-uae',
    '/buy-cocopeat-new-york',
    '/coco-coir-brick-mix-5kg-grade-plus-in-uk',
    '/coco-coir-brick-mix-5kg-grade-plus-plus-in-south-korea',
    '/coco-coir-brick-mix-5kg-in-spain',
    '/coco-coir-briquettes-bulk',
    '/coco-coir-grow-bags-wholesale',
    '/coco-coir-grow-cube-10x10x7-cm-in-vietnam',
    '/coco-coir-grow-cube-7x7x7-cm-in-germany',
    '/coco-coir-propagation-cube-in-japan',
    '/coco-coir-wholesale-supplier-usa',
    '/coco-cube-block-15x10x7-cm-in-usa',
    '/coco-cube-block-20x10x7-cm-in-uae',
    '/coco-husk-chips-briquette-germany',
    '/coco-peat-disc-10cm-in-japan',
    '/coco-peat-disc-135cm-in-usa',
    '/coco-peat-disc-16cm-in-south-korea',
    '/coco-peat-disc-22cm-in-uk',
    '/coco-peat-disc-25cm-in-australia',
    '/coco-peat-disc-30cm-in-uae',
    '/coco-peat-disc-35cm-in-netherlands',
    '/coco-peat-disc-40cm-in-saudi-arabia',
    '/coco-peat-disc-4cm-in-singapore',
    '/coco-peat-disc-6cm-in-vietnam',
    '/coco-peat-disc-7.5cm-in-germany',
    '/coconut-coir-twine-rope-in-saudi-arabia',
    '/cocopeat-blocks-wholesale-usa',
    '/coir-erosion-control-blanket-in-uk',
    '/coir-erosion-control-log-in-usa',
    '/curled-coconut-coir-rope-in-usa',
    '/custom-coco-coir-grow-cube-in-spain',
    '/custom-coco-coir-mix-substrate-bag-in-spain',
    '/custom-size-coco-peat-disc-in-spain',
    '/flowering-mix-substrate-bag-in-netherlands',
    '/geotextile-grade-coir-fiber-bale-in-vietnam',
    '/germination-mix-substrate-bag-in-south-korea',
    '/hydroponic-coco-coir-grow-cube-in-south-korea',
    '/hydroponic-mix-substrate-bag-in-saudi-arabia',
    '/mattress-grade-coir-fiber-bale-in-south-korea',
    '/natural-coco-coir-cube-in-netherlands',
    '/natural-coco-coir-grow-bag-50x20x11-cm-in-australia',
    '/natural-coco-coir-grow-bag-60x15x10-cm-in-saudi-arabia',
    '/natural-coco-coir-grow-bag-72x20x12-cm-in-south-korea',
    '/natural-coco-coir-grow-bag-90x15x12-cm-in-netherlands',
    '/natural-coco-peat-block-1kg-in-vietnam',
    '/natural-coco-peat-block-2kg-in-singapore',
    '/natural-coco-peat-block-3kg-in-uk',
    '/natural-coco-peat-block-45kg-in-netherlands',
    '/natural-coco-peat-block-4kg-in-south-korea',
    '/natural-coco-peat-block-5kg-in-usa',
    '/natural-coco-peat-block-650g-in-saudi-arabia',
    '/natural-coco-peat-briquette-australia',
    '/natural-coir-grow-bag-12l-3-gal-in-spain',
    '/natural-coir-grow-bag-15l-4-gal-in-singapore',
    '/natural-coir-grow-bag-18l-48-gal-in-japan',
    '/natural-coir-grow-bag-20l-5-gal-in-japan',
    '/natural-coir-grow-bag-25l-66-gal-in-netherlands',
    '/natural-plus-coco-peat-briquette-saudi-arabia',
    '/premium-coco-coir-brick-5kg-grade-plus-in-saudi-arabia',
    '/premium-coco-coir-brick-5kg-grade-plus-plus-in-netherlands',
    '/premium-coco-coir-brick-5kg-in-uae',
    '/pro-coco-coir-brick-5kg-grade-plus-in-spain',
    '/pro-coco-coir-brick-5kg-grade-plus-plus-in-saudi-arabia',
    '/pro-coco-coir-brick-5kg-in-australia',
    '/propagation-mix-substrate-bag-in-germany',
    '/raspberry-mix-substrate-bag-in-vietnam',
    '/strawberry-mix-substrate-bag-in-australia',
    '/twisted-coconut-coir-rope-in-uae',
    '/vegetation-mix-substrate-bag-in-uae',
    '/washed-coco-coir-grow-bag-50x20x11-cm-in-usa',
    '/washed-coco-coir-grow-bag-60x15x10-cm-in-vietnam',
    '/washed-coco-coir-grow-bag-72x20x12-cm-in-uae',
    '/washed-coco-coir-grow-bag-90x15x12-cm-in-germany',
    '/washed-coco-husk-chips-briquette-uk',
    '/washed-coir-grow-bag-12l-3-gal-in-south-korea',
    '/washed-coir-grow-bag-15l-4-gal-in-uk',
    '/washed-coir-grow-bag-18l-48-gal-in-vietnam',
    '/washed-coir-grow-bag-20l-5-gal-in-germany',
    '/washed-coir-grow-bag-25l-66-gal-in-saudi-arabia',
    '/washed-low-ec-coco-coir-cube-in-uk',
    '/washed-low-ec-coco-peat-block-1kg-in-germany',
    '/washed-low-ec-coco-peat-block-2kg-in-vietnam',
    '/washed-low-ec-coco-peat-block-3kg-in-germany',
    '/washed-low-ec-coco-peat-block-4.5kg-in-uae',
    '/washed-low-ec-coco-peat-block-4kg-in-australia',
    '/washed-low-ec-coco-peat-block-5kg-in-netherlands',
    '/washed-low-ec-coco-peat-block-650g-in-japan',
    '/white-coir-fiber-bale-in-saudi-arabia'
  ];

  // Product pages (Canonical path: /product/slug)
  // Exclude demo, test, inactive, or deleted products
  const productPages = products
    .filter(product => {
      if (!product || product.isActive === false || product.isDeleted) return false;
      const slug = (product.slug || generateSlug(product.name) || '').toLowerCase();
      const name = (product.name || '').toLowerCase();
      if (slug.includes('demo') || slug.includes('test') || name.includes('demo') || name.includes('test')) {
        return false;
      }
      return slug.length > 0;
    })
    .map(product => {
      const slug = product.slug || generateSlug(product.name) || product._id;
      return `/product/${slug}`;
    });

  // If product fetch fails or returns empty (e.g. offline build), preserve existing product URLs from current sitemap.xml
  let fallbackProductPages = [];
  const publicDir = path.resolve(__dirname, '../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  if (productPages.length === 0 && fs.existsSync(sitemapPath)) {
    try {
      const existingXml = fs.readFileSync(sitemapPath, 'utf8');
      const matches = [...existingXml.matchAll(/<loc>https?:\/\/[^\/]+(\/product\/[^<]+)<\/loc>/g)];
      fallbackProductPages = matches.map(m => m[1]);
      console.log(`Preserved ${fallbackProductPages.length} existing product URLs from previous sitemap.`);
    } catch (e) {
      console.warn('Could not read existing sitemap for fallback:', e.message);
    }
  }

  const finalProductPages = productPages.length > 0 ? productPages : fallbackProductPages;

  // Deduplicate and filter valid public routes
  const allUrls = Array.from(new Set([...staticPages, ...finalProductPages]));
  const xml = generateXml(allUrls);

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    fs.writeFileSync(sitemapPath, xml);
    console.log(`Sitemap generated successfully with ${allUrls.length} URLs.`);
  } catch (err) {
    if (fs.existsSync(sitemapPath)) {
      console.warn(`Warning: Could not overwrite sitemap.xml (${err.message}). Existing sitemap preserved.`);
    } else {
      throw err;
    }
  }
}

generateSitemap();


