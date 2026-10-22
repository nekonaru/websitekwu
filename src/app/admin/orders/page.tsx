"use client";

import { useEffect, useState } from "react";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/types/rfq";
import { Search } from "lucide-react";
import { formatRupiah, formatDate, getErrorMessage } from "@/lib/format";

interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-warning-700 border-amber-100",
  paid: "bg-blue-50 text-blue-600 border-blue-100",
  processing: "bg-blue-50 text-blue-600 border-blue-100",
  shipped: "bg-indigo-50 text-indigo-600 border-indigo-100",
  delivered: "bg-green-50 text-success-700 border-green-100",
  cancelled: "bg-red-50 text-danger-600 border-red-100",
  refunded: "bg-neutral-50 text-neutral-600 border-neutral-100",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let aktif = true;

    async function loadOrders() {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (!aktif) return;
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      aktif = false;
    };
  }, []);

  async function handleStatusChange(orderId: string, newStatus: string) {
    if (!window.confirm(`Ubah status pesanan menjadi ${newStatus}?`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Gagal mengubah status"));
    }
  }

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading mb-2">Kelola Pesanan</h1>
        <p className="text-muted">Daftar semua pesanan B2C dan B2B konversi.</p>
      </div>

      {/* Cari */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari nomor pesanan atau nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-3 py-3 text-sm sm:px-6 font-semibold text-muted">Nomor Pesanan</th>
                <th className="px-3 py-3 text-sm sm:px-6 font-semibold text-muted">Pelanggan</th>
                <th className="px-3 py-3 text-sm sm:px-6 font-semibold text-muted text-right">Total</th>
                <th className="px-3 py-3 text-sm sm:px-6 font-semibold text-muted text-center">Tanggal</th>
                <th className="px-3 py-3 text-sm sm:px-6 font-semibold text-muted text-center">Status</th>
                <th className="px-3 py-3 text-sm sm:px-6 font-semibold text-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    Tidak ada pesanan yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-4 text-sm sm:px-6 font-medium text-heading">
                      {o.order_number}
                    </td>
                    <td className="px-3 py-4 text-sm sm:px-6 text-heading">
                      {o.customer_name}
                    </td>
                    <td className="px-3 py-4 text-sm sm:px-6 font-medium text-primary text-right">
                      {formatRupiah(o.total)}
                    </td>
                    <td className="px-3 py-4 text-sm sm:px-6 text-muted text-center">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="px-3 py-4 text-sm sm:px-6 text-center">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          STATUS_COLORS[o.status] || "border-neutral-200 text-neutral-600"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="text-xs border border-border rounded-lg px-2 py-1 text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="pending">Menunggu</option>
                          <option value="paid">Dibayar</option>
                          <option value="processing">Diproses</option>
                          <option value="shipped">Disiapkan</option>
                          <option value="delivered">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                          <option value="refunded">Dikembalikan</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-muted">
        Status pesanan dapat diubah langsung dari tabel di atas. Perubahan akan
        disimpan ke database Supabase.
      </div>
    </section>
  );
}
