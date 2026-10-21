"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
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
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inStock = product.stock > 0;

  function handleAdd() {
    if (!inStock) return;
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article
      className={`group relative flex flex-col border border-border rounded-2xl p-5 bg-white hover:shadow-2xl transition-all duration-300 hover:border-primary/50 ${className ?? ""}`}
    >
      <div className="aspect-[4/5] overflow-hidden rounded-xl mb-4 relative bg-neutral-100 group-hover:scale-105 transition-transform duration-300">
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        {!inStock && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              Stok Habis
            </span>
          </span>
        )}
      </div>

      <Link href={`/produk/${product.slug}`} className="flex flex-col gap-2">
        <h3 className="font-bold text-heading line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-primary font-bold text-lg">{formatRupiah(product.price)}</p>
      </Link>

      <p
        className={`text-xs font-medium ${
          inStock ? "text-green-600" : "text-orange-600"
        }`}
      >
        {inStock ? `Stok Tersedia: ${product.stock}` : "Stok Habis"}
      </p>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className={`mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
          inStock
            ? "border-primary text-primary bg-orange-50 hover:bg-orange-100 hover:shadow-md shadow-orange-100"
            : "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
        }`}
      >
        {inStock ? (
          justAdded ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" aria-hidden="true" /> Masuk keranjang
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" /> Masukkan Keranjang
            </span>
          )
        ) : (
          "Habis"
        )}
      </button>
    </article>
  );
}
