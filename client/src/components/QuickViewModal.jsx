import React from 'react';
import { X, ShoppingBag, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  const categoryMaterials = {
    'Wall Decor': 'Premium Canvas / Solid Timber Moulding',
    'Lighting': 'Sculpted Ceramic / Hand-woven Rattan / Brass',
    'Soft Furnishings': 'Organic Belgian Linen / Merino Blend',
    'Decorative Accents': 'Hand-thrown Stoneware / Natural Soy Wax',
    'Rugs & Mats': 'Hand-braided Jute / Flatweave Cotton Dhurrie'
  };

  const material = categoryMaterials[product.category] || 'Bespoke Curated Craft';

  const handleAddToCart = () => {
    addToCart(product, 1, product.category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-950 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-100 dark:border-stone-900 flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Left: Product Image */}
        <div className="md:w-1/2 bg-stone-50 dark:bg-stone-900/50 relative">
          <img
            className="w-full h-full object-cover max-h-[320px] md:max-h-full"
            src={product.image_path || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'}
            alt={product.name}
          />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 text-stone-700 flex items-center justify-center shadow-md md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Specifications & Add to Cart */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  {product.category || 'Home Décor'}
                </span>
                <h2 className="font-headline-md text-2xl text-primary font-bold leading-tight">
                  {product.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="hidden md:flex w-9 h-9 rounded-full bg-stone-100 text-stone-500 items-center justify-center hover:bg-stone-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-400 block">
                ₹{Number(product.base_price).toLocaleString('en-IN')}
              </span>
              <p className="text-stone-500 text-xs leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-3 text-xs font-semibold text-stone-600">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-normal">Materials</span>
                <span className="text-primary truncate max-w-[200px]">{material}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-normal">Personalisation</span>
                <span className="text-emerald-800 bg-emerald-500/15 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Curation Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-normal">Delivery</span>
                <span className="text-primary flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  Free · 3-5 Business Days
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full bg-emerald-950 text-white py-3.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition-colors flex justify-center items-center gap-2 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
