'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getTotal,
    applyPromoCode,
    promoCode,
    discount,
  } = useCart();

  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError(false);
    setPromoSuccess(false);

    if (!promoInput) return;

    const ok = applyPromoCode(promoInput);
    if (ok) {
      setPromoSuccess(true);
    } else {
      setPromoError(true);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center text-brand-brown-dark shadow-sm">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Keranjang Belanja Kosong</h1>
        <p className="text-sm text-muted">
          Sepertinya Anda belum menambahkan hijab apapun ke dalam keranjang. Yuk temukan koleksi hijab cantik kami!
        </p>
        <div>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-medium px-8 py-3 rounded-xl transition-all"
          >
            <span>Mulai Belanja</span>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold text-foreground">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={`${item.product.id}-${item.color}`}
              className="bg-card border border-border rounded-2xl p-4 flex items-center space-x-4 shadow-2xs hover:shadow-xs transition-shadow duration-200"
            >
              {/* Product Image */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-brand-beige relative">
                <img
                  src={item.product.imageUrl || 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=300'}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 space-y-1 sm:space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-serif font-semibold text-foreground line-clamp-1">
                      {item.product.name}
                    </h2>
                    <span className="inline-block text-3xs font-semibold uppercase text-brand-pink-dark">
                      {item.product.category}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id, item.color)}
                    className="p-1 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex items-center text-xs text-muted">
                  <span>Warna: </span>
                  <span className="font-semibold text-foreground ml-1.5">{item.color}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-brand-brown-dark">
                    {formatPrice(item.product.price)}
                  </span>

                  {/* Quantity controls */}
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-0.5 bg-background">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.color, item.quantity - 1)}
                      className="w-6 h-6 rounded hover:bg-brand-beige/40 text-foreground flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.color, item.quantity + 1)}
                      className="w-6 h-6 rounded hover:bg-brand-beige/40 text-foreground flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase text-brand-brown-dark tracking-wider pb-2 border-b border-border">
              Ringkasan Belanja
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600 font-semibold bg-green-50/50 p-2 rounded-lg border border-green-100">
                  <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1" /> Diskon (10%)</span>
                  <span>-{formatPrice(subtotal * discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted">
                <span>Estimasi Ongkir</span>
                <span className="text-green-500 font-semibold uppercase">Gratis Ongkir</span>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between text-sm font-bold text-foreground">
                <span>Total Pembayaran</span>
                <span className="text-brand-brown-dark">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all group"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Promo Code Input */}
          <div className="bg-card border border-border p-6 rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold uppercase text-brand-brown-dark tracking-wider">
              Punya Kode Promo?
            </h3>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan kode..."
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                disabled={discount > 0}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink disabled:bg-border/30 disabled:text-muted transition-all"
              />
              <button
                type="submit"
                disabled={discount > 0}
                className="bg-brand-brown text-white text-xs px-4 py-2 rounded-xl font-medium transition-all hover:bg-brand-brown-dark disabled:bg-border/60 disabled:cursor-not-allowed shrink-0"
              >
                Terapkan
              </button>
            </form>

            {promoSuccess && (
              <p className="text-2xs text-green-600 font-medium">✓ Promo ETHEREAL10 berhasil digunakan!</p>
            )}
            {promoError && (
              <p className="text-2xs text-red-500 font-medium">✗ Kode voucher tidak valid.</p>
            )}
            {discount > 0 && !promoSuccess && (
              <p className="text-2xs text-green-600 font-medium">Voucher aktif: {promoCode}</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
