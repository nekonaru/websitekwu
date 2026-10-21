const email = process.env.NEXT_PUBLIC_KWU_EMAIL ?? "";
const telepon = process.env.NEXT_PUBLIC_KWU_TELEPON ?? "";
const alamat = process.env.NEXT_PUBLIC_KWU_ALAMAT ?? "";

export default function Kontak() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-heading mb-6">Kontak Kami</h1>
      <div className="bg-surface border border-border rounded-xl p-8">
        <p className="text-body leading-relaxed mb-6">
          Butuh bantuan atau ingin berbicara dengan tim KWU? Hubungi kami
          melalui saluran di bawah.
        </p>
        <div className="space-y-4">
          {email && (
            <div className="flex items-center gap-3">
              <span className="text-muted" aria-hidden="true">
                &#128231;
              </span>
              <div>
                <div className="font-medium text-heading">Email Support</div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {email}
                </a>
              </div>
            </div>
          )}
          {telepon && (
            <div className="flex items-center gap-3">
              <span className="text-muted" aria-hidden="true">
                &#128222;
              </span>
              <div>
                <div className="font-medium text-heading">Telepon</div>
                <div className="text-sm text-muted">{telepon}</div>
              </div>
            </div>
          )}
          {alamat && (
            <div className="flex items-center gap-3">
              <span className="text-muted" aria-hidden="true">
                &#128205;
              </span>
              <div>
                <div className="font-medium text-heading">Alamat Kantor</div>
                <div className="text-sm text-muted">{alamat}</div>
              </div>
            </div>
          )}
          {!email && !telepon && !alamat && (
            <p className="text-sm text-muted">
              Saluran kontak resmi belum diisi. Sementara ini, gunakan asisten
              KWU di pojok kanan bawah halaman atau kirim pesan melalui
              formulir permintaan penawaran grosir.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
