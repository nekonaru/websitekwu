import Link from "next/link";
import { ArrowRight, Flame, Package } from "lucide-react";
import { getFeaturedProducts } from "@/lib/data";
import { ProductCard } from "@/components/products/product-card";

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-blue-900 text-white p-6 md:p-12 lg:p-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557821552-17105176677c2f?w=1200&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-orange-500/20 text-orange-100 text-xs font-semibold tracking-wider uppercase">
              Toko Kampus KWU
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Kebutuhan Kampus,<br />
              Satu Tempat Terpercaya
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-6 max-w-md">
              Katalog lengkap, pemesanan mudah, dan layanan penawaran grosir
              (RFQ) untuk institusi. Pesan sekarang dan terima dengan cepat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/katalog"
                className="flex-1 sm:w-auto py-3.5 px-6 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
              >
                Lihat Katalog <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/business/rfq/new"
                className="flex-1 sm:w-auto py-3.5 px-6 rounded-xl border border-blue-200 text-blue-900 font-semibold hover:bg-blue-50 transition-colors"
              >
                Ajukan Penawaran (RFQ)
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative h-64 w-80">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-2xl blur-3xl" />
              <div className="relative rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                    <Package className="h-5 w-5 text-orange-400" />
                    <span className="text-sm">Pengiriman Cepat</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                    <Flame className="h-5 w-5 text-blue-400" />
                    <span className="text-sm">Produk Berkualitas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produk unggulan */}
      <section aria-label="Produk unggulan">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Produk Unggulan</h2>
              <p className="text-neutral-600">Pilihan terbaik dari toko kami.</p>
            </div>
            <Link
              href="/katalog"
              className="text-sm font-medium text-primary hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Info layanan */}
      <section className="bg-neutral-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="sr-only">Layanan KWU</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-border">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                <ArrowRight className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Pemesanan Mudah</h3>
              <p className="text-sm text-neutral-600">
                Pilih produk, masukkan keranjang, dan checkout dalam beberapa
                klik.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-border">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Grosir B2B</h3>
              <p className="text-sm text-neutral-600">
                Ajukan penawaran grosir untuk kebutuhan institusi melalui RFQ.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-border">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Terkini &amp; Terpercaya</h3>
              <p className="text-sm text-neutral-600">
                Stok diperbarui secara berkala dan siap dikirim.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

