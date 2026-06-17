'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../utils/api';
import { HelpCircle, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export default function Survey() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Wanita',
    city: '',
    preference: 'Hijab Segi Empat (Square)',
    budget: 'IDR 50k - 100k',
    frequency: '1 kali',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.name || !formData.age || !formData.city) {
        setErrorMsg('Silakan lengkapi nama, umur, dan kota asal Anda.');
        return;
      }
      if (isNaN(formData.age) || parseInt(formData.age) <= 0) {
        setErrorMsg('Silakan masukkan umur yang valid.');
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.preference || !formData.budget || !formData.frequency) {
      setErrorMsg('Silakan lengkapi semua preferensi belanja Anda.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitSurvey({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        city: formData.city,
        preference: formData.preference,
        budget: formData.budget,
        frequency: formData.frequency,
      });
      setSuccess(true);
    } catch (err) {
      console.error('Failed to submit survey', err);
      setErrorMsg(err.message || 'Gagal mengirim survey. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-foreground">Terima Kasih Atas Partisipasi Anda!</h1>
          <p className="text-sm text-muted">Data Anda telah kami simpan dengan aman untuk membantu menyempurnakan koleksi EtherealHijab.</p>
        </div>

        <div className="bg-brand-beige/30 p-6 rounded-2xl text-left border border-brand-beige-dark/20 flex items-start space-x-3 text-xs text-brand-brown-dark leading-relaxed">
          <Sparkles className="w-5 h-5 shrink-0 text-brand-pink-dark" />
          <div>
            <p className="font-semibold">Keuntungan Anda:</p>
            <p className="text-2xs text-muted mt-1">Sebagai apresiasi, gunakan kode voucher <strong className="text-brand-pink-dark">ETHEREAL10</strong> untuk mendapatkan potongan 10% pada pembelian pertama Anda!</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-medium px-8 py-3 rounded-xl shadow-sm transition-all"
          >
            <span>Belanja Sekarang</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border-2 border-brand-brown-dark/20 hover:border-brand-brown-dark text-brand-brown-dark font-medium px-8 py-3 rounded-xl transition-all"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground flex items-center justify-center space-x-2">
          <HelpCircle className="w-6 h-6 text-brand-pink-dark" />
          <span>Survey Preferensi Hijab</span>
        </h1>
        <p className="text-sm text-muted">
          Bantu kami memahami produk hijab favorit Anda dan temukan voucher diskon spesial di akhir kuesioner.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-brand-pink h-full transition-all duration-300"
          style={{ width: `${step === 1 ? '50%' : '100%'}` }}
        />
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6">
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">
          
          {/* STEP 1: Profil Dasar */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-brown-dark pb-1.5 border-b border-border mb-4">
                Langkah 1: Informasi Dasar
              </h2>

              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-brand-brown-dark">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="cth. Aisyah Putri"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                  required
                />
              </div>

              {/* Age & Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label htmlFor="age" className="block text-brand-brown-dark">Umur (Tahun)</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    placeholder="cth. 23"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gender" className="block text-brand-brown-dark">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                  >
                    <option value="Wanita">Wanita</option>
                    <option value="Pria">Pria</option>
                  </select>
                </div>

              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label htmlFor="city" className="block text-brand-brown-dark">Kota Asal</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="cth. Bandung"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center justify-center bg-brand-brown text-white font-medium px-6 py-2.5 rounded-xl transition-all"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Kebiasaan & Preferensi Belanja */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-brown-dark pb-1.5 border-b border-border mb-4">
                Langkah 2: Preferensi Hijab
              </h2>

              {/* Preference */}
              <div className="space-y-1.5">
                <label htmlFor="preference" className="block text-brand-brown-dark">Model Hijab Terfavorit</label>
                <select
                  id="preference"
                  name="preference"
                  value={formData.preference}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
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

              {/* Budget */}
              <div className="space-y-1.5">
                <label htmlFor="budget" className="block text-brand-brown-dark">Rata-rata Budget Per Pembelian</label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                >
                  <option value="Di bawah IDR 50k">Di bawah IDR 50.000</option>
                  <option value="IDR 50k - 100k">IDR 50.000 - IDR 100.000</option>
                  <option value="IDR 100k - 200k">IDR 100.000 - IDR 200.000</option>
                  <option value="Di atas IDR 200k">Di atas IDR 200.000</option>
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <label htmlFor="frequency" className="block text-brand-brown-dark">Frekuensi Belanja Hijab Per Bulan</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground font-normal"
                >
                  <option value="1 kali">1 kali per bulan</option>
                  <option value="2-3 kali">2-3 kali per bulan</option>
                  <option value="4-5 kali">4-5 kali per bulan</option>
                  <option value="Lebih dari 5 kali">Lebih dari 5 kali per bulan</option>
                </select>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center justify-center border border-border text-muted font-medium px-6 py-2.5 rounded-xl hover:bg-brand-beige/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  <span>Kembali</span>
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-medium px-8 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{submitting ? 'Mengirim...' : 'Kirim Jawaban'}</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>

    </div>
  );
}
