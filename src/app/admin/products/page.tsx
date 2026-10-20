"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { getPublishedProducts } from "@/lib/data";
import { formatRupiah } from "@/lib/format";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const products = getPublishedProducts().filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Produk</h1>
          <p className="text-neutral-600">Katalog dan stok produk KWU.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Produk
        </Link>
      </div>

      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Cari produk"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Produk</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600">Kategori</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600 text-right">Harga</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600 text-center">Stok</th>
                <th className="px-6 py-3 text-sm font-semibold text-neutral-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="text-xs text-neutral-500">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {p.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.stock === 0
                            ? "bg-red-100 text-red-600"
                            : p.stock < 10
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {p.stock} {p.stock === 1 ? "pcs" : "pcs"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-primary hover:bg-orange-50 rounded-lg" title="Edit" aria-label="Edit produk">
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg" title="Hapus" aria-label="Hapus produk">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-600">
                    Produk tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-neutral-600">
        Halaman admin produk dalam pengembangan. Fitur edit/stok akan
        terhubung ke database Supabase dengan RLS.
      </div>
    </section>
  );
}

