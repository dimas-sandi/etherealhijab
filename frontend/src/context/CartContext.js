'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Load cart on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('ethereal_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Failed to parse cart storage', err);
      }
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('ethereal_cart', JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1, selectedColor) => {
    const fallbackColor = product.colors ? product.colors.split(',')[0].trim() : '';
    const color = selectedColor || fallbackColor;
    
    const existingIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.color === color
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...cartItems, { product, quantity, color }]);
    }
  };

  const removeFromCart = (productId, color) => {
    const updated = cartItems.filter(
      (item) => !(item.product.id === productId && item.color === color)
    );
    saveCart(updated);
  };

  const updateQuantity = (productId, color, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, color);
      return;
    }
    const updated = cartItems.map((item) =>
      item.product.id === productId && item.color === color 
        ? { ...item, quantity: parseInt(newQty) } 
        : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setPromoCode('');
    setDiscount(0);
  };

  const applyPromoCode = (code) => {
    const cleanedCode = code.trim().toUpperCase();
    setPromoCode(cleanedCode);
    if (cleanedCode === 'ETHEREAL10') {
      setDiscount(0.10); // 10% discount
      return true;
    }
    setDiscount(0);
    return false;
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    return subtotal - (subtotal * discount);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getTotal,
        applyPromoCode,
        promoCode,
        discount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
