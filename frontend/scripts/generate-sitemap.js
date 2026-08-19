import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://cocoveera.onrender.com/api';
const BASE_URL = 'https://cocoveera.com';

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
  const [products, categories] = await Promise.all([
    fetchData('products'),
    fetchData('categories')
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
    '/blueberry-discs-in-coimbatore'
  ];

  // Category pages
  const categoryPages = [];
  const categoryNames = new Set();
  categories.forEach(c => {
    if (c.name) categoryNames.add(c.name.trim());
  });
  categoryNames.forEach(catName => {
    categoryPages.push(`/products?category=${encodeURIComponent(catName)}`);
  });

  // Product pages (Canonical path: /product/slug)
  const productPages = products.map(product => {
    const slug = product.slug || generateSlug(product.name) || product._id;
    return `/product/${slug}`;
  });

  // Deduplicate and filter valid public routes
  const allUrls = Array.from(new Set([...staticPages, ...categoryPages, ...productPages]));
  const xml = generateXml(allUrls);

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log(`Sitemap generated successfully with ${allUrls.length} URLs.`);
}

generateSitemap();

