import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Package, User, Compass, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data?.data) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
      
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">
            Personal Portfolio
          </span>
          <h1 className="font-display-xl text-3xl md:text-5xl text-primary font-bold leading-tight">
            Your Curations
          </h1>
          <p className="text-stone-500 max-w-md text-sm mt-2 leading-relaxed">
            A definitive archive of your bespoke spatial specifications and active crafting orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/products"
            className="px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors"
          >
            Browse Collection
          </Link>
          <Link
            to="/ai-designer"
            className="px-6 py-3 rounded-xl bg-emerald-950 text-white font-semibold text-xs hover:bg-emerald-900 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            New Space Analysis
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-stone-100 rounded-3xl h-44 animate-pulse" />
            ))}
          </div>
          <div className="bg-stone-100 rounded-3xl h-64 animate-pulse" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-stone-50 rounded-3xl p-12 text-center border border-stone-200/60 max-w-xl mx-auto space-y-5">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-stone-100 text-stone-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-headline-md text-xl font-bold text-primary">Your Portfolio is Empty</h3>
          <p className="text-stone-500 text-xs leading-relaxed max-w-sm mx-auto">
            You haven't initiated any bespoke curation orders yet. Begin by analyzing your room space or exploring our collection.
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3.5 rounded-xl bg-emerald-950 text-white font-bold text-xs hover:bg-emerald-900 transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          
          <div className="lg:col-span-2 space-y-5">
            {orders.map((order) => {
              const customDesign = order.custom_design_id;
              const product = customDesign?.product_id || order.items?.[0];
              const thumbUrl = customDesign?.room_image_path
                ? (customDesign.room_image_path.startsWith('http') ? customDesign.room_image_path : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${customDesign.room_image_path}`)
                : (product?.image_path || product?.image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80');

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-[2rem] p-6 whisper-shadow border border-stone-100 flex flex-col sm:flex-row gap-5 transition-all hover:-translate-y-0.5"
                >
                  
                  <div className="w-full sm:w-36 h-36 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0">
                    <img
                      src={thumbUrl}
                      alt="Order piece"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block">
                            Order {order.order_number}
                          </span>
                          <h3 className="font-headline-sm text-base font-bold text-primary">
                            {product?.name || 'Bespoke Curated Piece'}
                          </h3>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-800 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {order.status}
                        </span>
                      </div>

                      <div className="text-stone-500 text-xs mt-2 space-y-1">
                        {customDesign?.design_json?.ai_art_spec && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            AI Vector Spec Generated
                          </span>
                        )}
                        <p className="text-[11px] text-stone-400">
                          Moulding: {customDesign?.design_json?.frame_style || 'Signature'} | Size: {customDesign?.design_json?.size || 'Standard'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-4 pt-3 border-t border-stone-100">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">Investment</span>
                        <span className="text-emerald-950 font-bold text-sm">
                          ₹{Number(order.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-xs font-semibold text-stone-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
                      >
                        View Invoice <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          
          <div className="lg:col-span-1">
            <div className="bg-stone-50 rounded-[2rem] p-7 border border-stone-200/60 sticky top-28 space-y-6">
              <h3 className="font-headline-sm text-base font-bold text-primary">Profile Summary</h3>

              <div className="flex items-center gap-3.5 pb-5 border-b border-stone-200/60">
                <div className="w-12 h-12 rounded-full bg-emerald-950 text-white flex items-center justify-center font-bold text-lg">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{user?.name || 'Customer'}</h4>
                  <p className="text-stone-400 text-xs">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between items-center text-stone-600">
                  <span className="text-stone-400 font-normal">Total Curations</span>
                  <span className="font-bold text-primary">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span className="text-stone-400 font-normal">Account Role</span>
                  <span className="capitalize text-emerald-800 font-bold">{user?.role || 'Customer'}</span>
                </div>
                {user?.createdAt && (
                  <div className="flex justify-between items-center text-stone-600">
                    <span className="text-stone-400 font-normal">Member Since</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
