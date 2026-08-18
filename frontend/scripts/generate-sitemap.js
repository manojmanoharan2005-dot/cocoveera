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

async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

function generateXml(pages) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  pages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page.route}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}

async function generateSitemap() {
  console.log('Generating sitemap...');
  const products = await fetchProducts();
  
  const buildDate = new Date().toISOString();
  
  const staticPages = [
    { route: '/', priority: '1.0', changefreq: 'daily', lastmod: buildDate },
    { route: '/about', priority: '0.8', changefreq: 'weekly', lastmod: buildDate },
    { route: '/products', priority: '0.8', changefreq: 'daily', lastmod: buildDate },
    { route: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: buildDate },
    { route: '/production-process', priority: '0.8', changefreq: 'monthly', lastmod: buildDate },
    { route: '/global-network', priority: '0.8', changefreq: 'monthly', lastmod: buildDate },
    { route: '/how-it-works', priority: '0.8', changefreq: 'monthly', lastmod: buildDate },
    { route: '/privacy-policy', priority: '0.5', changefreq: 'yearly', lastmod: buildDate },
    { route: '/terms-conditions', priority: '0.5', changefreq: 'yearly', lastmod: buildDate },
    { route: '/blueberry-discs-in-coimbatore', priority: '0.8', changefreq: 'weekly', lastmod: buildDate }
  ];
  
  const productPages = products.map(product => {
    const slug = product.slug || generateSlug(product.name) || product._id;
    const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString() : buildDate;
    return {
      route: `/products/${slug}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod
    };
  });
  
  const allPages = [...staticPages, ...productPages];
  const xml = generateXml(allPages);
  
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log(`Sitemap generated successfully with ${allPages.length} URLs.`);
}

generateSitemap();
