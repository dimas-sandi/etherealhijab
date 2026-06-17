'use client';
import { BarChart3, Package, ShoppingCart, Users, LogOut, CheckCircle2 } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'overview', name: 'Overview & Statistik', icon: BarChart3 },
    { id: 'products', name: 'Kelola Produk', icon: Package },
    { id: 'orders', name: 'Kelola Pesanan', icon: ShoppingCart },
    { id: 'customers', name: 'Data Pelanggan (Survey)', icon: Users },
  ];

  return (
    <aside className="w-full md:w-64 bg-card border-r border-border min-h-screen p-6 flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center space-x-2 select-none">
          <img src="/Logo.svg" alt="Ethereal Logo" className="w-8 h-8 object-contain" />
          <h2 className="text-lg font-serif font-semibold text-brand-brown-dark">
            Ethereal Admin
          </h2>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-brand-brown text-white shadow-sm'
                    : 'text-muted hover:bg-brand-beige hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="pt-6 border-t border-border/60">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
