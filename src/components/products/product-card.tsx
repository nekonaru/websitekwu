"use client";

import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/format";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stock > 0;
  return (
    <article className="flex flex-col border border-border rounded-xl p-4 bg-surface hover:shadow-md transition-shadow group">
      <div className="aspect-[4/5] overflow-hidden rounded-lg mb-3 relative bg-neutral-100">
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
        />
        {!inStock && (
          <span className="absolute top-2 left-2 bg-orange-900 text-orange-100 text-xs font-bold px-2 py-1 rounded-full">
            Stok Habis
          </span>
        )}
      </div>
      <Link href={`/produk/${product.slug}`} className="flex flex-col gap-1">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-primary font-bold">
          {formatRupiah(product.price)}
        </p>
      </Link>
      <p className={`text-xs ${inStock ? "text-neutral-600" : "text-orange-600"}`}>
        {inStock ? `Stok: ${product.stock}` : "Stok habis"}
      </p>
      <button
        disabled={!inStock}
        className={`mt-auto w-full py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
          inStock
            ? "border-primary text-primary bg-orange-50 hover:bg-orange-100"
            : "border-neutral-300 text-neutral-400 bg-neutral-50 cursor-not-allowed"
        }`}
      >
        {inStock ? "Masukkan Keranjang" : "Habis"}
      </button>
    </article>
  );
}

