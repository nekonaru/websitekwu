/**
 * Halaman admin daftar RFQ (stub untuk Phase 4).
 * Dalam implementasi penuh, data diambil dari /api/rfqs dengan otorisasi admin.
 */
export default function AdminRfqs() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola RFQ</h1>
          <p className="text-neutral-600">Daftar permintaan penawaran grosir masuk.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Nomor RFQ</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Perusahaan</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Tanggal Pengajuan</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Tanggal Kebutuhan</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Jumlah Item</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-4 text-sm text-foreground border-b border-border">Belum ada data</td>
                <td className="px-6 py-4 text-sm text-neutral-600 border-b border-border" colSpan={6}>
                  Data RFQ akan ditampilkan setelah terhubung ke database Supabase dan admin login.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-neutral-600">
        Halaman admin RFQ dalam pengembangan. Rute lengkap:
        /admin/rfqs dan /admin/rfqs/[id] sesuai spesifikasi bab 6.7.
      </div>
    </section>
  );
}

