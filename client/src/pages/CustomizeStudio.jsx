import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Layers,
  Wand2,
  Info,
  Check,
  Move,
  BrainCircuit
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const CustomizeStudio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Visualizer settings state
  const [color, setColor] = useState(searchParams.get('color') || '#064e3b');
  const [size, setSize] = useState('A3');
  const [scale, setScale] = useState(100);
  const [frameStyle, setFrameStyle] = useState(searchParams.get('frame_style') || 'black');
  const [backdrop, setBackdrop] = useState('living');
  const [customRoomImageFile, setCustomRoomImageFile] = useState(null);
  const [customRoomImageUrl, setCustomRoomImageUrl] = useState(null);

  // AI Art spec state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiArtSpec, setAiArtSpec] = useState(null);
  const [aiSynthesizedImage, setAiSynthesizedImage] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);

  // Canvas and dragging state
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [frameOffset, setFrameOffset] = useState({ x: 240, y: 70 });

  // Preloaded image references
  const backdropImagesRef = useRef({});
  const productBaseImageRef = useRef(null);

  const backdropUrls = {
    living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
  };

  // 1. Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data?.data) {
          setProduct(res.data.data);

          // Preload product image
          if (res.data.data.image_path) {
            const pImg = new Image();
            pImg.crossOrigin = 'anonymous';
            pImg.src = res.data.data.image_path;
            pImg.onload = () => {
              productBaseImageRef.current = pImg;
              renderCanvas();
            };
          }
        }
      } catch (err) {
        addToast('Product not found', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Preload Backdrops
  useEffect(() => {
    Object.entries(backdropUrls).forEach(([key, url]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        backdropImagesRef.current[key] = img;
        if (key === backdrop) renderCanvas();
      };
    });
  }, []);

  // 3. Re-render canvas whenever controls change
  useEffect(() => {
    renderCanvas();
  }, [color, size, scale, frameStyle, backdrop, customRoomImageUrl, aiArtSpec, aiSynthesizedImage, frameOffset]);

  // Handle Room Photo Upload
  const handleRoomImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomRoomImageFile(file);
      const url = URL.createObjectURL(file);
      setCustomRoomImageUrl(url);

      const img = new Image();
      img.onload = () => {
        backdropImagesRef.current['custom'] = img;
        setBackdrop('custom');
      };
      img.src = url;
    }
  };

  // Generate AI Vector Art
  const handleGenerateAiArt = async () => {
    if (!aiPrompt.trim()) {
      addToast('Please enter an art prompt (e.g. bohemian abstract sun sunset)', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.post('/ai/generate-art', { prompt: aiPrompt.trim() });
      if (res.data?.data) {
        const spec = res.data.data;
        setAiArtSpec(spec);

        if (spec.shape_color) setColor(spec.shape_color);
        if (spec.curated_frame && spec.curated_frame !== 'none') setFrameStyle(spec.curated_frame);

        setAiFeedback({
          palette: spec.palette_name,
          layout: spec.layout_description,
          typography: spec.typography_recommendation
        });

        // Load synthesized image if returned
        if (spec.synthesized_image_base64) {
          const aiImg = new Image();
          aiImg.onload = () => {
            setAiSynthesizedImage(aiImg);
          };
          aiImg.src = spec.synthesized_image_base64;
        }

        addToast(`AI spec generated! Palette: ${spec.palette_name || 'Curated'}`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'AI generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Save Design and Proceed to Review
  const handleSaveDesign = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const category = product?.category || 'Wall Decor';
      const sizeMultiplier = size === 'A4' ? 0.8 : size === 'A2' ? 1.25 : 1;
      const baseW = (category === 'Lighting' ? 160 : category === 'Soft Furnishings' ? 180 : category === 'Rugs & Mats' ? 340 : 280) * (scale / 100) * sizeMultiplier;
      const baseH = (category === 'Lighting' ? 240 : category === 'Soft Furnishings' ? 180 : category === 'Rugs & Mats' ? 220 : 360) * (scale / 100) * sizeMultiplier;

      const designData = {
        color,
        size,
        scale: Number(scale),
        frame_style: frameStyle,
        ai_art_spec: aiArtSpec,
        backdrop,
        offset_x: frameOffset.x,
        offset_y: frameOffset.y,
        frame_w: baseW,
        frame_h: baseH,
        product_category: category
      };

      const formData = new FormData();
      formData.append('product_id', product._id || product.id);
      formData.append('design_json', JSON.stringify(designData));

      if (customRoomImageFile) {
        formData.append('room_image', customRoomImageFile);
      }

      const res = await api.post('/designs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.design_id) {
        addToast('Design specifications saved successfully!', 'success');
        navigate(`/designs/${res.data.design_id}/preview`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save design.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── CANVAS RENDERING ENGINE ──────────────────────────────────────
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Backdrop Image
    const activeBackdropImg = backdrop === 'custom'
      ? backdropImagesRef.current['custom']
      : backdropImagesRef.current[backdrop] || backdropImagesRef.current['living'];

    if (activeBackdropImg) {
      ctx.drawImage(activeBackdropImg, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#f5f5f4';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Compute category-specific dimensions
    const category = product?.category || 'Wall Decor';
    const sizeMultiplier = size === 'A4' ? 0.8 : size === 'A2' ? 1.25 : 1;
    const scaleFactor = (scale / 100) * sizeMultiplier;

    let fWidth = 280 * scaleFactor;
    let fHeight = 360 * scaleFactor;

    if (category === 'Lighting') {
      fWidth = 160 * scaleFactor;
      fHeight = 240 * scaleFactor;
    } else if (category === 'Soft Furnishings') {
      fWidth = 180 * scaleFactor;
      fHeight = 180 * scaleFactor;
    } else if (category === 'Rugs & Mats') {
      fWidth = 340 * scaleFactor;
      fHeight = 220 * scaleFactor;
    }

    const fX = frameOffset.x;
    const fY = frameOffset.y;

    // 3. Render Product by Category
    if (category === 'Lighting') {
      drawLighting(ctx, fX, fY, fWidth, fHeight);
    } else if (category === 'Soft Furnishings') {
      drawSoftFurnishings(ctx, fX, fY, fWidth, fHeight);
    } else if (category === 'Rugs & Mats') {
      drawRug(ctx, fX, fY, fWidth, fHeight);
    } else if (category === 'Decorative Accents') {
      drawAccent(ctx, fX, fY, fWidth, fHeight);
    } else {
      drawWallDecor(ctx, fX, fY, fWidth, fHeight);
    }

    // 4. Draw dimension indicators
    const rY = fY + fHeight + 16;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fX, rY);
    ctx.lineTo(fX + fWidth, rY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(fX, rY - 4);
    ctx.lineTo(fX, rY + 4);
    ctx.moveTo(fX + fWidth, rY - 4);
    ctx.lineTo(fX + fWidth, rY + 4);
    ctx.stroke();
  };

  // Category Renderers
  const drawWallDecor = (ctx, fX, fY, fWidth, fHeight) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 16;

    // Frame Moulding
    const frameColors = {
      black: '#1c1917',
      oak: '#8c6239',
      gold: '#d4af37',
      none: 'transparent'
    };
    const fColor = frameColors[frameStyle] || '#1c1917';
    const borderThickness = frameStyle === 'none' ? 0 : 14;

    if (borderThickness > 0) {
      ctx.fillStyle = fColor;
      ctx.fillRect(fX, fY, fWidth, fHeight);
    }

    // Inner Passpartout Matting
    const matting = frameStyle === 'none' ? 0 : 18;
    const innerX = fX + borderThickness + matting;
    const innerY = fY + borderThickness + matting;
    const innerW = fWidth - (borderThickness + matting) * 2;
    const innerH = fHeight - (borderThickness + matting) * 2;

    if (matting > 0) {
      ctx.fillStyle = '#fcfbf7';
      ctx.fillRect(fX + borderThickness, fY + borderThickness, fWidth - borderThickness * 2, fHeight - borderThickness * 2);
    }

    // Artwork Area
    if (aiSynthesizedImage) {
      ctx.drawImage(aiSynthesizedImage, innerX, innerY, innerW, innerH);
    } else if (aiArtSpec) {
      drawAiVectorArt(ctx, innerX, innerY, innerW, innerH, aiArtSpec);
    } else if (productBaseImageRef.current) {
      ctx.drawImage(productBaseImageRef.current, innerX, innerY, innerW, innerH);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(innerX, innerY, innerW, innerH);
    }

    ctx.restore();
  };

  const drawAiVectorArt = (ctx, x, y, w, h, spec) => {
    // Gradient background
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, spec.gradient_start || '#faf9f6');
    grad.addColorStop(1, spec.gradient_end || '#e5e5e0');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Primary shape
    ctx.fillStyle = spec.shape_color || color;
    const pX = x + w / 2;
    const pY = y + h / 2;

    if (spec.primary_shape === 'circle') {
      ctx.beginPath();
      ctx.arc(pX, pY, w * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (spec.primary_shape === 'arch') {
      ctx.beginPath();
      ctx.moveTo(pX - 45, pY - 20);
      ctx.arc(pX, pY - 20, 45, Math.PI, 0);
      ctx.lineTo(pX + 45, pY + 50);
      ctx.lineTo(pX - 45, pY + 50);
      ctx.closePath();
      ctx.fill();
    } else if (spec.primary_shape === 'sun') {
      ctx.beginPath();
      ctx.arc(pX, pY + 30, 50, Math.PI, 0);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(pX, pY, w * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Typography
    if (spec.typography) {
      ctx.fillStyle = '#1c1917';
      ctx.font = `600 12px ${spec.curated_font === 'serif' ? 'serif' : 'sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.fillText(spec.typography, pX, y + h - 16);
    }
  };

  const drawLighting = (ctx, x, y, w, h) => {
    ctx.save();
    // Ambient light glow
    const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.4, 10, x + w / 2, y + h * 0.4, 120);
    glow.addColorStop(0, 'rgba(255, 252, 230, 0.9)');
    glow.addColorStop(0.3, 'rgba(253, 224, 71, 0.25)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.4, 120, 0, Math.PI * 2);
    ctx.fill();

    // Fixture base & shade
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y + h * 0.2);
    ctx.lineTo(x + w * 0.8, y + h * 0.2);
    ctx.lineTo(x + w * 0.9, y + h * 0.55);
    ctx.lineTo(x + w * 0.1, y + h * 0.55);
    ctx.closePath();
    ctx.fill();

    // Stem & Base
    ctx.fillStyle = frameStyle === 'gold' ? '#d4af37' : '#1c1917';
    ctx.fillRect(x + w / 2 - 4, y + h * 0.55, 8, h * 0.35);
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.9, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawSoftFurnishings = (ctx, x, y, w, h) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    // Cushion rounded diamond/pillow contour
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y + h * 0.1);
    ctx.quadraticCurveTo(x + w * 0.5, y, x + w * 0.9, y + h * 0.1);
    ctx.quadraticCurveTo(x + w, y + h * 0.5, x + w * 0.9, y + h * 0.9);
    ctx.quadraticCurveTo(x + w * 0.5, y + h, x + w * 0.1, y + h * 0.9);
    ctx.quadraticCurveTo(x, y + h * 0.5, x + w * 0.1, y + h * 0.1);
    ctx.closePath();
    ctx.fill();

    // Inner embroidery highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const drawRug = (ctx, x, y, w, h) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    // Perspective projection on floor
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.15, y);
    ctx.lineTo(x + w * 0.85, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawAccent = (ctx, x, y, w, h) => {
    ctx.save();
    ctx.fillStyle = color;
    // Trio of stylized ceramic vases
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.6, 25, 40, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.65, y + h * 0.5, 30, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // ─── Drag & Drop Event Handlers ──────────────────────────────────
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = { x: x - frameOffset.x, y: y - frameOffset.y };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFrameOffset({
      x: Math.max(10, Math.min(500, x - dragStartRef.current.x)),
      y: Math.max(10, Math.min(300, y - dragStartRef.current.y))
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      
      {/* ─── Breadcrumb & Title ──────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-900 transition-colors font-semibold text-xs mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collection
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
              Step 2 of 3 · Studio Visualizer
            </span>
            <h1 className="font-display-xl text-3xl md:text-4xl text-primary font-bold leading-tight">
              {product?.name}
            </h1>
          </div>
          <div className="bg-stone-50 border border-stone-200 px-6 py-3 rounded-2xl">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 block">Base Price</span>
            <span className="text-xl font-bold text-emerald-950">₹{Number(product?.base_price).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── Left: Controls Column ─────────────────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 whisper-shadow border border-stone-100 space-y-6 h-fit">
          <h2 className="font-headline-md text-xl text-primary font-bold">Visualizer Controls</h2>

          {/* AI Vector Art Spec Prompt Box */}
          <div className="p-5 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-2xl border border-emerald-800/40 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <h3 className="text-xs uppercase tracking-widest font-bold text-emerald-200">
                AI Wall Art Spec Generator
              </h3>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Type an abstract design prompt, and let Gemini AI create premium vector layouts, matching color palettes, and typographic accents instantly!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. bohemian abstract sun sunset..."
                className="flex-1 bg-white/10 border border-white/20 px-3 py-2 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-300"
              />
              <button
                type="button"
                onClick={handleGenerateAiArt}
                disabled={aiLoading}
                className="bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-300 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {aiLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* AI Feedback Rationale */}
          {aiFeedback && (
            <div className="p-4 bg-stone-50 border border-emerald-500/30 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
                <BrainCircuit className="w-3.5 h-3.5 text-emerald-700" />
                <span>AI Design Rationale</span>
              </div>
              <p><strong>Palette:</strong> {aiFeedback.palette}</p>
              <p><strong>Layout:</strong> {aiFeedback.layout}</p>
            </div>
          )}

          <form onSubmit={handleSaveDesign} className="space-y-6">
            
            {/* Color Profile */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">Color Profile</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-11 bg-transparent border-0 cursor-pointer rounded-xl p-0"
                />
                <div className="flex-1 flex gap-2 flex-wrap">
                  {['#064e3b', '#78350f', '#1e3a8a', '#1c1917', '#fef3c7'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${color === hex ? 'border-emerald-600 scale-110 shadow-md' : 'border-white/40'}`}
                      style={{ backgroundColor: hex }}
                      aria-label={hex}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Dimensions */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">Canvas Dimensions</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-700"
              >
                <option value="A4">A4 (Small / 21 × 29.7 cm)</option>
                <option value="A3">A3 (Medium / 29.7 × 42 cm)</option>
                <option value="A2">A2 (Large / 42 × 59.4 cm)</option>
              </select>
            </div>

            {/* Scale Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-stone-400">
                <span>Interactive Decor Scale</span>
                <span className="text-emerald-950 font-bold">{scale}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
              />
            </div>

            {/* Frame Moulding */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">Frame Moulding</label>
              <select
                value={frameStyle}
                onChange={(e) => setFrameStyle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-700"
              >
                <option value="black">Charcoal Ash (Deep Black)</option>
                <option value="oak">Raw Oak (Warm Natural)</option>
                <option value="gold">Bespoke Gold (Metallic Brass)</option>
                <option value="none">Borderless Canvas Wrap</option>
              </select>
            </div>

            {/* Room Scene Backdrop */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">Room Scene Backdrop</label>
              <div className="grid grid-cols-3 gap-2">
                {['living', 'bedroom', 'office'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBackdrop(b)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      backdrop === b
                        ? 'bg-emerald-950 text-white shadow-md'
                        : 'bg-stone-50 border border-stone-200 text-stone-600 hover:text-emerald-900'
                    }`}
                  >
                    {b === 'living' ? 'Living Room' : b === 'bedroom' ? 'Bedroom' : 'Study Office'}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom Room Photo */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">
                Upload Your Wall Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleRoomImageChange}
                className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-950 file:text-white hover:file:bg-emerald-900 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-950 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-900 shadow-[0_0_20px_rgba(6,78,59,0.3)] transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Saving Specifications...' : 'Save Design & Preview'}
              <Wand2 className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ─── Right: Canvas Showcase ─────────────────────────────────── */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 whisper-shadow border border-stone-100 flex flex-col justify-between h-fit lg:sticky lg:top-24">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-xl text-primary font-bold">Room Visualizer</h2>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                Real-time Canvas
              </span>
            </div>

            {/* Canvas Element */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-md">
              <canvas
                ref={canvasRef}
                width={760}
                height={490}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-auto block cursor-grab active:cursor-grabbing select-none"
              />

              {/* Drag indicator pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 text-white text-[10px] font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                <Move className="w-3.5 h-3.5" />
                Drag to reposition piece on the wall
              </div>

              {/* AI Loading status overlay */}
              {aiLoading && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center text-white space-y-3">
                  <Sparkles className="w-10 h-10 animate-spin text-emerald-300" />
                  <p className="font-bold text-sm">Generating AI Design Specs...</p>
                  <p className="text-xs text-stone-300 font-mono">Synthesizing vectors & neural pixels...</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs text-stone-500 leading-relaxed">
            <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <p>
              <strong>Live Canvas Active:</strong> Drag the piece anywhere on the wall to preview balance and scale. Click <strong>Generate AI Art</strong> to construct unique geometric and organic canvas artwork live in the frame!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
