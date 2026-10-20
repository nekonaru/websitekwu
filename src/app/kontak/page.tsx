export default function Kontak() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-6">Kontak Kami</h1>
      <div className="bg-surface border border-border rounded-xl p-8">
        <p className="text-neutral-700 leading-relaxed mb-6">
          Butuh bantuan atau ingin berbicara dengan tim KWU? Hubungi kami
          melalui saluran di bawah.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-neutral-500">📧</span>
            <div>
              <div className="font-medium text-foreground">Email Support</div>
              <div className="text-sm text-neutral-600">support@kwu.example</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-500">📞</span>
            <div>
              <div className="font-medium text-foreground">Telepon</div>
              <div className="text-sm text-neutral-600">+62 800-XXXX-XXXX</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-500">📍</span>
            <div>
              <div className="font-medium text-foreground">Alamat Kantor</div>
              <div className="text-sm text-neutral-600">Kampus KWU, Indonesia</div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-neutral-600">
          Kontak di atas adalah <strong>data contoh</strong> untuk
          pengembangan. Ganti dengan kontak resmi melalui konfigurasi admin.
        </p>
      </div>
    </section>
  );
}
