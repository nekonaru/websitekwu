"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus } from "lucide-react";
import { formatDate } from "@/lib/format";
import { RFQ_STATUS_LABELS } from "@/types/rfq";

interface AdminRfq {
  id: string;
  rfq_number: string;
  organization_name: string;
  contact_name: string;
  business_email: string;
  status: string;
  required_date: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-amber-50 text-amber-600 border-amber-100",
  under_review: "bg-blue-50 text-blue-600 border-blue-100",
  needs_information: "bg-orange-50 text-orange-600 border-orange-100",
  quoted: "bg-indigo-50 text-indigo-600 border-indigo-100",
  negotiation: "bg-purple-50 text-purple-600 border-purple-100",
  accepted: "bg-green-50 text-green-600 border-green-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
  expired: "bg-neutral-50 text-neutral-600 border-neutral-100",
  converted_to_order: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function AdminRfqs() {
  const [rfqs, setRfqs] = useState<AdminRfq[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    let aktif = true;

    async function loadRfqs() {
      try {
        const params = new URLSearchParams();
        if (filters.status) params.set("status", filters.status);
        if (filters.search) params.set("search", filters.search);
        params.set("page", String(filters.page));
        params.set("pageSize", String(filters.pageSize));

        const res = await fetch(`/api/admin/rfqs?${params}`);
        const data = await res.json();
        if (!aktif) return;
        if (data.success) {
          setRfqs(data.data.rfqs);
          setTotal(data.data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadRfqs();
    return () => {
      aktif = false;
    };
  }, [filters]);

  const totalPages = Math.max(Math.ceil(total / filters.pageSize), 1);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading mb-2">Kelola RFQ</h1>
          <p className="text-muted">Daftar permintaan penawaran grosir masuk.</p>
        </div>
        <Link
          href="/business/rfq/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-md shadow-orange-200"
        >
          <Plus className="h-4 w-4" /> Ajukan RFQ Baru
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 lg:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari nomor RFQ, perusahaan, atau kontak..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative lg:w-64">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Status</option>
            <option value="submitted">Diajukan</option>
            <option value="under_review">Sedang Ditinjau</option>
            <option value="needs_information">Perlu Informasi</option>
            <option value="quoted">Penawaran Terbit</option>
            <option value="negotiation">Negosiasi</option>
            <option value="accepted">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="expired">Kedaluwarsa</option>
            <option value="converted_to_order">Menjadi Pesanan</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-6 py-3 text-sm font-semibold text-muted">Nomor RFQ</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted">Perusahaan</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted">Kontak</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Tanggal Pengajuan</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Tanggal Kebutuhan</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    Memuat data...
                  </td>
                </tr>
              ) : rfqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    Tidak ada RFQ yang ditemukan.
                  </td>
                </tr>
              ) : (
                rfqs.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-heading">
                      {r.rfq_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-heading">{r.organization_name}</td>
                    <td className="px-6 py-4 text-sm text-muted">{r.contact_name}</td>
                    <td className="px-6 py-4 text-sm text-muted text-center">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted text-center">
                      {formatDate(r.required_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          STATUS_COLORS[r.status] || "border-neutral-200 text-neutral-600"
                        }`}
                      >
                        {RFQ_STATUS_LABELS[r.status as keyof typeof RFQ_STATUS_LABELS] || r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Link
                        href={`/admin/rfqs/${r.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted">
            Menampilkan {((filters.page - 1) * filters.pageSize) + 1} hingga {Math.min(filters.page * filters.pageSize, total)} dari {total} RFQ
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 rounded-lg border border-border text-heading disabled:text-neutral-400 disabled:border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="px-4 py-2 rounded-lg border border-border text-sm text-heading">
              Halaman {filters.page} dari {totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === totalPages}
              className="px-4 py-2 rounded-lg border border-border text-heading disabled:text-neutral-400 disabled:border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}
