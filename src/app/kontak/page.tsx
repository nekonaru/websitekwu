import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi tim KWU untuk bantuan katalog, pemesanan, dan RFQ.",
};

const email = process.env.NEXT_PUBLIC_KWU_EMAIL ?? "";
const telepon = process.env.NEXT_PUBLIC_KWU_TELEPON ?? "";
const alamat = process.env.NEXT_PUBLIC_KWU_ALAMAT ?? "";

const SALURAN = [
  {
    icon: Mail,
    label: "Email Support",
    nilai: email,
    tautan: email ? `mailto:${email}` : null,
    placeholder: "Belum diisi",
  },
  {
    icon: Phone,
    label: "Telepon",
    nilai: telepon,
    tautan: telepon ? `tel:${telepon.replace(/\s/g, "")}` : null,
    placeholder: "Belum diisi",
  },
  {
    icon: MapPin,
    label: "Alamat Kantor",
    nilai: alamat,
    tautan: null,
    placeholder: "Belum diisi",
  },
];

export default function Kontak() {
  const adaSaluran = SALURAN.some((s) => s.nilai);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-10 max-w-2xl">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Kontak
        </span>
        <h1 className="text-2xl font-bold text-heading md:text-3xl">
          Hubungi Tim KWU
        </h1>
        <p className="mt-3 leading-relaxed text-body">
          Butuh bantuan atau ingin berbicara dengan tim KWU? Gunakan salah satu
          saluran di bawah ini, atau ajukan pertanyaan langsung lewat asisten
          KWU di pojok kanan bawah halaman.
        </p>
      </div>

      {adaSaluran ? (
        <ul className="mb-8 grid gap-4 sm:grid-cols-3">
          {SALURAN.filter((s) => s.nilai).map((saluran) => (
            <li
              key={saluran.label}
              className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <saluran.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-bold text-heading">{saluran.label}</p>
              {saluran.tautan ? (
                <a
                  href={saluran.tautan}
                  className="mt-1 block break-words text-sm text-primary transition-colors duration-200 hover:text-primary-hover hover:underline"
                >
                  {saluran.nilai}
                </a>
              ) : (
                <p className="mt-1 break-words text-sm text-body">
                  {saluran.nilai}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-8 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <MessageCircle
            className="mx-auto mb-4 h-10 w-10 text-muted"
            aria-hidden="true"
          />
          <h2 className="mb-2 text-lg font-bold text-heading">
            Saluran kontak resmi belum diisi
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted">
            Sementara ini, gunakan asisten KWU di pojok kanan bawah halaman atau
            kirim pesan melalui formulir permintaan penawaran grosir. Admin akan
            membalas melalui surel Anda.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-heading">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            Jam Layanan
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Senin sampai Jumat</dt>
              <dd className="font-semibold text-heading">08.00 sampai 17.00</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Sabtu</dt>
              <dd className="font-semibold text-heading">09.00 sampai 13.00</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Minggu dan hari libur</dt>
              <dd className="font-semibold text-heading">Tutup</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">Waktu Indonesia Barat (WIB).</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-3 text-lg font-bold text-heading">
            Pertanyaan Umum
          </h2>
          <ul className="space-y-2.5 text-sm text-body">
            <li>
              <span className="font-semibold text-heading">Lacak pesanan</span>{" "}
              masuk ke menu Riwayat Pesanan setelah masuk ke akun.
            </li>
            <li>
              <span className="font-semibold text-heading">Kebutuhan grosir</span>{" "}
              gunakan formulir permintaan penawaran pada halaman Layanan Bisnis.
            </li>
            <li>
              <span className="font-semibold text-heading">Kendala pemesanan</span>{" "}
              sampaikan nomor pesanan agar admin dapat memeriksa lebih cepat.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-orange-700 to-blue-700 p-6 text-center md:p-8">
        <p className="text-lg font-bold text-white md:text-xl">
          Sudah punya kebutuhan grosir?
        </p>
        <p className="mx-auto max-w-lg text-sm text-orange-50/95">
          Ajukan permintaan penawaran dan admin akan meninjau sebelum
          menerbitkan harga khusus untuk Anda.
        </p>
        <Link
          href="/business/rfq/new"
          className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Ajukan Penawaran
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
