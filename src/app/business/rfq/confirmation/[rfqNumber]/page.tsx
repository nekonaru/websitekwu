import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RfqConfirmation({
  params,
}: {
  params: Promise<{ rfqNumber: string }>;
}) {
  const { rfqNumber } = await params;

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Permintaan Terkirim</h1>
        <p className="text-neutral-600 mb-6">
          Terima kasih telah mengajukan permintaan penawaran grosir. Tim KWU
          akan meninjau permintaan Anda segera.
        </p>

        <div className="bg-neutral-50 border border-border rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-foreground mb-2">Nomor Referensi</h2>
          <p className="text-2xl font-mono font-bold text-primary mb-2">{rfqNumber}</p>
          <p className="text-sm text-neutral-600">
            Simpan nomor referensi ini untuk mengecek status permintaan Anda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/katalog"
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Belanja Lagi
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-neutral-100 transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    </section>
  );
}
