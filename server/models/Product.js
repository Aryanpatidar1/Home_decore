import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Wall Decor', 'Lighting', 'Soft Furnishings', 'Decorative Accents', 'Rugs & Mats'],
    default: 'Wall Decor',
    index: true
  },
  base_price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0
  },
  image_path: {
    type: String,
    default: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  stock: {
    type: Number,
    default: 50,
    min: 0
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
