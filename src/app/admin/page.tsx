"use client";

import Link from "next/link";
import {
  RFQ_STATUS_LABELS,
  type RfqStatus,
} from "@/types/rfq";
import { useEffect, useState } from "react";

interface AdminProduct {
  id: string;
  name: string;
  category?: string;
}

interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
}

interface AdminRfq {
  id: string;
  rfq_number: string;
  organization_name: string;
  status: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [rfqs, setRfqs] = useState<AdminRfq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktif = true;

    async function loadData() {
      setLoading(true);
      try {
        const [produkRes, pesananRes, rfqRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/rfqs?pageSize=20"),
        ]);

        const produkJson = await produkRes.json();
        const pesananJson = await pesananRes.json();
        const rfqJson = await rfqRes.json();

        if (!aktif) return;

        setProducts(produkJson.success ? produkJson.data : []);
        setOrders(pesananJson.success ? pesananJson.data : []);
        setRfqs(rfqJson.success ? rfqJson.data?.rfqs ?? [] : []);
      } catch (err) {
        console.error("Gagal memuat data dashboard admin:", err);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadData();
    return () => {
      aktif = false;
    };
  }, []);

  const productCount = products.length;
  const categoryCount = new Set(
    products.map((p) => p.category).filter(Boolean)
  ).size;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const pendingRfqs = rfqs.filter((r) => r.status === "submitted").length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading mb-2">Dashboard Admin</h1>
        <p className="text-muted">Ringkasan operasi toko KWU.</p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Produk Aktif"
          value={loading ? "..." : productCount}
          icon="📦"
          color="bg-orange-50 text-orange-600 border-orange-100"
        />
        <StatCard
          title="Kategori"
          value={loading ? "..." : categoryCount}
          icon="🏷️"
          color="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatCard
          title="Pesanan Tertunda"
          value={loading ? "..." : pendingOrders}
          icon="⏳"
          color="bg-amber-50 text-warning-700 border-amber-100"
        />
        <StatCard
          title="RFQ Masuk"
          value={loading ? "..." : pendingRfqs}
          icon="📋"
          color="bg-blue-50 text-blue-600 border-blue-100"
        />
      </div>

      {/* Aktivitas terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pesanan terbaru */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-bold text-heading mb-4 flex items-center gap-2">
            <span>🛒</span> Pesanan Terbaru
          </h3>
          {loading ? (
            <p className="text-sm text-muted text-center py-4">Memuat pesanan...</p>
          ) : orders.length > 0 ? (
            <ul className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-heading">
                      {o.order_number}
                    </div>
                    <div className="text-xs text-muted">{o.customer_name}</div>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted text-center py-4">
              Belum ada pesanan.
            </p>
          )}
        </div>

        {/* RFQ terbaru */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-bold text-heading mb-4 flex items-center gap-2">
            <span>📋</span> RFQ Terbaru
          </h3>
          {loading ? (
            <p className="text-sm text-muted text-center py-4">Memuat RFQ...</p>
          ) : rfqs.length > 0 ? (
            <ul className="space-y-3">
              {rfqs.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-heading">
                      {r.rfq_number}
                    </div>
                    <div className="text-xs text-muted">{r.organization_name}</div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.status === "submitted"
                        ? "bg-amber-100 text-warning-700"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {RFQ_STATUS_LABELS[r.status as RfqStatus] ?? r.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted text-center py-4">Belum ada RFQ.</p>
          )}
        </div>

        {/* Tindakan cepat admin */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-bold text-heading mb-4">Tindakan Cepat</h3>
          <div className="space-y-3">
            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-primary hover:text-white transition-all group"
            >
              <span className="text-lg">📦</span>
              <span className="text-sm font-medium text-heading group-hover:text-white">
                Kelola Produk
              </span>
            </Link>
            <Link
              href="/admin/rfqs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-primary hover:text-white transition-all group"
            >
              <span className="text-lg">📋</span>
              <span className="text-sm font-medium text-heading group-hover:text-white">
                Kelola RFQ
              </span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-primary hover:text-white transition-all group"
            >
              <span className="text-lg">🛒</span>
              <span className="text-sm font-medium text-heading group-hover:text-white">
                Kelola Pesanan
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-xl border ${color} flex items-center justify-between`}>
      <div>
        <p className="text-sm text-muted mb-1">{title}</p>
        <p className="text-2xl font-bold text-heading">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  );
}
