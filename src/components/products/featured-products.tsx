"use client";

import { useEffect, useState } from "react";
import { ProductCard, type ProductCardProps } from "@/components/products/product-card";

interface FeaturedProductsProps {
  limit?: number;
}

export function FeaturedProducts({ limit = 4 }: FeaturedProductsProps) {
  const [products, setProducts] = useState<ProductCardProps["product"][]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"database" | "contoh">("database");

  useEffect(() => {
    let aktif = true;

    async function loadFeatured() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!aktif) return;
        if (data.success) {
          const daftar = (data.data as ProductCardProps["product"][]).filter(
            (p) => p.stock > 0
          );
          setProducts(daftar.slice(0, limit));
          setSource(data.source ?? "database");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      aktif = false;
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={index}
            className="border border-border rounded-2xl p-5 bg-white animate-pulse"
            aria-hidden="true"
          >
            <div className="aspect-[4/5] rounded-xl mb-4 bg-neutral-200" />
            <div className="h-4 w-3/4 rounded bg-neutral-200 mb-3" />
            <div className="h-5 w-1/2 rounded bg-neutral-200 mb-3" />
            <div className="h-10 w-full rounded-xl bg-neutral-200" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-muted py-10">
        Belum ada produk yang bisa ditampilkan. Katalog akan diperbarui
        segera.
      </p>
    );
  }

  return (
    <>
      {source === "contoh" && (
        <p className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800">
          Produk di bawah ini memakai data contoh.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
