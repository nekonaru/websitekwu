"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah, formatDate, getErrorMessage } from "@/lib/format";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Diterima",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan dana",
};

export default function PesananSaya() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;

    async function loadOrders() {
      try {
        const res = await fetch("/api/my/orders");
        const data = await res.json();
        if (!aktif) return;
        if (data.success) {
          setOrders(data.data);
        } else {
          setMessage(data.error ?? "Gagal memuat riwayat pesanan");
        }
      } catch (err) {
        console.error(err);
        if (aktif) {
          setMessage(getErrorMessage(err, "Gagal memuat riwayat pesanan"));
        }
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      aktif = false;
    };
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/profil"
          className="text-sm text-primary hover:underline flex items-center gap-2"
        >
          Kembali ke Profil
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-heading mb-6">Riwayat Pesanan</h1>

      {message && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center text-muted">
          Memuat riwayat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-neutral-50 border border-border rounded-xl p-12 text-center">
          <p className="text-muted mb-4">Belum ada pesanan.</p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
          >
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-6 py-3 text-sm font-semibold text-muted">
                  Nomor Pesanan
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-muted">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-muted text-right">
                  Total
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-muted text-center">
                  Status
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-muted text-right">
                  Item
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-6 py-4 text-sm font-medium text-heading">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                    {formatRupiah(order.total)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-600"
                          : order.status === "processing"
                            ? "bg-blue-100 text-blue-600"
                            : order.status === "pending"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-muted">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} item
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
