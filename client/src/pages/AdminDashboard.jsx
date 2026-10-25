import React, { useState, useEffect } from 'react';
import { Shield, Package, ShoppingBag, Plus, Check, RefreshCw, Eye, Edit2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const AdminDashboard = () => {
  const [tab, setTab] = useState('orders'); // 'orders' or 'products'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New product form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Wall Decor');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdImage, setNewProdImage] = useState('');

  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes] = await Promise.all([
        api.get('/orders/admin/all'),
        api.get('/products')
      ]);
      if (orderRes.data?.data) setOrders(orderRes.data.data);
      if (prodRes.data?.data) setProducts(prodRes.data.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin management data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      addToast(`Order status updated to "${newStatus}"`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    }
  };

  const handleToggleProduct = async (prodId) => {
    try {
      const res = await api.delete(`/products/${prodId}`);
      if (res.data?.data) {
        setProducts((prev) =>
          prev.map((p) => (p._id === prodId ? res.data.data : p))
        );
        addToast(res.data.message || 'Product updated', 'success');
      }
    } catch (err) {
      addToast('Failed to toggle product status.', 'error');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    try {
      const res = await api.post('/products', {
        name: newProdName,
        category: newProdCategory,
        base_price: parseFloat(newProdPrice),
        description: newProdDesc,
        stock: parseInt(newProdStock, 10),
        image_path: newProdImage || undefined
      });

      if (res.data?.data) {
        setProducts([res.data.data, ...products]);
        setShowAddModal(false);
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDesc('');
        setNewProdImage('');
        addToast('New product created successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create product.', 'error');
    }
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total_price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
      
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-amber-500/15 text-amber-800 text-[11px] font-bold uppercase tracking-widest border border-amber-300">
            <Shield className="w-3.5 h-3.5" />
            Executive Administration
          </span>
          <h1 className="font-display-xl text-3xl md:text-5xl text-primary font-bold leading-tight">
            Control Dashboard
          </h1>
          <p className="text-stone-500 text-sm mt-1">Manage global orders, customer specifications, and catalog inventory.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-950 text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-emerald-900 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 whisper-shadow">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-stone-400">Total Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-emerald-700 mt-2 font-bold">18% GST Accounted</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-100 whisper-shadow">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-stone-400">Total Orders</p>
          <p className="text-2xl font-extrabold text-primary mt-1">{orders.length}</p>
          <p className="text-[10px] text-stone-400 mt-2 font-medium">Bespoke & Direct Cart</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-100 whisper-shadow">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-stone-400">Active Products</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {products.filter((p) => p.is_active).length}
          </p>
          <p className="text-[10px] text-stone-400 mt-2 font-medium">Out of {products.length} in catalog</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-100 whisper-shadow">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-stone-400">Database Engine</p>
          <p className="text-xl font-extrabold text-emerald-900 mt-1">MongoDB Native</p>
          <p className="text-[10px] text-emerald-700 mt-2 font-bold">Port 27017 Connected</p>
        </div>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex border-b border-stone-200 mb-6 gap-6">
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 text-sm font-bold transition-colors ${
            tab === 'orders'
              ? 'text-emerald-950 border-b-2 border-emerald-950'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab('products')}
          className={`pb-3 text-sm font-bold transition-colors ${
            tab === 'products'
              ? 'text-emerald-950 border-b-2 border-emerald-950'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Catalog Inventory ({products.length})
        </button>
      </div>

      {/* ─── Orders Table ────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-100 whisper-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 uppercase tracking-widest text-[10px] text-stone-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Order Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Pieces / Design</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-950">
                      {o.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900">{o.shipping_address?.name || o.user_id?.name || 'Customer'}</p>
                      <p className="text-[10px] text-stone-400">{o.shipping_address?.phone || o.user_id?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {o.custom_design_id ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          Bespoke Studio Design
                        </span>
                      ) : (
                        <span>{o.items?.length || 1} Item(s)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">
                      ₹{Number(o.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                        className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-800 cursor-pointer"
                      >
                        <option value="placed">placed</option>
                        <option value="confirmed">confirmed</option>
                        <option value="crafting">crafting</option>
                        <option value="dispatched">dispatched</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Products Table ──────────────────────────────────────────── */}
      {tab === 'products' && (
        <div className="bg-white rounded-3xl border border-stone-100 whisper-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 uppercase tracking-widest text-[10px] text-stone-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Base Price</th>
                  <th className="px-6 py-4">Inventory Stock</th>
                  <th className="px-6 py-4">Active</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={p.image_path} className="w-10 h-10 rounded-lg object-cover" alt={p.name} />
                      <span className="font-bold text-stone-900">{p.name}</span>
                    </td>
                    <td className="px-6 py-4">{p.category}</td>
                    <td className="px-6 py-4 font-bold text-emerald-950">
                      ₹{Number(p.base_price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">{p.stock || 50} units</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                        {p.is_active ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleProduct(p._id)}
                        className="px-3 py-1 rounded-lg border border-stone-200 text-stone-600 font-bold hover:bg-stone-100 text-[10px]"
                      >
                        {p.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add Product Modal ───────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-primary">Add New Catalog Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Minimalist Ceramic Plinth"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 bg-white"
                >
                  <option value="Wall Decor">Wall Decor</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Soft Furnishings">Soft Furnishings</option>
                  <option value="Decorative Accents">Decorative Accents</option>
                  <option value="Rugs & Mats">Rugs & Mats</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="1999"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Stock</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="50"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-stone-400 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Handcrafted stoneware piece..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-3 border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-emerald-950 text-white rounded-xl font-bold hover:bg-emerald-900"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
