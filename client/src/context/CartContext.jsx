import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, style = 'Bespoke Custom Frame') => {
    setCart((prev) => {
      const productId = product._id || product.id;
      const existing = prev.find((item) => item.id === productId);

      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, qty: item.qty + quantity } : item
        );
      } else {
        return [
          ...prev,
          {
            id: productId,
            product_id: productId,
            name: product.name,
            price: parseFloat(product.base_price || product.price),
            qty: quantity,
            style: style || product.category || 'Bespoke Custom Frame',
            image: product.image_path || product.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
          }
        ];
      }
    });

    addToast(`✓ "${product.name}" added to cart`, 'success');
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('aura_cart');
  };

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        gst,
        total,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
