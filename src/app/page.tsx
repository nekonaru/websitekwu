import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Flame,
  Handshake,
  FileText,
  BadgeCheck,
  Store,
  PackageCheck,
} from "lucide-react";
import { FeaturedProducts } from "@/components/products/featured-products";

const KEUNGGULAN = [
  {
    icon: ShieldCheck,
    title: "Pemesanan Aman",
    desc: "Setiap pesanan tercatat pada basis data dan dapat dilacak statusnya oleh admin KWU.",
    tone: "orange",
  },
  {
    icon: Users,
    title: "Untuk Kampus",
    desc: "Katalog dirancang untuk kebutuhan civitas akademika, dari alat tulis sampai perlengkapan harian.",
    tone: "blue",
  },
  {
    icon: Flame,
    title: "Terkini & Terpercaya",
    desc: "Stok diperbarui berkala sehingga informasi harga dan ketersediaan selalu relevan.",
    tone: "orange",
  },
];

const KATEGORI = [
  { label: "Alat Tulis", slug: "alat-tulis", icon: "✏️" },
  { label: "Elektronik", slug: "elektronik", icon: "🔌" },
  { label: "Pakaian", slug: "pakaian", icon: "👕" },
  { label: "Makanan & Minuman", slug: "makanan-minuman", icon: "🥤" },
  { label: "Kesehatan", slug: "kesehatan", icon: "🩺" },
];

