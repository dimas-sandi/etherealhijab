'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, getImageUrl } from '../../utils/api';
import { Search, MapPin, Truck, Calendar, ShoppingBag, Landmark, Info } from 'lucide-react';

function TrackingContent() {
  const searchParams = useSearchParams();
  const whatsappQuery = searchParams.get('whatsapp');
  const orderIdQuery = searchParams.get('orderId');

  const [inputVal, setInputVal] = useState(orderIdQuery || whatsappQuery || '');
  const [orders, setOrders] = useState([]);
  const [singleOrder, setSingleOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const query = orderIdQuery || whatsappQuery;
    if (query) {
      handleSearch(null, query);
    }
  }, [orderIdQuery, whatsappQuery]);

  const handleSearch = async (e, directVal) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setOrders([]);
    setSingleOrder(null);
    setSearched(false);

    const query = directVal || inputVal.trim();
    if (!query) return;

    setLoading(true);

    try {
      const normalizedQuery = query.trim().toUpperCase();
      // If query starts with 'ETH-' or contains non-digits, treat it as an Order ID
      const isOrderId = normalizedQuery.startsWith('ETH-') || (!/^\d+$/.test(normalizedQuery) && normalizedQuery.length > 5);

      if (isOrderId) {
        const order = await api.getOrderById(normalizedQuery);
        setSingleOrder(order);
      } else {
        // Query by WhatsApp
        const results = await api.trackOrderByWhatsapp(query);
        if (results.length === 1) {
          setSingleOrder(results[0]);
        } else {
          setOrders(results);
        }
      }
      setSearched(true);
    } catch (err) {
      console.error('Failed to track order', err);
      setErrorMsg('Data pesanan tidak ditemukan. Silakan cek kembali nomor WhatsApp atau ID Pesanan Anda.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Pembayaran';
      case 'PROCESSED': return 'Sedang Diproses';
      case 'SHIPPED': return 'Dalam Pengiriman';
      case 'COMPLETED': return 'Selesai';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PROCESSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStatusTimeline = (status) => {
    const steps = [
      { key: 'PENDING', label: 'Order Dibuat' },
      { key: 'PROCESSED', label: 'Verifikasi & Packing' },
      { key: 'SHIPPED', label: 'Dikirim' },
      { key: 'COMPLETED', label: 'Tiba di Tujuan' }
    ];

    const currentIdx = steps.findIndex(s => s.key === status);

    return (
      <div className="flex items-center justify-between w-full relative py-6">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-brand-pink -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isActive = idx <= currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center z-10 space-y-2">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-brand-pink border-brand-pink text-white shadow-sm' 
                  : 'bg-background border-border text-muted'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-[10px] sm:text-2xs font-semibold ${isActive ? 'text-brand-brown-dark' : 'text-muted'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Lacak Status Pesanan</h1>
        <p className="text-sm text-muted">
          Masukkan ID Pesanan (cth. ETH-260617-K7P9X) atau Nomor WhatsApp untuk memeriksa status pengiriman hijab Anda.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={(e) => handleSearch(e)} className="bg-card border border-border p-6 rounded-2xl shadow-2xs flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="cth. 081234567890 atau ID Order: ETH-260617-K7P9X"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all"
            required
          />
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white text-xs px-6 py-3 rounded-xl font-semibold transition-all shadow-sm shrink-0"
        >
          {loading ? 'Mencari...' : 'Lacak'}
        </button>
      </form>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      {/* Multi-Order List (when queried by WA and has multiple orders) */}
      {searched && orders.length > 1 && !singleOrder && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-brown-dark">Daftar Pesanan Anda ({orders.length})</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSingleOrder(order)}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-foreground">Order #{order.id}</div>
                  <div className="text-2xs text-muted flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {formatDate(order.createdAt)}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-full text-3xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <span className="font-bold text-brand-brown-dark">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Order Detail Display */}
      {searched && singleOrder && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border gap-3 text-xs">
            <div>
              <h2 className="text-base font-serif font-bold text-foreground">Order #{singleOrder.id}</h2>
              <p className="text-3xs text-muted mt-0.5">Dipesan pada: {formatDate(singleOrder.createdAt)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(singleOrder.status)}`}>
              {getStatusText(singleOrder.status)}
            </span>
          </div>

          {/* Timeline */}
          <div className="bg-background border border-border/60 rounded-2xl px-4 py-2 sm:px-6">
            {renderStatusTimeline(singleOrder.status)}
          </div>

          {/* Shipping details (Resi) if shipped */}
          {singleOrder.status === 'SHIPPED' && singleOrder.trackingNumber && (
            <div className="bg-purple-50/50 border border-purple-200 text-purple-900 p-4 rounded-xl flex items-start space-x-3 text-xs">
              <Truck className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="font-semibold">Paket Telah Dikirim!</p>
                <p className="mt-0.5 text-2xs text-muted">Nomor Resi Pengiriman: <strong className="font-mono text-purple-800 text-xs">{singleOrder.trackingNumber}</strong></p>
              </div>
            </div>
          )}

          {/* Customer Address & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Address */}
            <div className="bg-background border border-border/50 p-4 rounded-xl space-y-2">
              <h3 className="font-bold text-brand-brown-dark flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> Alamat Pengiriman</h3>
              <p className="text-muted leading-relaxed font-normal">{singleOrder.address}</p>
              <p className="text-2xs text-muted font-normal pt-1 border-t border-border/40">Penerima: <strong className="text-foreground">{singleOrder.customerName}</strong> ({singleOrder.whatsapp})</p>
            </div>

            {/* Payment Info */}
            <div className="bg-background border border-border/50 p-4 rounded-xl space-y-2">
              <h3 className="font-bold text-brand-brown-dark flex items-center"><Landmark className="w-4 h-4 mr-1.5" /> Metode Pembayaran</h3>
              <p className="text-muted leading-relaxed font-normal">{singleOrder.paymentMethod}</p>
              <p className="text-2xs text-muted font-normal pt-1 border-t border-border/40">Total Tagihan: <strong className="text-foreground">{formatPrice(singleOrder.totalAmount)}</strong></p>
            </div>

          </div>

          {/* Itemized Order list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown-dark flex items-center"><ShoppingBag className="w-4.5 h-4.5 mr-1.5" /> Item Belanja</h3>
            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border text-xs">
              {singleOrder.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={getImageUrl(item.product.imageUrl)} 
                      alt={item.product.name} 
                      className="w-10 h-12 rounded object-cover shrink-0 bg-brand-beige"
                    />
                    <div>
                      <span className="block font-semibold text-foreground">{item.product.name}</span>
                      <span className="block text-3xs text-muted font-normal">Warna: {item.product.colors.split(',')[0]} | Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-brand-brown-dark">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note for Pending status */}
          {singleOrder.status === 'PENDING' && (
            <div className="bg-amber-50/50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start space-x-2.5 text-xs font-normal">
              <Info className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <div>
                <p><strong>Menunggu Konfirmasi Pembayaran.</strong></p>
                <p className="text-2xs text-muted mt-0.5">Jika Anda memilih transfer bank, silakan kirim bukti transfer Anda ke WhatsApp CS kami di +62 812-3456-7890 agar pesanan bisa segera dikirim.</p>
              </div>
            </div>
          )}

        </div>
      )}

      {searched && !orders.length && !singleOrder && (
        <div className="text-center py-12 bg-card border border-border border-dashed rounded-3xl text-muted text-xs">
          Masukkan nomor di atas untuk melacak.
        </div>
      )}

    </div>
  );
}

export default function Tracking() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Memuat Pelacakan...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
