import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Sparkles, Wand2, ShoppingBag, Eye, Compass } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export const Home = () => {
  const { onOpenQuiz } = useOutletContext();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?limit=6');
        if (res.data?.data) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const rooms = [
    { name: 'Living Room', icon: 'chair', count: '12 Pieces', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', color: 'from-emerald-950/85' },
    { name: 'Bedroom', icon: 'bed', count: '9 Pieces', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80', color: 'from-stone-950/85' },
    { name: 'Study & Office', icon: 'laptop_mac', count: '7 Pieces', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80', color: 'from-stone-900/85' },
    { name: 'Dining Room', icon: 'restaurant', count: '8 Pieces', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80', color: 'from-amber-950/85' },
    { name: 'Entryway', icon: 'door_front', count: '6 Pieces', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', color: 'from-zinc-950/85' },
    { name: 'Outdoor & Balcony', icon: 'deck', count: '5 Pieces', img: 'https://images.unsplash.com/photo-1568528741500-d3d2ccd0b0d5?auto=format&fit=crop&w=600&q=80', color: 'from-green-950/85' },
  ];

  const styles = [
    { name: 'Minimalist', desc: 'Clean lines · Neutral palette · Intentional', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80', accent: 'bg-stone-900' },
    { name: 'Bohemian', desc: 'Earthy warmth · Layered textures · Free-spirit', img: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=500&q=80', accent: 'bg-amber-800' },
    { name: 'Japandi', desc: 'Nordic calm · Japanese wabi-sabi · Harmony', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80', accent: 'bg-stone-600' },
    { name: 'Modern Luxury', desc: 'Gold accents · Bold drama · Statement pieces', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80', accent: 'bg-yellow-700' },
  ];

  return (
    <div className="space-y-0">
      
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="relative min-h-[780px] lg:h-[870px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80"
            alt="Luxurious sun-drenched interior"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent dark:from-stone-950/95 dark:via-stone-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full py-16">
          <div className="max-w-2xl">
            <span className="inline-block mb-4 px-4 py-1.5 bg-primary-container/10 text-primary-container font-headline-md text-xs font-bold uppercase tracking-widest rounded-full">
              ESTABLISHED IN CURATION
            </span>
            <h1 className="font-display-xl text-4xl sm:text-5xl lg:text-6xl text-primary leading-[1.1] mb-6 font-bold tracking-tight">
              Design Your <br />
              <span className="text-emerald-900">Dream Space</span>
            </h1>
            <p className="font-body-lg text-stone-600 dark:text-stone-300 text-base md:text-lg mb-10 max-w-lg leading-relaxed">
              Experience the intersection of high-end craftsmanship and personal expression. Create a home that resonates with your unique soul through our bespoke curation.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#products"
                className="bg-primary-container text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-semibold text-sm md:text-base whisper-shadow hover:bg-emerald-900 transition-all flex items-center gap-3"
              >
                <span>Start Customizing</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/ai-designer"
                className="border-2 border-stone-300 dark:border-stone-700 bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm text-primary px-8 md:px-10 py-4 md:py-5 rounded-2xl font-semibold text-sm md:text-base hover:bg-white transition-all flex items-center gap-2"
              >
                <span>AI Room Designer</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Customizable Products ─────────────────────────── */}
      <section id="products" className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
              Showroom Preview
            </span>
            <h2 className="font-headline-lg text-3xl md:text-4xl text-primary font-bold">The Custom Collection</h2>
            <p className="text-stone-500 max-w-md text-sm mt-2">
              Meticulously crafted foundations for your personal style, ready for your creative touch.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-emerald-800 transition-colors"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
                  <div className="p-7 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-headline-md text-lg text-primary font-bold leading-snug">
                          {product.name}
                        </h3>
                        <span className="text-emerald-900 dark:text-emerald-400 font-bold text-sm shrink-0">
                          ₹{Number(product.base_price).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs mb-6 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 mt-auto">
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1, product.category)}
                        className="w-full py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 hover:text-emerald-900 transition-colors flex justify-center items-center gap-2 text-xs"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <Link
                        to={`/products/${prodId}/customize`}
                        className="w-full py-3 rounded-xl border border-primary-container text-primary-container font-semibold hover:bg-primary-container hover:text-white transition-all flex justify-center items-center gap-2 text-xs"
                      >
                        <Wand2 className="w-4 h-4" />
                        Customize in Studio
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-950 text-white rounded-full font-semibold hover:bg-emerald-900 transition-colors shadow-lg group"
          >
            <span>Explore All 15 Curations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ─── Shop By Room ────────────────────────────────────────────── */}
      <section className="py-24 bg-stone-50 dark:bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
              Room by Room
            </span>
            <h2 className="font-headline-lg text-3xl md:text-4xl text-primary font-bold mb-3">Decorate Every Corner</h2>
            <p className="text-stone-500 max-w-md mx-auto text-sm">
              Find the perfect personalised pieces curated for each room in your home.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {rooms.map((room) => (
              <Link
                key={room.name}
                to={`/products?room=${encodeURIComponent(room.name)}`}
                className="group relative overflow-hidden rounded-[1.75rem] aspect-[4/3] block shadow-sm hover:shadow-xl transition-all"
              >
                <img
                  src={room.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={room.name}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${room.color} to-transparent`} />
                <div className="absolute bottom-0 left-0 p-5 flex items-end justify-between w-full">
                  <div>
                    <h3 className="text-white font-bold text-sm md:text-base leading-tight">{room.name}</h3>
                    <span className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">{room.count}</span>
                  </div>
                  <span className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Decor Styles ────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
            Design Personalities
          </span>
          <h2 className="font-headline-lg text-3xl md:text-4xl text-primary font-bold mb-3">Browse by Decor Style</h2>
          <p className="text-stone-500 max-w-md mx-auto text-sm">
            Every home has a personality. Find yours and shop a curated set built around it.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {styles.map((style) => (
            <Link
              key={style.name}
              to={`/products?style=${encodeURIComponent(style.name)}`}
              className="group relative overflow-hidden rounded-[1.75rem] block shadow-sm hover:shadow-xl transition-all"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={style.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={style.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className={`inline-block w-3 h-3 rounded-full ${style.accent} mb-2 shadow-sm`} />
                <h3 className="text-white font-bold text-base mb-0.5">{style.name}</h3>
                <p className="text-white/75 text-[10px] leading-relaxed">{style.desc}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-white/90 text-[11px] font-semibold group-hover:gap-2 transition-all">
                  Shop Style <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────── */}
      <section className="py-24 bg-emerald-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
            The Process
          </span>
          <h2 className="font-headline-lg text-3xl md:text-4xl text-white font-bold mb-3">
            Transform Your Home in 3 Steps
          </h2>
          <p className="text-white/70 max-w-md mx-auto mb-16 text-sm">
            From inspiration to delivery — personalise any piece and see it in your room before you buy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Take the Style Quiz', desc: 'Answer 3 quick questions about your style, room, and color mood. Our AI builds your unique decor profile.' },
              { num: '02', title: 'Personalise Your Piece', desc: 'Choose any product and customize colors, dimensions, patterns, and materials. See changes live in the Room Visualizer.' },
              { num: '03', title: 'Delivered to Your Door', desc: 'Place your order and our artisans handcraft your bespoke piece. Free delivery in 3-5 business days.' }
            ].map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-black mb-5">
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-white/70 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
            >
              <span>Browse All Products</span>
              <Compass className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Innovation Highlights ──────────────────────────────────── */}
      <section className="py-24 bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="font-headline-lg text-3xl md:text-4xl text-primary font-bold mb-3">The Future of Living</h2>
            <p className="text-stone-600 max-w-xl mx-auto text-base">
              Technology that doesn't just display products, but imagines them in the context of your living space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/60 whisper-shadow transition-all hover:bg-white">
                <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary mb-5">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-headline-md text-xl text-primary font-bold mb-2">Live Room Visualizer</h3>
                <p className="text-stone-600 text-sm mb-5 leading-relaxed">
                  Eliminate guesswork. Using our interactive canvas visualizer, reposition, resize, and inspect bespoke mouldings directly on realistic backdrops or photos of your room.
                </p>
                <Link to="/customize" className="inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all text-sm">
                  <span>Open Customization Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/60 whisper-shadow transition-all hover:bg-white">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-900 mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-headline-md text-xl text-primary font-bold mb-2">AI-Powered Spatial Curation</h3>
                <p className="text-stone-600 text-sm mb-5 leading-relaxed">
                  Our neural design engine analyzes your aesthetic objectives, color vibrations, and uploaded room photos to compute spatial balance and frame specs.
                </p>
                <Link to="/ai-designer" className="inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all text-sm">
                  <span>Try AI Spatial Designer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img
                  className="w-full aspect-square object-cover"
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
                  alt="Spatial visualization preview"
                />
                <div className="absolute inset-x-6 bottom-6 glass-panel rounded-2xl p-5 border border-white/40 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Visualizer Active</p>
                      <p className="text-xs font-bold text-primary">Placing: Bespoke Wall Decor Collection</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1 bg-emerald-800 w-full rounded-full" />
                    <div className="h-1 bg-stone-300 w-full rounded-full" />
                    <div className="h-1 bg-stone-300 w-full rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quiz Prompt CTA ────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="bg-primary p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="font-headline-lg text-2xl md:text-4xl text-white font-bold mb-4">
              Ready to reveal your space's potential?
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed">
              Take our 3-minute aesthetic discovery quiz to unlock personalized collections tailored to your lifestyle and palette.
            </p>
            <button
              onClick={onOpenQuiz}
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
            >
              Take Aesthetic Discovery Quiz
            </button>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-stone-200 rotate-3 shadow-lg">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80"
                alt="Textured fabric art"
              />
            </div>
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-stone-200 -rotate-6 translate-y-6 shadow-lg">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80"
                alt="Minimalist vase"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
