'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomer } from '../../context/CustomerContext';
import { api } from '../../utils/api';
import { User, Mail, Shield, Calendar, ShoppingBag, Truck, ExternalLink, MessageSquare, HelpCircle } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const { customerUser, isLoggedIn, loading } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Authentication Guard
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login?redirect=/profile');
    }
  }, [isLoggedIn, loading, router]);

  // 2. Fetch Customer Orders
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchOrders = async () => {
      try {
        setFetchingOrders(true);
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        setErrorMsg('Gagal memuat riwayat pesanan Anda.');
      } finally {
        setFetchingOrders(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/50">Menunggu Bayar</span>;
      case 'PROCESSED':
        return <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/50">Diproses</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-purple-50 text-purple-600 border border-purple-200/50">Dikirim</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-green-50 text-green-600 border border-green-200/50">Selesai</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-muted/20 text-muted">{status}</span>;
    }
  };

  if (loading || !isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted animate-pulse">
        Memuat Halaman Profil...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-serif font-bold text-foreground">Profil Saya</h1>
        <p className="text-sm text-muted mt-1">Kelola data informasi akun Anda dan pantau riwayat transaksi pembelian hijab.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Account Details */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-2xs">
          <div className="text-center pb-4 border-b border-border">
            <div className="mx-auto w-20 h-20 rounded-full bg-brand-pink/20 text-brand-pink-dark flex items-center justify-center font-bold text-2xl mb-3 shadow-2xs border-2 border-white dark:border-brand-beige-dark/20">
              {customerUser?.name[0].toUpperCase()}
            </div>
            <h2 className="text-lg font-serif font-bold text-foreground leading-tight">{customerUser?.name}</h2>
            <span className="text-2xs text-muted font-mono">{customerUser?.provider === 'GOOGLE' ? 'Taut Google Account' : 'Standard Login'}</span>
          </div>

          <div className="space-y-4 text-xs font-medium text-muted">
            {/* Email */}
            <div className="flex items-center space-x-3 bg-background border border-border p-3.5 rounded-2xl">
              <Mail className="w-5 h-5 text-brand-brown-dark shrink-0" />
              <div>
                <span className="block text-3xs font-semibold uppercase text-brand-brown tracking-wider">Alamat Email</span>
                <span className="block text-foreground text-xs">{customerUser?.email}</span>
              </div>
            </div>

            {/* Provider */}
            <div className="flex items-center space-x-3 bg-background border border-border p-3.5 rounded-2xl">
              <Shield className="w-5 h-5 text-brand-brown-dark shrink-0" />
              <div>
                <span className="block text-3xs font-semibold uppercase text-brand-brown tracking-wider">Metode Masuk</span>
                <span className="block text-foreground text-xs">
                  {customerUser?.provider === 'GOOGLE' ? 'Google Account Simulator' : 'Email & Password'}
                </span>
              </div>
            </div>

            {/* Hint */}
            <div className="bg-brand-beige/20 border border-brand-beige-dark/25 p-4 rounded-2xl flex items-start space-x-2.5 text-2xs leading-relaxed text-brand-brown-dark">
              <HelpCircle className="w-4 h-4 shrink-0 text-brand-pink-dark" />
              <p>Butuh bantuan dengan akun atau pesanan Anda? Silakan hubungi admin kami melalui tombol WhatsApp yang tertera di rincian order.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-brown-dark pb-3 border-b border-border flex items-center space-x-2">
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>Riwayat Transaksi</span>
            </h3>

            {fetchingOrders ? (
              <div className="py-12 text-center text-muted space-y-2 animate-pulse">
                <div className="mx-auto w-6 h-6 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Memuat daftar pesanan Anda...</p>
              </div>
            ) : errorMsg ? (
              <div className="py-10 text-center text-red-500 text-xs font-semibold">
                {errorMsg}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand-beige/50 flex items-center justify-center text-muted shadow-2xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-foreground">Belum Ada Transaksi</h4>
                  <p className="text-xs text-muted max-w-xs mx-auto">Anda belum pernah melakukan pemesanan hijab. Mulai belanja sekarang untuk koleksi terbaik kami.</p>
                </div>
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white text-xs px-5 py-2.5 rounded-xl font-semibold shadow-xs"
                >
                  Belanja Sekarang
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="pt-6 first:pt-4 space-y-4">
                    {/* Order Meta Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block sm:inline mr-2">No. Pesanan #{order.id}</span>
                        <span className="text-2xs text-muted font-medium flex items-center sm:inline">
                          <Calendar className="w-3.5 h-3.5 mr-1 inline sm:hidden" />
                          {new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-background border border-border/70 rounded-2xl p-4 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <div className="max-w-[75%]">
                            <span className="block font-semibold text-foreground line-clamp-1">{item.product.name}</span>
                            <span className="block text-3xs text-muted">Varian: {item.color || '-'} | Qty: {item.quantity}</span>
                          </div>
                          <span className="font-bold text-brand-brown-dark shrink-0">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}

                      {/* Total Amount Block */}
                      <div className="border-t border-border/50 pt-2.5 flex items-center justify-between text-xs font-bold text-foreground">
                        <span className="text-2xs font-semibold text-muted">Total Pembayaran ({order.paymentMethod}):</span>
                        <span className="text-brand-brown-dark text-sm">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Tracking details or WhatsApp CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs">
                      {/* Left: Resi details */}
                      {order.status === 'SHIPPED' && order.trackingNumber ? (
                        <div className="flex items-center space-x-2 text-2xs text-purple-600 bg-purple-50/50 border border-purple-200/50 px-3 py-1.5 rounded-xl font-semibold">
                          <Truck className="w-4 h-4 shrink-0 text-purple-500" />
                          <span>No. Resi: <strong>{order.trackingNumber}</strong></span>
                          <Link href={`/tracking?whatsapp=${order.whatsapp}`} className="text-brand-pink-dark hover:underline flex items-center space-x-0.5 ml-1">
                            <span>Lacak</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : order.status === 'PENDING' ? (
                        <p className="text-3xs text-muted leading-tight">*Silakan selesaikan pembayaran dan kirimkan bukti transfer ke WhatsApp admin kami.</p>
                      ) : (
                        <p className="text-3xs text-muted leading-tight">*Pesanan Anda sedang diproses oleh admin kami.</p>
                      )}

                      {/* Right: WhatsApp CTA */}
                      <a
                        href={`https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Admin,%20saya%20ingin%20bertanya%20mengenai%20pesanan%20%23${order.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center space-x-1.5 text-2xs font-semibold text-green-600 border border-green-200 bg-green-50/30 hover:bg-green-50 px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                        <span>Tanya Admin</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
