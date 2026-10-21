"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  isFeatured: boolean;
}

export default function ProductDetail({
  params,
}: { params: Promise<{ slug: string }> }) {
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktif = true;

    async function load() {
      const { slug } = await params;
      try {
        const res = await fetch(`/api/produk/${slug}`);
        const data = await res.json();
        if (!aktif) return;
        setProduct(data.success ? data.data : null);
      } catch (err) {
        console.error(err);
      } finally {
        if (aktif) setLoading(false);
      }
    }
    load();
    return () => {
      aktif = false;
    };
  }, [params]);

  if (loading) return <div className="max-w-2xl mx-auto py-12 text-center">Memuat produk...</div>;
  if (!product) return <div className="max-w-2xl mx-auto py-12 text-center">Produk tidak ditemukan.</div>;

  const inStock = product.stock > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex gap-1 mb-6 text-sm text-neutral-600">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span className="text-neutral-400">/</span>
        <Link href="/katalog" className="hover:text-primary transition-colors">Katalog</Link>
        <span className="text-neutral-400">/</span>
        <span className="text-heading">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-neutral-50 relative">
            <Image
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              loading="eager"
            />
            {!inStock && (
              <span className="absolute bottom-2 left-2 bg-orange-900 text-orange-100 text-xs font-bold px-2 py-1 rounded-full">
                Stok Habis
              </span>
            )}
          </div>
          <p className="text-xs text-muted text-center">Gambar produk dari database KWU</p>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-heading">{product.name}</h1>
            <p className="text-primary text-2xl font-bold mt-1">{formatRupiah(product.price)}</p>
            <p className="mt-3 text-sm text-heading flex items-center gap-1">
              {inStock ? <span className="text-green-600">Tersedia</span> : <span className="text-orange-600">Stok Habis</span>}
              <span className="text-neutral-400">•</span>
              <span>Stok: {product.stock}</span>
            </p>
          </div>
          <div>
            <h2 className="font-bold text-heading mb-3">Deskripsi</h2>
            <p className="text-body leading-relaxed">{product.description}</p>
          </div>
          <div className="space-y-4">
            <label htmlFor="quantity" className="font-medium text-heading">Jumlah</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={inStock ? product.stock : 0}
              defaultValue={1}
              disabled={!inStock}
              className={`w-full pl-3 pr-4 py-3 border rounded-lg text-heading ${!inStock ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" : "focus:outline-none focus:ring-2 focus:ring-primary"}`}
              aria-label="Jumlah produk"
            />
          </div>
          <button
            disabled={!inStock}
            className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${inStock ? "bg-primary text-white hover:bg-orange-500 shadow-lg shadow-orange-500/25" : "border border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"}`}
          >
            {inStock ? (
              <>
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                Masukkan ke Keranjang
              </>
            ) : (
              "Stok Habis"
            )}
          </button>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <AlertCircle className="h-4 w-4 mr-2" aria-hidden="true" />
              Data ini berasal dari <strong>database KWU</strong> (Supabase). Jika belum dikonfigurasi, data contoh akan ditampilkan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
