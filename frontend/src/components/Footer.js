import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-brand-beige dark:bg-brand-beige-dark/10 border-t border-border mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 select-none">
              <img src="/Logo.svg" alt="EtherealHijab Logo" className="h-8 w-auto object-contain" />
              <h3 className="text-base font-semibold font-serif tracking-wider text-brand-brown-dark">
                ETHEREAL<span className="text-brand-pink font-sans font-light">HIJAB</span>
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Menghadirkan keindahan, keanggunan, dan kenyamanan terbaik di setiap helaian hijab Anda. #EleganceInEveryLayer
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-brand-brown-dark hover:text-brand-pink transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Catalog Col */}
          <div>
            <h4 className="text-sm font-semibold text-brand-brown-dark uppercase tracking-wider mb-4">Belanja</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/catalog?category=Hijab Segi Empat (Square)" className="hover:text-brand-pink transition-colors">Hijab Segi Empat (Square)</Link></li>
              <li><Link href="/catalog?category=Pashmina" className="hover:text-brand-pink transition-colors">Pashmina</Link></li>
              <li><Link href="/catalog?category=Hijab Instan" className="hover:text-brand-pink transition-colors">Hijab Instan</Link></li>
              <li><Link href="/catalog?category=Pashmina Instan (Pashmina Inner)" className="hover:text-brand-pink transition-colors">Pashmina Instan</Link></li>
              <li><Link href="/catalog?category=Turban" className="hover:text-brand-pink transition-colors">Turban</Link></li>
              <li><Link href="/catalog?category=Hijab Olahraga (Sport Hijab)" className="hover:text-brand-pink transition-colors">Hijab Olahraga</Link></li>
              <li><Link href="/catalog?category=Ciput" className="hover:text-brand-pink transition-colors">Ciput</Link></li>
            </ul>
          </div>

          {/* Navigation Col */}
          <div>
            <h4 className="text-sm font-semibold text-brand-brown-dark uppercase tracking-wider mb-4">Informasi</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/survey" className="hover:text-brand-pink transition-colors">Survey Pelanggan</Link></li>
              <li><Link href="/tracking" className="hover:text-brand-pink transition-colors">Lacak Pesanan</Link></li>
              <li><Link href="/admin" className="hover:text-brand-pink transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-sm font-semibold text-brand-brown-dark uppercase tracking-wider mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-brand-pink mr-2 shrink-0" />
                <span>Jl. Anggrek No. 123, Kebayoran Baru, Jakarta Selatan</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-brand-pink mr-2 shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-brand-pink mr-2 shrink-0" />
                <span>info@etherealhijab.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} EtherealHijab. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-brand-pink cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-brand-pink cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
