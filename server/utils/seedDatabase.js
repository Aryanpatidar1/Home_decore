import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const products = [
  // ─── Wall Decor ───────────────────────────────────────────────
  {
    name: 'Custom Canvas Wall Art',
    description: 'AI-generated personalized canvas print with your chosen palette, quote, and abstract composition. Printed on premium 400gsm cotton rag.',
    category: 'Wall Decor',
    base_price: 2199.00,
    image_path: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 50
  },
  {
    name: 'Personalized Wooden Wall Frame',
    description: 'Handcrafted solid wood frame with your custom text, initials, or a special date. Available in Oak, Walnut, and Ebony finishes.',
    category: 'Wall Decor',
    base_price: 1499.00,
    image_path: 'https://images.unsplash.com/photo-1544273677-c433136021d4?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 45
  },
  {
    name: 'Hexagonal Wooden Wall Mirror',
    description: 'A geometric statement mirror in hand-finished teak. Clusters beautifully into a gallery wall arrangement.',
    category: 'Wall Decor',
    base_price: 2799.00,
    image_path: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 30
  },
  {
    name: 'Macramé Wall Hanging',
    description: 'Hand-knotted from natural cotton rope. Customizable in width, fringe length, and accent bead color. Bohemian & Japandi ready.',
    category: 'Wall Decor',
    base_price: 1299.00,
    image_path: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 60
  },

  // ─── Lighting ─────────────────────────────────────────────────
  {
    name: 'Artisan Table Lamp',
    description: 'Sculpted ceramic base with a linen drum shade. Available in 6 glaze colors to match your room palette. Warm 2700K Edison bulb included.',
    category: 'Lighting',
    base_price: 3499.00,
    image_path: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 25
  },
  {
    name: 'Rattan Pendant Shade',
    description: 'Hand-woven rattan pendant that casts stunning dappled light patterns. Ideal above dining tables and reading nooks.',
    category: 'Lighting',
    base_price: 2199.00,
    image_path: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 40
  },
  {
    name: 'Bohemian Fairy String Lights',
    description: 'Warm-white micro-LED string lights on copper wire, 5 metres. Perfect for headboards, shelves, and balcony draping.',
    category: 'Lighting',
    base_price: 899.00,
    image_path: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 100
  },

  // ─── Soft Furnishings ─────────────────────────────────────────
  {
    name: 'Personalized Throw Pillow',
    description: 'Custom monogram or quote embroidered on 100% organic Belgian linen. Stone-washed for a lived-in luxury feel. 45 × 45 cm.',
    category: 'Soft Furnishings',
    base_price: 899.00,
    image_path: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 80
  },
  {
    name: 'Custom Cushion Cover Set (2)',
    description: 'Pair of cushion covers in coordinating prints. Choose from our AI-curated fabric palettes — Japandi, Boho, or Minimalist.',
    category: 'Soft Furnishings',
    base_price: 1199.00,
    image_path: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 65
  },
  {
    name: 'Handwoven Knit Throw Blanket',
    description: 'Chunky-knit merino-blend throw in your chosen colorway. Drapes beautifully over sofas and armchairs for a cosy, editorial look.',
    category: 'Soft Furnishings',
    base_price: 2499.00,
    image_path: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 35
  },

  // ─── Decorative Accents ───────────────────────────────────────
  {
    name: 'Ceramic Bud Vase Set (3)',
    description: 'A trio of hand-thrown stoneware vases in graduated heights. Each set is unique — glazed in earthy matte finishes that complement any palette.',
    category: 'Decorative Accents',
    base_price: 1199.00,
    image_path: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 50
  },
  {
    name: 'Luxury Soy Scented Candle',
    description: 'Hand-poured soy wax in a reusable ceramic pot. Choose from 8 signature scents: Vetiver & Cedar, White Tea, Jasmine Noir, and more.',
    category: 'Decorative Accents',
    base_price: 699.00,
    image_path: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 120
  },
  {
    name: 'Woven Seagrass Storage Tray',
    description: 'Natural seagrass tray with leather handles. Perfect as a coffee table centrepiece, catch-all, or plant display plinth.',
    category: 'Decorative Accents',
    base_price: 1099.00,
    image_path: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 45
  },

  // ─── Rugs & Mats ──────────────────────────────────────────────
  {
    name: 'Natural Jute Area Rug',
    description: 'Hand-braided jute rug with a dense, durable weave. Earthy, natural texture grounds any room. Custom sizes from 3×5 to 8×10 ft.',
    category: 'Rugs & Mats',
    base_price: 4999.00,
    image_path: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 20
  },
  {
    name: 'Geometric Dhurrie Rug',
    description: 'Flatweave cotton dhurrie in bold or subtle geometric patterns. Reversible, easy-clean, and available in 12 colorways.',
    category: 'Rugs & Mats',
    base_price: 5499.00,
    image_path: 'https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?auto=format&fit=crop&w=700&q=80',
    is_active: true,
    stock: 22
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homedecor';
    await mongoose.connect(mongoUri);
    console.log(`[Seeder] Connected to MongoDB at: ${mongoUri}`);

    // Cleanly upsert products
    for (const prod of products) {
      await Product.findOneAndUpdate(
        { name: prod.name },
        prod,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Seeder] Successfully seeded ${products.length} products.`);

    // Seed Demo Users (Admin and Customer)
    const adminEmail = 'admin@auradecor.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Aura Administrator',
        email: adminEmail,
        password: 'password123',
        role: 'admin'
      });
      console.log(`[Seeder] Admin created: ${adminEmail} / password123`);
    }

    const demoEmail = 'user@example.com';
    const existingDemo = await User.findOne({ email: demoEmail });
    if (!existingDemo) {
      await User.create({
        name: 'Arjun Sharma',
        email: demoEmail,
        password: 'password123',
        role: 'customer',
        phone: '+91 98765 43210',
        addresses: [{
          street: 'Flat 4B, Prestige Heights, MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          phone: '+91 98765 43210',
          isDefault: true
        }]
      });
      console.log(`[Seeder] Demo customer created: ${demoEmail} / password123`);
    }

    await mongoose.connection.close();
    console.log('[Seeder] Database connection closed. Done.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

seedDB();
