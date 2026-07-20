/**
 * File: backend/utils/initCategoryOrdering.js
 * Purpose: Ensures categories in MongoDB strictly adhere to production order,
 * placing DEMO at the end of existing categories, and maintaining persistent displayOrder.
 */
import Category from '../models/Category.js';

// Production category order requested:
const INITIAL_CATEGORY_ORDER = [
  'Coco Cubes',
  'Coir Fiber Bales',
  'Substrate Bags',
  'Erosion Control Nets & Logs',
  'Blueberry Discs',
  'Erosion Control Blankets',
  'Briquettes',
  'Open Top Grow Bags',
  'Curled Coir Ropes',
  'Cocopeat Blocks',
  'Growbags',
  'DEMO' // DEMO is placed at the end of existing categories!
];

export const initCategoryOrdering = async () => {
  try {
    const categories = await Category.find({});
    if (!categories || categories.length === 0) return;

    const existingMap = new Map();
    categories.forEach(cat => {
      existingMap.set(cat.name.toLowerCase(), cat);
    });

    let currentOrder = 1;

    // 1. Assign displayOrder for initial production categories
    for (const name of INITIAL_CATEGORY_ORDER) {
      const cat = existingMap.get(name.toLowerCase());
      if (cat) {
        cat.displayOrder = currentOrder++;
        await cat.save();
        existingMap.delete(name.toLowerCase());
      }
    }

    // 2. Assign displayOrder for any other categories currently in DB
    const remainingCats = Array.from(existingMap.values()).sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    for (const cat of remainingCats) {
      cat.displayOrder = currentOrder++;
      await cat.save();
    }

    console.log('[CategoryOrdering] Categories displayOrder successfully verified & updated.');
  } catch (err) {
    console.error('[CategoryOrdering] Failed to initialize category ordering:', err.message);
  }
};
