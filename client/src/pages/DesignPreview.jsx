import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { RazorpayModal } from '../components/RazorpayModal';
import api from '../services/api';

export const DesignPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [design, setDesign] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef(null);
  const backdropImgRef = useRef(null);
  const aiImgRef = useRef(null);
  const productImgRef = useRef(null);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const res = await api.get(`/designs/${id}`);
        if (res.data?.data) {
          const d = res.data.data;
          setDesign(d);
          setProduct(d.product);

          // Preload backdrop image
          const bImg = new Image();
          bImg.crossOrigin = 'anonymous';
          const backdrops = {
            living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
            bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
            office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
          };
          const bUrl = d.room_image_path
            ? (d.room_image_path.startsWith('http') ? d.room_image_path : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${d.room_image_path}`)
            : (backdrops[d.design_json?.backdrop] || backdrops.living);

          bImg.src = bUrl;
          bImg.onload = () => {
            backdropImgRef.current = bImg;
            drawPreview(d, bImg, aiImgRef.current, productImgRef.current);
          };

          // Preload AI image if present
          if (d.design_json?.ai_art_spec?.synthesized_image_base64) {
            const aiImg = new Image();
            aiImg.src = d.design_json.ai_art_spec.synthesized_image_base64;
            aiImg.onload = () => {
              aiImgRef.current = aiImg;
              drawPreview(d, backdropImgRef.current, aiImg, productImgRef.current);
            };
          }

          // Preload product image
          if (d.product?.image_path) {
            const pImg = new Image();
            pImg.crossOrigin = 'anonymous';
            pImg.src = d.product.image_path;
            pImg.onload = () => {
              productImgRef.current = pImg;
              drawPreview(d, backdropImgRef.current, aiImgRef.current, pImg);
            };
          }
        }
      } catch (err) {
        addToast('Design not found or could not be loaded.', 'error');
        navigate('/customize');
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [id]);

  const drawPreview = (d, bImg, aiImg, pImg) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (bImg) {
      ctx.drawImage(bImg, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#f5f5f4';
      ctx.fillRect(0, 0, width, height);
    }

    const dj = d.design_json || {};
    const fWidth = dj.frame_w || 280;
    const fHeight = dj.frame_h || 360;
    const fX = dj.offset_x !== undefined ? dj.offset_x : (width - fWidth) / 2;
    const fY = dj.offset_y !== undefined ? dj.offset_y : 70;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 16;

    const frameColors = {
      black: '#1c1917',
      oak: '#8c6239',
      gold: '#d4af37',
      none: 'transparent'
    };
    const frameColor = frameColors[dj.frame_style] || '#1c1917';
    const borderThickness = dj.frame_style === 'none' ? 0 : 14;

    if (borderThickness > 0) {
      ctx.fillStyle = frameColor;
      ctx.fillRect(fX, fY, fWidth, fHeight);
    }

    const matting = dj.frame_style === 'none' ? 0 : 18;
    const innerX = fX + borderThickness + matting;
    const innerY = fY + borderThickness + matting;
    const innerW = fWidth - (borderThickness + matting) * 2;
    const innerH = fHeight - (borderThickness + matting) * 2;

    if (matting > 0) {
      ctx.fillStyle = '#fcfbf7';
      ctx.fillRect(fX + borderThickness, fY + borderThickness, fWidth - borderThickness * 2, fHeight - borderThickness * 2);
    }

    if (aiImg) {
      ctx.drawImage(aiImg, innerX, innerY, innerW, innerH);
    } else if (pImg) {
      ctx.drawImage(pImg, innerX, innerY, innerW, innerH);
    } else {
      ctx.fillStyle = dj.color || '#064e3b';
      ctx.fillRect(innerX, innerY, innerW, innerH);
    }
    ctx.restore();

    // Dimension lines
    const rY = fY + fHeight + 16;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fX, rY);
    ctx.lineTo(fX + fWidth, rY);
    ctx.stroke();
  };

  const handleOpenPayment = (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      addToast('Please enter your full shipping destination address.', 'error');
      return;
    }
    setIsRazorpayOpen(true);
  };

  const handleConfirmOrder = async (upiId) => {
    setIsProcessing(true);
    try {
      const res = await api.post('/orders', {
        custom_design_id: design._id,
        shipping_address: shippingAddress.trim(),
        payment_info: {
          method: 'razorpay',
          status: 'paid',
          payment_id: `rzp_pay_${Date.now()}`
        }
      });

      if (res.data?.order_id) {
        setIsRazorpayOpen(false);
        addToast('Payment confirmed! Order placed successfully.', 'success');
        navigate(`/orders/${res.data.order_id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const basePrice = Number(product?.base_price || 0);
  const gst = basePrice * 0.18;
  const totalPrice = basePrice + gst;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
            Step 3 of 3 · Final Order Review
          </span>
          <h1 className="font-display-xl text-3xl md:text-4xl text-primary font-bold leading-tight">
            Review Your Custom Decor
          </h1>
        </div>
        <Link
          to={`/products/${product?._id || product?.id}/customize`}
          className="inline-flex items-center gap-1.5 text-stone-600 hover:text-emerald-900 font-semibold text-xs transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Re-customize Design
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── Left: Canvas Mockup ─────────────────────────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 whisper-shadow border border-stone-100">
          <h2 className="font-headline-md text-xl text-primary font-bold mb-6">Visualizer Integration</h2>
          <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-md">
            <canvas
              ref={canvasRef}
              width={760}
              height={490}
              className="w-full h-auto block select-none"
            />
          </div>

          {design?.room_image_path && (
            <div className="mt-6 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-stone-400">Uploaded Room Photo</h4>
              <div className="rounded-xl overflow-hidden border border-stone-200 max-h-48">
                <img
                  src={design.room_image_path.startsWith('http') ? design.room_image_path : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${design.room_image_path}`}
                  alt="Custom room"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Specifications & Payment ───────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 whisper-shadow border border-stone-100 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h2 className="font-headline-md text-xl text-primary font-bold border-b border-stone-100 pb-4">
              Order Specifications
            </h2>

            <div className="space-y-3.5 text-xs font-medium">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">Design Signature ID</span>
                <span className="text-primary font-mono font-bold text-[11px]">{design?._id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">Selected Base</span>
                <span className="text-primary font-bold">{product?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">Curation Status</span>
                <span className="text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px]">
                  {design?.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">Dimensions Standard</span>
                <span className="text-primary font-bold">{design?.design_json?.size || 'A3'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">Frame Moulding</span>
                <span className="text-primary font-bold capitalize">{design?.design_json?.frame_style || 'Charcoal Ash'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">Subtotal</span>
                <span className="text-stone-700 font-semibold">₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-400">GST (18%)</span>
                <span className="text-stone-700 font-semibold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-stone-500 text-sm font-bold">Total Cost (incl. GST)</span>
                <span className="text-xl font-extrabold text-emerald-950">
                  ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Address Form */}
            <form onSubmit={handleOpenPayment} className="space-y-4 pt-4 border-t border-stone-100">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">
                  Shipping Destination
                </label>
                <textarea
                  rows="3"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your full street address, flat/suite, landmark and pincode..."
                  className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-emerald-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2d72d9] text-white py-4 rounded-xl font-bold hover:bg-[#2561c0] transition-colors flex items-center justify-center gap-2 shadow-lg text-sm"
              >
                <Lock className="w-4 h-4" />
                Pay with Razorpay
              </button>
              <p className="text-center text-[10px] text-stone-400">UPI · Cards · Netbanking · Instant Confirmation</p>
            </form>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-start gap-2.5 text-stone-400 text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>Secure 256-bit encrypted transaction. Handcrafted at our central design studio. Free delivery within 3-5 business days.</span>
          </div>
        </div>

      </div>

      {/* Razorpay Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={totalPrice}
        onConfirm={handleConfirmOrder}
        isProcessing={isProcessing}
      />
    </div>
  );
};
