import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Compass, Palette, PackageCheck, Scissors, Truck } from 'lucide-react';
import api from '../services/api';

export const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const localOrder = localStorage.getItem(`aura_order_${id}`);
      if (localOrder) {
        try {
          setOrder(JSON.parse(localOrder));
        } catch (err) {
          console.error('Failed to read saved demo order:', err);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data?.data) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Order Not Found</h2>
        <p className="text-stone-500 text-sm">We could not find the specified order confirmation.</p>
        <Link to="/" className="inline-block bg-emerald-950 text-white px-6 py-3 rounded-xl font-semibold text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const customDesign = order.customDesign || order.custom_design_id;
  const productName = order.product?.name || 'Bespoke Curated Decor';

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-[2.5rem] border border-stone-100 whisper-shadow text-center p-8 md:p-12 space-y-8">
        {order.payment_info?.method === 'demo' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Demo order only — no payment was processed or charged.
          </div>
        )}
        
        
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-800 rounded-full">
          <CheckCircle2 className="w-14 h-14 text-emerald-700 animate-in zoom-in" />
          <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full scale-110 animate-ping opacity-25" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
            Aura Decor Order Placed
          </span>
          <h1 className="font-display-xl text-3xl md:text-4xl text-primary font-extrabold leading-tight">
            Thank You For Your Curation
          </h1>
          <p className="text-stone-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Your custom styling selection has been submitted to our design laboratory. Our master craftsmen are preparing your bespoke decor pieces.
          </p>
        </div>

        
        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 max-w-md mx-auto text-left space-y-3.5 text-xs font-semibold">
          <div className="flex justify-between py-1 border-b border-stone-200/60">
            <span className="text-stone-400">Order Number</span>
            <span className="text-emerald-950 font-mono font-bold">{order.order_number}</span>
          </div>
          {order.product ? (
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-400">Base Piece</span>
              <span className="text-primary font-bold">{productName}</span>
            </div>
          ) : (
            <div className="flex justify-between gap-6 py-1 border-b border-stone-200/60">
              <span className="shrink-0 text-stone-400">Items</span>
              <span className="text-right text-primary font-bold">
                {order.items?.map((item) => `${item.name} × ${item.qty}`).join(', ') || 'Store order'}
              </span>
            </div>
          )}
          {customDesign && (
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-400">Curation Signature ID</span>
              <span className="text-primary font-mono text-[11px]">{customDesign._id || customDesign.id}</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-stone-200/60">
            <span className="text-stone-400">Status</span>
            <span className="text-emerald-800 uppercase tracking-widest text-[9px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-stone-500 font-bold">
              {order.payment_info?.method === 'demo' ? 'Demo Order Total' : 'Total Charged'}
            </span>
            <span className="text-base font-extrabold text-emerald-950">
              ₹{Number(order.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        
        <div className="max-w-md mx-auto space-y-4 text-left pt-2">
          <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400">Next Steps</h3>
          <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-500/30">
            
            <div className="relative">
              <span className="absolute -left-[26px] top-0.5 w-4 h-4 bg-emerald-700 rounded-full flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
                Curation Secured
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">Specifications logged and materials queued in laboratory.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[26px] top-0.5 w-4 h-4 bg-stone-300 rounded-full flex items-center justify-center text-[10px] text-stone-600 font-bold">
                2
              </span>
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-stone-500" />
                Crafting & Mounting
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">Premium materials shaped to size with protective mounting.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[26px] top-0.5 w-4 h-4 bg-stone-300 rounded-full flex items-center justify-center text-[10px] text-stone-600 font-bold">
                3
              </span>
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-stone-500" />
                Dispatch & Delivery
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">Custom padding pack applied. Courier tracking email dispatched.</p>
            </div>

          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
          <Link
            to="/products"
            className="w-full sm:w-auto bg-emerald-950 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-900 transition-colors flex justify-center items-center gap-2 text-xs shadow-md"
          >
            <span>Continue Shopping</span>
            <Compass className="w-4 h-4" />
          </Link>
          {customDesign && (
            <Link
              to={`/designs/${customDesign._id || customDesign.id}/preview`}
              className="w-full sm:w-auto border border-stone-200 text-stone-700 px-8 py-3.5 rounded-xl font-bold hover:bg-stone-50 transition-colors flex justify-center items-center gap-2 text-xs"
            >
              <span>Review Saved Canvas</span>
              <Palette className="w-4 h-4" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};
