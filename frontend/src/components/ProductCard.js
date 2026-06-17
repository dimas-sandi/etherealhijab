'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../utils/api';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFav = isInWishlist(product.id);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-4 right-4 z-10 p-2 bg-background/80 hover:bg-background rounded-full shadow-sm backdrop-blur-sm transition-colors text-brand-pink-dark"
        aria-label="Toggle Wishlist"
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-brand-pink-dark text-brand-pink-dark' : 'text-muted'}`} />
      </button>

      {/* Product Image */}
      <Link href={`/catalog/${product.id}`} className="block overflow-hidden relative pt-[125%] bg-brand-beige">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Content */}
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-2xs uppercase tracking-wider font-semibold text-brand-pink-dark mb-1">
          {product.category}
        </span>
        <Link href={`/catalog/${product.id}`} className="hover:text-brand-pink-dark transition-colors mb-2">
          <h3 className="font-serif text-base font-medium text-foreground line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Pricing and Action */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <span className="block text-2xs text-muted">Harga</span>
            <span className="text-sm font-semibold text-brand-brown-dark">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              product.stock > 0
                ? 'bg-brand-brown hover:bg-brand-brown-dark text-white shadow-sm'
                : 'bg-border text-muted cursor-not-allowed'
            }`}
            title={product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
