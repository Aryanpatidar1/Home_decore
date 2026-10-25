import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight, Palette, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const CustomizeIndex = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = activeCategory === 'all' ? '/products' : `/products?category=${encodeURIComponent(activeCategory)}`;
        const res = await api.get(url);
        if (res.data?.data) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const categories = [
    { id: 'all', label: 'All Collections' },
    { id: 'Wall Decor', label: 'Wall Décor' },
    { id: 'Lighting', label: 'Lighting' },
    { id: 'Soft Furnishings', label: 'Soft Furnishings' },
    { id: 'Decorative Accents', label: 'Accents' },
    { id: 'Rugs & Mats', label: 'Rugs & Mats' }
  ];

  return (
    <div className="space-y-16 pb-24">
      
      {/* ─── Hero Header ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white py-20 md:py-28">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-900/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 font-semibold text-xs uppercase tracking-widest">
              <Wand2 className="w-4 h-4" />
              Personalisation Studio
            </div>
            <h1 className="font-display-xl text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Design Your <br />
              <span className="text-emerald-300">Perfect Space</span>
            </h1>
            <p className="text-emerald-100/80 text-base md:text-lg leading-relaxed mb-8">
              Choose a base piece from our collection, then use our interactive visualizer canvas to adjust colours, dimensions, frame mouldings, and AI abstract art layouts before it's handcrafted.
            </p>

            {/* 3-Step Flow */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">1</div>
                <span className="text-emerald-100/90 text-sm font-medium">Pick a piece</span>
              </div>
              <div className="hidden sm:flex items-center text-emerald-500/50">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">2</div>
                <span className="text-emerald-100/90 text-sm font-medium">Visualise in room</span>
              </div>
              <div className="hidden sm:flex items-center text-emerald-500/50">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">3</div>
                <span className="text-emerald-100/90 text-sm font-medium">Handcrafted to order</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Selection Grid ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-full">
              Step 1 of 3
            </span>
            <h2 className="font-headline-lg text-2xl md:text-3xl text-primary font-bold mt-2">
              Select Base Product to Customise
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-950 text-white shadow-md'
                    : 'bg-stone-50 border border-stone-200 text-stone-600 hover:text-emerald-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-stone-100 rounded-3xl h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const prodId = product._id || product.id;
              return (
                <div
                  key={prodId}
                  className="group bg-white rounded-[2rem] overflow-hidden whisper-shadow border border-stone-100 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                    <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/95 text-stone-800 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {product.category}
                    </span>
                    <img
                      src={product.image_path}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="font-headline-md text-base font-bold text-primary">{product.name}</h3>
                        <span className="text-emerald-900 font-bold text-sm whitespace-nowrap">
                          ₹{Number(product.base_price).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <Link
                      to={`/products/${prodId}/customize`}
                      className="w-full py-3 rounded-xl bg-emerald-950 text-white font-semibold hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 text-xs shadow-md"
                    >
                      <Wand2 className="w-4 h-4" />
                      Configure in Visualizer
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
