import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Container from './models/Container.js';
import Product from './models/Product.js';

dotenv.config();

const seedContainerProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    const containers = await Container.find({});
    console.log(`Found ${containers.length} containers`);

    for (const container of containers) {
      let loadedProducts = [];
      let totalWeight = 0;
      let totalVolume = 0;

      // Distribute products evenly
      // Let's add 10 of each product just for demo, or calculate based on weight
      for (const product of products) {
        const qty = 50; // Arbitrary quantity
        const weight = (product.weight || 1) * qty; 
        // approximate volume: 1 kg = 0.002 CBM
        const volume = (product.length * product.width * product.height / 1000000) * qty || (weight * 0.002);

        loadedProducts.push({
          productName: product.name,
          quantity: qty,
          actualWeight: weight,
          actualVolume: volume
        });

        totalWeight += weight;
        totalVolume += volume;
      }

      container.loadedProducts = loadedProducts;
      container.currentWeight = totalWeight;
      container.currentVolume = totalVolume;
      container.remainingWeight = Math.max(0, container.maxWeight - totalWeight);
      container.remainingVolume = Math.max(0, container.maxVolume - totalVolume);
      
      const utilWeight = (totalWeight / container.maxWeight) * 100;
      const utilVol = (totalVolume / container.maxVolume) * 100;
      container.utilizationPercentage = Math.min(100, Math.max(utilWeight, utilVol));
      container.status = 'Loading';

      await container.save();
      console.log(`Updated container ${container.containerNumber}`);
    }

    console.log('Finished populating containers with products.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding container products:', error);
    process.exit(1);
  }
};

seedContainerProducts();
