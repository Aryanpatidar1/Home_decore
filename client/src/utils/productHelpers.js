import { demoProducts } from '../data/demoProducts';

export const resolveMediaUrl = (imagePath) => {
  if (typeof imagePath !== 'string' || !imagePath.trim()) return imagePath;

  const path = imagePath.trim();
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const apiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const serverUrl = (import.meta.env.VITE_SERVER_URL || apiUrl.replace(/\/api\/?$/, '')).replace(/\/$/, '');
  const localServerUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : '';

  if (path.startsWith('/uploads/')) {
    return `${serverUrl || localServerUrl}${path}`;
  }
  return path;
};

export const normalizeProduct = (item) => {
  if (!item || typeof item !== 'object') return null;

  const id = item._id || item.id || item.product_id || item.slug || null;
  const name = item.name || item.title || item.product_name || 'Luxury Decor Piece';
  const category = item.category || item.type || 'Home Décor';
  const description = item.description || item.short_description || item.summary || 'Elegant home décor piece for premium living spaces.';
  const basePrice = Number(item.base_price ?? item.price ?? item.sale_price ?? item.amount ?? 0);
  const imagePath = item.image_path || item.image || item.thumbnail || item.img || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80';

  return {
    ...item,
    _id: id,
    id,
    name,
    category,
    description,
    base_price: Number.isFinite(basePrice) ? basePrice : 0,
    price: Number.isFinite(basePrice) ? basePrice : 0,
    image_path: resolveMediaUrl(imagePath),
    stock: Number(item.stock ?? item.quantity ?? 10),
    is_active: item.is_active ?? true
  };
};

export const normalizeProductList = (payload, useFallback = true) => {
  const data = Array.isArray(payload)
    ? payload
    : payload?.data ?? payload?.products ?? payload?.items ?? payload?.result ?? [];

  const list = Array.isArray(data) ? data : [];
  const normalized = list.map(normalizeProduct).filter(Boolean);

  return normalized.length > 0 || !useFallback
    ? normalized
    : demoProducts.map(normalizeProduct).filter(Boolean);
};
