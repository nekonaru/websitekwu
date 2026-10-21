import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Search,
  Handshake,
  ArrowRight,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  description: "Halaman yang Anda cari tidak tersedia di KWU.",
};

const TAUTAN = [
  {
    href: "/katalog",
    label: "Jelajahi Katalog",
    desc: "Lihat seluruh produk yang tersedia",
    icon: Search,
  },
  {
    href: "/business/rfq/new",
    label: "Ajukan Penawaran",
    desc: "Permintaan grosir untuk institusi",
    icon: Handshake,
  },
];

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>

      <p className="mt-6 text-sm font-bold uppercase tracking-widest text-muted">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-heading md:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
        Alamat yang Anda buka sudah berubah atau tidak pernah ada. Silakan
        kembali ke beranda atau jelajahi katalog kami.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Kembali ke Beranda
        </Link>
      </div>

      <ul className="mt-10 grid gap-3 text-left sm:grid-cols-2">
        {TAUTAN.map((tautan) => (
          <li key={tautan.href}>
            <Link
              href={tautan.href}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <tautan.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="flex items-center gap-1 text-sm font-bold text-heading">
                  {tautan.label}
                  <ArrowRight
                    className="h-3.5 w-3.5 text-muted transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {tautan.desc}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
