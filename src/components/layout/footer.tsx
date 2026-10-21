import Link from "next/link";

const TAUTAN = [
  { href: "/katalog", label: "Katalog Produk" },
  { href: "/business/rfq/new", label: "Layanan Bisnis (RFQ)" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
  { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-heading">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-orange-200">
                K
              </span>
              <span className="tracking-tight">KWU</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Toko kampus untuk kebutuhan belajar, bekerja, dan kebutuhan
              institusi. Katalog B2C dan layanan penawaran grosir dalam satu
              tempat.
            </p>
          </div>

          {/* Tautan */}
          <nav aria-label="Tautan footer">
            <h2 className="text-sm font-bold uppercase tracking-wider text-heading">
              Tautan
            </h2>
            <ul className="mt-4 space-y-2.5">
              {TAUTAN.map((tautan) => (
                <li key={tautan.href}>
                  <Link
                    href={tautan.href}
                    className="inline-block text-sm text-body transition-colors duration-200 hover:text-primary"
                  >
                    {tautan.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bantuan */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-heading">
              Bantuan
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-body">
              <li>
                <Link
                  href="/keranjang"
                  className="transition-colors duration-200 hover:text-primary"
                >
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link
                  href="/pesanan-saya"
                  className="transition-colors duration-200 hover:text-primary"
                >
                  Riwayat Pesanan
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors duration-200 hover:text-primary"
                >
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <span className="text-muted">
                  Senin sampai Jumat, 08.00 sampai 17.00 WIB
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted sm:flex-row">
          <p>
            &copy; {year} KWU - Toko Kampus. Hak cipta dilindungi.
          </p>
          <p className="text-xs sm:text-sm">
            Dibangun dengan Next.js dan Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
