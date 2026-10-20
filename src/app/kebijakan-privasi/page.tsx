export default function KebijakanPrivasi() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-6">Kebijakan Privasi</h1>
      <div className="bg-surface border border-border rounded-xl p-8">
        <p className="text-neutral-700 leading-relaxed mb-4">
          KWU berkomitmen melindungi privasi data pengguna. Kebijakan ini
          menjelaskan kapan dan mengapa kami mengumpulkan data, serta bagaimana
          data digunakan.
        </p>
        <ul className="list-disc list-inside text-neutral-700 leading-relaxed space-y-2 mb-4">
          <li>Data akun hanya digunakan untuk autentikasi dan pemesanan.</li>
          <li>Data RFQ perusahaan tidak dipublikasikan dan hanya dilihat oleh pihak berwenang.</li>
          <li>Percakapan chatbot tidak menyimpan data pribadi yang tidak diperlukan.</li>
          <li>Semua data disimpan di database dengan Row Level Security (RLS).</li>
        </ul>
        <p className="text-neutral-700 leading-relaxed mb-4">
          Kebijakan lengkap dan jadwal retensi data ditetapkan bersama
          pengelola kampus (item terbuka dalam README).
        </p>
        <p className="text-sm text-neutral-600 mt-4">
          Kebijakan ini adalah <strong>contoh</strong> untuk pengembangan dan
          harus disesuaikan sebelum dipakai produksi.
        </p>
      </div>
    </section>
  );
}
