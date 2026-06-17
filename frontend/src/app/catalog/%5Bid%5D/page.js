'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { Heart, ShoppingBag, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ProductDetail({ params }) {
  const unwrappedParams = use(params);
  const productId = unwrappedParams.id;
  const router = useRouter();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProductById(productId)
      .then((data) => {
        setProduct(data);
        if (data.colors) {
          setSelectedColor(data.colors.split(',')[0].trim());
        }
      })
      .catch((err) => {
        console.error('Failed to load product details, using fallback', err);
        // Fallback product
        const fallbacks = {
          '1': {
            id: 1,
            name: 'Ethereal Voal Ultrafine',
            price: 85000,
            description: 'Voal premium yang tegak di dahi, tidak mudah lecek, dan sangat nyaman untuk penggunaan sehari-hari. Kain halus berpori udara sejuk.',
            material: 'Voal Ultrafine',
            colors: 'Beige, Dusty Pink, Cream, Sage Green',
            imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600',
            category: 'Voal',
            stock: 50
          },
          '2': {
            id: 2,
            name: 'Silk Pashmina Shimmer',
            price: 110000,
            description: 'Pashmina dengan kilau elegan yang memberikan kesan mewah untuk acara formal maupun kasual. Tekstur jatuh dan mudah dibentuk.',
            material: 'Silk Shimmer',
            colors: 'Rose Gold, Mocca, Pearl White, Soft Lilac',
            imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
            category: 'Pashmina',
            stock: 30
          }
        };
        const item = fallbacks[productId] || fallbacks['1'];
        setProduct(item);
        if (item.colors) {
          setSelectedColor(item.colors.split(',')[0].trim());
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted">
        Memuat Detail Produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Produk Tidak Ditemukan</h2>
        <Link href="/catalog" className="text-brand-pink-dark hover:underline"> Kembali ke Katalog</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    router.push('/cart');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const colors = product.colors ? product.colors.split(',').map((c) => c.trim()) : [];
  const isFav = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Link href="/catalog" className="inline-flex items-center space-x-2 text-sm text-muted hover:text-brand-pink transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-card border border-border p-6 sm:p-10 rounded-3xl shadow-sm">
        
        {/* Left Col - Image */}
        <div className="relative aspect-[4/5] bg-brand-beige rounded-2xl overflow-hidden shadow-sm">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800'}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Col - Details */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-brand-pink-dark">
              {product.category}
            </span>
            <div className="flex items-start justify-between">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                {product.name}
              </h1>
              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className="p-2.5 border border-border hover:bg-brand-beige/20 rounded-full transition-colors text-brand-pink-dark ml-4 shrink-0"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-brand-pink-dark text-brand-pink-dark' : 'text-muted'}`} />
              </button>
            </div>

            {/* Price */}
            <div className="text-xl sm:text-2xl font-bold text-brand-brown-dark">
              {formatPrice(product.price)}
            </div>

            <div className="border-t border-border pt-4 text-sm text-muted leading-relaxed space-y-2">
              <p>{product.description}</p>
              <div className="grid grid-cols-2 gap-y-1 text-xs font-medium pt-2 text-foreground">
                <div>Material: <span className="text-muted">{product.material}</span></div>
                <div>Stok: <span className={product.stock > 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                  {product.stock > 0 ? `${product.stock} pcs` : 'Habis'}
                </span></div>
              </div>
            </div>

            {/* Colors Select */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-brand-brown-dark tracking-wider">Varian Warna</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-xs px-4 py-2 rounded-xl border transition-all ${
                        selectedColor === color
                          ? 'border-brand-pink bg-brand-pink/10 text-brand-pink-dark font-bold'
                          : 'border-border bg-background hover:bg-brand-beige/30 text-muted'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-brand-brown-dark tracking-wider">Jumlah</label>
              <div className="flex items-center space-x-3 w-32 border border-border rounded-xl p-1 bg-background">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg hover:bg-brand-beige/50 text-foreground font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 rounded-lg hover:bg-brand-beige/50 text-foreground font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4 pt-6 border-t border-border">
            
            {/* Added to cart message */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Berhasil ditambahkan ke keranjang belanja!</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 inline-flex items-center justify-center border-2 border-brand-brown-dark text-brand-brown-dark hover:bg-brand-brown-dark/5 font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>Tambah Keranjang</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <span>Beli Sekarang</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-1.5 text-2xs text-muted pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-pink-dark" />
              <span>Garansi bahan premium halus & jahitan tepi rapi.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
