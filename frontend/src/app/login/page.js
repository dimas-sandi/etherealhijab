'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomer } from '../../context/CustomerContext';
import { Mail, Lock, User, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { loginCustomer, registerCustomer, loginCustomerGoogle, isLoggedIn } = useCustomer();

  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Google Simulation popup state
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectPath);
    }
  }, [isLoggedIn, router, redirectPath]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginView) {
        await loginCustomer(formData.email, formData.password);
      } else {
        await registerCustomer(formData.name, formData.email, formData.password);
      }
      router.push(redirectPath);
    } catch (err) {
      console.error('Customer auth failed', err);
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login simulator profiles
  const googleMockProfiles = [
    { name: 'Fatimah Az-Zahra', email: 'fatimah.zahra@gmail.com' },
    { name: 'Siti Aminah', email: 'siti.aminah@gmail.com' },
    { name: 'Aisyah Putri', email: 'aisyah.putri@gmail.com' },
  ];

  const handleGoogleMockSelect = async (profile) => {
    setErrorMsg('');
    setGoogleLoading(true);

    try {
      // Simulate network request delay for "ongoing" status experience
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await loginCustomerGoogle(profile.name, profile.email);
      setShowGoogleMock(false);
      router.push(redirectPath);
    } catch (err) {
      console.error('Google mock login failed', err);
      setErrorMsg('Gagal terhubung dengan layanan Google Simulasi.');
      setShowGoogleMock(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in relative">
      
      <div className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {isLoginView ? 'Masuk Akun' : 'Daftar Akun Baru'}
          </h1>
          <p className="text-xs text-muted">
            {isLoginView 
              ? 'Silakan masuk untuk melanjutkan pembelian hijab Anda.' 
              : 'Daftar sekarang untuk melacak pesanan dan menikmati promo menarik.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* Register-only: Name */}
          {!isLoginView && (
            <div className="space-y-1.5 animate-fade-in">
              <label htmlFor="name" className="block text-brand-brown-dark">Nama Lengkap</label>
              <div className="relative font-normal text-muted">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="cth. Fatimah Az-Zahra"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground"
                  required={!isLoginView}
                />
                <User className="w-4 h-4 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-brand-brown-dark">Alamat Email</label>
            <div className="relative font-normal text-muted">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="cth. fatimah@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground"
                required
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-brand-brown-dark">Password</label>
            <div className="relative font-normal text-muted">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Masukkan password Anda"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground"
                required
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-semibold py-3 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <span>
                {loading 
                  ? 'Memproses...' 
                  : isLoginView ? 'Masuk' : 'Daftar Sekarang'}
              </span>
            </button>
          </div>

        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-2 text-2xs text-muted font-semibold uppercase">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <span className="relative bg-card px-3">Atau</span>
        </div>

        {/* Google Login Simulation Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowGoogleMock(true)}
            disabled={loading || googleLoading}
            className="w-full inline-flex items-center justify-center bg-white dark:bg-brand-beige/5 border border-border hover:bg-brand-beige/10 text-foreground font-semibold py-3 rounded-xl transition-all space-x-2.5 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-brand-brown border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              /* Standard Google Logo icon */
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>{googleLoading ? 'Menghubungkan...' : 'Masuk dengan Google (Simulasi)'}</span>
          </button>
        </div>

        {/* View Toggle */}
        <div className="text-center text-xs text-muted pt-2">
          {isLoginView ? (
            <p>
              Belum punya akun?{' '}
              <button
                onClick={() => setIsLoginView(false)}
                className="text-brand-pink-dark font-bold hover:underline ml-1"
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{' '}
              <button
                onClick={() => setIsLoginView(true)}
                className="text-brand-pink-dark font-bold hover:underline ml-1"
              >
                Silakan Masuk
              </button>
            </p>
          )}
        </div>

      </div>

      {/* Simulated Google Sign-In Popup Overlay */}
      {showGoogleMock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border w-full max-w-sm p-6 rounded-2xl space-y-5 shadow-2xl animate-scale-in">
            
            {/* Logo & Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center space-x-1.5 items-center">
                {/* Fixed Google Logo vector */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-bold text-foreground font-sans">
                  {googleLoading ? 'Menghubungkan Akun...' : 'Sign in with Google'}
                </span>
              </div>
              <p className="text-2xs text-muted">
                {googleLoading 
                  ? 'Mohon tunggu sebentar selagi kami menautkan akun Google Anda.' 
                  : 'Pilih akun demo simulasi untuk menghubungkan dengan EtherealHijab.'}
              </p>
            </div>

            {/* Profile Selection or Spinner */}
            {googleLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-xs font-semibold text-brand-brown-dark">Sedang masuk...</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {googleMockProfiles.map((profile) => (
                  <button
                    key={profile.email}
                    onClick={() => handleGoogleMockSelect(profile)}
                    className="w-full flex items-center space-x-3 p-3 bg-background border border-border hover:border-brand-pink/50 hover:bg-brand-pink/5 rounded-xl transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-pink/20 text-brand-pink-dark flex items-center justify-center font-bold text-xs">
                      {profile.name[0]}
                    </div>
                    <div className="text-2xs">
                      <span className="block font-bold text-foreground">{profile.name}</span>
                      <span className="block text-muted">{profile.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={() => setShowGoogleMock(false)}
                disabled={googleLoading}
                className="text-xs text-muted hover:underline disabled:opacity-50"
              >
                Batal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-20 text-center text-muted">Memuat Halaman Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
