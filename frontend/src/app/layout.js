import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { CustomerProvider } from "../context/CustomerContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "EtherealHijab | Elegance in Every Layer - Premium Voal & Pashmina",
  description: "Beli hijab voal ultrafine, pashmina shimmer, bergo instan, dan inner berkualitas premium. Dapatkan penampilan elegan nan minimalis di EtherealHijab.",
  keywords: "hijab voal, pashmina shimmer, bergo instan, aksesoris hijab, inner ninja, busana muslimah, ethereal hijab",
  icons: {
    icon: "/Logo.svg",
  },
  openGraph: {
    title: "EtherealHijab | Elegance in Every Layer",
    description: "Koleksi hijab elegan dan minimalis berkualitas premium untuk wanita modern.",
    url: "https://etherealhijab.com",
    siteName: "EtherealHijab",
    images: [
      {
        url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800",
        width: 800,
        height: 600,
        alt: "EtherealHijab Banner",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EtherealHijab",
    description: "Koleksi hijab elegan dan minimalis berkualitas premium untuk wanita modern.",
    images: ["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800"],
  },
};

export default function RootLayout({ children }) {
  // Inject structured data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "EtherealHijab",
    "description": "Koleksi hijab premium voal, pashmina, bergo, inner, dan aksesoris elegan.",
    "url": "https://etherealhijab.com",
    "telephone": "+6281234567890",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Anggrek No. 123, Kebayoran Baru",
      "addressLocality": "Jakarta Selatan",
      "addressRegion": "Jakarta",
      "postalCode": "12130",
      "addressCountry": "ID"
    }
  };

  return (
    <html
      lang="id"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider>
          <CustomerProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </CustomerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
