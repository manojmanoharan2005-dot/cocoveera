import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { securitySanitizers } from './middleware/sanitize.js';

import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
// import shippingRoutes from './routes/shippingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import testingRoutes from './routes/testingRoutes.js';

// Models for seeding
import Product from './models/Product.js';
import User from './models/User.js';

const app = express();

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

app.use(limiter);

// Compression Middleware
app.use(compression());

// Security Middlewares
// Helmet with stricter Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173', 'https:'],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
  })
);
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://cocoveera.vercel.app',
  'https://cocoveera-wwre.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    try {
      const hostname = new URL(origin).hostname;
      const isLocal = /^localhost$|^127\.\d+\.\d+\.\d+$|^192\.168\.\d+\.\d+$|^10\.\d+\.\d+\.\d+$|^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$|\.local$/i.test(hostname);
      if (isLocal) {
        return callback(null, true);
      }
    } catch (e) {}
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));



// Body Parser
app.use(express.json({ limit: '100kb' }));

// Sanitization against NoSQL injection and XSS
securitySanitizers.forEach(mw => app.use(mw));

// Routes
// Apply auth rate limiter to auth endpoints
app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refunds', refundRoutes);
// app.use('/api/shipping', shippingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/testing', testingRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Cocoveera API is running successfully' });
});

