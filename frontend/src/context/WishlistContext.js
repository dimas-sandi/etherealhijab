'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist on component mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem('ethereal_wishlist');
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist));
      } catch (err) {
        console.error('Failed to parse wishlist storage', err);
      }
    }
  }, []);

  const saveWishlist = (items) => {
    setWishlistItems(items);
    localStorage.setItem('ethereal_wishlist', JSON.stringify(items));
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);
    if (exists) {
      const updated = wishlistItems.filter((item) => item.id !== product.id);
      saveWishlist(updated);
    } else {
      saveWishlist([...wishlistItems, product]);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
