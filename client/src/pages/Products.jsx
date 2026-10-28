import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Search, ArrowUpDown, X, ShoppingBag, Eye, Wand2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { QuickViewModal } from '../components/QuickViewModal';
import api from '../services/api';
import { normalizeProductList } from '../utils/productHelpers';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { addToCart } = useCart();

  const activeRoom = searchParams.get('room');
  const activeStyle = searchParams.get('style');

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, activeRoom, activeStyle, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'all') params.append('category', activeCategory);
      if (activeRoom) params.append('room', activeRoom);
      if (activeStyle) params.append('style', activeStyle);
      if (searchQuery) params.append('search', searchQuery);

      if (sortBy === 'price_asc') params.append('sort', 'price_asc');
      if (sortBy === 'price_desc') params.append('sort', 'price_desc');
      if (sortBy === 'newest') params.append('sort', 'newest');

      const res = await api.get(`/products?${params.toString()}`);
      const hasFilters = activeCategory !== 'all' || Boolean(activeRoom || activeStyle || searchQuery);
      const normalized = normalizeProductList(res.data, !hasFilters);
      setProducts(normalized);
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
      let fallback = normalizeProductList([]);
      if (activeCategory !== 'all') {
        fallback = fallback.filter((product) => product.category === activeCategory);
      }
      if (searchQuery.trim()) {
        const term = searchQuery.trim().toLowerCase();
        fallback = fallback.filter((product) =>
          `${product.name} ${product.description}`.toLowerCase().includes(term)
        );
      }
      if (activeRoom) {
        const room = activeRoom.toLowerCase();
        const categoriesForRoom = room.includes('bedroom')
          ? ['Soft Furnishings', 'Lighting']
          : room.includes('dining')
            ? ['Lighting', 'Decorative Accents']
            : room.includes('office') || room.includes('study')
              ? ['Lighting', 'Wall Decor']
              : room.includes('entryway') || room.includes('outdoor')
                ? ['Rugs & Mats', 'Decorative Accents']
                : ['Wall Decor', 'Lighting', 'Soft Furnishings'];
        fallback = fallback.filter((product) => categoriesForRoom.includes(product.category));
      }
      if (sortBy === 'price_asc') fallback.sort((a, b) => a.base_price - b.base_price);
      if (sortBy === 'price_desc') fallback.sort((a, b) => b.base_price - a.base_price);
      setProducts(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSearchParams({});
  };

  const categories = [
    { id: 'all', label: 'All Décor' },
    { id: 'Wall Decor', label: 'Wall Décor' },
    { id: 'Lighting', label: 'Lighting' },
    { id: 'Soft Furnishings', label: 'Soft Furnishings' },
    { id: 'Decorative Accents', label: 'Accents' },
    { id: 'Rugs & Mats', label: 'Rugs & Mats' }
  ];

  const categoryMaterials = {
    'Wall Decor': 'Premium Canvas / Solid Timber',
    'Lighting': 'Ceramic / Rattan / Brass',
    'Soft Furnishings': 'Organic Linen / Belgian Flax',
    'Decorative Accents': 'Hand-thrown Stoneware / Soy Wax',
    'Rugs & Mats': 'Hand-braided Jute / Cotton Dhurrie'
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <span className="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
            Luxury Showroom
          </span>
          <h1 className="font-display-xl text-3xl md:text-5xl text-primary font-bold leading-tight">
            The Decor Collection
          </h1>
          <p className="text-stone-500 max-w-md text-sm mt-2 leading-relaxed">
            Curated home décor pieces designed for personal expression — from wall art to rugs, lighting to soft furnishings.
          </p>
        </div>

        
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-emerald-950 text-white shadow-md'
                  : 'bg-stone-50 dark:bg-stone-900 text-stone-600 hover:text-emerald-900 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search curations (e.g. Lamp, Rug)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-800 bg-white"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-stone-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-stone-200 text-xs font-semibold px-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-800 text-stone-700 cursor-pointer"
          >
            <option value="name_asc">Sort by: Name (A-Z)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      
      {(activeRoom || activeStyle || activeCategory !== 'all') && (
        <div className="mb-8 flex items-center gap-3 px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <Filter className="w-4 h-4 text-emerald-800" />
          <span className="text-xs md:text-sm font-semibold text-emerald-900">
            {activeRoom && <>Showing collection for: <strong>{activeRoom}</strong></>}
            {activeStyle && <>Curated for style: <strong>{activeStyle}</strong></>}
            {activeCategory !== 'all' && <>Category: <strong>{activeCategory}</strong></>}
          </span>
          <button
            onClick={clearFilters}
            className="ml-auto text-xs font-bold text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>
      )}

      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-stone-100 rounded-[2rem] h-96 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-headline-md text-xl font-bold text-primary">No products match your criteria</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing selected room & category filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-xl bg-emerald-950 text-white text-xs font-bold hover:bg-emerald-900"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const prodId = product._id || product.id;
            const material = categoryMaterials[product.category] || 'Bespoke Curated Craft';

            return (
              <div
                key={prodId}
                className="group relative bg-white dark:bg-stone-950 rounded-[2rem] overflow-hidden whisper-shadow border border-stone-100 dark:border-stone-900 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
              >
                
                <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative shrink-0">
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/95 text-stone-800 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {product.category || 'Home Décor'}
                  </span>
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={product.image_path}
                    alt={product.name}
                  />
                </div>

                
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-headline-md text-base text-stone-900 font-bold leading-tight mr-2">
                        {product.name}
                      </h3>
                      <span className="text-emerald-900 font-bold text-sm whitespace-nowrap shrink-0">
                        ₹{Number(product.base_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-stone-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">
                      {material}
                    </p>
                    <p className="text-stone-500 text-xs leading-relaxed mb-5 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  
                  <div className="space-y-2 mt-auto">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        className="py-2.5 rounded-xl bg-stone-50 text-stone-600 font-semibold hover:bg-stone-100 text-xs transition-colors flex justify-center items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Quick View
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1, product.category)}
                        className="py-2.5 rounded-xl bg-stone-50 text-stone-600 hover:bg-emerald-50 hover:text-emerald-900 font-semibold text-xs transition-colors flex justify-center items-center gap-1.5 border border-stone-200/60"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>

                    <Link
                      to={`/products/${prodId}/customize`}
                      className="w-full py-2.5 rounded-xl bg-primary-container text-white font-semibold hover:bg-emerald-900 transition-colors flex justify-center items-center gap-1.5 text-xs shadow-sm"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Customize in Studio
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
