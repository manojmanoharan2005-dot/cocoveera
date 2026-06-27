import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://cocoveera.onrender.com/api';
const BASE_URL = 'https://cocoveera.com';

const STATIC_ROUTES = [
  '/',
  '/about',
  '/products',
  '/contact',
  '/production-process',
  '/global-network'
];

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

function generateXml(staticRoutes, dynamicRoutes) {
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  const date = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  allRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}

async function generateSitemap() {
  console.log('Generating sitemap...');
  const products = await fetchProducts();
  
  // Note: Adjusting the product path to how it's handled in the app.
  const dynamicRoutes = products.map(product => `/account/product/${product._id}`);
  
  const xml = generateXml(STATIC_ROUTES, dynamicRoutes);
  
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log(`Sitemap generated successfully with ${STATIC_ROUTES.length + dynamicRoutes.length} URLs.`);
}

generateSitemap();