const ALUR_RFQ = [
  {
    icon: FileText,
    judul: "Ajukan Permintaan",
    desc: "Institusi mengisi formulir kebutuhan, jumlah, dan tanggal kebutuhan.",
  },
  {
    icon: BadgeCheck,
    judul: "Admin Meninjau",
    desc: "Tim KWU memeriksa detail permintaan dan menyusun penawaran harga.",
  },
  {
    icon: PackageCheck,
    judul: "Penawaran Terbit",
    desc: "Anda menerima nomor referensi dan penawaran resmi yang dapat disetujui.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-blue-900 text-white">
        {/* Lapisan cahaya dekoratif */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -left-1/3 -top-1/3 h-[34rem] w-[34rem] rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-1/3 -right-1/4 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl animate-pulse" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            {/* Teks utama */}
            <div className="animate-fade-in-up">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                Toko Kampus KWU
              </span>

              <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                Kebutuhan Kampus,{" "}
                <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">
                  Satu Tempat Terpercaya
                </span>
              </h1>

              <p className="mb-8 max-w-xl text-base leading-relaxed text-blue-100/90 sm:text-lg">
                Katalog lengkap, pemesanan mudah, dan layanan penawaran grosir
                (RFQ) untuk institusi dan civitas akademika KWU.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/katalog"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-base font-bold text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-2xl hover:shadow-orange-500/35 active:translate-y-0 sm:text-lg"
                >
                  Lihat Katalog
                  <ArrowRight
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/business/rfq/new"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 sm:text-lg"
                >
                  Ajukan Penawaran (RFQ)
                  <ArrowRight
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {/* Bukti singkat */}
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  { nilai: "5+", label: "Kategori produk" },
                  { nilai: "24/7", label: "Katalog daring" },
                  { nilai: "B2B", label: "Penawaran grosir" },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-2xl font-extrabold text-orange-300 sm:text-3xl">
                      {item.nilai}
                    </dt>
                    <dd className="mt-1 text-xs leading-snug text-blue-200/80 sm:text-sm">
                      {item.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Kartu Keunggulan */}
            <div className="hidden lg:block">
              <div className="animate-float">
                <div className="relative">
                  <div
                    className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-orange-500/30 to-blue-500/30 blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="relative rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
                    <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-5">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-orange-300">
                        <Store className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">KWU Store</p>
                        <p className="text-xs text-blue-200/80">
                          Kebutuhan kampus, siap diakses
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-4">
                      {[
                        {
                          icon: ShieldCheck,
                          judul: "Pemesanan aman",
                          desc: "Tercatat dan dapat dilacak",
                          tone: "text-orange-300 bg-orange-500/15",
                        },
                        {
                          icon: Handshake,
                          judul: "Layanan institusional",
                          desc: "Penawaran grosir RFQ",
                          tone: "text-blue-300 bg-blue-500/15",
                        },
                        {
                          icon: PackageCheck,
                          judul: "Katalog terstruktur",
                          desc: "Mudah dicari dan difilter",
                          tone: "text-emerald-300 bg-emerald-500/15",
                        },
                      ].map((item) => (
                        <li key={item.judul} className="flex items-start gap-3">
                          <span
                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.tone}`}
                          >
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-white">
                              {item.judul}
                            </span>
                            <span className="block text-xs text-blue-200/75">
                              {item.desc}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= KATEGORI CEPAT ================= */}
      <section className="border-b border-border bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-heading md:text-3xl">
            Belanja per Kategori
          </h2>
          <p className="mb-8 text-center text-muted">
            Pilih kategori untuk menemukan produk yang Anda butuhkan.
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {KATEGORI.map((kategori) => (
              <li key={kategori.slug}>
                <Link
                  href={`/katalog?category=${kategori.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary-soft hover:shadow-card-hover sm:p-6"
                >
                  <span
                    className="text-2xl transition-transform duration-300 group-hover:scale-110 sm:text-3xl"
                    aria-hidden="true"
                  >
                    {kategori.icon}
                  </span>
                  <span className="text-sm font-semibold text-heading sm:text-base">
                    {kategori.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= PRODUK UNGGULAN ================= */}
      <section className="bg-surface py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="animate-fade-in-up">
              <h2 className="mb-2 text-2xl font-bold text-heading md:text-3xl">
                Produk Unggulan
              </h2>
              <p className="text-muted">Pilihan terbaik dari toko kami.</p>
            </div>
            <Link
              href="/katalog"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg sm:text-base"
            >
              Lihat Semua Katalog
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          <FeaturedProducts limit={4} />
        </div>
      </section>

      {/* ================= KEUNGGULAN ================= */}
      <section className="border-y border-blue-100 bg-blue-50 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold text-heading md:text-3xl">
              Mengapa Memilih KWU?
            </h2>
            <p className="text-muted">
              Keunggulan toko kampus untuk Anda.
            </p>
          </div>

          <ul className="grid gap-5 md:grid-cols-3 md:gap-6">
            {KEUNGGULAN.map((item, index) => (
              <li
                key={item.title}
                className={`group rounded-2xl border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover md:p-8 ${
                  item.tone === "orange"
                    ? "border-orange-100 hover:border-orange-300"
                    : "border-blue-100 hover:border-blue-300"
                } animate-fade-in-up`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span
                  className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                    item.tone === "orange"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <item.icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-lg font-bold text-heading">{item.title}</h3>
                <p className="leading-relaxed text-body">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= ALUR RFQ ================= */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
              Untuk Instansi
            </span>
            <h2 className="mb-3 text-2xl font-bold text-heading md:text-3xl">
              Cara Meminta Penawaran Grosir
            </h2>
            <p className="text-muted">
              Tiga langkah sederhana untuk mendapatkan penawaran harga khusus
              kebutuhan institusi Anda.
            </p>
          </div>

          <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
            {ALUR_RFQ.map((langkah, index) => (
              <li
                key={langkah.judul}
                className="relative rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-card md:p-7"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary">
                  <langkah.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
                  Langkah {index + 1}
                </p>
                <h3 className="mb-2 text-base font-bold text-heading">
                  {langkah.judul}
                </h3>
                <p className="text-sm leading-relaxed text-body">{langkah.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex justify-center">
            <Link
              href="/business/rfq/new"
              className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
            >
              Ajukan Penawaran Sekarang
              <ArrowRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PENUTUP ================= */}
      <section className="px-4 pb-16 sm:px-6 md:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-blue-600 px-6 py-12 text-center shadow-2xl md:px-12 md:py-16">
            <div
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-blue-900/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="mb-4 text-2xl font-extrabold text-white md:text-4xl">
                Siap mulai belanja di KWU?
              </h2>
              <p className="mb-8 text-base leading-relaxed text-orange-50/95 md:text-lg">
                Ribuan kebutuhan kampus tersedia dalam satu katalog. Buat
                pesanan dalam beberapa langkah atau ajukan penawaran grosir
                untuk kebutuhan institusi.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/katalog"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-bold text-orange-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Buka Katalog
                </Link>
                <Link
                  href="/kontak"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/70 px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Hubungi Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
