"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingCart, User, Search, X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-sm supports-[backdrop-filter]:bg-surface/80">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary md:text-2xl"
          aria-label="Beranda KWU"
        >
          <span className="inline-block h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            K
          </span>
          <span>KWU</span>
        </Link>

        {/* Navigasi desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-foreground hover-text-primary transition-colors">
            Beranda
          </Link>
          <Link
            href="/katalog"
            className="text-foreground hover-text-primary transition-colors"
          >
            Katalog
          </Link>
          <Link href="/business/rfq/new" className="text-foreground hover-text-primary transition-colors">
            Layanan Bisnis (RFQ)
          </Link>
        </nav>

        {/* Aksi kanan: search, akun, keranjang */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-foreground hover-text-primary transition-colors p-2 rounded-md"
            aria-label="Cari produk"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link href="/login" className="text-foreground hover-text-primary transition-colors p-2 rounded-md">
            <User className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Masuk</span>
          </Link>
          <Link
            href="/keranjang"
            className="relative p-2 rounded-md text-foreground hover-text-primary transition-colors"
            aria-label="Keranjang belanja"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {itemCount}
              </span>
            )}
            <span className="sr-only">Keranjang: {itemCount} item</span>
          </Link>

          {/* Toggle menu mobile */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-foreground p-2 rounded-md"
            aria-label="Buka menu navigasi"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Drawer menu mobile */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col">
          <div className="absolute top-0 right-0 p-3">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-foreground p-2 rounded-md hover:bg-surface-muted"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-surface border-l border-border p-6 space-y-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-lg font-medium text-foreground hover-text-primary"
            >
              Beranda
            </Link>
            <Link
              href="/katalog"
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-lg font-medium text-foreground hover-text-primary"
            >
              Katalog Produk
            </Link>
            <Link
              href="/business/rfq/new"
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-lg font-medium text-foreground hover-text-primary"
            >
              Layanan Bisnis (RFQ)
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-lg font-medium text-foreground hover-text-primary"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      )}

      {/* Overlay search mobile */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <button
              onClick={() => setSearchOpen(false)}
              className="text-foreground p-2 rounded-md hover:bg-surface-muted"
              aria-label="Tutup pencarian"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <h2 className="sr-only">Pencarian produk</h2>
          </div>
          <div className="flex-1 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-600" aria-hidden="true" />
              <input
                type="search"
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Pencarian produk"
              />
            </div>
            <p className="mt-4 text-sm text-neutral-600">
              Ketik nama produk atau kata kunci, lalu tekan Enter.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

