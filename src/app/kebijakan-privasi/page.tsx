import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Database,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Penjelasan pengumpulan, penggunaan, dan perlindungan data pengguna di KWU.",
};

const POIN = [
  {
    icon: ShieldCheck,
    judul: "Autentikasi dan Akun",
    isi: "Data akun hanya digunakan untuk autentikasi, pemesanan, dan Status pesanan Anda.",
  },
  {
    icon: Database,
    judul: "Penyimpanan dan Keamanan",
    isi: "Seluruh data disimpan di basis data dengan Row Level Security sehingga tiap pengguna hanya dapat mengakses miliknya.",
  },
  {
    icon: FileText,
    judul: "Permintaan Penawaran Grosir",
    isi: "Data RFQ perusahaan tidak dipublikasikan dan hanya dapat dilihat oleh admin KWU yang berwenang.",
  },
  {
    icon: MessageSquare,
    judul: "Asisten KWU",
    isi: "Percakapan dengan asisten tidak menyimpan data pribadi yang tidak diperlukan untuk menjawab pertanyaan Anda.",
  },
  {
    icon: Clock,
    judul: "Retensi Data",
    isi: "Jadwal penghapusan data ditetapkan bersama pengelola kampus dan akan diumumkan pada pembaruan kebijakan ini.",
  },
];

export default function KebijakanPrivasi() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Dokumentasi
        </span>
        <h1 className="text-2xl font-bold text-heading md:text-3xl">
          Kebijakan Privasi
        </h1>
        <p className="mt-2 text-muted">
          KWU berkomitmen melindungi privasi data pengguna. Kebijakan ini
          menjelaskan kapan dan mengapa kami mengumpulkan data, serta bagaimana
          data digunakan.
        </p>
      </div>

      <ul className="mb-8 grid gap-4 sm:grid-cols-2">
        {POIN.map((poin) => (
          <li
            key={poin.judul}
            className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <poin.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mb-1.5 text-base font-bold text-heading">
              {poin.judul}
            </h2>
            <p className="text-sm leading-relaxed text-body">{poin.isi}</p>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-3 text-lg font-bold text-heading">
          Hubungi Kami
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-body">
          Untuk pertanyaan mengenai privasi atau permintaan penghapusan data,
          hubungi admin KWU melalui halaman kontak. Permintaan akan ditinjau
          dan ditindaklanjuti sesuai ketentuan yang berlaku.
        </p>
        <Link
          href="/kontak"
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
        >
          Halaman Kontak
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
