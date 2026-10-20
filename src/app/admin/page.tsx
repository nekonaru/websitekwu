import Link from "next/link";
import {
  getPublishedProducts,
  getCategories,
} from "@/services/product.service";
import { getAllOrdersAdmin } from "@/services/order.service";
import { getAllRfqsAdmin } from "@/services/rfq.service";

export default async function AdminDashboard() {
  const [products, categories, orders, rfqs] = await Promise.allSettled([
    getPublishedProducts(),
    getCategories(),
    getAllOrdersAdmin(),
    getAllRfqsAdmin({ cookies: () => ({} as any) }),
  ]);

  const productCount =
    products.status === "fulfilled" ? products.value.length : 0;
  const categoryCount =
    categories.status === "fulfilled" ? categories.value.length : 0;
  const orderCount =
    orders.status === "fulfilled" ? orders.value.length : 0;
  const rfqCount = rfqs.status === "fulfilled" ? rfqs.value.total : 0;

  const pendingOrders =
    orders.status === "fulfilled"
      ? orders.value.filter((o) => o.status === "pending").length
      : 0;
  const pendingRfqs =
    rfqs.status === "fulfilled"
      ? rfqs.value.rfqs.filter((r) => r.status === "submitted").length
      : 0;

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
          value={productCount}
          icon="📦"
          color="bg-orange-50 text-orange-600 border-orange-100"
        />
        <StatCard
          title="Kategori"
          value={categoryCount}
          icon="🏷️"
          color="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatCard
          title="Pesanan Tertunda"
          value={pendingOrders}
          icon="⏳"
          color="bg-amber-50 text-amber-600 border-amber-100"
        />
        <StatCard
          title="RFQ Masuk"
          value={pendingRfqs}
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
          {orders.status === "fulfilled" && orders.value.length > 0 ? (
            <ul className="space-y-3">
              {orders.value
                .slice(0, 5)
                .map((o) => (
                  <li key={o.id} className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-heading">
                        {o.order_number}
                      </div>
                      <div className="text-xs text-muted">
                        {o.customer_name}
                      </div>
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
          {rfqs.status === "fulfilled" && rfqs.value.rfqs.length > 0 ? (
            <ul className="space-y-3">
              {rfqs.value.rfqs.slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-heading">
                      {r.rfq_number}
                    </div>
                    <div className="text-xs text-muted">
                      {r.organization_name}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.status === "submitted"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {r.status.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted text-center py-4">
              Belum ada RFQ.
            </p>
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
