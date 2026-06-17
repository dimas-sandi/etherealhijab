'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import { Lock, User, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect directly to admin panel
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await api.login(formData.username, formData.password);
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_user', JSON.stringify(result.admin));
      router.push('/admin');
    } catch (err) {
      console.error('Login failed', err);
      setErrorMsg(err.message || 'Login gagal. Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 animate-fade-in">
      <div className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink-dark">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Portal</h1>
          <p className="text-xs text-muted">Silakan masuk untuk mengelola katalog, order, dan statistik survey.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-brand-brown-dark">Username</label>
            <div className="relative font-normal text-muted">
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground"
                required
              />
              <User className="w-4 h-4 absolute left-3.5 top-3" />
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
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink transition-all text-foreground"
                required
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center bg-brand-brown-dark hover:bg-brand-brown-dark/95 text-white font-semibold py-3 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Masuk...' : 'Masuk'}</span>
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-border text-center text-3xs text-muted space-y-1">
          <p>Demo Akun default:</p>
          <p className="font-mono bg-background px-2 py-1 rounded border border-border inline-block">admin / admin123</p>
        </div>

      </div>
    </div>
  );
}