// Health ping route to keep Render awake
app.get('/api/ping', (req, res) => {
  res.status(200).json({ success: true, message: 'pong' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database & Boot Server
const startServer = async () => {
  await connectDB();
  
  // Seed Database if empty
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database empty. Seeding Sai Cocopeat products...');

    const mockProducts = [
      {
        name: 'Sai Substrates Growbags',
        description: 'Specially formulated growbags packed in UV-resistant co-extruded LDPE bags. Available in customized sizes and drainage configurations for hydroponic berries, tomatoes, and cucumbers.',
        category: 'Grow Bags',
        specifications: {
          ph: '5.5 - 6.5',
          ec: '< 0.5 - 0.8 mS/cm',
          moisture: '18% - 22%',
          compressionRatio: '3:1',
          fiberLength: 'Under 3cm',
          expansionVolume: '12 Liters/kg',
          sandContent: '< 2%'
        },
        packageSize: '100cm x 15cm x 10cm Slabs (LDPE)',
        price: 420,
        stock: 300,
        images: ['https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=800&q=80'],
        benefits: ['Double sieved to remove fine particles', 'UV-stabilized co-extruded plastic covers', 'Optimized air-to-water ratio'],
        applications: ['Hydroponic Tomatoes', 'Strawberry Gutters', 'Cucumber greenhouse slabs']
      },
      {
        name: 'OMRI-Certified Coir Pith Blocks',
        description: 'Flagship organic growing medium made of sieved, low-EC coir pith. Ideal soil amendment or soil-less culture base for large-scale commercial nursery operators.',
        category: 'Coir Pith Blocks',
        specifications: {
          ph: '5.6 - 6.5',
          ec: '< 0.5 mS/cm',
          moisture: '15% - 20%',
          compressionRatio: '5:1',
          fiberLength: 'Under 2cm',
          expansionVolume: '15 Liters/kg',
          sandContent: '< 1.5%'
        },
        packageSize: '5kg Blocks (Palletized)',
        price: 310,
        stock: 500,
        images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'],
        benefits: ['OMRI-listed organic certified', 'Double sieved dust free', 'Excellent moisture buffering capacity'],
        applications: ['Commercial nurseries', 'Potting soil blends', 'Golf course turf topdressing']
      },
      {
        name: 'Specialized Coir Discs',
        description: 'Custom-compressed discs designed for container plants and propagation. Ensures excellent root expansion, rapid drainage, and easy transplantation.',
        category: 'Coir Discs',
        specifications: {
          ph: '5.4 - 6.0',
          ec: '< 0.5 mS/cm',
          moisture: '12% - 15%',
          compressionRatio: '6:1',
          fiberLength: 'Under 1cm',
          expansionVolume: '8 Liters/disc',
          sandContent: '< 1%'
        },
        packageSize: '10cm to 15cm Diameter (Cartons)',
        price: 350,
        stock: 800,
        images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'],
        benefits: ['Prevents weed growth in container pots', 'Perfect for automatic potting lines', 'Encourages air-pruning of roots'],
        applications: ['Blueberry cultivation pots', 'Gerbera floriculture', 'Tree nurseries']
      },
      {
        name: 'Erosion Control Coir Logs',
        description: 'Sturdy biodegradable wattles stuffed with dense matured coir fiber. Provides structural stability to embankments, shorelines, and steep slopes while allowing vegetation growth.',
        category: 'Erosion Control',
        specifications: {
          ph: '6.0 - 7.2',
          ec: '< 1.2 mS/cm',
          moisture: '15% Max',
          compressionRatio: 'N/A',
          fiberLength: '10cm to 20cm',
          expansionVolume: 'N/A',
          sandContent: '< 3%'
        },
        packageSize: '3m Long x 30cm Diameter Logs',
        price: 260,
        stock: 250,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
        benefits: ['100% biodegradable organic structure', 'Excellent water velocity absorption', 'Supports native plant root embedding'],
        applications: ['Riverbank restoration', 'Slope stabilization', 'Construction sediment control']
      },
      {
        name: 'Erosion Control Coir Blankets & Nets',
        description: 'Woven coir netting and blankets engineered for soil containment and vegetation establishment on highway slopes and river drainage channels.',
        category: 'Erosion Control',
        specifications: {
          ph: '6.0 - 7.0',
          ec: '< 1.5 mS/cm',
          moisture: '15% Max',
          compressionRatio: 'N/A',
          fiberLength: '12cm to 20cm',
          expansionVolume: 'N/A',
          sandContent: '< 3%'
        },
        packageSize: '2m x 50m Rolls',
        price: 240,
        stock: 400,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
        benefits: ['Controls erosion up to 5 growing seasons', 'High tensile strength coir yarn', 'Protects seeds from washouts'],
        applications: ['Hillside erosion blankets', 'Highway slopes vegetation', 'Landscaping design']
      },
      {
        name: 'Coco Peat Briquettes',
        description: 'Standard nursery-grade small coco peat bricks. Easy to handle and rehydrate, ideal soil amendment for retail garden centers and hobbyists.',
        category: 'Hobby Gardening',
        specifications: {
          ph: '5.7 - 6.8',
          ec: '< 0.6 mS/cm',
          moisture: '12% - 15%',
          compressionRatio: '8:1',
          fiberLength: 'Under 1cm',
          expansionVolume: '9 Liters/brick',
          sandContent: '< 1%'
        },
        packageSize: '650g Briquettes (Shrink Wrapped)',
        price: 510,
        stock: 1200,
        images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'],
        benefits: ['Retail packaged', 'Expands in minutes with water', 'Enhances moisture retention in soil mixes'],
        applications: ['Potted house plants', 'Hanging baskets soil base', 'Seed starter plugs']
      },
      {
        name: 'Natural Matured Coir Fiber Bales',
        description: 'High tensile strength matured golden-brown coir fiber. Extracted from coconut husks, widely used in mattresses, drainage liners, and industrial insulation.',
        category: 'Other Coir Products',
        specifications: {
          ph: '6.0 - 7.0',
          ec: '< 1.5 mS/cm',
          moisture: '15% Max',
          compressionRatio: '2:1',
          fiberLength: '5cm to 15cm',
          expansionVolume: 'N/A',
          sandContent: '< 3%'
        },
        packageSize: '120kg Bales',
        price: 280,
        stock: 450,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
        benefits: ['Matured decay-resistant coconut fiber', 'Excellent sound and thermal insulation', '100% organic stuffing raw material'],
        applications: ['Mattress upholstery', 'Horticulture basket lining', 'Industrial filtration liners']
      },
      {
        name: 'Curled Coir Ropes',
        description: 'Mechanically spun curled coir twine. Excellent elasticity and flexibility, commonly used in spring mattress backing, acoustic panel insulation, and gardening.',
        category: 'Other Coir Products',
        specifications: {
          ph: '6.0 - 7.0',
          ec: '< 1.5 mS/cm',
          moisture: '15% Max',
          compressionRatio: 'N/A',
          fiberLength: '5cm to 12cm',
          expansionVolume: 'N/A',
          sandContent: '< 2%'
        },
        packageSize: '30kg Coils',
        price: 290,
        stock: 350,
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
        benefits: ['Curly structure provides high resilience', '100% natural organic binding rope', 'Decay-resistant outdoor stringing'],
        applications: ['Spring mattress core support', 'Hops growing support ropes', 'Industrial insulation padding']
      }
    ];

      const productsToInsert = mockProducts.map(p => ({
        ...p,
        slug: p.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      }));
      await Product.insertMany(productsToInsert);
      console.log('Seeding products complete.');
    } else {
      console.log('Products already seeded.');
    }

    // Seed default admin if none exists
    const adminEmail = 'coirsystemadmin@gmail.com';
    let adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log(`Seeding default admin ${adminEmail}...`);
      await User.create({
        name: 'Cocoveera Admin',
        email: adminEmail,
        phone: '+919876543210',
        password: 'Coirsystem@28',
        role: 'admin',
        isVerified: true
      });
      console.log(`Admin account seeded: email=${adminEmail}`);
    }

    // Demo user seeding has been removed so that accounts can be permanently deleted

    // Demote any other accounts that might be marked as admin to enforce "anything other than this is user"
    const demoteResult = await User.updateMany(
      { email: { $ne: 'coirsystemadmin@gmail.com' }, role: 'admin' },
      { role: 'user' }
    );
    if (demoteResult.modifiedCount > 0) {
      console.log(`Demoted ${demoteResult.modifiedCount} accounts with unauthorized admin roles.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

startServer();
