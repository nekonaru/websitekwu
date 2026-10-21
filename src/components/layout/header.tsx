"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  User,
  Search,
  X,
  LogIn,
  LayoutGrid,
  Handshake,
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";

const NAVIGASI = [
  { href: "/", label: "Beranda", icon: LayoutGrid },
  { href: "/katalog", label: "Katalog", icon: Search },
  { href: "/business/rfq/new", label: "Layanan Bisnis (RFQ)", icon: Handshake },
];

export function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Kunci scroll halaman saat lapisan menu terbuka.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = sebelumnya;
    };
  }, [menuOpen, searchOpen]);

  // Tutup dengan tombol Escape dan fokuskan input pencarian.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/katalog?q=${encodeURIComponent(trimmed)}` : "/katalog");
    setSearchOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function closeLayers() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-[4.25rem] md:gap-4 md:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-bold text-heading transition-transform duration-200 hover:scale-[1.02] md:text-2xl"
          aria-label="Beranda KWU"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold shadow-md shadow-orange-200 transition-colors duration-200 group-hover:bg-primary-hover">
            K
          </span>
          <span className="tracking-tight">KWU</span>
        </Link>

        {/* Navigasi desktop */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {NAVIGASI.map((item) => {
            const aktif = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`relative rounded-lg px-3 py-2 transition-colors duration-200 ${
                  aktif
                    ? "text-primary"
                    : "text-body hover:text-primary hover:bg-primary-soft"
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary transition-transform duration-300 origin-left ${
                    aktif ? "scale-x-100" : "scale-x-0"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        {/* Aksi kanan: cari, akun, keranjang */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
            aria-label="Cari produk"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            href="/login"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
            aria-label="Masuk ke akun"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>

          <Link
            href="/keranjang"
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
            aria-label={`Keranjang belanja, ${itemCount} item`}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Toggle menu mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary md:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Drawer menu mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
            aria-label="Tutup menu"
            tabIndex={-1}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col bg-white shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-lg font-bold text-heading">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {NAVIGASI.map((item) => {
                const aktif = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeLayers}
                    aria-current={aktif ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors duration-200 ${
                      aktif
                        ? "bg-primary-soft text-primary"
                        : "text-heading hover:bg-primary-soft hover:text-primary"
                    }`}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="my-3 border-t border-border" />

              <Link
                href="/login"
                onClick={closeLayers}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-heading transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
              >
                <LogIn className="h-5 w-5" aria-hidden="true" />
                Masuk ke Akun
              </Link>
              <Link
                href="/keranjang"
                onClick={closeLayers}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-heading transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                Keranjang
                {itemCount > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Pencarian */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-heading">Cari produk</h2>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
                aria-label="Tutup pencarian"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submitSearch} className="mt-6" role="search">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari produk, kategori, atau kata kunci..."
                  className="w-full rounded-2xl border border-border bg-white py-4 pl-12 pr-4 text-base text-heading shadow-soft transition-shadow duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-orange-100"
                  aria-label="Kata kunci pencarian"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:bg-primary-hover hover:shadow-xl active:scale-[0.99]"
              >
                Cari di Katalog
              </button>
            </form>

            <p className="mt-4 text-sm text-muted">
              Tekan Enter untuk mencari, atau tekan Escape untuk menutup.
            </p>

            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-heading">
                Pencarian populer
              </p>
              <div className="flex flex-wrap gap-2">
                {["alat tulis", "elektronik", "pakaian", "makanan", "kesehatan"].map(
                  (kata) => (
                    <button
                      key={kata}
                      type="button"
                      onClick={() => {
                        setQuery(kata);
                        router.push(`/katalog?q=${encodeURIComponent(kata)}`);
                        setSearchOpen(false);
                      }}
                      className="rounded-full border border-border bg-white px-4 py-2 text-sm text-body transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary"
                    >
                      {kata}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
