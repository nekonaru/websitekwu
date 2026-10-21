import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  Users,
  Handshake,
  Target,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "KWU adalah toko kampus untuk kebutuhan belajar, bekerja, dan kebutuhan institusi.",
};

const NILAI = [
  {
    icon: Target,
    judul: "Fokus kebutuhan kampus",
    isi: "Setiap produk dan layanan disusun mengikuti kebutuhan harian civitas akademika, bukan sekadar daftar barang.",
  },
  {
    icon: Handshake,
    judul: "Layanan yang transparan",
    isi: "Harga terlihat terbuka, status pesanan dapat dilacak, dan permintaan penawaran grosir selalu ditinjau manusia.",
  },
  {
    icon: HeartHandshake,
    judul: "Kebijakan yang manusiawi",
    isi: "Data pengguna dipakai seperlunya, akses dibatasi dengan Row Level Security, dan privasi dihormati.",
  },
];

export default function Tentang() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-10 max-w-2xl">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Store className="h-3.5 w-3.5" aria-hidden="true" />
          Tentang KWU
        </span>
        <h1 className="text-2xl font-bold text-heading md:text-3xl">
          Toko kampus untuk semua kebutuhan belajar
        </h1>
        <p className="mt-3 leading-relaxed text-body">
          KWU adalah toko kampus resmi yang menyediakan kebutuhan pelajar dan
          civitas akademika. Kami hadir dengan katalog produk lengkap,
          pemesanan mudah, dan layanan penawaran grosir (RFQ) untuk kebutuhan
          institusi.
        </p>
      </div>

      <ul className="mb-12 grid gap-4 sm:grid-cols-3">
        {NILAI.map((nilai) => (
          <li
            key={nilai.judul}
            className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <nilai.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mb-1.5 text-base font-bold text-heading">
              {nilai.judul}
            </h2>
            <p className="text-sm leading-relaxed text-body">{nilai.isi}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-heading">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            Untuk siapa KWU
          </h2>
          <p className="text-sm leading-relaxed text-body">
            KWU melayani civitas akademika yang membutuhkan alat tulis dan
            perlengkapan harian, serta institusi dan lembaga yang memperoleh
            kebutuhan dalam jumlah besar melalui layanan penawaran grosir.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-heading">
            <Store className="h-5 w-5 text-primary" aria-hidden="true" />
            Cara Membership
          </h2>
          <p className="text-sm leading-relaxed text-body">
            Buat akun sekali, lalu gunakan untuk melihat riwayat pesanan,
            mengelola keranjang, dan mengajukan permintaan penawaran grosir
            kapan saja.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-700 to-blue-700 p-6 text-center md:p-8">
        <p className="mb-4 text-lg font-bold text-white md:text-xl">
          Masih ada pertanyaan tentang KWU?
        </p>
        <p className="mx-auto mb-6 max-w-lg text-sm text-orange-50/95">
          Tim kami siap membantu pertanyaan seputar katalog, pemesanan, dan
          layanan penawaran grosir.
        </p>
        <Link
          href="/kontak"
          className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Hubungi Kami
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
