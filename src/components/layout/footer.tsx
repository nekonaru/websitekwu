import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-muted mt-auto py-8">
      <div className="px-4 mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-600">
          <p>
            &copy; {year} KWU - Toko Kampus. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/tentang"
              className="hover:text-primary transition-colors underline underline-offset-4"
              >Tentang Kami</Link
            >
            <Link
              href="/kontak"
              className="hover:text-primary transition-colors underline underline-offset-4"
              >Kontak</Link
            >
            <Link
              href="/kebijakan-privasi"
              className="hover:text-primary transition-colors underline underline-offset-4"
              >Kebijakan Privasi</Link
            >
          </div>
        </div>
      </div>
    </footer>
  );
}

