"use client";

import { useCallback, useMemo, useState } from "react";
import { Filter, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { getPublishedProducts, getProductsByCategory, searchProducts } from "@/lib/data";

interface CatalogPageProps {
  searchParams: { category?: string; q?: string; page?: string };
}

export default function Katalog({ searchParams }: CatalogPageProps) {
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.category ?? ""
  );
  const [query, setQuery] = useState(searchParams.q ?? "");
  const [page, setPage] = useState(Math.max(parseInt(searchParams.page ?? "1", 10), 1));
  const [filterOpen, setFilterOpen] = useState(false);

  const PAGE_SIZE = 9;

  const allProducts = useMemo(() => {
    let result = getPublishedProducts();
    if (categoryFilter) {
      result = getProductsByCategory(categoryFilter);
    }
    if (query) {
      result = searchProducts(query);
    }
    return result;
  }, [categoryFilter, query]);

  const totalPages = Math.max(Math.ceil(allProducts.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return allProducts.slice(start, start + PAGE_SIZE);
  }, [allProducts, currentPage]);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) setPage(currentPage - 1);
  }, [currentPage]);
  const handleNext = useCallback(() => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  }, [currentPage, totalPages]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filter mobile drawer + desktop */}
        <aside
          className={`lg:w-64 lg:flex-shrink-0 ${
            filterOpen ? "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border p-6 transform transition-transform duration-200" : "hidden lg:block p-0"
          }`}
        >
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Filter</h2>
            <button
              onClick={() => setFilterOpen(false)}
              className="text-neutral-600 hover:text-foreground"
              aria-label="Tutup filter"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Kategori</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategoryFilter("")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !categoryFilter
                      ? "bg-primary text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Semua Kategori
                </button>
                {[...new Set(getPublishedProducts().map((p) => p.category))].map(
                  (cat) => {
                    const categoryName = {
                      "alat-tulis": "Alat Tulis",
                      elektronik: "Elektronik",
                      pakaian: "Pakaian",
                      "makanan-minuman": "Makanan & Minuman",
                      kesehatan: "Kesehatan",
                    }[cat] ?? cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          categoryFilter === cat
                            ? "bg-primary text-white"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {categoryName}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Harga</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  Semua harga
                </button>
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  Di bawah Rp 50.000
                </button>
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  Rp 50.000 - Rp 200.000
                </button>
                <button
                  onClick={() => {}}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  Di atas Rp 200.000
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Konten utama katalog */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Katalog Produk</h1>
              <p className="text-neutral-600">
                Temukan produk yang Anda butuhkan untuk keperluan kampus.
              </p>
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-sm font-medium text-foreground hover:bg-neutral-50 transition-colors md:hidden"
            >
              <Filter className="h-4 w-4" aria-hidden="true" /> Filter
            </button>
          </div>

          {/* Pencarian */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Cari produk"
            />
          </div>

          {/* Hasil */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
            <span className="font-medium text-foreground">
              {paginated.length} dari {allProducts.length} produk
            </span>
            {query && (
              <span>untuk pencarian “{query}”</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.length > 0 ? (
              paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-neutral-600">
                Produk tidak ditemukan. Coba ubah kata kunci atau filter.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground disabled:text-neutral-400 disabled:border-neutral-200 hover:bg-neutral-50 transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-neutral-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground disabled:text-neutral-400 disabled:border-neutral-200 hover:bg-neutral-50 transition-colors"
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

