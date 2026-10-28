import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const seedProductsData = [
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
  },

  {
    name: 'Walnut Gallery Frame Set',
    description: 'A coordinated set of three walnut-finish frames for a personal gallery wall. Includes a balanced mix of portrait and landscape sizes.',
    category: 'Wall Decor',
    base_price: 3299.00,
    image_path: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 28
  },
  {
    name: 'Sculpted Sunburst Wall Mirror',
    description: 'A softly rounded statement mirror with a warm, sculptural silhouette for entryways and living spaces.',
    category: 'Wall Decor',
    base_price: 4299.00,
    image_path: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 18
  },
  {
    name: 'Textured Neutral Wall Panel',
    description: 'Layered tactile wall art in calming sand and ivory tones. A refined focal point for minimal and Japandi interiors.',
    category: 'Wall Decor',
    base_price: 2899.00,
    image_path: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 24
  },
  {
    name: 'Aster Glass Globe Pendant',
    description: 'A clear glass globe pendant with a warm metal detail, designed to bring soft, ambient light over a dining table or bedside.',
    category: 'Lighting',
    base_price: 3799.00,
    image_path: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 20
  },
  {
    name: 'Noma Tripod Floor Lamp',
    description: 'A sculptural tripod lamp with a linen shade that creates a cosy reading corner and a gentle evening glow.',
    category: 'Lighting',
    base_price: 5999.00,
    image_path: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 14
  },
  {
    name: 'Brushed Brass Wall Sconce',
    description: 'A compact, elegant wall light with a brushed brass finish. Ideal beside a bed, hallway mirror, or favourite artwork.',
    category: 'Lighting',
    base_price: 2499.00,
    image_path: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 32
  },
  {
    name: 'Terracotta Velvet Cushion',
    description: 'A plush velvet cushion in a rich terracotta shade, finished with a subtle piped edge. Includes a soft, supportive insert.',
    category: 'Soft Furnishings',
    base_price: 1099.00,
    image_path: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 42
  },
  {
    name: 'Oatmeal Linen Lounge Throw',
    description: 'A breathable linen-blend throw with a relaxed drape and delicate fringed edges, made for sofas and quiet evenings.',
    category: 'Soft Furnishings',
    base_price: 2199.00,
    image_path: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 26
  },
  {
    name: 'Botanical Cushion Cover Pair',
    description: 'Two soft cotton cushion covers with a subtle botanical pattern to add a fresh, layered accent to your living room.',
    category: 'Soft Furnishings',
    base_price: 1399.00,
    image_path: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 38
  },
  {
    name: 'Cloud Stoneware Vase',
    description: 'A hand-finished stoneware vase with a softly sculptural shape. Looks beautiful with fresh stems or styled on its own.',
    category: 'Decorative Accents',
    base_price: 1499.00,
    image_path: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 30
  },
  {
    name: 'Sculptural Travertine Object',
    description: 'A tactile stone-look accent with an organic silhouette, designed to bring natural texture to shelves and coffee tables.',
    category: 'Decorative Accents',
    base_price: 1899.00,
    image_path: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 22
  },
  {
    name: 'Olive Glaze Planter Pair',
    description: 'A pair of ceramic planters in a deep olive glaze, sized for small indoor plants and styled together or separately.',
    category: 'Decorative Accents',
    base_price: 1699.00,
    image_path: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 25
  },
  {
    name: 'Cloud-soft Wool Area Rug',
    description: 'A generously sized wool-blend rug with a soft, inviting pile and a quiet neutral palette for relaxed living spaces.',
    category: 'Rugs & Mats',
    base_price: 7999.00,
    image_path: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 12
  },
  {
    name: 'Sandstone Flatweave Runner',
    description: 'A durable low-profile runner with a woven texture and understated sandstone tones for hallways and bedside spaces.',
    category: 'Rugs & Mats',
    base_price: 3499.00,
    image_path: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 16
  },
  {
    name: 'Braided Cotton Round Rug',
    description: 'A handwoven round cotton rug that adds soft texture to a reading nook, nursery, or the side of a bed.',
    category: 'Rugs & Mats',
    base_price: 2799.00,
    image_path: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=85',
    is_active: true,
    stock: 19
  }
];

export const seedProducts = async () => {
  for (const prod of seedProductsData) {
    await Product.findOneAndUpdate(
      { name: prod.name },
      prod,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return seedProductsData.length;
};

export const seedUsers = async () => {
  const adminEmail = 'admin@auradecor.com';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: 'Aura Administrator',
      email: adminEmail,
      password: 'password123',
      role: 'admin'
    });
    console.log(`[Seeder] Admin created: ${adminEmail} / password123`);
  }

  const demoEmail = 'user@example.com';
  if (!(await User.findOne({ email: demoEmail }))) {
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
};

export const seedIfEmpty = async () => {
  const result = await Product.bulkWrite(
    seedProductsData.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $setOnInsert: product },
        upsert: true
      }
    })),
    { ordered: false }
  );
  if (result.upsertedCount > 0) {
    console.log(`[Seeder] Added ${result.upsertedCount} catalog products.`);
  }
  await seedUsers();
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/homedecor', {
        serverSelectionTimeoutMS: 15000,
        family: 4
      });
      console.log(`[Seeder] Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
      const n = await seedProducts();
      console.log(`[Seeder] Successfully seeded ${n} products.`);
      await seedUsers();
      await mongoose.connection.close();
      console.log('[Seeder] Done.');
      process.exit(0);
    } catch (error) {
      console.error(`[Seeder Error] ${error.message}`);
      process.exit(1);
    }
  })();
}
