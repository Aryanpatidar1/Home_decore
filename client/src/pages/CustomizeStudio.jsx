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
  BrainCircuit,
  RotateCw,
  Trash2,
  Undo2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { normalizeProduct, normalizeProductList } from '../utils/productHelpers';

export const CustomizeStudio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sceneItems, setSceneItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [canUndo, setCanUndo] = useState(false);

  // Visualizer settings state
  const initialColor = searchParams.get('color') || '#064e3b';
  const [size, setSize] = useState('A3');
  const [scale, setScale] = useState(100);
  const initialFrameStyle = searchParams.get('frame_style') || 'black';
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
  const pointerActionRef = useRef(null);
  const sceneHistoryRef = useRef([]);
  const [backdropVersion, setBackdropVersion] = useState(0);

  // Preloaded image references
  const backdropImagesRef = useRef({});
  const productBaseImageRef = useRef(null);
  const sceneProductImagesRef = useRef({});

  const backdropUrls = {
    living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    dining: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    entryway: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    nursery: 'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=80',
    balcony: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
  };
  const roomScenes = [
    { id: 'living', label: 'Living room', image: backdropUrls.living },
    { id: 'bedroom', label: 'Bedroom', image: backdropUrls.bedroom },
    { id: 'dining', label: 'Dining room', image: backdropUrls.dining },
    { id: 'office', label: 'Home office', image: backdropUrls.office },
    { id: 'entryway', label: 'Entryway', image: backdropUrls.entryway },
    { id: 'nursery', label: 'Nursery', image: backdropUrls.nursery },
    { id: 'balcony', label: 'Balcony', image: backdropUrls.balcony }
  ];

  // 1. Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data?.data) {
          const loadedProduct = normalizeProduct(res.data.data);
          setProduct(loadedProduct);
          const category = loadedProduct?.category || 'Wall Decor';
          const initialSize = category === 'Lighting'
            ? { width: 160, height: 240 }
            : category === 'Soft Furnishings'
              ? { width: 180, height: 180 }
              : category === 'Rugs & Mats'
                ? { width: 340, height: 220 }
                : { width: 280, height: 360 };
          const initialItem = {
            id: `item-${loadedProduct._id || loadedProduct.id}`,
            product: loadedProduct,
            x: 240,
            y: 70,
            width: initialSize.width,
            height: initialSize.height,
            baseWidth: initialSize.width,
            baseHeight: initialSize.height,
            scale: 100,
            rotation: 0,
            color: initialColor,
            frameStyle: initialFrameStyle
          };
          setSceneItems([initialItem]);
          setSelectedItemId(initialItem.id);

          // Preload product image
          if (loadedProduct?.image_path) {
            const pImg = new Image();
            pImg.crossOrigin = 'anonymous';
            pImg.src = loadedProduct.image_path;
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

  useEffect(() => {
    api.get('/products')
      .then((res) => setCatalogProducts(normalizeProductList(res.data, true)))
      .catch((err) => {
        console.error('Failed to load visualizer products:', err);
        setCatalogProducts(normalizeProductList([]));
      });
  }, []);

  // 2. Preload Backdrops
  useEffect(() => {
    Object.entries(backdropUrls).forEach(([key, url]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        backdropImagesRef.current[key] = img;
        setBackdropVersion((version) => version + 1);
      };
      img.onerror = () => {
        backdropImagesRef.current[key] = null;
        setBackdropVersion((version) => version + 1);
      };
      img.src = url;
    });
  }, []);

  // 3. Re-render canvas whenever controls change
  useEffect(() => {
    renderCanvas();
  }, [size, scale, backdrop, customRoomImageUrl, aiArtSpec, aiSynthesizedImage, sceneItems, selectedItemId, product, backdropVersion]);

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

        if (selectedItemId) {
          updateSceneItem(selectedItemId, {
            ...(spec.shape_color ? { color: spec.shape_color } : {}),
            ...(spec.curated_frame && spec.curated_frame !== 'none' ? { frameStyle: spec.curated_frame } : {})
          });
        }

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
      const prompt = aiPrompt.toLowerCase();
      const isWarm = /boho|bohemian|earth|sun|warm/.test(prompt);
      const isGreen = /green|emerald|botanical|nature/.test(prompt);
      const spec = {
        gradient_start: isGreen ? '#dce8dd' : isWarm ? '#f2d7a5' : '#f4efe6',
        gradient_end: isGreen ? '#335c4b' : isWarm ? '#8d4d32' : '#b8c5bf',
        primary_shape: isWarm ? 'sun' : isGreen ? 'arch' : 'circle',
        shape_color: isGreen ? '#064e3b' : isWarm ? '#c47b42' : '#526d64',
        accent_shapes: [
          { shape: 'circle', x_pct: 68, y_pct: 32, size: 18, color: '#d4af37' },
          { shape: 'arch', x_pct: 34, y_pct: 67, size: 28, color: '#f5f0e7' }
        ],
        typography: isWarm ? 'Golden Hour' : isGreen ? 'Quiet Grove' : 'Soft Horizon',
        curated_font: 'serif',
        curated_frame: 'oak',
        palette_name: isWarm ? 'Terracotta Sundown' : isGreen ? 'Botanical Stillness' : 'Quiet Horizon',
        layout_description: 'Layered organic geometry creates a calm focal point with a subtle warm-metal accent.',
        typography_recommendation: 'A refined serif adds a gallery-like finish to the composition.'
      };
      setAiArtSpec(spec);
      if (selectedItemId) {
        updateSceneItem(selectedItemId, {
          color: spec.shape_color,
          frameStyle: spec.curated_frame
        });
      }
      setAiFeedback({
        palette: spec.palette_name,
        layout: spec.layout_description,
        typography: spec.typography_recommendation
      });
      addToast('AI service unavailable; your design was created with the built-in design engine.', 'info');
    } finally {
      setAiLoading(false);
    }
  };

  const recordSceneChange = (nextItems) => {
    sceneHistoryRef.current = [...sceneHistoryRef.current, sceneItems].slice(-30);
    setCanUndo(sceneHistoryRef.current.length > 0);
    setSceneItems(nextItems);
  };

  const updateSceneItem = (itemId, updates) => {
    recordSceneChange(sceneItems.map((item) => item.id === itemId ? { ...item, ...updates } : item));
  };

  const addProductToScene = (addedProduct) => {
    if (sceneItems.length >= 8) {
      addToast('You can add up to 8 pieces to one room preview.', 'info');
      return;
    }

    const category = addedProduct.category || 'Wall Decor';
    const dimensions = category === 'Lighting'
      ? { width: 110, height: 165 }
      : category === 'Soft Furnishings'
        ? { width: 125, height: 125 }
        : category === 'Rugs & Mats'
          ? { width: 220, height: 145 }
          : { width: 190, height: 245 };
    const offset = (sceneItems.length % 4) * 24;
    const item = {
      id: `item-${addedProduct._id || addedProduct.id}-${Date.now()}`,
      product: addedProduct,
      x: Math.min(760 - dimensions.width - 12, 340 + offset),
      y: Math.min(490 - dimensions.height - 12, 74 + offset),
      ...dimensions,
      baseWidth: dimensions.width,
      baseHeight: dimensions.height,
      scale: 100,
      rotation: 0,
      color: '#064e3b',
      frameStyle: 'black'
    };

    recordSceneChange([...sceneItems, item]);
    setSelectedItemId(item.id);
    setScale(item.scale || 100);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      sceneProductImagesRef.current[item.id] = image;
      renderCanvas();
    };
    image.src = addedProduct.image_path;
  };

  const handleUndo = () => {
    const previousItems = sceneHistoryRef.current.pop();
    if (!previousItems) return;
    setSceneItems(previousItems);
    setCanUndo(sceneHistoryRef.current.length > 0);
    if (!previousItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(previousItems[0]?.id || null);
    }
  };

  const handleDeleteSelected = () => {
    if (sceneItems.length <= 1) {
      addToast('Keep at least one piece in your room design.', 'info');
      return;
    }
    const nextItems = sceneItems.filter((item) => item.id !== selectedItemId);
    recordSceneChange(nextItems);
    setSelectedItemId(nextItems[0]?.id || null);
  };

  const handleResetScene = () => {
    if (!product) return;
    const category = product.category || 'Wall Decor';
    const dimensions = category === 'Lighting'
      ? { width: 160, height: 240 }
      : category === 'Soft Furnishings'
        ? { width: 180, height: 180 }
        : category === 'Rugs & Mats'
          ? { width: 340, height: 220 }
          : { width: 280, height: 360 };
    const resetItem = {
      id: `item-${product._id || product.id}`,
      product,
      x: 240,
      y: 70,
      ...dimensions,
      baseWidth: dimensions.width,
      baseHeight: dimensions.height,
      scale: 100,
      rotation: 0,
      color: initialColor,
      frameStyle: initialFrameStyle
    };
    recordSceneChange([resetItem]);
    setSelectedItemId(resetItem.id);
    setScale(100);
  };

  // Save Design and Proceed to Review
  const handleSaveDesign = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const baseItem = sceneItems.find((item) => (
        String(item.product._id || item.product.id) === String(product._id || product.id)
      )) || sceneItems[0];
      const category = product?.category || 'Wall Decor';

      const designData = {
        color: baseItem?.color || initialColor,
        size,
        scale: Number(scale),
        frame_style: baseItem?.frameStyle || initialFrameStyle,
        ai_art_spec: aiArtSpec,
        backdrop,
        offset_x: baseItem?.x ?? 240,
        offset_y: baseItem?.y ?? 70,
        frame_w: baseItem?.width ?? 280,
        frame_h: baseItem?.height ?? 360,
        product_category: category,
        scene_items: sceneItems.map((item) => ({
          id: item.id,
          product_id: item.product._id || item.product.id,
          name: item.product.name,
          category: item.product.category,
          image_path: item.product.image_path,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          scale: item.scale,
          rotation: item.rotation,
          color: item.color,
          frame_style: item.frameStyle
        }))
      };

      const productId = product._id || product.id;
      if (String(productId).startsWith('demo-')) {
        const designId = `local-${Date.now()}`;
        localStorage.setItem(`aura_design_${designId}`, JSON.stringify({
          _id: designId,
          product,
          design_json: designData,
          room_image_path: customRoomImageUrl
        }));
        addToast('Design saved on this device. Review your custom piece next.', 'success');
        navigate(`/designs/${designId}/preview`);
        return;
      }

      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('design_json', JSON.stringify(designData));
      if (customRoomImageFile) formData.append('room_image', customRoomImageFile);

      const res = await api.post('/designs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!res.data?.design_id) throw new Error('The design could not be saved by the server.');
      addToast('Design specifications saved successfully!', 'success');
      navigate(`/designs/${res.data.design_id}/preview`);
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
      drawRoomFallback(ctx, width, height, backdrop);
    }

    sceneItems.forEach((item) => {
      const { x, y, width: itemWidth, height: itemHeight } = item;
      const centerX = x + itemWidth / 2;
      const centerY = y + itemHeight / 2;
      const itemProductId = item.product._id || item.product.id;
      const isBaseProduct = itemProductId === (product?._id || product?.id);
      const itemImage = isBaseProduct
        ? productBaseImageRef.current
        : sceneProductImagesRef.current[item.id];

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      const category = item.product.category || 'Wall Decor';
      const itemColor = item.color || '#064e3b';
      const itemFrameStyle = item.frameStyle || 'black';
      if (category === 'Lighting') {
        drawLighting(ctx, x, y, itemWidth, itemHeight, itemColor, itemFrameStyle);
      } else if (category === 'Soft Furnishings') {
        drawSoftFurnishings(ctx, x, y, itemWidth, itemHeight, itemColor);
      } else if (category === 'Rugs & Mats') {
        drawRug(ctx, x, y, itemWidth, itemHeight, itemColor);
      } else if (category === 'Decorative Accents') {
        drawAccent(ctx, x, y, itemWidth, itemHeight, itemColor);
      } else {
        drawWallDecor(ctx, x, y, itemWidth, itemHeight, {
          image: itemImage,
          useAiArt: isBaseProduct,
          color: itemColor,
          frameStyle: itemFrameStyle
        });
      }

      if (item.id === selectedItemId) {
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 5]);
        ctx.strokeRect(x - 5, y - 5, itemWidth + 10, itemHeight + 10);
        ctx.setLineDash([]);

        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(centerX, y - 22, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + itemWidth - 8, y + itemHeight - 8, 16, 16);
      }
      ctx.restore();
    });
  };

  const drawRoomFallback = (ctx, width, height, scene) => {
    const palettes = {
      living: ['#e9dfd0', '#b69a7b', '#75604d'],
      bedroom: ['#e4ddd3', '#a99684', '#75695f'],
      dining: ['#eee5d7', '#b79d7e', '#675443'],
      office: ['#e3e5df', '#aa9b85', '#55564b'],
      entryway: ['#eee8dc', '#b5a58d', '#685747'],
      nursery: ['#f1e9df', '#c9b5a1', '#8d7968'],
      balcony: ['#e6e4d8', '#a6a18a', '#5f6651']
    };
    const [wall, floor, detail] = palettes[scene] || palettes.living;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, wall);
    gradient.addColorStop(0.76, wall);
    gradient.addColorStop(0.77, floor);
    gradient.addColorStop(1, floor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.46)';
    ctx.fillRect(34, 36, 142, 168);
    ctx.fillStyle = 'rgba(196,218,220,0.55)';
    ctx.fillRect(43, 45, 124, 150);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 8;
    ctx.strokeRect(39, 41, 132, 158);

    ctx.fillStyle = detail;
    ctx.fillRect(0, 346, width, 5);
    ctx.fillStyle = 'rgba(28,25,23,0.10)';
    ctx.fillRect(0, 351, width, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(width * 0.58, 0, width * 0.42, 343);
  };

  // Category Renderers
  const drawWallDecor = (ctx, fX, fY, fWidth, fHeight, { image, useAiArt, color: itemColor, frameStyle: itemFrameStyle } = {}) => {
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
    const activeFrameStyle = itemFrameStyle || 'black';
    const fColor = frameColors[activeFrameStyle] || '#1c1917';
    const borderThickness = activeFrameStyle === 'none' ? 0 : 14;

    if (borderThickness > 0) {
      ctx.fillStyle = fColor;
      ctx.fillRect(fX, fY, fWidth, fHeight);
    }

    // Inner Passpartout Matting
    const matting = activeFrameStyle === 'none' ? 0 : 18;
    const innerX = fX + borderThickness + matting;
    const innerY = fY + borderThickness + matting;
    const innerW = fWidth - (borderThickness + matting) * 2;
    const innerH = fHeight - (borderThickness + matting) * 2;

    if (matting > 0) {
      ctx.fillStyle = '#fcfbf7';
      ctx.fillRect(fX + borderThickness, fY + borderThickness, fWidth - borderThickness * 2, fHeight - borderThickness * 2);
    }

    // Artwork Area
    if (useAiArt && aiSynthesizedImage) {
      ctx.drawImage(aiSynthesizedImage, innerX, innerY, innerW, innerH);
    } else if (useAiArt && aiArtSpec) {
      drawAiVectorArt(ctx, innerX, innerY, innerW, innerH, aiArtSpec, itemColor);
    } else if (image) {
      ctx.drawImage(image, innerX, innerY, innerW, innerH);
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = itemColor || '#064e3b';
      ctx.fillRect(innerX, innerY, innerW, innerH);
      ctx.restore();
    } else {
      ctx.fillStyle = itemColor || '#064e3b';
      ctx.fillRect(innerX, innerY, innerW, innerH);
    }

    ctx.restore();
  };

  const drawAiVectorArt = (ctx, x, y, w, h, spec, itemColor) => {
    // Gradient background
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, spec.gradient_start || '#faf9f6');
    grad.addColorStop(1, spec.gradient_end || '#e5e5e0');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Primary shape
    ctx.fillStyle = itemColor || spec.shape_color || '#064e3b';
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

  const drawLighting = (ctx, x, y, w, h, itemColor, itemFrameStyle) => {
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
    ctx.fillStyle = itemColor;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y + h * 0.2);
    ctx.lineTo(x + w * 0.8, y + h * 0.2);
    ctx.lineTo(x + w * 0.9, y + h * 0.55);
    ctx.lineTo(x + w * 0.1, y + h * 0.55);
    ctx.closePath();
    ctx.fill();

    // Stem & Base
    ctx.fillStyle = itemFrameStyle === 'gold' ? '#d4af37' : '#1c1917';
    ctx.fillRect(x + w / 2 - 4, y + h * 0.55, 8, h * 0.35);
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.9, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawSoftFurnishings = (ctx, x, y, w, h, itemColor) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    // Cushion rounded diamond/pillow contour
    ctx.fillStyle = itemColor;
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

  const drawRug = (ctx, x, y, w, h, itemColor) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    // Perspective projection on floor
    ctx.fillStyle = itemColor;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.15, y);
    ctx.lineTo(x + w * 0.85, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawAccent = (ctx, x, y, w, h, itemColor) => {
    ctx.save();
    ctx.fillStyle = itemColor;
    // Trio of stylized ceramic vases
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.6, 25, 40, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.65, y + h * 0.5, 30, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // ─── Select, Move, Resize & Rotate Scene Items ───────────────────
  const getCanvasPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (event.clientY - rect.top) * (canvasRef.current.height / rect.height)
    };
  };

  const getItemLocalPoint = (point, item) => {
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    const angle = (-item.rotation * Math.PI) / 180;
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    return {
      x: centerX + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: centerY + dx * Math.sin(angle) + dy * Math.cos(angle)
    };
  };

  const handlePointerDown = (event) => {
    const point = getCanvasPoint(event);
    for (let index = sceneItems.length - 1; index >= 0; index -= 1) {
      const item = sceneItems[index];
      const localPoint = getItemLocalPoint(point, item);
      if (localPoint.x < item.x - 12 || localPoint.x > item.x + item.width + 12
        || localPoint.y < item.y - 32 || localPoint.y > item.y + item.height + 12) continue;

      setSelectedItemId(item.id);
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      const rotateHandleDistance = Math.hypot(localPoint.x - centerX, localPoint.y - (item.y - 22));
      const mode = localPoint.x >= item.x + item.width - 18 && localPoint.y >= item.y + item.height - 18
        ? 'resize'
        : rotateHandleDistance < 16
          ? 'rotate'
          : 'move';
      sceneHistoryRef.current = [...sceneHistoryRef.current, sceneItems].slice(-30);
      setCanUndo(true);
      pointerActionRef.current = {
        pointerId: event.pointerId,
        item,
        mode,
        startPoint: point,
        startAngle: Math.atan2(point.y - centerY, point.x - centerX)
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }
    setSelectedItemId(null);
  };

  const handlePointerMove = (event) => {
    const action = pointerActionRef.current;
    if (!action || action.pointerId !== event.pointerId) return;
    const point = getCanvasPoint(event);
    const { item } = action;
    let updatedItem;

    if (action.mode === 'move') {
      updatedItem = {
        ...item,
        x: Math.max(0, Math.min(760 - item.width, item.x + point.x - action.startPoint.x)),
        y: Math.max(0, Math.min(490 - item.height, item.y + point.y - action.startPoint.y))
      };
    } else if (action.mode === 'resize') {
      const localPoint = getItemLocalPoint(point, item);
      const localStart = getItemLocalPoint(action.startPoint, item);
      const width = Math.max(70, Math.min(620, 760 - item.x, item.width + localPoint.x - localStart.x));
      const ratio = item.height / item.width;
      const sizeMultiplier = size === 'A4' ? 0.8 : size === 'A2' ? 1.25 : 1;
      const nextScale = Math.round((width / item.baseWidth / sizeMultiplier) * 100);
      updatedItem = {
        ...item,
        width,
        height: Math.max(70, Math.min(460, width * ratio)),
        scale: nextScale
      };
      if (item.id === selectedItemId) setScale(nextScale);
    } else {
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      const angle = Math.atan2(point.y - centerY, point.x - centerX);
      const angleDelta = ((angle - action.startAngle) * 180) / Math.PI;
      updatedItem = { ...item, rotation: item.rotation + angleDelta };
    }

    setSceneItems((currentItems) => currentItems.map((sceneItem) => (
      sceneItem.id === item.id ? updatedItem : sceneItem
    )));
  };

  const handlePointerUp = (event) => {
    if (pointerActionRef.current?.pointerId === event.pointerId) {
      pointerActionRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedSceneItem = sceneItems.find((item) => item.id === selectedItemId);

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

          <section className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Room items</h3>
                <p className="mt-1 text-[11px] text-stone-500">Add pieces, then select and edit them on the canvas.</p>
              </div>
              <span className="text-[11px] font-semibold text-stone-500">{sceneItems.length}/8</span>
            </div>
            <select
              value=""
              onChange={(event) => {
                const selectedProduct = catalogProducts.find((item) => String(item._id) === event.target.value);
                if (selectedProduct) addProductToScene(selectedProduct);
              }}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-semibold text-stone-700"
              aria-label="Add a product to the room"
            >
              <option value="">+ Add another product to the room</option>
              {catalogProducts.map((catalogProduct) => (
                <option key={catalogProduct._id || catalogProduct.id} value={catalogProduct._id || catalogProduct.id}>
                  {catalogProduct.name} · {catalogProduct.category}
                </option>
              ))}
            </select>

            <div className="space-y-1.5">
              {sceneItems.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setScale(item.scale || 100);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs ${
                    selectedItemId === item.id
                      ? 'border-emerald-700 bg-white text-emerald-950'
                      : 'border-transparent bg-white/70 text-stone-600'
                  }`}
                  aria-pressed={selectedItemId === item.id}
                >
                  <span className="truncate pr-3">{index + 1}. {item.product.name}</span>
                  {selectedItemId === item.id && <span className="shrink-0 font-bold">{Math.round(item.scale || 100)}%</span>}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 className="h-3.5 w-3.5" /> Undo
              </button>
              <button
                type="button"
                onClick={() => selectedSceneItem && updateSceneItem(selectedSceneItem.id, {
                  rotation: (selectedSceneItem.rotation + 15) % 360
                })}
                disabled={!selectedSceneItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] font-semibold text-stone-700 disabled:opacity-40"
              >
                <RotateCw className="h-3.5 w-3.5" /> Rotate 15°
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={!selectedSceneItem || sceneItems.length <= 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-[11px] font-semibold text-red-700 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
              <button
                type="button"
                onClick={handleResetScene}
                className="ml-auto rounded-lg px-2 py-2 text-[11px] font-semibold text-stone-500 hover:text-stone-800"
              >
                Reset room
              </button>
            </div>
          </section>

          {/* AI Vector Art Spec Prompt Box */}
          <div className="p-5 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-2xl border border-emerald-800/40 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <h3 className="text-xs uppercase tracking-widest font-bold text-emerald-200">
                AI Wall Art Spec Generator
              </h3>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Describe your art style to generate a live palette and layout. Gemini is used when configured; the built-in design engine keeps the studio working without an API key.
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
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">
                Color Profile{selectedSceneItem ? ` · ${selectedSceneItem.product.name}` : ''}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedSceneItem?.color || initialColor}
                  onChange={(e) => selectedSceneItem && updateSceneItem(selectedSceneItem.id, { color: e.target.value })}
                  disabled={!selectedSceneItem}
                  className="w-12 h-11 bg-transparent border-0 cursor-pointer rounded-xl p-0"
                />
                <div className="flex-1 flex gap-2 flex-wrap">
                  {['#064e3b', '#78350f', '#1e3a8a', '#1c1917', '#fef3c7'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => selectedSceneItem && updateSceneItem(selectedSceneItem.id, { color: hex })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${(selectedSceneItem?.color || initialColor) === hex ? 'border-emerald-600 scale-110 shadow-md' : 'border-white/40'}`}
                      style={{ backgroundColor: hex }}
                      aria-label={hex}
                      disabled={!selectedSceneItem}
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
                onChange={(e) => {
                  const nextSize = e.target.value;
                  setSize(nextSize);
                  if (selectedSceneItem) {
                    const multiplier = nextSize === 'A4' ? 0.8 : nextSize === 'A2' ? 1.25 : 1;
                    recordSceneChange(sceneItems.map((item) => item.id === selectedSceneItem.id
                      ? {
                        ...item,
                        width: item.baseWidth * (item.scale / 100) * multiplier,
                        height: item.baseHeight * (item.scale / 100) * multiplier
                      }
                      : item));
                  }
                }}
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
                <span className="text-emerald-950 font-bold">{selectedSceneItem?.scale || scale}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="150"
                value={selectedSceneItem?.scale || scale}
                onPointerDown={() => {
                  if (selectedSceneItem) {
                    sceneHistoryRef.current = [...sceneHistoryRef.current, sceneItems].slice(-30);
                    setCanUndo(true);
                  }
                }}
                onChange={(e) => {
                  const nextScale = Number(e.target.value);
                  setScale(nextScale);
                  if (!selectedSceneItem) return;
                  const multiplier = size === 'A4' ? 0.8 : size === 'A2' ? 1.25 : 1;
                  setSceneItems((currentItems) => currentItems.map((item) => item.id === selectedSceneItem.id
                    ? {
                      ...item,
                      scale: nextScale,
                      width: item.baseWidth * (nextScale / 100) * multiplier,
                      height: item.baseHeight * (nextScale / 100) * multiplier
                    }
                    : item));
                }}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
              />
            </div>

            {/* Frame Moulding */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400">
                Frame Moulding{selectedSceneItem ? ` · ${selectedSceneItem.product.name}` : ''}
              </label>
              <select
                value={selectedSceneItem?.frameStyle || initialFrameStyle}
                onChange={(e) => selectedSceneItem && updateSceneItem(selectedSceneItem.id, { frameStyle: e.target.value })}
                disabled={!selectedSceneItem}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roomScenes.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setBackdrop(room.id)}
                    aria-pressed={backdrop === room.id}
                    className={`group overflow-hidden rounded-xl border text-left transition-all ${
                      backdrop === room.id
                        ? 'border-emerald-800 ring-2 ring-emerald-800/20 shadow-md'
                        : 'border-stone-200 hover:border-emerald-700'
                    }`}
                  >
                    <img src={room.image} alt="" className="h-16 w-full object-cover" loading="lazy" />
                    <span className={`block px-2 py-2 text-[10px] font-semibold ${backdrop === room.id ? 'bg-emerald-950 text-white' : 'bg-stone-50 text-stone-700'}`}>
                      {room.label}
                    </span>
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
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-auto block cursor-grab active:cursor-grabbing select-none touch-none"
              />

              {/* Drag indicator pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 text-white text-[10px] font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                <Move className="w-3.5 h-3.5" />
                Drag to move · corner handle to resize · top handle to rotate
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
              <strong>Editable room:</strong> Select an item, drag it to move, use the lower corner to resize, or the top handle to rotate. Add up to 8 products, adjust the selected item with the scale control, and undo changes. On touchscreens, drag the same handles directly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
