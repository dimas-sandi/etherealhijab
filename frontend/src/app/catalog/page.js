'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import { useWishlist } from '../../context/WishlistContext';
import { Search, SlidersHorizontal, Heart, RotateCcw } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const showWishlistOnly = searchParams.get('wishlist') === 'true';
  const initialCategory = searchParams.get('category') || 'All';

  const { wishlistItems } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedColor, setSelectedColor] = useState('All');
  const [maxPrice, setMaxPrice] = useState(200000);

  // Categories list
  const categories = [
    'All',
    'Hijab Segi Empat (Square)',
    'Pashmina',
    'Hijab Instan',
    'Pashmina Instan (Pashmina Inner)',
    'Turban',
    'Hijab Olahraga (Sport Hijab)',
    'Ciput'
  ];
  // Color lists
  const colorsList = ['All', 'Beige', 'Pink', 'White', 'Coklat', 'Black', 'Navy', 'Gold', 'Silver', 'Grey'];

  useEffect(() => {
    setLoading(true);
    // Fetch products
    api.getProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error('Failed to fetch catalog products, using static items', err);
        setProducts([
          {
            id: 1,
            name: 'Ethereal Voal Square Premium',
            price: 85000,
            description: 'Hijab segi empat voal ultrafine premium yang tegak di dahi, tidak mudah lecek, halus, dan nyaman untuk penggunaan sehari-hari.',
            material: 'Voal Ultrafine',
            colors: 'Beige, Dusty Pink, Cream, Sage Green',
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
            colors: 'Rose Gold, Mocca, Pearl White, Soft Lilac',
            imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
            category: 'Pashmina',
            stock: 30
          },
          {
            id: 3,
            name: 'Bergo Maryam Instant Daily',
            price: 45000,
            description: 'Hijab instan daily bertali belakang dari bahan jersey premium yang dingin di kulit, menyerap keringat, dan menutup dada sempurna.',
            material: 'Jersey Premium',
            colors: 'Black, Navy, Dark Grey, Mocca',
            imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600',
            category: 'Hijab Instan',
            stock: 80
          },
          {
            id: 4,
            name: 'Pashmina Inner 2-in-1 Ethereal',
            price: 75000,
            description: 'Inovasi pashmina instan yang sudah menyatu dengan ciput/inner ninja premium di dalamnya. Praktis, rapi, dan anti geser.',
            material: 'Ceruty Babydoll & Jersey Knit',
            colors: 'Khaki, Caramel, Black, Soft Pink',
            imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600',
            category: 'Pashmina Instan (Pashmina Inner)',
            stock: 40
          },
          {
            id: 5,
            name: 'Ciput Rajut Anti Bingung',
            price: 20000,
            description: 'Ciput inner rajut premium yang elastis dan nyaman sepanjang hari tanpa menekan telinga. Mencegah hijab utama bergeser.',
            material: 'Soft Knit Yarn',
            colors: 'Black, Cream, Grey, Brown',
            imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600',
            category: 'Ciput',
            stock: 120
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update category if url parameter changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedColor('All');
    setMaxPrice(200000);
  };

  // Client-side filtering logic
  const filteredProducts = products.filter((product) => {
    // 1. Wishlist Check
    if (showWishlistOnly && !wishlistItems.some((item) => item.id === product.id)) {
      return false;
    }

    // 2. Search query check
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.material.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Category check
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    // 4. Color check
    const matchesColor =
      selectedColor === 'All' ||
      product.colors.toLowerCase().includes(selectedColor.toLowerCase());

    // 5. Price check
    const matchesPrice = product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesColor && matchesPrice;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {showWishlistOnly ? 'Wishlist Saya' : 'Katalog Hijab'}
          </h1>
          <p className="text-sm text-muted mt-1">
            {showWishlistOnly
              ? 'Kumpulan produk favorit pilihan Anda.'
              : 'Temukan pilihan hijab terbaik dengan beragam varian warna.'}
          </p>
        </div>
        
        {/* Quick Search */}
        <div className="mt-4 md:mt-0 relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari hijab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink transition-all"
          />
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="space-y-6 bg-card border border-border p-6 rounded-2xl h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter Produk</span>
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-pink-dark hover:underline flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase text-brand-brown-dark tracking-wider">Kategori</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-2 rounded-xl text-left font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-brown text-white'
                      : 'bg-background hover:bg-brand-beige/50 text-muted'
                  }`}
                >
                  {cat === 'All' ? 'Semua Produk' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase text-brand-brown-dark tracking-wider">Warna</h3>
            <div className="grid grid-cols-3 gap-2">
              {colorsList.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`text-2xs py-2 rounded-xl border text-center transition-all ${
                    selectedColor === color
                      ? 'border-brand-pink bg-brand-pink/10 text-brand-pink-dark font-semibold'
                      : 'border-border bg-background hover:bg-brand-beige/30 text-muted'
                  }`}
                >
                  {color === 'All' ? 'Semua' : color}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase text-brand-brown-dark tracking-wider">Maks. Harga</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="20000"
                max="200000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-brand-pink"
              />
              <div className="flex items-center justify-between text-2xs font-semibold text-muted">
                <span>IDR 20k</span>
                <span className="text-brand-brown-dark text-xs">{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-brand-beige/25 rounded-2xl h-80" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border border-border border-dashed rounded-3xl space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-beige/50 flex items-center justify-center text-muted">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">Tidak Ada Hasil</h3>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Kami tidak menemukan hijab yang sesuai dengan kriteria penyaringan Anda. Silakan atur ulang filter.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center space-x-2 bg-brand-brown text-white text-xs px-4 py-2 rounded-xl"
              >
                <span>Hapus Filter</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted">Memuat Katalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
