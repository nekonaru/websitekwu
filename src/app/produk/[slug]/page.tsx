"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  AlertCircle,
  Check,
  Package,
  ShieldCheck,
  Store,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
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
  createdAt?: string;
}

function judulKategori(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(" ");
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
    window.setTimeout(() => setAdded(false), 2500);
  }

  if (loading)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-9 w-3/4 rounded" />
            <div className="skeleton h-8 w-1/3 rounded" />
            <div className="skeleton h-24 w-full rounded-xl" />
            <div className="skeleton h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted" aria-hidden="true" />
        <h1 className="mb-3 text-2xl font-bold text-heading">
          Produk tidak ditemukan
        </h1>
        <p className="mb-8 text-muted">
          Produk yang Anda cari mungkin sudah tidak tersedia. Lihat apa saja di katalog.
        </p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
        >
          Kembali ke katalog
        </Link>
      </div>
    );

  const inStock = product.stock > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Remah roti */}
      <nav
        aria-label="Remah roti"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted"
      >
        <Link
          href="/"
          className="transition-colors duration-200 hover:text-primary"
        >
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link
          href="/katalog"
          className="transition-colors duration-200 hover:text-primary"
        >
          Katalog
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link
              href={`/katalog?category=${product.category}`}
              className="transition-colors duration-200 hover:text-primary"
            >
              {judulKategori(product.category)}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="truncate font-medium text-heading">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gambar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-neutral-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            {!inStock && (
              <span className="absolute bottom-3 left-3 rounded-full bg-neutral-900/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                Stok Habis
              </span>
            )}
            {product.isFeatured && inStock && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                Produk Unggulan
              </span>
            )}
          </div>

          {source === "contoh" && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-warning-100 bg-warning-50 p-3 text-sm text-warning-800">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              Halaman ini memakai data contoh. Data katalog lengkap akan tampil
              setelah basis data toko siap.
            </p>
          )}
        </div>

        {/* Informasi */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Link
                href={`/katalog?category=${product.category}`}
                className="mb-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
              >
                {judulKategori(product.category)}
              </Link>
            )}
            <h1 className="text-2xl font-bold leading-tight text-heading md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-3xl font-extrabold text-primary">
              {formatRupiah(product.price)}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 font-semibold text-success-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-600" />
                  Tersedia
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-2.5 py-1 font-semibold text-danger-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />
                  Stok Habis
                </span>
              )}
              <span className="text-muted">Stok: {product.stock}</span>
              {product.createdAt && (
                <span className="text-muted">
                  Diperbarui {formatDate(product.createdAt)}
                </span>
              )}
            </p>
          </div>

          {product.shortDescription && (
            <p className="text-base leading-relaxed text-body">
              {product.shortDescription}
            </p>
          )}

          <div>
            <h2 className="mb-2 text-lg font-bold text-heading">Deskripsi</h2>
            <p className="leading-relaxed text-body">{product.description}</p>
          </div>

          {/* Jumlah dan tombol */}
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-heading"
                >
                  Jumlah
                </label>
                <div className="inline-flex items-center rounded-xl border border-border bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((n) => Math.max(1, n - 1))
                    }
                    disabled={!inStock || quantity <= 1}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-l-xl text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
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
                          Math.min(
                            Number(e.target.value) || 1,
                            product.stock
                          )
                        )
                      )
                    }
                    disabled={!inStock}
                    className="h-11 w-16 border-x border-border bg-transparent text-center text-base font-semibold text-heading focus:outline-none focus:ring-4 focus:ring-orange-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Jumlah produk"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((n) => Math.min(product.stock, n + 1))
                    }
                    disabled={!inStock || quantity >= product.stock}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-r-xl text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted sm:text-right">
                Subtotal
                <span className="mt-0.5 block text-xl font-extrabold text-heading">
                  {formatRupiah(product.price * quantity)}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-all duration-200 active:scale-[0.99] ${
                inStock
                  ? added
                    ? "bg-success-600 text-white shadow-lg"
                    : "bg-primary text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
                  : "cursor-not-allowed border border-neutral-200 bg-neutral-50 text-neutral-400"
              }`}
            >
              {inStock ? (
                added ? (
                  <>
                    <Check className="h-5 w-5" aria-hidden="true" /> Sudah masuk
                    keranjang
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
                className="block text-center text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover"
              >
                Lihat keranjang
              </Link>
            )}
          </div>

          {/* Keunggulan singkat */}
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                judul: "Pesanan tercatat",
                desc: "Tersimpan pada basis data KWU",
              },
              {
                icon: Store,
                judul: "Katalog resmi",
                desc: "Produk dikelola oleh admin toko",
              },
            ].map((item) => (
              <li
                key={item.judul}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-heading">
                    {item.judul}
                  </span>
                  <span className="block text-xs text-muted">{item.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
