"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border bg-white"
            aria-hidden="true"
          >
            <div className="skeleton aspect-[4/5] w-full" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
        <PackageOpen
          className="mx-auto mb-4 h-10 w-10 text-muted"
          aria-hidden="true"
        />
        <p className="mb-1 font-bold text-heading">Belum ada produk</p>
        <p className="mb-5 text-sm text-muted">
          Katalog akan diperbarui segera. Sementara ini Anda dapatagate
          menghubungi admin untuk menanyakan kebutuhan Anda.
        </p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
        >
          Buka katalog <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <>
      {source === "contoh" && (
        <p className="mb-4 rounded-xl border border-warning-100 bg-warning-50 p-3 text-sm text-warning-800">
          Produk di bawah ini memakai data contoh.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
