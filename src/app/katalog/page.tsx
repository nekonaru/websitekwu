"use client";

import { useEffect, useState } from "react";
import { Filter, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function Katalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"database" | "contoh">("database");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const PAGE_SIZE = 9;

  useEffect(() => {
    let aktif = true;

    async function loadData() {
      try {
        let daftarProduk: Product[] = [];
        let sumber: "database" | "contoh" = "database";

        if (query) {
          const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          daftarProduk = data.success ? data.data : [];
          sumber = data.source ?? "database";
        } else if (categoryFilter) {
          const res = await fetch(`/api/products?category=${categoryFilter}`);
          const data = await res.json();
          daftarProduk = data.success ? data.data : [];
          sumber = data.source ?? "database";
        } else {
          const res = await fetch("/api/products");
          const data = await res.json();
          daftarProduk = data.success ? data.data : [];
          sumber = data.source ?? "database";
        }

        if (!aktif) return;

        const uniqueCategories = [
          ...new Set(
            daftarProduk
              .map((p) => p.category)
              .filter((c): c is string => Boolean(c))
          ),
        ];
        setCategories(uniqueCategories);
        setProducts(daftarProduk);
        setSource(sumber);
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
  }, [categoryFilter, query]);

  const totalPages = Math.max(Math.ceil(products.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside
          className={`lg:w-64 lg:flex-shrink-0 ${
            filterOpen
              ? "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border p-6 transform transition-transform duration-200"
              : "hidden lg:block p-0"
          }`}
        >
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-heading">Filter</h2>
            <button
              onClick={() => setFilterOpen(false)}
              className="text-muted hover:text-heading"
              aria-label="Tutup filter"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-heading mb-3">Kategori</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setLoading(true);
                    setCategoryFilter("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !categoryFilter ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setLoading(true);
                      setCategoryFilter(cat);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      categoryFilter === cat ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-heading mb-3">Harga</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-muted hover:bg-neutral-100"
                >
                  Semua harga
                </button>
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-muted hover:bg-neutral-100"
                >
                  Di bawah Rp 50.000
                </button>
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-muted hover:bg-neutral-100"
                >
                  Rp 50.000 - Rp 200.000
                </button>
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-muted hover:bg-neutral-100"
                >
                  Di atas Rp 200.000
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-heading">Katalog Produk</h1>
              <p className="text-muted">
                Temukan produk yang Anda butuhkan untuk keperluan kampus.
              </p>
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white text-sm font-medium text-heading hover:bg-neutral-50 transition-colors md:hidden"
            >
              <Filter className="h-4 w-4" aria-hidden="true" /> Filter
            </button>
          </div>

          {source === "contoh" && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800">
              Katalog sedang menampilkan data contoh. Data katalog lengkap
              akan tampil setelah basis data toko siap.
            </div>
          )}

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => {
                setLoading(true);
                setQuery(e.target.value);
              }}
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Cari produk"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted mb-4">
            <span className="font-medium text-heading">
              {paginated.length} dari {products.length} produk
            </span>
            {query && <span>untuk pencarian “{query}”</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
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
              ))
            ) : paginated.length > 0 ? (
              paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted">
                Produk tidak ditemukan. Coba ubah kata kunci atau filter.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-heading disabled:text-neutral-400 disabled:border-neutral-200 hover:bg-neutral-50 transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-heading disabled:text-neutral-400 disabled:border-neutral-200 hover:bg-neutral-50 transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
