import { Product } from '../models/Product.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, room, style, search, sort, limit } = req.query;
    let query = { is_active: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Room and style matching heuristic
    if (room) {
      const roomLower = room.toLowerCase();
      if (roomLower.includes('living')) {
        query.$or = [
          { category: 'Wall Decor' },
          { category: 'Lighting' },
          { category: 'Soft Furnishings' }
        ];
      } else if (roomLower.includes('bedroom')) {
        query.$or = [
          { category: 'Soft Furnishings' },
          { category: 'Lighting' }
        ];
      } else if (roomLower.includes('dining')) {
        query.$or = [
          { category: 'Lighting' },
          { category: 'Decorative Accents' }
        ];
      } else if (roomLower.includes('study') || roomLower.includes('office')) {
        query.$or = [
          { category: 'Lighting' },
          { category: 'Wall Decor' }
        ];
      } else if (roomLower.includes('entryway') || roomLower.includes('outdoor')) {
        query.$or = [
          { category: 'Rugs & Mats' },
          { category: 'Decorative Accents' }
        ];
      }
    }

    let sortOptions = { name: 1 };
    if (sort === 'price_asc') sortOptions = { base_price: 1 };
    if (sort === 'price_desc') sortOptions = { base_price: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    let productQuery = Product.find(query).sort(sortOptions);
    if (limit) productQuery = productQuery.limit(parseInt(limit, 10));

    const products = await productQuery;

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, base_price, stock } = req.body;
    let image_path = req.body.image_path;

    if (req.file) {
      image_path = `/uploads/${req.file.filename}`;
    }

    if (!name || !base_price) {
      return res.status(422).json({ message: 'Product name and base price are required.' });
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      category,
      base_price: parseFloat(base_price),
      stock: stock ? parseInt(stock, 10) : 50,
      image_path: image_path || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const { name, description, category, base_price, stock, is_active } = req.body;

    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (base_price !== undefined) product.base_price = parseFloat(base_price);
    if (stock !== undefined) product.stock = parseInt(stock, 10);
    if (is_active !== undefined) product.is_active = is_active;

    if (req.file) {
      product.image_path = `/uploads/${req.file.filename}`;
    } else if (req.body.image_path) {
      product.image_path = req.body.image_path;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Toggle active status or delete
    product.is_active = !product.is_active;
    await product.save();

    res.json({
      success: true,
      message: `Product is now ${product.is_active ? 'active' : 'inactive'}.`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};
