"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, AlertCircle, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/contexts/cart-context";

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
  const [source, setSource] = useState<"database" | "contoh">("database");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    let aktif = true;

    async function load() {
      const { slug } = await params;
      try {
        const res = await fetch(`/api/produk/${slug}`);
        const data = await res.json();
        if (!aktif) return;
        setProduct(data.success ? data.data : null);
        setSource(data.source ?? "database");
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

  function handleAddToCart() {
    if (!product || product.stock <= 0) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        image: product.image,
      },
      quantity
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  if (loading)
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-muted">
        Memuat produk...
      </div>
    );

  if (!product)
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-heading mb-4">
          Produk tidak ditemukan
        </h1>
        <Link href="/katalog" className="text-primary hover:underline">
          Kembali ke katalog
        </Link>
      </div>
    );

  const inStock = product.stock > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex gap-1 mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-primary transition-colors">
          Beranda
        </Link>
        <span className="text-neutral-400">/</span>
        <Link href="/katalog" className="hover:text-primary transition-colors">
          Katalog
        </Link>
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
            />
            {!inStock && (
              <span className="absolute bottom-2 left-2 bg-orange-900 text-orange-100 text-xs font-bold px-2 py-1 rounded-full">
                Stok Habis
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-heading">{product.name}</h1>
            <p className="text-primary text-2xl font-bold mt-1">
              {formatRupiah(product.price)}
            </p>
            <p className="mt-3 text-sm text-heading flex items-center gap-2">
              {inStock ? (
                <span className="text-green-600">Tersedia</span>
              ) : (
                <span className="text-orange-600">Stok Habis</span>
              )}
              <span className="text-neutral-400">•</span>
              <span>Stok: {product.stock}</span>
            </p>
          </div>

          <div>
            <h2 className="font-bold text-heading mb-3">Deskripsi</h2>
            <p className="text-body leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <label htmlFor="quantity" className="font-medium text-heading">
              Jumlah
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={inStock ? product.stock : 0}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(Number(e.target.value) || 1, product.stock)
                  )
                )
              }
              disabled={!inStock}
              className={`w-full pl-3 pr-4 py-3 border rounded-lg text-heading ${
                !inStock
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "focus:outline-none focus:ring-2 focus:ring-primary"
              }`}
              aria-label="Jumlah produk"
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
              inStock
                ? "bg-primary text-white hover:bg-orange-500 shadow-lg shadow-orange-500/25"
                : "border border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
            }`}
          >
            {inStock ? (
              added ? (
                <>
                  <Check className="h-5 w-5" aria-hidden="true" />
                  Masuk keranjang
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  Masukkan ke Keranjang
                </>
              )
            ) : (
              "Stok Habis"
            )}
          </button>

          {added && (
            <Link
              href="/keranjang"
              className="block text-center text-sm text-primary hover:underline"
            >
              Lihat keranjang
            </Link>
          )}

          {source === "contoh" && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <AlertCircle
                  className="h-4 w-4 mr-2 inline-block"
                  aria-hidden="true"
                />
                Halaman ini memakai data contoh. Data katalog lengkap akan
                tampil setelah basis data toko siap.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
