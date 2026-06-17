'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { api } from '../../utils/api';
import { CreditCard, CheckCircle2, ChevronRight, MessageSquare, Landmark, QrCode } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const { cartItems, getTotal, promoCode, discount, clearCart } = useCart();
  const { customerUser, isLoggedIn, loading } = useCustomer();

  const [formData, setFormData] = useState({
    customerName: '',
    whatsapp: '',
    address: '',
    notes: '',
    paymentMethod: 'Bank Transfer',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  // Checkout Authentication Guard
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login?redirect=/checkout');
    }
  }, [isLoggedIn, loading, router]);

  // Prefill Customer Name
  useEffect(() => {
    if (customerUser) {
      setFormData((prev) => ({
        ...prev,
        customerName: customerUser.name,
      }));
    }
  }, [customerUser]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.customerName || !formData.whatsapp || !formData.address) {
      setErrorMsg('Nama lengkap, WhatsApp, dan Alamat lengkap harus diisi.');
      return;
    }

    setSubmitting(true);

    // Prepare items for DB
    const items = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      color: item.color,
    }));

    try {
      const payload = {
        customerName: formData.customerName,
        whatsapp: formData.whatsapp,
        address: formData.address,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        promoCode: promoCode || null,
        items,
      };

      const result = await api.createOrder(payload);
      setCreatedOrder(result.order);
      
      // Construct WhatsApp message
      const orderId = result.order.id;
      const itemsListText = cartItems
        .map((item) => `- ${item.product.name} (${item.color}) x${item.quantity} @ ${formatPrice(item.product.price)}`)
        .join('%0A');
      
      const waText = `Halo EtherealHijab, saya ingin mengonfirmasi pesanan baru dengan rincian berikut:%0A%0A` +
        `*No. Pesanan:* %23${orderId}%0A` +
        `*Nama Pelanggan:* ${formData.customerName}%0A` +
        `*WhatsApp:* ${formData.whatsapp}%0A` +
        `*Alamat Lengkap:* ${formData.address}%0A%0A` +
        `*Pesanan:*%0A${itemsListText}%0A%0A` +
        `*Total Pembayaran:* ${formatPrice(getTotal())}%0A` +
        `*Metode Pembayaran:* ${formData.paymentMethod}%0A` +
        `*Catatan:* ${formData.notes || '-'}%0A%0A` +
        `Mohon segera diproses. Terima kasih!`;
      
      const whatsappURL = `https://api.whatsapp.com/send?phone=6281234567890&text=${waText}`;
      
      // Delay redirect slightly so the user sees order completed screen
      setTimeout(() => {
        window.open(whatsappURL, '_blank');
      }, 1500);

      // Clear Cart Context
      clearCart();

    } catch (err) {
      console.error('Checkout failed', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat membuat pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  const total = getTotal();

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-muted animate-pulse">
        Memuat Halaman Pembayaran...
      </div>
    );
  }

  // If order was successfully created, show completion screen
  if (createdOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-foreground">Pesanan Berhasil Dibuat!</h1>
          <p className="text-xs text-muted">ID Pesanan Anda: <span className="font-semibold text-brand-brown-dark font-mono text-sm">#{createdOrder.id}</span></p>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl text-left space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown-dark">Instruksi Pembayaran</h3>
          
          {formData.paymentMethod === 'Bank Transfer' ? (
            <div className="text-xs space-y-2 text-muted leading-relaxed">
              <p>Silakan transfer total pembayaran sebesar <strong className="text-brand-brown-dark text-sm">{formatPrice(total)}</strong> ke rekening berikut:</p>
              <div className="bg-background border border-border p-3.5 rounded-xl space-y-1 font-mono text-foreground text-xs">
                <div>Bank BCA: <strong>8012-3456-78</strong></div>
                <div>A/N: <strong>Ethereal Hijab Indonesia</strong></div>
              </div>
              <p className="text-3xs text-red-500 font-semibold">* Mohon sertakan nomor pesanan #{createdOrder.id} pada berita transfer.</p>
            </div>
          ) : formData.paymentMethod === 'QRIS' ? (
            <div className="text-xs space-y-2 text-muted text-center leading-relaxed">
              <p>Scan kode QRIS di bawah ini dengan aplikasi pembayaran digital (OVO, GoPay, Dana, LinkAja, BCA, dll.):</p>
              <div className="mx-auto w-40 h-40 border border-border bg-white rounded-lg flex items-center justify-center p-2">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EtherealHijabQRIS" alt="QRIS Code" className="w-full h-full object-contain" />
              </div>
              <p className="text-brand-brown-dark text-xs font-semibold">Total: {formatPrice(total)}</p>
            </div>
          ) : (
            <p className="text-xs text-muted leading-relaxed">Admin kami akan segera menghubungi Anda di WhatsApp untuk memverifikasi detail pesanan dan pembayaran.</p>
          )}
        </div>

        <div className="bg-brand-pink/10 border border-brand-pink-light/40 p-4 rounded-xl text-left flex items-start space-x-3 text-xs text-brand-pink-dark">
          <MessageSquare className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Membuka WhatsApp Web / Aplikasi...</p>
            <p className="text-2xs text-muted mt-0.5">Jika Anda tidak dialihkan otomatis dalam beberapa detik, silakan klik tombol di bawah untuk konfirmasi pesanan secara manual.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Admin,%20saya%20konfirmasi%20order%20%23${createdOrder.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all"
          >
            <span>Hubungi Via WhatsApp</span>
          </a>
          <Link
            href={`/tracking?whatsapp=${createdOrder.whatsapp}`}
            className="inline-flex items-center justify-center border-2 border-brand-brown-dark/30 hover:border-brand-brown-dark text-brand-brown-dark font-medium px-6 py-2.5 rounded-xl transition-all"
          >
            <span>Lacak Status Pesanan</span>
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty and order not created, redirect
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Keranjang Belanja Kosong</h2>
        <Link href="/catalog" className="text-brand-pink-dark hover:underline">Kembali Belanja</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold text-foreground">Formulir Pemesanan</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Checkout Form */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl space-y-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-brown-dark pb-2 border-b border-border">
            Informasi Pengiriman & Kontak
          </h2>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4 text-xs font-semibold">
            
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label htmlFor="customerName" className="block text-brand-brown-dark">Nama Lengkap *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                placeholder="cth. Fatimah Az-Zahra"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                required
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label htmlFor="whatsapp" className="block text-brand-brown-dark">Nomor WhatsApp *</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                placeholder="cth. 081234567890"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="block text-brand-brown-dark">Alamat Lengkap Pengiriman *</label>
              <textarea
                id="address"
                name="address"
                rows="4"
                placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kabupaten/kota, dan kode pos"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label htmlFor="notes" className="block text-brand-brown-dark">Catatan Tambahan (Opsional)</label>
              <textarea
                id="notes"
                name="notes"
                rows="2"
                placeholder="cth. Tolong packing box aman untuk kado, atau patokan dekat pos satpam"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-brand-brown-dark">Metode Pembayaran *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-normal text-muted">
                
                {/* Bank Transfer */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'Bank Transfer'
                    ? 'border-brand-pink bg-brand-pink/5 text-brand-pink-dark font-semibold'
                    : 'border-border bg-background hover:bg-brand-beige/20'
                }`}>
                  <div className="flex items-center space-x-3 text-xs">
                    <Landmark className="w-4 h-4 shrink-0 text-brand-brown-dark" />
                    <span>Bank Transfer</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Transfer"
                    checked={formData.paymentMethod === 'Bank Transfer'}
                    onChange={handleInputChange}
                    className="accent-brand-pink hidden"
                  />
                </label>

                {/* QRIS */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'QRIS'
                    ? 'border-brand-pink bg-brand-pink/5 text-brand-pink-dark font-semibold'
                    : 'border-border bg-background hover:bg-brand-beige/20'
                }`}>
                  <div className="flex items-center space-x-3 text-xs">
                    <QrCode className="w-4 h-4 shrink-0 text-brand-brown-dark" />
                    <span>QRIS (E-Wallet)</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="QRIS"
                    checked={formData.paymentMethod === 'QRIS'}
                    onChange={handleInputChange}
                    className="accent-brand-pink hidden"
                  />
                </label>

                {/* WhatsApp Direct */}
                <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'WhatsApp Checkout'
                    ? 'border-brand-pink bg-brand-pink/5 text-brand-pink-dark font-semibold'
                    : 'border-border bg-background hover:bg-brand-beige/20'
                }`}>
                  <div className="flex items-center space-x-3 text-xs">
                    <CreditCard className="w-4 h-4 shrink-0 text-brand-brown-dark" />
                    <span>WhatsApp Pay</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="WhatsApp Checkout"
                    checked={formData.paymentMethod === 'WhatsApp Checkout'}
                    onChange={handleInputChange}
                    className="accent-brand-pink hidden"
                  />
                </label>

              </div>
            </div>

          </div>
        </div>

        {/* Order Summary & Confirm */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase text-brand-brown-dark tracking-wider pb-2 border-b border-border">
              Rincian Belanja
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.color}`} className="flex items-center justify-between text-xs">
                  <div className="max-w-[70%]">
                    <span className="block font-semibold text-foreground line-clamp-1">{item.product.name}</span>
                    <span className="block text-3xs text-muted">Varian: {item.color} | Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-brand-brown-dark shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-2xs">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0))}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600 font-semibold">
                  <span>Diskon Voucher ({promoCode})</span>
                  <span>-{formatPrice(cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0) * discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-muted">
                <span>Ongkir</span>
                <span className="text-green-500 font-semibold uppercase">Gratis</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-foreground pt-2 border-t border-border/50">
                <span>Total Bayar</span>
                <span className="text-brand-brown-dark text-sm">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{submitting ? 'Memproses Order...' : 'Konfirmasi Pemesanan'}</span>
                {!submitting && <ChevronRight className="ml-2.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
