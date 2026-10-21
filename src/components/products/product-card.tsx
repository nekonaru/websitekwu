"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Check, Plus, Flame } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/contexts/cart-context";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    image: string;
    isFeatured?: boolean;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inStock = product.stock > 0;
  const menipis = inStock && product.stock <= 10;

  function handleAdd() {
    if (!inStock) return;
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover ${
        className ?? ""
      }`}
    >
      <Link
        href={`/produk/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-neutral-100"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Label produk */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <Flame className="h-3 w-3" aria-hidden="true" />
              Unggulan
            </span>
          )}
          {menipis && (
            <span className="rounded-full bg-warning-50 px-2.5 py-1 text-[11px] font-bold text-warning-800 shadow-sm">
              Sisa {product.stock}
            </span>
          )}
        </div>

        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/45">
            <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-800 shadow">
              Stok Habis
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 lg:p-5">
        <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-heading transition-colors duration-200 group-hover:text-primary lg:text-base">
          <Link href={`/produk/${product.slug}`} className="focus:outline-none">
            {product.name}
          </Link>
        </h3>

        <p className="text-lg font-extrabold text-primary lg:text-xl">
          {formatRupiah(product.price)}
        </p>

        <p
          className={`mt-1 text-xs font-medium ${
            inStock ? "text-success-700" : "text-danger-600"
          }`}
        >
          {inStock ? `Stok tersedia: ${product.stock}` : "Stok habis"}
        </p>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
            inStock
              ? justAdded
                ? "bg-success-600 text-white shadow-md"
                : "border border-primary bg-primary-soft text-primary hover:bg-primary hover:text-white hover:shadow-md"
              : "cursor-not-allowed border border-neutral-200 bg-neutral-50 text-neutral-400"
          }`}
        >
          {inStock ? (
            justAdded ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <Check className="h-4 w-4" aria-hidden="true" /> Masuk keranjang
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5">
                <Plus className="h-4 w-4" aria-hidden="true" /> Masukkan
              </span>
            )
          ) : (
            "Habis"
          )}
        </button>
      </div>
    </article>
  );
}
