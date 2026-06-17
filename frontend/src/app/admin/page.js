'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getImageUrl } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Download,
  Check,
  X,
  Truck,
  Eye
} from 'lucide-react';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [salesStats, setSalesStats] = useState(null);
  const [surveyStats, setSurveyStats] = useState(null);

  // Data Listing State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [surveys, setSurveys] = useState([]);

  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  // CRUD Product Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    material: '',
    stock: '',
    colors: '',
    imageUrl: '',
    category: 'Hijab Segi Empat (Square)',
  });

  // Tracking Number State
  const [trackingInputs, setTrackingInputs] = useState({});

  // File Upload State & Handler
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setUploadingImage(true);
        const base64Data = reader.result;
        const response = await api.uploadImage(base64Data);
        setProductForm(prev => ({
          ...prev,
          imageUrl: response.imageUrl
        }));
      } catch (err) {
        alert(err.message || 'Gagal mengunggah gambar.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auth Protection Check
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Load Dashboard Data
  useEffect(() => {
    if (!authorized) return;

    const loadDashboardData = async () => {
      setLoadingStats(true);
      setLoadingData(true);

      try {
        // Fetch stats
        const sales = await api.getSalesStats();
        const survey = await api.getSurveyStats();
        setSalesStats(sales);
        setSurveyStats(survey);
      } catch (err) {
        console.error('Failed to fetch dashboard stats, using fallbacks', err);
        // Fallback Stats
        setSalesStats({
          totalOrders: 14,
          totalRevenue: 1045000,
          statusCounts: { PENDING: 3, PROCESSED: 2, SHIPPED: 4, COMPLETED: 5 },
          topProducts: [
            { name: 'Ethereal Voal Square Premium', category: 'Hijab Segi Empat (Square)', quantity: 8, revenue: 680000 },
            { name: 'Silk Pashmina Shimmer', category: 'Pashmina', quantity: 3, revenue: 330000 },
          ],
          categoryDistribution: [
            { label: 'Hijab Segi Empat (Square)', value: 8 },
            { label: 'Pashmina', value: 3 },
            { label: 'Hijab Instan', value: 2 },
            { label: 'Ciput', value: 1 },
          ]
        });

        setSurveyStats({
          totalCount: 10,
          preferences: [
            { label: 'Hijab Segi Empat (Square)', value: 4 },
            { label: 'Pashmina', value: 3 },
            { label: 'Hijab Instan', value: 2 },
            { label: 'Ciput', value: 1 }
          ],
          budgets: [
            { label: 'IDR 50k - 100k', value: 3 },
            { label: 'IDR 100k - 200k', value: 4 },
            { label: 'Di atas IDR 200k', value: 2 },
            { label: 'Di bawah IDR 50k', value: 1 }
          ],
          ages: [
            { label: '17-22 tahun', value: 3 },
            { label: '23-28 tahun', value: 4 },
            { label: '29-35 tahun', value: 2 },
            { label: 'Lainnya', value: 1 }
          ]
        });
      } finally {
        setLoadingStats(false);
      }

      try {
        // Fetch tables data
        const prodData = await api.getProducts();
        const ordData = await api.getOrders();
        const survData = await api.getSurveys();
        setProducts(prodData);
        setOrders(ordData);
        setSurveys(survData);
      } catch (err) {
        console.error('Failed to load listings data, using fallbacks', err);
        setProducts([
          { id: 1, name: 'Ethereal Voal Square Premium', price: 85000, category: 'Hijab Segi Empat (Square)', stock: 50, colors: 'Beige, Dusty Pink', material: 'Voal Ultrafine', imageUrl: '' },
          { id: 2, name: 'Silk Pashmina Shimmer', price: 110000, category: 'Pashmina', stock: 30, colors: 'Rose Gold, Mocca', material: 'Silk Shimmer', imageUrl: '' }
        ]);
        setOrders([
          { id: 1, customerName: 'Aminah', whatsapp: '081234567890', address: 'Jakarta', totalAmount: 85000, paymentMethod: 'Bank Transfer', status: 'PENDING', trackingNumber: null, createdAt: new Date() }
        ]);
        setSurveys([
          { id: 1, name: 'Aminah', age: 22, gender: 'Wanita', city: 'Jakarta', preference: 'Hijab Segi Empat (Square)', budget: 'IDR 100k - 200k', frequency: '2-3 kali', createdAt: new Date() }
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboardData();
  }, [authorized]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  // Product CRUD functions
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      description: '',
      material: '',
      stock: '',
      colors: '',
      imageUrl: '',
      category: 'Hijab Segi Empat (Square)',
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price,
      description: prod.description || '',
      material: prod.material || '',
      stock: prod.stock,
      colors: prod.colors || '',
      imageUrl: prod.imageUrl || '',
      category: prod.category,
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      // Refresh listings
      const updatedProds = await api.getProducts();
      setProducts(updatedProds);
      
      // Refresh stats
      const sales = await api.getSalesStats();
      setSalesStats(sales);

      setShowProductModal(false);
    } catch (err) {
      alert(err.message || 'Gagal menyimpan produk.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || 'Gagal menghapus produk.');
    }
  };

  // Order status modification
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      // Refresh stats
      const sales = await api.getSalesStats();
      setSalesStats(sales);
    } catch (err) {
      alert(err.message || 'Gagal memperbarui status order.');
    }
  };

  const handleTrackingSubmit = async (orderId) => {
    const trackingNo = trackingInputs[orderId];
    if (!trackingNo) return;
    try {
      await api.updateOrderStatus(orderId, { status: 'SHIPPED', trackingNumber: trackingNo });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'SHIPPED', trackingNumber: trackingNo } : o));
      alert('Nomor Resi berhasil disimpan!');
    } catch (err) {
      alert(err.message || 'Gagal menyimpan nomor resi.');
    }
  };

  // CSV Export Utility
  const exportToCSV = (dataType) => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (dataType === 'orders') {
      headers = ['ID Order', 'Nama Customer', 'WhatsApp', 'Alamat', 'Total Bayar', 'Metode Bayar', 'Status', 'Resi', 'Tanggal'];
      rows = orders.map(o => [
        o.id,
        o.customerName,
        o.whatsapp,
        `"${o.address.replace(/"/g, '""')}"`,
        o.totalAmount,
        o.paymentMethod,
        o.status,
        o.trackingNumber || '-',
        new Date(o.createdAt).toLocaleDateString('id-ID')
      ]);
      filename = `EtherealHijab_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (dataType === 'customers') {
      headers = ['Nama', 'Umur', 'Gender', 'Kota', 'Preferensi Hijab', 'Budget', 'Frekuensi Belanja', 'Tanggal'];
      rows = surveys.map(s => [
        s.name,
        s.age,
        s.gender,
        s.city,
        s.preference,
        s.budget,
        s.frequency,
        new Date(s.createdAt).toLocaleDateString('id-ID')
      ]);
      filename = `EtherealHijab_CustomersSurvey_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!authorized) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted">
        Mengalihkan ke halaman Login...
      </div>
    );
  }

  // Chart configs
  const categoryChartData = {
    labels: surveyStats?.preferences.map(p => p.label) || [],
    datasets: [{
      data: surveyStats?.preferences.map(p => p.value) || [],
      backgroundColor: ['#ffb5a7', '#fcd5ce', '#e3d5ca', '#d5bdaf', '#f5ebe0'],
      borderColor: 'transparent',
    }]
  };

  const ageChartData = {
    labels: surveyStats?.ages.map(a => a.label) || [],
    datasets: [{
      label: 'Jumlah Partisipan',
      data: surveyStats?.ages.map(a => a.value) || [],
      backgroundColor: '#7d6556',
      borderRadius: 8,
    }]
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Component */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-x-hidden">
        
        {/* TAB 1: OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard Ringkasan & Analisis</h1>

            {loadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="bg-brand-beige/20 h-28 rounded-2xl" />)}
              </div>
            ) : (
              /* Stat Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Revenue */}
                <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-muted">Total Pendapatan</span>
                    <span className="block text-xl font-bold text-brand-brown-dark">{formatPrice(salesStats?.totalRevenue)}</span>
                  </div>
                  <div className="p-3 bg-brand-pink-light/20 text-brand-pink-dark rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                {/* Orders */}
                <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-muted">Total Pesanan</span>
                    <span className="block text-xl font-bold text-brand-brown-dark">{salesStats?.totalOrders} Order</span>
                  </div>
                  <div className="p-3 bg-brand-beige/60 text-brand-brown-dark rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>

                {/* Survey Participants */}
                <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-muted">Partisipan Survey</span>
                    <span className="block text-xl font-bold text-brand-brown-dark">{surveyStats?.totalCount} Pengguna</span>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-muted">Pending Orders</span>
                    <span className="block text-xl font-bold text-amber-600">{salesStats?.statusCounts.PENDING} Order</span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

              </div>
            )}

            {/* Charts Section */}
            {!loadingStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs font-semibold">
                
                {/* Category preferences */}
                <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-brand-brown-dark">Preferensi Model Hijab (Hasil Survey)</h3>
                  <div className="w-full h-64 flex items-center justify-center">
                    <Doughnut 
                      data={categoryChartData} 
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </div>

                {/* Age distribution */}
                <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-brand-brown-dark">Demografi Umur Pelanggan</h3>
                  <div className="w-full h-64">
                    <Bar 
                      data={ageChartData} 
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCT CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">Manajemen Produk</h1>
                <p className="text-xs text-muted">Tambah, ubah, dan hapus koleksi produk EtherealHijab.</p>
              </div>
              <button
                onClick={openAddProduct}
                className="bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-1.5 shadow-sm shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            </div>

            {loadingData ? (
              <div className="bg-card border border-border p-10 rounded-2xl animate-pulse text-center text-muted">Memuat tabel produk...</div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-normal border-collapse">
                    <thead>
                      <tr className="bg-brand-beige/50 border-b border-border text-brand-brown-dark font-bold text-2xs uppercase tracking-wider">
                        <th className="p-4">Nama Produk</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4">Harga</th>
                        <th className="p-4">Stok</th>
                        <th className="p-4">Pilihan Warna</th>
                        <th className="p-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-brand-beige/10">
                          <td className="p-4 flex items-center space-x-3 text-foreground font-medium">
                            <img src={getImageUrl(prod.imageUrl)} alt="" className="w-10 h-10 object-cover rounded-lg bg-brand-beige shrink-0" />
                            <span>{prod.name}</span>
                          </td>
                          <td className="p-4">{prod.category}</td>
                          <td className="p-4 font-semibold text-foreground">{formatPrice(prod.price)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${prod.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{prod.stock} pcs</span>
                          </td>
                          <td className="p-4 max-w-xs truncate">{prod.colors || '-'}</td>
                          <td className="p-4 text-center">
                            <div className="inline-flex space-x-2">
                              <button onClick={() => openEditProduct(prod)} className="p-2 border border-border rounded-lg text-brand-brown-dark hover:bg-brand-beige/40" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 border border-border rounded-lg text-red-500 hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">Daftar Transaksi Masuk</h1>
                <p className="text-xs text-muted">Ubah status pesanan, input nomor resi pengiriman, atau ekspor data.</p>
              </div>
              <button
                onClick={() => exportToCSV('orders')}
                className="bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-1.5 shadow-sm shrink-0 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor ke CSV</span>
              </button>
            </div>

            {loadingData ? (
              <div className="bg-card border border-border p-10 rounded-2xl animate-pulse text-center text-muted">Memuat tabel transaksi...</div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-normal border-collapse">
                    <thead>
                      <tr className="bg-brand-beige/50 border-b border-border text-brand-brown-dark font-bold text-2xs uppercase tracking-wider">
                        <th className="p-4">ID</th>
                        <th className="p-4">Nama Pelanggan</th>
                        <th className="p-4">Kontak WA</th>
                        <th className="p-4">Total Bayar</th>
                        <th className="p-4">Metode</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">No. Resi</th>
                        <th className="p-4 text-center">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-brand-beige/10">
                          <td className="p-4 font-mono font-semibold text-foreground">#{ord.id}</td>
                          <td className="p-4 font-medium text-foreground">{ord.customerName}</td>
                          <td className="p-4">{ord.whatsapp}</td>
                          <td className="p-4 font-semibold text-foreground">{formatPrice(ord.totalAmount)}</td>
                          <td className="p-4">{ord.paymentMethod}</td>
                          <td className="p-4">
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                              className="bg-background border border-border rounded-lg px-2.5 py-1 text-2xs focus:outline-none"
                            >
                              <option value="PENDING">Menunggu Bayar</option>
                              <option value="PROCESSED">Diproses</option>
                              <option value="SHIPPED">Dikirim</option>
                              <option value="COMPLETED">Selesai</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                placeholder={ord.trackingNumber || 'Input resi...'}
                                value={trackingInputs[ord.id] || ''}
                                onChange={(e) => setTrackingInputs({ ...trackingInputs, [ord.id]: e.target.value })}
                                className="bg-background border border-border rounded-lg px-2 py-1 text-2xs w-28 focus:outline-none"
                              />
                              <button
                                onClick={() => handleTrackingSubmit(ord.id)}
                                className="p-1 hover:bg-brand-beige bg-background border border-border rounded-lg text-brand-brown-dark"
                                title="Kirim Resi"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center">{new Date(ord.createdAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMER SURVEY DATA */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">Database Hasil Survey Pelanggan</h1>
                <p className="text-xs text-muted">Analisis demografi pasar, segmentasi budget belanja, dan preferensi model.</p>
              </div>
              <button
                onClick={() => exportToCSV('customers')}
                className="bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-1.5 shadow-sm shrink-0 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor ke CSV</span>
              </button>
            </div>

            {loadingData ? (
              <div className="bg-card border border-border p-10 rounded-2xl animate-pulse text-center text-muted">Memuat tabel survey...</div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-normal border-collapse">
                    <thead>
                      <tr className="bg-brand-beige/50 border-b border-border text-brand-brown-dark font-bold text-2xs uppercase tracking-wider">
                        <th className="p-4">Nama</th>
                        <th className="p-4">Umur</th>
                        <th className="p-4">Gender</th>
                        <th className="p-4">Kota</th>
                        <th className="p-4">Model Favorit</th>
                        <th className="p-4">Budget Belanja</th>
                        <th className="p-4">Frekuensi Bulanan</th>
                        <th className="p-4 text-center">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted">
                      {surveys.map((surv) => (
                        <tr key={surv.id} className="hover:bg-brand-beige/10">
                          <td className="p-4 font-semibold text-foreground">{surv.name}</td>
                          <td className="p-4">{surv.age} tahun</td>
                          <td className="p-4">{surv.gender}</td>
                          <td className="p-4">{surv.city}</td>
                          <td className="p-4 font-medium text-foreground">{surv.preference}</td>
                          <td className="p-4">{surv.budget}</td>
                          <td className="p-4">{surv.frequency}</td>
                          <td className="p-4 text-center">{new Date(surv.createdAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* CRUD Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-lg p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-base font-serif font-bold text-foreground">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Hijab Baru'}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="p-1.5 hover:bg-brand-beige/40 rounded-full text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-semibold text-brand-brown-dark">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="col-span-2 space-y-1">
                  <label>Nama Produk *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-normal text-foreground"
                    required
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label>Harga (IDR) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-normal text-foreground"
                    required
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label>Stok Awal *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-normal text-foreground"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label>Kategori *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-normal text-foreground"
                  >
                    <option value="Hijab Segi Empat (Square)">Hijab Segi Empat (Square)</option>
                    <option value="Pashmina">Pashmina</option>
                    <option value="Hijab Instan">Hijab Instan</option>
                    <option value="Pashmina Instan (Pashmina Inner)">Pashmina Instan (Pashmina Inner)</option>
                    <option value="Turban">Turban</option>
                    <option value="Hijab Olahraga (Sport Hijab)">Hijab Olahraga (Sport Hijab)</option>
                    <option value="Ciput">Ciput</option>
                  </select>
                </div>

                {/* Material */}
                <div className="space-y-1">
                  <label>Material Bahan</label>
                  <input
                    type="text"
                    placeholder="cth. Voal Ultrafine"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-normal text-foreground"
                  />
                </div>
              </div>

              {/* Colors comma separated */}
              <div className="space-y-1">
                <label>Varian Warna (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="cth. Beige, Dusty Pink, Cream"
                  value={productForm.colors}
                  onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-normal text-foreground"
                />
              </div>

              {/* Image Upload & Preview */}
              <div className="space-y-2">
                <label className="block">Gambar Produk *</label>
                <div className="flex items-center space-x-4">
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-xl bg-brand-beige border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {productForm.imageUrl ? (
                      <img src={getImageUrl(productForm.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xs text-muted font-normal">No Image</span>
                    )}
                  </div>
                  {/* File input wrapper */}
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="product-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="inline-flex items-center justify-center border border-border bg-background hover:bg-brand-beige/25 hover:text-brand-brown-dark text-brand-brown-dark font-semibold px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-colors"
                    >
                      {uploadingImage ? 'Mengunggah...' : 'Pilih File Gambar'}
                    </label>
                    <span className="block text-3xs text-muted mt-1 font-normal">Format: JPG, PNG, WEBP (Maks. 5MB)</span>
                  </div>
                </div>
                <input
                  type="hidden"
                  value={productForm.imageUrl}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label>Deskripsi Produk</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-normal text-foreground"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="border border-border text-muted font-semibold px-4 py-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-brand-brown-dark text-white font-semibold px-6 py-2 rounded-xl"
                >
                  Simpan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
