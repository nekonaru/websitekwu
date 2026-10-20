/**
 * Lapisan data sementara (mock) untuk pengembangan dan pengujian
 * tanpa kredensial Saat Supabase dikonfigurasi, ganti implementasi ini
 * dengan panggilan ke Supabase melalui src/lib/supabase.ts.
 *
 * Semua data di sini adalah DATA CONTOH (label jelas sebagai contoh),
 * bukan data operasional nyata, sesuai aturan proyek.
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  isFeatured?: boolean;
  isDraft?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { id: "1", name: "Alat Tulis", slug: "alat-tulis" },
  { id: "2", name: "Elektronik", slug: "elektronik" },
  { id: "3", name: "Pakaian", slug: "pakaian" },
  { id: "4", name: "Makanan & Minuman", slug: "makanan-minuman" },
  { id: "5", name: "Kesehatan", slug: "kesehatan" },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Buku Tulis Contoh A5",
    slug: "buku-tulis-contoh-a5",
    description: "Buku tulis contoh untuk keperluan kuliah, kertas berkualitas, 60 lembar.",
    shortDescription: "Buku tulis contoh A5, 60 lembar.",
    price: 15000,
    stock: 120,
    category: "alat-tulis",
    image: "/placeholder-products/notebook.jpg",
    isFeatured: true,
  },
  {
    id: "p2",
    name: "Tinta Bolpoin Contoh (12 pcs)",
    slug: "tinta-bolpoin-contoh-12-pcs",
    description: "Set bolpoin contoh, 12 buah dalam satu kotak, tinta hitam.",
    shortDescription: "Set bolpoin 12 pcs.",
    price: 48000,
    stock: 50,
    category: "alat-tulis",
    image: "/placeholder-products/pens.jpg",
    isFeatured: true,
  },
  {
    id: "p3",
    name: "Kaos KWU Contoh",
    slug: "kaos-kwu-contoh",
    description: "Kaos cotton contoh dengan logo KWU, berbagai ukuran.",
    shortDescription: "Kaos KWU contoh.",
    price: 95000,
    stock: 30,
    category: "pakaian",
    image: "/placeholder-products/tshirt.jpg",
    isFeatured: true,
  },
  {
    id: "p4",
    name: "Power Bank Contoh 10000mAh",
    slug: "power-bank-contoh-10000mah",
    description: "Power bank contoh kapasitas 10000mAh, dua port USB.",
    shortDescription: "Power bank 10000mAh.",
    price: 185000,
    stock: 15,
    category: "elektronik",
    image: "/placeholder-products/powerbank.jpg",
    isFeatured: true,
  },
  {
    id: "p5",
    name: "Snack Kotak Contoh",
    slug: "snack-kotak-contoh",
    description: "Kotak rass contoh berbagai rasa, untuk stok kantin.",
    shortDescription: "Snack kotak contoh.",
    price: 35000,
    stock: 80,
    category: "makanan-minuman",
    image: "/placeholder-products/snack.jpg",
  },
  {
    id: "p6",
    name: "Masker Kesehatan Contoh (50 pcs)",
    slug: "masker-kesehatan-contoh-50-pcs",
    description: "Masker kesehatan contoh, kotak 50 lembar, 3 lapis.",
    shortDescription: "Masker kesehatan 50 pcs.",
    price: 65000,
    stock: 100,
    category: "kesehatan",
    image: "/placeholder-products/mask.jpg",
  },
];

/** Ambil semua produk yang terbit (bukan draft). */
export function getPublishedProducts(): Product[] {
  return PRODUCTS.filter((p) => !p.isDraft);
}

/** Ambil produk yang unggul (featured). */
export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.isFeatured && !p.isDraft);
}

/** Ambil produk berdasarkan slug. */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug && !p.isDraft);
}

/** Ambil produk berdasarkan kategori. */
export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter(
    (p) => p.category === categorySlug && !p.isDraft
  );
}

/** Cari produk berdasarkan nama atau deskripsi. */
export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      !p.isDraft &&
      (p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q))
  );
}

/** Ambil semua kategori. */
export function getCategories(): Category[] {
  return CATEGORIES;
}
