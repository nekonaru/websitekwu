"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { formatRupiah, formatDate, getErrorMessage } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/types/rfq";

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

const WAKTU_STATUS: Record<string, string> = {
  pending: "bg-warning-50 text-warning-800",
  paid: "bg-info-50 text-info-800",
  processing: "bg-info-50 text-info-800",
  shipped: "bg-orange-50 text-orange-700",
  delivered: "bg-success-50 text-success-800",
  cancelled: "bg-danger-50 text-danger-700",
  refunded: "bg-neutral-100 text-neutral-700",
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
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/profil"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke
          Profil
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-heading md:text-3xl">
        Riwayat Pesanan
      </h1>
      <p className="mb-8 text-muted">
        Daftar seluruh pesanan yang pernah Anda buat.
      </p>

      {message && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-800"
        >
          {message}
        </div>
      )}

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="skeleton h-24 rounded-2xl"
              aria-hidden="true"
            />
          ))}
        </ul>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <ShoppingBag
            className="mx-auto mb-4 h-10 w-10 text-muted"
            aria-hidden="true"
          />
          <h2 className="mb-2 text-lg font-bold text-heading">
            Belum ada pesanan
          </h2>
          <p className="mb-6 text-sm text-muted">
            Pesanan yang Anda buat akan tampil di sini beserta status
            pembaruannya.
          </p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            Belanja Sekarang
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-border bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-bold text-heading">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    WAKTU_STATUS[order.status] ??
                    "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                    order.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <p className="text-sm text-muted">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} item
                </p>
                <p className="text-lg font-extrabold text-primary">
                  {formatRupiah(order.total)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
