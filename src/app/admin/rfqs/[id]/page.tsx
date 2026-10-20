"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Trash2,
  Edit2,
  Mail,
  MapPin,
  Calendar,
  Building2,
} from "lucide-react";
import {
  getRfqById,
  updateRfqStatusAdmin,
  addAdminNote,
  getQuotationsByRfq,
} from "@/services/rfq.service";
import { createQuotation } from "@/services/quotation.service";
import { formatRupiah, formatDate } from "@/lib/format";
import { RFQ_STATUS_LABELS } from "@/types/rfq";

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

export default async function AdminRfqDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rfq, setRfq] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newQuotation, setNewQuotation] = useState({
    validUntil: "",
    shippingCost: "0",
    discount: "0",
    terms: "",
    items: [{ productName: "", quantity: 1, unit: "pcs", unitPrice: "0" }],
  });
  const [openQuotationForm, setOpenQuotationForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadRfq();
  }, [id]);

  async function loadRfq() {
    try {
      const res = await fetch(`/api/rfqs/${id}`);
      const data = await res.json();
      if (data.success) {
        setRfq(data.data);
        setQuotations(data.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!rfq) return;
    try {
      await updateRfqStatusAdmin({
        rfqId: id,
        newStatus,
        note: newStatus === "rejected" ? "" : undefined,
        cookies: () => ({} as any),
      });
      setMessage({ type: "success", text: `Status diubah menjadi ${RFQ_STATUS_LABELS[newStatus as keyof typeof RFQ_STATUS_LABELS] || newStatus}` });
      await loadRfq();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message ?? "Gagal mengubah status" });
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addAdminNote({
        rfqId: id,
        note: newNote,
        cookies: () => ({} as any),
      });
      setNewNote("");
      setMessage({ type: "success", text: "Catatan berhasil ditambahkan" });
      await loadRfq();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message ?? "Gagal menambah catatan" });
    }
  }

  async function handleCreateQuotation(e: React.FormEvent) {
    e.preventDefault();
    try {
      const items = newQuotation.items.filter((i) => i.productName.trim());
      const payload = {
        rfqId: id,
        validUntil: newQuotation.validUntil,
        shippingCost: parseFloat(newQuotation.shippingCost) || 0,
        discount: parseFloat(newQuotation.discount) || 0,
        terms: newQuotation.terms || undefined,
        items: items.map((i) => ({
          productName: i.productName,
          quantity: Number(i.quantity) || 1,
          unit: i.unit,
          unitPrice: parseFloat(i.unitPrice) || 0,
        })),
      };

      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal membuat quotation");

      const data = await res.json();
      setMessage({
        type: "success",
        text: `Quotation ${data.data.quotationNumber} versi ${data.data.version} berhasil dibuat`,
      });
      setOpenQuotationForm(false);
      await loadRfq();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message ?? "Gagal membuat quotation" });
    }
  }

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Memuat detail RFQ...</div>
      </section>
    );
  }

  if (!rfq) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-heading">RFQ Tidak Ditemukan</h1>
          <Link href="/admin/rfqs" className="text-primary hover:underline">
            Kembali ke daftar RFQ
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading mb-2">
            Detail RFQ {rfq.rfq_number}
          </h1>
          <p className="text-muted">
            Status:{ " "}
            <span
              className={`text-sm font-bold px-2 py-0.5 rounded-full border ${
                STATUS_COLORS[rfq.status] || "border-neutral-200 text-neutral-600"
              }`}
            >
              {RFQ_STATUS_LABELS[rfq.status as keyof typeof RFQ_STATUS_LABELS] || rfq.status}
            </span>
          </p>
        </div>
        <Link
          href="/admin/rfqs"
          className="text-primary hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke Daftar
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl mb-6 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail RFQ */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-6">
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-heading mb-2">
                Informasi Perusahaan / Institusi
              </h2>
              <dl className="space-y-2 text-sm">
                <dt className="text-muted">Nama</dt>
                <dd className="text-heading">{rfq.organization_name}</dd>
                <dt className="text-muted">Kontak</dt>
                <dd className="text-heading">{rfq.contact_name}</dd>
                <dt className="text-muted">Email</dt>
                <dd className="text-heading">
                  <a href={`mailto:${rfq.business_email}`} className="text-primary hover:underline">
                    {rfq.business_email}
                  </a>
                </dd>
              </dl>
            </div>

            <div>
              <h2 className="font-bold text-heading mb-2">
                Detail Kebutuhan Grosir
              </h2>
              <div className="space-y-3">
                {rfq.items.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-lg bg-neutral-50 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-heading">{item.product_name}</h4>
                      <span className="text-xs font-medium text-primary">
                        {formatRupiah(item.unit_price || 0)} / {item.unit}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{item.product_details}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm font-medium">Jumlah</span>
                      <span className="text-sm font-bold">{item.quantity} {item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted">Tanggal Kebutuhan</dt>
                <dd className="text-heading text-sm">
                  {formatDate(rfq.required_date)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Tanggal Pengajuan</dt>
                <dd className="text-heading text-sm">
                  {formatDate(rfq.created_at)}
                </dd>
              </div>
            </div>

            {rfq.admin_notes && (
              <div>
                <h3 className="font-bold text-heading mb-2">Catatan Internal Admin</h3>
                <p className="text-sm text-muted">{rfq.admin_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar aksi admin */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ubah status */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-bold text-heading mb-4">Ubah Status RFQ</h3>
            <div className="space-y-2">
              {rfq.status === "submitted" && (
                <>
                  <button
                    onClick={() => handleStatusChange("under_review")}
                    className="w-full py-2.5 rounded-lg border border-border text-heading hover:bg-neutral-50 transition-colors"
                  >
                    Sedang Ditinjau
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Tolak Permintaan
                  </button>
                </>
              )}
              {rfq.status === "under_review" && (
                <>
                  <button
                    onClick={() => handleStatusChange("needs_information")}
                    className="w-full py-2.5 rounded-lg border border-border text-heading hover:bg-neutral-50 transition-colors"
                  >
                    Perlu Informasi Tambahan
                  </button>
                  <button
                    onClick={() => handleStatusChange("quoted")}
                    className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
                  >
                    Buat Penawaran (Quotation)
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Tolak
                  </button>
                </>
              )}
              {rfq.status === "needs_information" && (
                <>
                  <button
                    onClick={() => handleStatusChange("under_review")}
                    className="w-full py-2.5 rounded-lg border border-border text-heading hover:bg-neutral-50 transition-colors"
                  >
                    Kembali ke Ditinjau
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Tolak
                  </button>
                </>
              )}
              {rfq.status === "quoted" && (
                <>
                  <button
                    onClick={() => handleStatusChange("negotiation")}
                    className="w-full py-2.5 rounded-lg border border-border text-heading hover:bg-neutral-50 transition-colors"
                  >
                    Negosiasi
                  </button>
                  <button
                    onClick={() => handleStatusChange("accepted")}
                    className="w-full py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                  >
                    Terima Penawaran
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleStatusChange("expired")}
                    className="w-full py-2.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    Kedaluwarsa
                  </button>
                </>
              )}
              {rfq.status === "negotiation" && (
                <>
                  <button
                    onClick={() => handleStatusChange("quoted")}
                    className="w-full py-2.5 rounded-lg border border-border text-heading hover:bg-neutral-50 transition-colors"
                  >
                    Revisi Penawaran
                  </button>
                  <button
                    onClick={() => handleStatusChange("accepted")}
                    className="w-full py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                  >
                    Terima Penawaran
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Tolak
                  </button>
                </>
              )}
              {rfq.status === "accepted" && (
                <>
                  <button
                    onClick={() => handleStatusChange("converted_to_order")}
                    className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    Konversi ke Pesanan
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Catatan internal */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-bold text-heading mb-4">Catatan Internal</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                placeholder="Tulis catatan internal..."
                className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-orange-500 transition-colors"
              >
                Simpan Catatan
              </button>
            </form>
          </div>

          {/* Buat quotation */}
          {rfq.status === "under_review" || rfq.status === "quoted" || rfq.status === "negotiation" ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-bold text-heading mb-4">Buat Quotation</h3>
              <p className="text-sm text-muted mb-4">
                Buat penawaran harga untuk RFQ ini. Pelanggan akan menerima
                notifikasi setelah penawaran diterbitkan.
              </p>
              <button
                onClick={() => setOpenQuotationForm(true)}
                className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
              >
                Buat Quotation Baru
              </button>
            </div>
          ) : null}

          {/* Riwayat status */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-bold text-heading mb-4">Riwayat Status</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {rfq.history.map((h: any) => (
                <div key={h.id} className="flex justify-between items-start text-sm">
                  <div>
                    <div className="text-heading">{h.new_status.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted">
                      {formatDate(h.created_at)}
                    </div>
                  </div>
                  {h.note && (
                    <span className="text-xs text-muted ml-2">"{h.note}"</span>
                  )}
                </div>
              ))}
              {rfq.history.length === 0 && (
                <p className="text-xs text-muted text-center py-4">
                  Belum ada riwayat.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daftar quotation */}
      {quotations.length > 0 && (
        <div className="mt-8 bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold text-heading mb-4">Daftar Quotation</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="px-6 py-3 text-sm font-semibold text-muted">Nomor</th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-right">Versi</th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-right">Total</th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-heading">
                      {q.quotation_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-muted">
                      v{q.version}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                      {formatRupiah(q.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          q.status === "issued"
                            ? "bg-blue-50 text-blue-600"
                            : q.status === "accepted"
                              ? "bg-green-50 text-green-600"
                              : q.status === "rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-neutral-50 text-neutral-600"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {q.status === "issued" && (
                        <button
                          onClick={() => convertQuotation(q.id)}
                          className="text-primary hover:underline text-sm"
                        >
                          Konversi ke Pesanan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form quotation */}
      {openQuotationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-heading">Buat Quotation</h3>
              <button
                onClick={() => setOpenQuotationForm(false)}
                className="text-muted hover:text-heading"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  Tanggal Kedaluwarsa <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newQuotation.validUntil}
                  onChange={(e) =>
                    setNewQuotation({ ...newQuotation, validUntil: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">
                    Biaya Pengiriman
                  </label>
                  <input
                    type="number"
                    value={newQuotation.shippingCost}
                    onChange={(e) =>
                      setNewQuotation({ ...newQuotation, shippingCost: e.target.value })
                    }
                    className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">
                    Diskon
                  </label>
                  <input
                    type="number"
                    value={newQuotation.discount}
                    onChange={(e) =>
                      setNewQuotation({ ...newQuotation, discount: e.target.value })
                    }
                    className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  Syarat & Ketentuan
                </label>
                <textarea
                  rows={3}
                  value={newQuotation.terms}
                  onChange={(e) =>
                    setNewQuotation({ ...newQuotation, terms: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  Item Penawaran
                </label>
                <div className="space-y-3">
                  {newQuotation.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        value={item.productName}
                        onChange={(e) =>
                          setNewQuotation({
                            ...newQuotation,
                            items: newQuotation.items.map((it, i) =>
                              i === idx ? { ...it, productName: e.target.value } : it
                            ),
                          })
                        }
                        className="pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nama produk"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          setNewQuotation({
                            ...newQuotation,
                            items: newQuotation.items.map((it, i) =>
                              i === idx ? { ...it, quantity: Number(e.target.value) || 1 } : it
                            ),
                          })
                        }
                        className="pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          setNewQuotation({
                            ...newQuotation,
                            items: newQuotation.items.map((it, i) =>
                              i === idx ? { ...it, unit: e.target.value } : it
                            ),
                          })
                        }
                        className="pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="pcs">pcs</option>
                        <option value="unit">unit</option>
                        <option value="box">box</option>
                        <option value="pack">pack</option>
                      </select>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          setNewQuotation({
                            ...newQuotation,
                            items: newQuotation.items.map((it, i) =>
                              i === idx ? { ...it, unitPrice: e.target.value } : it
                            ),
                          })
                        }
                        className="pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Harga satuan"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuotation({
                        ...newQuotation,
                        items: [...newQuotation.items, { productName: "", quantity: 1, unit: "pcs", unitPrice: "0" }],
                      })
                    }
                    className="text-sm text-primary hover:text-orange-600 flex items-center gap-1"
                  >
                    <span className="text-lg">+</span> Tambah Item
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenQuotationForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-heading hover:bg-neutral-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
                >
                  Terbitkan Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

async function convertQuotation(quotationId: string) {
  if (!window.confirm("Yakin ingin mengonversi quotation ini menjadi pesanan?")) return;
  try {
    const res = await fetch(`/api/quotations/${quotationId}/convert`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Gagal mengonversi");
    window.location.reload();
  } catch (err: any) {
    alert(err.message ?? "Gagal mengonversi quotation");
  }
}
