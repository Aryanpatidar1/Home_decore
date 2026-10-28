import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, RotateCcw, Lock, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RazorpayModal } from '../components/RazorpayModal';
import api from '../services/api';

export const Cart = () => {
  const { cart, itemCount, subtotal, gst, total, updateQty, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Checkout form fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState(
    user?.addresses?.[0]?.street || ''
  );
  const demoMode = cart.some((item) => String(item.product_id || item.id).startsWith('demo-'));

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutModalOpen(true);
  };

  const handleCheckoutFormSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail || !shippingAddress) {
      addToast('Please fill in all delivery details before continuing.', 'error');
      return;
    }
    setCheckoutModalOpen(false);
    setRazorpayOpen(true);
  };

  const handleConfirmPayment = async (upiId) => {
    setIsProcessing(true);
    try {
      if (demoMode) {
        const orderId = `demo-order-${Date.now()}`;
        const orderNumber = `DEMO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${orderId.slice(-6).toUpperCase()}`;
        const demoOrder = {
          _id: orderId,
          order_number: orderNumber,
          total_price: total,
          items: cart.map((item) => ({
            product_id: item.product_id || item.id,
            name: item.name,
            price: Number(item.price),
            qty: Number(item.qty) || 1,
            style: item.style,
            image: item.image
          })),
          shipping_address: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: shippingAddress
          },
          payment_info: {
            method: 'demo',
            status: 'not_charged',
            payment_id: `demo_${Date.now()}`
          },
          status: 'demo order',
          placed_at: new Date().toISOString()
        };

        localStorage.setItem(`aura_order_${orderId}`, JSON.stringify(demoOrder));
        clearCart();
        setRazorpayOpen(false);
        addToast('Demo order created. No payment was taken.', 'success');
        navigate(`/orders/${orderId}`);
        return;
      }

      const orderPayload = {
        items: cart,
        total_price: total,
        shipping_address: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: shippingAddress
        },
        payment_info: {
          method: 'razorpay',
          status: 'paid',
          payment_id: `rzp_pay_${Date.now()}`
        }
      };

      const res = await api.post('/orders', orderPayload);
      if (res.data?.order_id) {
        clearCart();
        setRazorpayOpen(false);
        addToast('Payment confirmed! Your order has been placed successfully.', 'success');
        navigate(`/orders/${res.data.order_id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Order placement failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
          <ShoppingBag className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary">Your cart is empty</h2>
        <p className="text-stone-500 text-sm max-w-sm">
          Browse our showroom collection and add bespoke pieces to your cart to begin your spatial curation.
        </p>
        <Link
          to="/products"
          className="bg-emerald-950 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-2 text-sm shadow-md"
        >
          <span>Browse Showroom Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
      
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
          Your Selection ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl text-primary font-bold leading-tight">
          Your Shopping Cart
        </h1>
        <p className="text-stone-500 mt-2 text-sm">Review your selected pieces and complete your bespoke checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ─── Cart Items List ────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[2rem] p-6 border border-stone-100 whisper-shadow flex gap-5 transition-all hover:-translate-y-0.5"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100">
                <img
                  src={item.image}
                  className="w-full h-full object-cover"
                  alt={item.name}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-primary text-base">{item.name}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{item.style || 'Bespoke Collective'}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-800 text-[9px] font-bold uppercase tracking-wider rounded-full">
                    Artisan Craft
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="text-stone-400 hover:text-emerald-900 font-bold text-base leading-none px-1"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-primary min-w-[20px] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="text-stone-400 hover:text-emerald-900 font-bold text-base leading-none px-1"
                    >
                      +
                    </button>
                  </div>

                  {/* Price & Delete */}
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-emerald-950 text-base">
                      ₹{(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-300 hover:text-rose-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Order Summary ──────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-stone-100 whisper-shadow space-y-4">
            <h2 className="font-headline-md text-xl text-primary font-bold border-b border-stone-100 pb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-xs font-semibold text-stone-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-800 font-bold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="text-stone-800 font-bold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-emerald-700 font-bold uppercase tracking-wider">FREE</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-emerald-950 pt-4 border-t border-stone-100">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={handleOpenCheckout}
              className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-emerald-900 transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(6,78,59,0.25)] text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 space-y-3">
            <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>256-bit SSL encrypted secure checkout</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Free delivery — 3-5 business days across India</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
              <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>30-day hassle-free returns on non-custom items</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Checkout Details Modal ──────────────────────────────────── */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[2rem] border border-stone-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-950 px-8 py-6 flex items-center justify-between text-white">
              <div>
                <p className="text-emerald-300 text-[10px] uppercase tracking-widest font-bold">Secure Checkout</p>
                <h3 className="font-bold text-xl">Delivery Destination</h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutFormSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-widest font-semibold text-stone-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-widest font-semibold text-stone-400">Phone</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-stone-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="arjun@example.com"
                  className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-stone-400">Shipping Address</label>
                <textarea
                  rows="3"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Flat 4B, Prestige Heights, MG Road, Bengaluru — 560001"
                  className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-700 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#2d72d9] text-white py-4 rounded-xl font-bold hover:bg-[#2561c0] transition-colors shadow-md text-sm"
                >
                  <Lock className="w-4 h-4" />
                  {demoMode ? 'Continue to Demo Checkout' : 'Continue to Razorpay Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Modal */}
      <RazorpayModal
        isOpen={razorpayOpen}
        onClose={() => setRazorpayOpen(false)}
        amount={total}
        onConfirm={handleConfirmPayment}
        isProcessing={isProcessing}
        demoMode={demoMode}
      />
    </div>
  );
};
