"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { formatRupiah } from "@/lib/format";
import { Trash2, Minus, Plus, ChevronLeft } from "lucide-react";

export default function Keranjang() {
  const { items, removeItem, updateQuantity, subtotal, itemCount, clear } =
    useCart();

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/katalog"
          className="text-sm text-primary hover:underline flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke Katalog
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-heading mb-6">Keranjang Belanja</h1>

      {itemCount === 0 ? (
        <div className="bg-neutral-50 border border-border rounded-xl p-12 text-center">
          <p className="text-muted mb-4">Keranjang Anda masih kosong.</p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
          >
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-neutral-50">
                  <th className="px-6 py-3 text-sm font-semibold text-muted">Produk</th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-right">
                    Harga Satuan
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-center">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-right">
                    Total
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-muted text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.product.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm text-heading">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            fill
                            sizes="48px"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-heading truncate">
                            {item.product.name}
                          </div>
                          <div className="text-xs text-muted truncate">
                            {item.product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                      {formatRupiah(item.product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                      {formatRupiah(item.product.price * item.quantity)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus dari keranjang"
                        aria-label={`Hapus ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border p-6 bg-neutral-50">
            <div className="flex justify-between mb-6">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-sm font-medium text-heading">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <div className="flex justify-between mb-6 text-sm text-muted">
              <span>Pengambilan barang</span>
              <span>Diambil sendiri di toko KWU</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-heading pt-4 border-t border-border">
              <span>Total</span>
              <span className="font-bold">{formatRupiah(subtotal)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/checkout"
                className="flex-1 sm:w-auto py-3.5 px-6 rounded-xl bg-primary text-white font-bold text-center hover:bg-orange-500 transition-colors shadow-md shadow-orange-200"
              >
                Lanjutkan Checkout
              </Link>
              <button
                onClick={() => {
                  if (window.confirm("Kosongkan seluruh keranjang?")) {
                    clear();
                  }
                }}
                className="flex-1 sm:w-auto py-3.5 px-6 rounded-xl border border-border text-heading font-semibold text-center hover:bg-neutral-100 transition-colors"
              >
                Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
