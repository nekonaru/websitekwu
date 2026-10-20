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
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const inStock = product.stock > 0;

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
          loading="lazy"
        />
        {!inStock && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              Stok Habis
            </span>
          </span>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <button className="p-2 rounded-lg bg-white/90 backdrop-blur text-body hover:bg-white transition-colors" aria-label="Simpan ke wishlist">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      <Link href={`/produk/${product.slug}`} className="flex flex-col gap-2">
        <h3 className="font-bold text-heading line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-primary font-bold text-lg">{formatRupiah(product.price)}</p>
      </Link>

      <p className={`text-xs font-medium ${inStock ? "text-green-600" : "text-orange-600"}`}>
        {inStock ? `Stok Tersedia: ${product.stock}` : "Stok Habis"}
      </p>

      <button
        disabled={!inStock}
        className={`mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
          inStock
            ? "border-primary text-primary bg-orange-50 hover:bg-orange-100 hover:shadow-md shadow-orange-100"
            : "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
        }`}
      >
        {inStock ? (
          <>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Masukkan Keranjang
          </>
        ) : (
          "Habis"
        )}
      </button>

      <div className="mt-auto pt-4 border-t border-border text-xs text-muted text-center">
        Data contoh untuk demonstrasi
      </div>
    </article>
  );
}
