"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/format";
import Link from "next/link";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { formatRupiah } from "@/lib/format";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    isFeatured: false,
    isDraft: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        category: formData.category,
        imageUrl: formData.imageUrl ?? "",
        isFeatured: formData.isFeatured,
      };

      if (editingId) {
        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error ?? "Gagal memperbarui produk");
        }
        setMessage({ type: "success", text: "Produk berhasil diperbarui" });
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error ?? "Gagal menambah produk");
        }
        setMessage({ type: "success", text: "Produk berhasil ditambahkan" });
      }

      setOpenForm(false);
      setEditingId(null);
      setFormData({
        name: "", slug: "", description: "", shortDescription: "",
        price: "", stock: "", category: "", imageUrl: "",
        isFeatured: false, isDraft: false,
      });
      await loadProducts();
    } catch (err: unknown) {
      setMessage({ type: "error", text: getErrorMessage(err, "Gagal menyimpan produk") });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Gagal menghapus produk");
      }
      setMessage({ type: "success", text: "Produk berhasil dihapus" });
      await loadProducts();
    } catch (err: unknown) {
      setMessage({ type: "error", text: getErrorMessage(err, "Gagal menghapus produk") });
    }
  }

  function handleEdit(p: any) {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription || "",
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      imageUrl: p.image || "",
      isFeatured: Boolean(p.isFeatured),
      isDraft: Boolean(p.isDraft),
    });
    setOpenForm(true);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading mb-2">Kelola Produk</h1>
          <p className="text-muted">Katalog dan stok produk KWU.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "", slug: "", description: "", shortDescription: "",
              price: "", stock: "", category: "", imageUrl: "",
              isFeatured: false, isDraft: false,
            });
            setOpenForm(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-orange-500 transition-colors shadow-md shadow-orange-200"
        >
          <Plus className="h-4 w-4" /> Tambah Produk
        </button>
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

      {/* Cari */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Cari produk"
          />
        </div>
      </div>

      {/* Form produk (modal sederhana) */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-heading">
                {editingId ? "Edit Produk" : "Tambah Produk"}
              </h3>
              <button
                onClick={() => setOpenForm(false)}
                className="text-muted hover:text-heading"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  name="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="contoh: buku-tulis-a5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">
                    Harga
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1">
                    Stok
                  </label>
                  <input
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="alat-tulis">Alat Tulis</option>
                  <option value="elektronik">Elektronik</option>
                  <option value="pakaian">Pakaian</option>
                  <option value="makanan-minuman">Makanan & Minuman</option>
                  <option value="kesehatan">Kesehatan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1">
                  URL Gambar
                </label>
                <input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  name="isFeatured"
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label className="text-sm text-heading">Produk unggulan</label>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input
                  name="isDraft"
                  type="checkbox"
                  checked={formData.isDraft}
                  onChange={(e) =>
                    setFormData({ ...formData, isDraft: e.target.checked })
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label className="text-sm text-heading">Draft (tidak tampil di katalog)</label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-heading hover:bg-neutral-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-orange-500 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel produk */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-neutral-50">
              <th className="px-6 py-3 text-sm font-semibold text-muted">Produk</th>
              <th className="px-6 py-3 text-sm font-semibold text-muted text-right">Harga</th>
              <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Stok</th>
              <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Kategori</th>
              <th className="px-6 py-3 text-sm font-semibold text-muted text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  Memuat produk...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  Produk tidak ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={p.image || "/placeholder.svg"}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-heading truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted truncate">
                          {p.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                    {formatRupiah(p.price || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        p.stock === 0
                          ? "bg-red-100 text-red-600"
                          : p.stock < 10
                            ? "bg-amber-100 text-amber-600"
                            : "bg-green-100 text-green-600"
                      }`}
                    >
                      {p.stock} {p.stock === 1 ? "pcs" : "pcs"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {p.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 text-primary hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-muted">
        Data produk disimpan di database Supabase. Jika belum terhubung,
        data akan menggunakan contoh (mock).
      </div>
    </section>
  );
}


