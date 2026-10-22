import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Copy, Handshake, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Permintaan Terkirim",
  description: "Permintaan penawaran grosir Anda telah diterima KWU.",
};

export default async function RfqConfirmation({
  params,
}: {
  params: Promise<{ rfqNumber: string }>;
}) {
  const { rfqNumber } = await params;

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="text-center">
        <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-700">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>

        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
          Layanan Bisnis
        </span>

        <h1 className="text-2xl font-bold text-heading md:text-3xl">
          Permintaan Terkirim
        </h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
          Terima kasih telah mengajukan permintaan penawaran grosir. Tim KWU akan
          meninjau permintaan Anda segera.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-white p-6 text-left shadow-soft">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-muted">
          Nomor Referensi
        </h2>
        <p className="mb-3 break-all font-mono text-2xl font-bold text-primary">
          {rfqNumber}
        </p>
        <p className="flex items-start gap-2 text-sm text-muted">
          <Copy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Simpan nomor referensi ini untuk mengecek status permintaan Anda.
        </p>
      </div>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          "Permintaan Anda tercatat",
          "Admin meninjau kebutuhan",
          "Penawaran diterbitkan",
        ].map((langkah, index) => (
          <li
            key={langkah}
            className="rounded-xl border border-border bg-surface p-4 text-center"
          >
            <span className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              {index + 1}
            </span>
            <p className="text-xs font-semibold text-heading">{langkah}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/katalog"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
        >
          Belanja Lagi
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-heading transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </section>
  );
}
