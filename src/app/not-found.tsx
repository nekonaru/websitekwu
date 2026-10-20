import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <p className="text-neutral-600 mb-8">Halaman tidak ditemukan.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </section>
  );
}
