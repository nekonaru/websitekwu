export default function AdminDashboard() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-neutral-600">Produk Aktif</p>
          <p className="text-3xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-neutral-600">RFQ Masuk</p>
          <p className="text-3xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-neutral-600">Pesanan Hari Ini</p>
          <p className="text-3xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm text-neutral-600">Penundaan</p>
          <p className="text-3xl font-bold text-foreground mt-1">0</p>
        </div>
      </div>

      <div className="bg-neutral-50 border border-border rounded-xl p-6 text-center py-12 text-neutral-600">
        Data statistik akan ditampilkan setelah terhubung ke database Supabase.
        Angka di atas adalah kosong sengaja (tidak ada data tiruan).
      </div>
    </section>
  );
}

