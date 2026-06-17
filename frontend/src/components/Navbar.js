'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, ShoppingBag, Heart, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { darkMode, toggleDarkMode } = useTheme();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const isActive = (path) => pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Katalog', path: '/catalog' },
    { name: 'Hubungi Kami', path: '/#contact' },
    { name: 'Survey Pelanggan', path: '/survey' },
    { name: 'Lacak Pesanan', path: '/tracking' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 select-none">
              <img src="/Logo.svg" alt="EtherealHijab Logo" className="h-9 w-auto object-contain" />
              <span className="text-lg sm:text-xl font-semibold tracking-wider text-brand-brown-dark font-serif">
                ETHEREAL<span className="text-brand-pink font-sans font-light">HIJAB</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-pink ${
                  isActive(link.path)
                    ? 'text-brand-pink font-semibold border-b-2 border-brand-pink pb-1'
                    : 'text-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-brand-beige dark:hover:bg-brand-beige-dark transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-brand-muted" />}
            </button>

            {/* Wishlist */}
            <Link
              href="/catalog?wishlist=true"
              className="p-2 rounded-full hover:bg-brand-beige dark:hover:bg-brand-beige-dark transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-brand-pink-dark" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-brand-pink-dark rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-brand-beige dark:hover:bg-brand-beige-dark transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-brand-brown-dark" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-brand-pink rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-brand-beige dark:hover:bg-brand-beige-dark focus:outline-none transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-background border-t border-border px-4 pt-2 pb-4 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-brand-beige dark:hover:bg-brand-beige-dark transition-colors ${
                isActive(link.path) ? 'text-brand-pink font-semibold' : 'text-muted'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
