import Link from "next/link";
import { ArrowRight, Shield, Flame, Users } from "lucide-react";
import { getFeaturedProducts } from "@/lib/data";
import { ProductCard } from "@/components/products/product-card";

export default function Home() {
  const featured = getFeaturedProducts();

  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-blue-900 text-white py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-900/30 via-orange-900/20 to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-100 text-xs font-semibold tracking-wider uppercase border border-orange-500/30">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Toko Kampus KWU
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-heading">
                Kebutuhan Kampus,<br />
                <span className="text-orange-400">Satu Tempat Terpercaya</span>
              </h1>
              <p className="text-blue-200 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                Katalog lengkap, pemesanan mudah, dan layanan penawaran grosir
                (RFQ) untuk institusi dan civitas akademika KWU.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/katalog"
                  className="flex-1 sm:w-auto py-4 px-8 rounded-2xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/30 animate-pulse-glow flex items-center justify-center gap-2"
                >
                  Lihat Katalog <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/business/rfq/new"
                  className="flex-1 sm:w-auto py-4 px-8 rounded-2xl border-2 border-orange-300 text-orange-900 font-bold text-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                >
                  Ajukan Penawaran (RFQ)
                </Link>
              </div>
            </div>

            <div className="hidden md:flex justify-center animate-float">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-blue-500/30 rounded-3xl blur-2xl group-hover:opacity-80 transition-opacity" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-3">
                        <Shield className="h-6 w-6" />
                      </div>
                      <p className="text-white text-sm font-medium">Pemesanan Aman</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="text-white text-sm font-medium">Untuk Kampus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produk unggulan */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold text-heading mb-2">Produk Unggulan</h2>
              <p className="text-muted">Pilihan terbaik dari toko kami.</p>
            </div>
            <Link
              href="/katalog"
              className="animate-slide-in-right inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-orange-500 transition-all shadow-md"
            >
              Lihat Semua Katalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan KWU */}
      <section className="py-16 md:py-24 bg-blue-50 border-t-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-heading mb-2">Mengapa Memilih KWU?</h2>
              <p className="text-muted">Keunggulan toko kampus untuk kamu.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Pemesanan Aman",
                desc: "Transaksi terlindungi dan data pelanggan dijamin keamanannya.",
                color: "orange",
              },
              {
                icon: Users,
                title: "Untuk Kampus",
                desc: "Dedicated untuk civitas akademika dan kebutuhan institusi.",
                color: "blue",
              },
              {
                icon: Flame,
                title: "Terkini & Terpercaya",
                desc: "Stok selalu diperbarui mengikuti kondisi terbaru.",
                color: "orange",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`p-8 rounded-2xl border border-border bg-white hover:shadow-xl transition-all group ${item.color === "orange" ? "border-orange-100" : "border-blue-100"}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  item.color === "orange" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                } group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-heading mb-3">{item.title}</h3>
                <p className="text-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
