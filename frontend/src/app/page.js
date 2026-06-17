'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShoppingBag, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { api } from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  useEffect(() => {
    // Fetch products
    api.getProducts({ limit: 4 })
      .then((data) => {
        // Show first 4 items
        setFeaturedProducts(data.slice(0, 4));
      })
      .catch((err) => {
        console.error('Failed to load products, using fallbacks', err);
        // Static fallback
        setFeaturedProducts([
          {
            id: 1,
            name: 'Ethereal Voal Square Premium',
            price: 85000,
            description: 'Hijab segi empat voal ultrafine premium yang tegak di dahi, tidak mudah lecek, halus, dan nyaman untuk penggunaan sehari-hari.',
            material: 'Voal Ultrafine',
            colors: 'Beige, Dusty Pink',
            imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600',
            category: 'Hijab Segi Empat (Square)',
            stock: 50
          },
          {
            id: 2,
            name: 'Silk Pashmina Shimmer',
            price: 110000,
            description: 'Pashmina dengan kilau elegan yang memberikan kesan mewah. Tekstur jatuh, lembut, dan sangat anggun untuk acara formal.',
            material: 'Silk Shimmer',
            colors: 'Rose Gold, Mocca',
            imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
            category: 'Pashmina',
            stock: 30
          }
        ]);
      })
      .finally(() => setLoadingProducts(false));

    // Fetch testimonials
    api.getTestimonials()
      .then((data) => {
        setTestimonials(data);
      })
      .catch((err) => {
        console.error('Failed to load testimonials, using fallbacks', err);
        setTestimonials([
          {
            id: 1,
            name: 'Sarah Amelia',
            review: 'Bahan voalnya bener-bener tegak di dahi dan lembut banget! Warnanya juga soft, sesuai ekspektasi.',
            rating: 5,
            imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
            role: 'Pelanggan Setia'
          },
          {
            id: 2,
            name: 'Nabila Putri',
            review: 'Pengirimannya cepat, pashmina shimmernya mewah banget pas dipakai ke kondangan. Pasti bakal order lagi!',
            rating: 5,
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
            role: 'Customer'
          }
        ]);
      })
      .finally(() => setLoadingTestimonials(false));
  }, []);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-beige via-brand-beige/50 to-transparent py-20 lg:py-32 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <div className="space-y-8 text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center space-x-2 bg-brand-pink/20 text-brand-pink-dark px-3 py-1.5 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Koleksi Baru: Ethereal Shimmer Series</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold font-serif leading-tight tracking-tight text-foreground">
              Elegance in <br />
              <span className="text-brand-brown-dark font-sans font-light italic">Every Layer</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Hijab premium voal & pashmina minimalis yang didesain khusus untuk menemani keanggunan harian Anda dengan kenyamanan tiada tanding.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/catalog"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-medium px-8 py-3.5 rounded-xl shadow-md transition-all group"
              >
                <span>Belanja Sekarang</span>
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/survey"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-brand-beige/10 hover:bg-brand-beige/20 border border-brand-brown/40 text-brand-brown-dark font-medium px-8 py-3.5 rounded-xl transition-all"
              >
                Ikut Survey Minat
              </Link>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[423/552] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-brand-beige/20">
              <img
                src="/Landing.svg"
                alt="Ethereal Hijab Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/20 to-transparent" />
            </div>
            {/* Small floating detail card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border p-4 rounded-2xl shadow-xl hidden sm:flex items-center space-x-3">
              <div className="bg-brand-pink-light p-2.5 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-brand-pink-dark" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-foreground">100% Premium Voal</span>
                <span className="block text-3xs text-muted">Bahan Halus & Anti Pusing</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Promotion Coupon Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-pink/30 to-brand-beige border border-brand-pink-light/60 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">Promo Spesial Grand Opening! 🎉</h2>
            <p className="text-sm text-muted mt-1">Gunakan kode voucher di halaman pembayaran untuk potongan harga 10%.</p>
          </div>
          <div className="flex items-center space-x-3 bg-white dark:bg-brand-beige/10 px-5 py-3 rounded-2xl border border-brand-pink-light">
            <span className="text-xs text-muted">Kode Voucher:</span>
            <code className="text-sm font-extrabold text-brand-pink-dark tracking-widest font-mono">ETHEREAL10</code>
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">Koleksi Terpopuler</h2>
          <p className="text-sm text-muted">Rekomendasi hijab terlaris minggu ini yang banyak dicari pelanggan.</p>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-brand-beige/50 rounded-2xl aspect-[4/5]" />
                <div className="h-4 bg-brand-beige/50 rounded w-1/2" />
                <div className="h-4 bg-brand-beige/50 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center border-2 border-brand-brown-dark/30 hover:border-brand-brown-dark/60 text-brand-brown-dark font-medium px-6 py-2.5 rounded-xl transition-all"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </section>

      {/* 4. Brand Features */}
      <section className="bg-brand-beige/40 dark:bg-brand-beige-dark/5 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 space-y-3">
            <div className="mx-auto w-12 h-12 bg-white dark:bg-brand-beige/10 rounded-full flex items-center justify-center shadow-sm text-brand-pink-dark">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Bahan Premium Selektif</h3>
            <p className="text-sm text-muted">Kami menyeleksi serat katun ultrafine dan benang sutra terbaik demi kenyamanan sirkulasi udara kulit dahi Anda.</p>
          </div>
          <div className="text-center p-6 space-y-3">
            <div className="mx-auto w-12 h-12 bg-white dark:bg-brand-beige/10 rounded-full flex items-center justify-center shadow-sm text-brand-pink-dark">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Warna Estetik Elegan</h3>
            <p className="text-sm text-muted">Palet warna earth-tone lembut (beige, soft pink, mocha) yang sangat mudah dipadupadankan dengan busana harian Anda.</p>
          </div>
          <div className="text-center p-6 space-y-3">
            <div className="mx-auto w-12 h-12 bg-white dark:bg-brand-beige/10 rounded-full flex items-center justify-center shadow-sm text-brand-pink-dark">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Mudah Dibentuk & Tegak</h3>
            <p className="text-sm text-muted">Potongan presisi berteknologi laser-cut, menjamin hijab tegak melengkung di dahi dan tidak letoy seharian.</p>
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">Apa Kata Pelanggan Kami?</h2>
          <p className="text-sm text-muted">Ulasan jujur dari pembeli yang menyukai koleksi produk kami.</p>
        </div>

        {loadingTestimonials ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-brand-beige/30 h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div key={test.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 mb-4 text-amber-400">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    {[...Array(5 - test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-border" />
                    ))}
                  </div>
                  <p className="text-sm text-muted leading-relaxed italic mb-6">
                    "{test.review}"
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <img
                    src={test.imageUrl}
                    alt={test.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="block text-xs font-semibold text-foreground">{test.name}</span>
                    <span className="block text-3xs text-muted">{test.role || 'Pelanggan'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
