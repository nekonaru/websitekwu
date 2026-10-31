"use client";

import Link from "next/link";
import { ChevronLeft, Heart, Trash2, ShoppingCart } from "lucide-react";
import { useFavorit } from "@/contexts/favorit-context";
import { useCart } from "@/contexts/cart-context";
import { ProductCard } from "@/components/products/product-card";

export default function FavoritPage() {
  const { items, remove, clear, count } = useFavorit();
  const { addItem } = useCart();

  function pindahkanKeKeranjang() {
    items.forEach((item) => addItem(item));
    clear();
  }

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

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading md:text-3xl">
            Produk Favorit
          </h1>
          {count > 0 && (
            <p className="mt-1 text-muted">
              {count} produk tersimpan di daftar favorit Anda.
            </p>
          )}
        </div>

        {count > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={pindahkanKeKeranjang}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Pindahkan semua ke keranjang
            </button>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-danger-600 transition-colors duration-200 hover:border-danger-600 hover:bg-danger-50 active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Kosongkan
            </button>
          </div>
        )}
      </div>

      {count === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <Heart
            className="mx-auto mb-4 h-10 w-10 text-muted"
            aria-hidden="true"
          />
          <h2 className="mb-2 text-lg font-bold text-heading">
            Belum ada produk favorit
          </h2>
          <p className="mb-6 text-sm text-muted">
            Tekan ikon hati pada produk di katalog untuk menyimpannya ke sini.
          </p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            Jelajahi Katalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard
                product={{
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  stock: item.stock,
                  image: item.image,
                }}
              />
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Hapus ${item.name} dari favorit`}
                className="absolute -right-2 -top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-500 shadow-md transition-all duration-200 hover:bg-danger-600 hover:text-white active:scale-90"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
