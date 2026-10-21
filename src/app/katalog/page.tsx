"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";
import { ProductCard } from "@/components/products/product-card";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  isFeatured?: boolean;
  isDraft?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const PAGE_SIZE = 9;

const RENTANG_HARGA = [
  { id: "", label: "Semua harga", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "under-50", label: "Di bawah Rp 50.000", min: 0, max: 50000 },
  {
    id: "50-200",
    label: "Rp 50.000 sampai Rp 200.000",
    min: 50000,
    max: 200000,
  },
  {
    id: "over-200",
    label: "Di atas Rp 200.000",
    min: 200000,
    max: Number.POSITIVE_INFINITY,
  },
];

/** Ubah slug kategori menjadi judul yang enak dibaca. */
function judulKategori(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(" ");
}

function KatalogIsi() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryParam = searchParams.get("q") ?? "";
  const kategoriParam = searchParams.get("category") ?? "";
  const hargaParam = searchParams.get("harga") ?? "";
  const halamanParam = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"database" | "contoh">("database");
  const [filterOpen, setFilterOpen] = useState(false);
  const [inputCari, setInputCari] = useState(queryParam);
  const [cariTertunda, setCariTertunda] = useState(queryParam);

  // Tunda pencarian agar tidak memanggil API pada setiap ketikan.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCariTertunda(inputCari);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [inputCari]);

  // Sinkronkan input pencarian dengan parameter URL memakai pola penyesuaian
  // state saat render, bukan di dalam efek.
  const [urlTerakhir, setUrlTerakhir] = useState(queryParam);
  if (urlTerakhir !== queryParam) {
    setUrlTerakhir(queryParam);
    setInputCari(queryParam);
    setCariTertunda(queryParam);
  }

  const perbaruiUrl = useCallback(
    (perubahan: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [kunci, nilai] of Object.entries(perubahan)) {
        if (!nilai) params.delete(kunci);
        else params.set(kunci, nilai);
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  // Muat daftar produk sesuai filter aktif.
  useEffect(() => {
    let aktif = true;

    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cariTertunda) params.set("q", cariTertunda);
        else if (kategoriParam) params.set("category", kategoriParam);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        if (!aktif) return;

        const daftar: Product[] = data.success ? data.data : [];
        setProducts(daftar);
        setSource(data.source ?? "database");
        setCategories(
          Array.isArray(data.categories) && data.categories.length > 0
            ? (data.categories as string[])
            : ([...new Set(daftar.map((p) => p.category).filter(Boolean))] as string[])
        );
      } catch (err) {
        console.error(err);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadData();
    return () => {
      aktif = false;
    };
  }, [cariTertunda, kategoriParam]);

  // Terapkan filter harga di sisi klien.
  const rentangDipilih =
    RENTANG_HARGA.find((r) => r.id === hargaParam) ?? RENTANG_HARGA[0];

  const produkTersaring = useMemo(
    () =>
      products.filter(
        (p) => p.price >= rentangDipilih.min && p.price <= rentangDipilih.max
      ),
    [products, rentangDipilih]
  );

  const totalHalaman = Math.max(
    Math.ceil(produkTersaring.length / PAGE_SIZE),
    1
  );
  const halamanSekarang = Math.min(halamanParam, totalHalaman);
  const produkHalaman = produkTersaring.slice(
    (halamanSekarang - 1) * PAGE_SIZE,
    halamanSekarang * PAGE_SIZE
  );

  const adaFilter = Boolean(queryParam || kategoriParam || hargaParam);

  function pilihKategori(slug: string) {
    perbaruiUrl({ category: slug || null, page: null });
    setFilterOpen(false);
  }

  function pilihHarga(id: string) {
    perbaruiUrl({ harga: id || null, page: null });
    setFilterOpen(false);
  }

  function bersihkanFilter() {
    perbaruiUrl({ q: null, category: null, harga: null, page: null });
    setInputCari("");
    setFilterOpen(false);
  }

  function keHalaman(halaman: number) {
    perbaruiUrl({ page: halaman > 1 ? String(halaman) : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const daftarFilter = (
    <>
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-heading">
          Kategori
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => pilihKategori("")}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
              !kategoriParam
                ? "bg-primary text-white shadow-sm"
                : "text-body hover:bg-primary-soft hover:text-primary"
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((kategori) => (
            <button
              key={kategori}
              type="button"
              onClick={() => pilihKategori(kategori)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                kategoriParam === kategori
                  ? "bg-primary text-white shadow-sm"
                  : "text-body hover:bg-primary-soft hover:text-primary"
              }`}
            >
              {judulKategori(kategori)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-heading">
          Rentang Harga
        </h3>
        <div className="space-y-1">
          {RENTANG_HARGA.map((rentang) => (
            <button
              key={rentang.id || "semua"}
              type="button"
              onClick={() => pilihHarga(rentang.id)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                hargaParam === rentang.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-body hover:bg-primary-soft hover:text-primary"
              }`}
            >
              {rentang.label}
            </button>
          ))}
        </div>
      </div>

      {adaFilter && (
        <button
          type="button"
          onClick={bersihkanFilter}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          Hapus semua filter
        </button>
      )}
    </>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Filter desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <SlidersHorizontal
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              <h2 className="font-bold text-heading">Filter</h2>
            </div>
            {daftarFilter}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Judul dan aksi */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-heading md:text-3xl">
                Katalog Produk
              </h1>
              <p className="mt-1 text-muted">
                Temukan produk yang Anda butuhkan untuk keperluan kampus.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-heading shadow-soft transition-colors duration-200 hover:border-primary hover:text-primary lg:hidden"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filter
              {adaFilter && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                  {
                    [queryParam, kategoriParam, hargaParam].filter(Boolean).length
                  }
                </span>
              )}
            </button>
          </div>

          {source === "contoh" && (
            <div className="mb-4 rounded-xl border border-warning-100 bg-warning-50 p-3 text-sm text-warning-800">
              Katalog sedang menampilkan data contoh. Data katalog lengkap akan
              tampil setelah basis data toko siap.
            </div>
          )}

          {/* Pencarian dan filter aktif */}
          <div className="mb-5 space-y-3">
            <div className="relative max-w-xl">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Cari produk..."
                value={inputCari}
                onChange={(e) => setInputCari(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    perbaruiUrl({ q: inputCari.trim() || null, page: null });
                  }
                }}
                className="w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-heading shadow-soft transition-shadow duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-orange-100"
                aria-label="Cari produk"
              />
            </div>

            {adaFilter && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">Filter:</span>
                {queryParam && (
                  <FilterChip
                    label={`“${queryParam}”`}
                    onRemove={() => {
                      setInputCari("");
                      perbaruiUrl({ q: null, page: null });
                    }}
                  />
                )}
                {kategoriParam && (
                  <FilterChip
                    label={judulKategori(kategoriParam)}
                    onRemove={() => perbaruiUrl({ category: null, page: null })}
                  />
                )}
                {hargaParam && (
                  <FilterChip
                    label={
                      RENTANG_HARGA.find((r) => r.id === hargaParam)?.label ??
                      hargaParam
                    }
                    onRemove={() => perbaruiUrl({ harga: null, page: null })}
                  />
                )}
              </div>
            )}
          </div>

          {/* Ringkasan hasil */}
          <p className="mb-4 text-sm text-muted">
            <span className="font-semibold text-heading">
              {produkTersaring.length} produk
            </span>
            {queryParam && <> untuk pencarian “{queryParam}”</>}
            {kategoriParam && <> dalam kategori {judulKategori(kategoriParam)}</>}
          </p>

          {/* Daftar produk */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-white p-4 lg:p-5"
                  aria-hidden="true"
                >
                  <div className="skeleton mb-4 aspect-[4/5] rounded-xl" />
                  <div className="skeleton mb-3 h-4 w-3/4 rounded" />
                  <div className="skeleton mb-3 h-5 w-1/2 rounded" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                </div>
              ))
            ) : produkHalaman.length > 0 ? (
              produkHalaman.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                <PackageSearch
                  className="mx-auto mb-4 h-10 w-10 text-muted"
                  aria-hidden="true"
                />
                <h2 className="mb-2 text-lg font-bold text-heading">
                  Produk tidak ditemukan
                </h2>
                <p className="mx-auto mb-6 max-w-sm text-sm text-muted">
                  Coba ubah kata kunci atau atur ulang filter untuk melihat
                  produk lain.
                </p>
                {adaFilter && (
                  <button
                    type="button"
                    onClick={bersihkanFilter}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Hapus semua filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalHalaman > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-1.5"
              aria-label="Pagination"
            >
              <button
                type="button"
                onClick={() => keHalaman(halamanSekarang - 1)}
                disabled={halamanSekarang === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-heading transition-colors duration-200 hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              {Array.from({ length: totalHalaman }).map((_, index) => {
                const nomor = index + 1;
                const aktif = nomor === halamanSekarang;
                return (
                  <button
                    key={nomor}
                    type="button"
                    onClick={() => keHalaman(nomor)}
                    aria-current={aktif ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 ${
                      aktif
                        ? "border-primary bg-primary text-white"
                        : "border-border text-body hover:border-primary hover:bg-primary-soft hover:text-primary"
                    }`}
                  >
                    {nomor}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => keHalaman(halamanSekarang + 1)}
                disabled={halamanSekarang === totalHalaman}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-heading transition-colors duration-200 hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* Filter untuk layar kecil */}
      {filterOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            onClick={() => setFilterOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
            aria-label="Tutup filter"
            tabIndex={-1}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl animate-slide-up-sheet">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white px-5 py-4">
              <h2 className="text-lg font-bold text-heading">Filter</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-primary-soft hover:text-primary"
                aria-label="Tutup filter"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-6 p-5">{daftarFilter}</div>

            <div className="sticky bottom-0 border-t border-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-white transition-colors duration-200 hover:bg-primary-hover"
              >
                Tampilkan {produkTersaring.length} produk
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft py-1 pl-3 pr-1.5 text-sm font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary hover:text-white"
        aria-label={`Hapus filter ${label}`}
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

function KerangkaKatalog() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="skeleton h-72 rounded-2xl" />
        </div>
        <div className="flex-1">
          <div className="skeleton mb-4 h-8 w-56 rounded" />
          <div className="skeleton mb-8 h-12 w-full max-w-xl rounded-xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KatalogPage() {
  return (
    <Suspense fallback={<KerangkaKatalog />}>
      <KatalogIsi />
    </Suspense>
  );
}
