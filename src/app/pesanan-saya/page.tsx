"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/format";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

const ORDERS: Order[] = [
  {
    order_number: "KWU-ORD-2026-00001",
    status: "delivered",
    total: 110000,
    created_at: "2026-10-15T10:30:00Z",
    items: [
      { product_name: "Buku Tulis Contoh A5", quantity: 2, unit_price: 15000, total_price: 30000 },
      { product_name: "Tinta Bolpoin Contoh (12 pcs)", quantity: 1, unit_price: 48000, total_price: 48000 },
      { product_name: "Snack Kotak Contoh", quantity: 1, unit_price: 32000, total_price: 32000 },
    ],
  },
  {
    order_number: "KWU-ORD-2026-00002",
    status: "processing",
    total: 185000,
    created_at: "2026-10-18T14:15:00Z",
    items: [
      { product_name: "Power Bank Contoh 10000mAh", quantity: 1, unit_price: 185000, total_price: 185000 },
    ],
  },
];

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
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/"
          className="text-sm text-primary hover:underline flex items-center gap-2"
        >
          Beranda
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-6">Riwayat Pesanan</h1>

      {ORDERS.length === 0 ? (
        <div className="bg-neutral-50 border border-border rounded-xl p-12 text-center">
          <p className="text-neutral-600 mb-4">Belum ada pesanan.</p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
          >
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Nomor Pesanan</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Tanggal</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600 text-right">Total</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600 text-center">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600 text-right">Item</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((order) => (
                <tr key={order.order_number} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                    {formatRupiah(order.total)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-600"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-600"
                          : order.status === "pending"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-neutral-600">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} item
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-neutral-600">
        Riwayat pesanan dalam pengembangan. Data di atas adalah contoh untuk
        demonstrasi. Setelah terhubung ke Supabase dan autentikasi, data akan
        diambil dari API /api/my/orders.
      </div>
    </section>
  );
}
