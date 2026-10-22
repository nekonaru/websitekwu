"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi kesalahan pada halaman:", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
      <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-700">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </span>

      <h1 className="mb-3 text-2xl font-bold text-heading md:text-3xl">
        Halaman gagal dimuat
      </h1>
      <p className="mx-auto mb-8 max-w-md leading-relaxed text-muted">
        Terjadi kesalahan yang tidak terduga. Silakan coba muat ulang halaman
        ini. Jika masalah berlanjut, hubungi admin KWU.
      </p>

      {error.digest && (
        <p className="mb-6 font-mono text-xs text-muted">
          Kode kesalahan: {error.digest}
        </p>
      )}

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Coba Lagi
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-heading transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Kembali ke Beranda
        </Link>
      </div>
    </section>
  );
}
