import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  { name: 'Cocopeat Blocks', description: 'Premium cocopeat blocks' },
  { name: 'Growbags', description: 'High quality growbags' },
  { name: 'Open Top Grow Bags', description: 'Open top grow bags for plants' },
  { name: 'Substrate Bags', description: 'Large capacity substrate bags' },
  { name: 'Coco Cubes', description: 'Coco cubes for propagation and growth' },
  { name: 'Blueberry Discs', description: 'Specially designed discs for blueberries' },
  { name: 'Briquettes', description: 'Compact cocopeat briquettes' },
  { name: 'Curled Coir Ropes', description: 'Durable curled coir ropes' },
  { name: 'Coir Fiber Bales', description: 'Premium quality coir fiber bales' },
  { name: 'Erosion Control Nets & Logs', description: 'Effective erosion control nets and logs' },
  { name: 'Erosion Control Blankets', description: 'Coir blankets for soil erosion prevention' },
  { name: 'Coir Weed Caps', description: 'Effective weed control caps' }
];

const productsData = [
  // 1. Cocopeat Blocks (30)
  ...['Natural 650g', 'Natural 1kg', 'Natural 2kg', 'Natural 3kg', 'Natural 4kg', 'Natural 4.5kg', 'Natural 5kg', 'Natural+ Washed 650g', 'Natural+ Washed 1kg', 'Natural+ Washed 2kg', 'Natural+ Washed 3kg', 'Natural+ Washed 4kg', 'Natural+ Washed 4.5kg', 'Natural+ Washed 5kg', 'Natural++ Buffered 650g', 'Natural++ Buffered 1kg', 'Natural++ Buffered 2kg', 'Natural++ Buffered 3kg', 'Natural++ Buffered 4kg', 'Natural++ Buffered 4.5kg', 'Natural++ Buffered 5kg', 'Mix 5kg', 'Mix+ 5kg', 'Mix++ 5kg', 'Pro 5kg', 'Pro+ 5kg', 'Pro++ 5kg', 'Premium 5kg', 'Premium+ 5kg', 'Premium++ 5kg'].map(name => ({ name, categoryName: 'Cocopeat Blocks' })),

  // 2. Growbags (50)
  ...['50x20x11 Natural', '50x20x11 Washed', '50x20x11 Buffered', '60x15x10 Natural', '60x15x10 Washed', '60x15x10 Buffered', '72x20x12 Natural', '72x20x12 Washed', '72x20x12 Buffered', '90x15x12 Natural', '90x15x12 Washed', '90x15x12 Buffered', '96x15x9 Natural', '96x15x9 Washed', '96x15x9 Buffered', '100x15x10 Natural', '100x15x10 Washed', '100x15x10 Buffered', '100x18x16.5 Natural', '100x18x16.5 Washed', '100x18x16.5 Buffered', '100x20x13.5 Natural', '100x20x13.5 Washed', '100x20x13.5 Buffered', '100x22x10 Natural', '100x22x10 Washed', '100x22x10 Buffered', '120x15x10 Natural', '120x15x10 Washed', '120x15x10 Buffered', 'Strawberry Growbag', 'Tomato Growbag', 'Cucumber Growbag', 'Bell Pepper Growbag', 'Lettuce Growbag', 'Blueberry Growbag', 'Raspberry Growbag', 'Cannabis Growbag', 'Rose Growbag', 'Gerbera Growbag', 'Nursery Growbag', 'Hydroponic Growbag', 'Open Bottom Growbag', 'Closed Bottom Growbag', 'UV Stabilized Growbag', 'Multi Drain Growbag', 'Premium Growbag', 'Pro Growbag', 'Supreme Growbag', 'Custom Growbag'].map(name => ({ name, categoryName: 'Growbags' })),

  // 3. Open Top Grow Bags (15)
  ...['12L Natural', '12L Washed', '12L Buffered', '15L Natural', '15L Washed', '15L Buffered', '18L Natural', '18L Washed', '18L Buffered', '20L Natural', '20L Washed', '20L Buffered', '25L Natural', '25L Washed', '25L Buffered'].map(name => ({ name, categoryName: 'Open Top Grow Bags' })),

  // 4. Substrate Bags (10)
  ...['Germination Mix', 'Propagation Mix', 'Vegetation Mix', 'Flowering Mix', 'Berries Mix', 'Blueberry Mix', 'Raspberry Mix', 'Strawberry Mix', 'Hydroponic Mix', 'Tailor Made Mix'].map(name => ({ name, categoryName: 'Substrate Bags' })),

  // 5. Coco Cubes (10)
  ...['7x7x7 cm', '10x10x7 cm', '15x10x7 cm', '20x10x7 cm', 'Natural Cube', 'Washed Cube', 'Buffered Cube', 'Propagation Cube', 'Hydroponic Cube', 'Custom Cube'].map(name => ({ name, categoryName: 'Coco Cubes' })),

  // 6. Blueberry Discs (12)
  ...['4 cm', '6 cm', '7.5 cm', '10 cm', '13.5 cm', '16 cm', '22 cm', '25 cm', '30 cm', '35 cm', '40 cm', 'Custom Pot Disc'].map(name => ({ name, categoryName: 'Blueberry Discs' })),

  // 7. Briquettes (6)
  ...['Natural Briquette', 'Natural+ Briquette', 'Natural++ Briquette', 'Coco Chips Briquette', 'Washed Chips Briquette', 'Buffered Chips Briquette'].map(name => ({ name, categoryName: 'Briquettes' })),

  // 8. Curled Coir Ropes (3)
  ...['Curled Coir Rope', 'Twisted Coir Rope', 'Coir Twine Rope'].map(name => ({ name, categoryName: 'Curled Coir Ropes' })),

  // 9. Coir Fiber Bales (4)
  ...['Brown Coir Fiber Bale', 'White Coir Fiber Bale', 'Mattress Grade Fiber', 'Geo Textile Fiber'].map(name => ({ name, categoryName: 'Coir Fiber Bales' })),

  // 10. Erosion Control Nets & Logs (1)
  { name: 'Coir Erosion Control Log', categoryName: 'Erosion Control Nets & Logs' },

  // 11. Erosion Control Blankets (1)
  { name: 'Coir Erosion Control Blanket', categoryName: 'Erosion Control Blankets' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    // 1. Clear existing Data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing Products and Categories');

    // 2. Insert Categories
    const insertedCategories = [];
    for (const cat of categories) {
      const newCat = await Category.create(cat);
      insertedCategories.push(newCat);
    }
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Build map of category name to category name for validation
    const categoryNames = insertedCategories.map(c => c.name);

    // 3. Prepare Products Data
    const productsToInsert = productsData.map(p => {
      if (!categoryNames.includes(p.categoryName)) {
        console.warn(`Warning: Category ${p.categoryName} not found for product ${p.name}`);
      }

      // Try to parse weight from string like "5kg" or "650g"
      let weight = 5;
      if (p.name.includes('kg')) {
        const match = p.name.match(/(\d+(\.\d+)?)kg/);
        if (match) weight = parseFloat(match[1]);
      } else if (p.name.includes('g')) {
         const match = p.name.match(/(\d+)g/);
         if (match) weight = parseInt(match[1]) / 1000;
      } else if (p.name.includes('L')) {
         const match = p.name.match(/(\d+)L/);
         if (match) weight = parseInt(match[1]) * 0.5; // dummy conversion
      }

      const fullName = p.name.includes(p.categoryName) ? p.name : `${p.name} ${p.categoryName}`;

      const baseSlug = fullName
        .toLowerCase()
        .replace(/\+/g, '-plus')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      return {
        name: fullName,
        slug: baseSlug,
        description: `Premium quality ${p.name} designed for optimal growth and sustainability.`,
        category: p.categoryName, // Since Schema uses String for category, not ObjectId
        packageSize: p.name.includes('L') ? p.name.split(' ')[0] : 'Standard packaging',
        weight: weight,
        price: 1000,
        stock: 500,
        isPublished: true,
        images: ['https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=800&q=80']
      };
    });

    // 4. Insert Products
    const insertedProducts = [];
    for (const prod of productsToInsert) {
      const newProd = await Product.create(prod);
      insertedProducts.push(newProd);
    }
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
