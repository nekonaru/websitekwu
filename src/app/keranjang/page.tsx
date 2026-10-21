"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { formatRupiah } from "@/lib/format";
import {
  Trash2,
  Minus,
  Plus,
  ChevronLeft,
  ShoppingCart,
  ArrowRight,
  Trash,
} from "lucide-react";

export default function Keranjang() {
  const { items, removeItem, updateQuantity, subtotal, itemCount, clear } =
    useCart();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke
          Katalog
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-heading md:text-3xl">
        Keranjang Belanja
      </h1>
      {itemCount > 0 && (
        <p className="mb-8 text-muted">
          {itemCount} item siap di-checkout.
        </p>
      )}

      {itemCount === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <ShoppingCart
            className="mx-auto mb-4 h-10 w-10 text-muted"
            aria-hidden="true"
          />
          <h2 className="mb-2 text-lg font-bold text-heading">
            Keranjang Anda masih kosong
          </h2>
          <p className="mb-6 text-sm text-muted">
            Jelajahi katalog dan pilih kebutuhan kampus Anda.
          </p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-8">
          {/* Daftar item */}
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex items-start gap-3 p-4 transition-colors duration-200 hover:bg-surface-muted sm:gap-4 sm:p-5"
                >
                  <Link
                    href={`/produk/${item.product.slug}`}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-20 sm:w-20"
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produk/${item.product.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-heading transition-colors duration-200 hover:text-primary sm:text-base"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-medium text-primary">
                      {formatRupiah(item.product.price)}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-lg border border-border bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-l-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent disabled:hover:text-neutral-300"
                          aria-label={`Kurangi jumlah ${item.product.name}`}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-heading">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-r-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
                          aria-label={`Tambah jumlah ${item.product.name}`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-heading sm:text-base">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:bg-danger-50 hover:text-danger-600"
                          title="Hapus dari keranjang"
                          aria-label={`Hapus ${item.product.name} dari keranjang`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Ringkasan */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-heading">
                Ringkasan Belanja
              </h2>

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-muted">
                  <span>Subtotal ({itemCount} item)</span>
                  <span className="font-medium text-heading">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted">
                  <span>Biaya layanan</span>
                  <span className="font-medium text-heading">Rp 0</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-lg font-bold text-heading">Total</span>
                <span className="text-xl font-extrabold text-primary">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl active:translate-y-0"
              >
                Lanjutkan Checkout
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Kosongkan seluruh keranjang?")) {
                    clear();
                  }
                }}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-body transition-colors duration-200 hover:border-danger-500 hover:bg-danger-50 hover:text-danger-600"
              >
                <Trash className="h-4 w-4" aria-hidden="true" />
                Kosongkan keranjang
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
