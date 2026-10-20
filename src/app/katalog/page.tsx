"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/services/product.service";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stock > 0;
  return (
    <article className="flex flex-col border border-border rounded-2xl p-5 bg-white hover:shadow-2xl transition-all duration-300 hover:border-primary/50 group">
      <div className="aspect-[4/5] overflow-hidden rounded-xl mb-4 relative bg-neutral-100 group-hover:scale-105 transition-transform duration-300">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!inStock && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              Stok Habis
            </span>
          </span>
        )}
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
        {inStock ? "Masukkan Keranjang" : "Habis"}
      </button>
    </article>
  );
}

export default function Katalog() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") ?? "");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1));
  const [filterOpen, setFilterOpen] = useState(false);

  const PAGE_SIZE = 9;

  useEffect(() => {
    loadData();
  }, [categoryFilter, query]);

  async function loadData() {
    setLoading(true);
    try {
      let products: Product[] = [];
      if (query) {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        products = data.success ? data.data : [];
      } else if (categoryFilter) {
        const res = await fetch(`/api/products?category=${categoryFilter}`);
        const data = await res.json();
        products = data.success ? data.data : [];
      } else {
        const res = await fetch("/api/products");
        const data = await res.json();
        products = data.success ? data.data : [];
      }

      const uniqueCategories = [...new Set(products.map((p) => p.category))];
      setCategories(uniqueCategories);
      setProducts(products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
                  onClick={() => setCategoryFilter("")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !categoryFilter ? "bg-primary text-white" : "text-heading hover:bg-neutral-100"
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      categoryFilter === cat ? "bg-primary text-white" : "text-heading hover:bg-neutral-100"
                    }`}
                  >
                    {cat}
                  </button>
                )}
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

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            {paginated.length > 0 ? (
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
