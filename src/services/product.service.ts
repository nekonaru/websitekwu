/**
 * Layer layanan produk KWU.
 * Saat Supabase belum dikonfigurasi, fallback ke data mock di src/lib/data.ts.
 * Saat Supabase dikonfigurasi, semua data diambil dari database.
 */
import {
  createBrowserSupabaseClient,
  createServerSupabaseClient,
  createServiceSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { SupabaseCookieStore } from "@/lib/supabase";

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
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

/** Bentuk baris tabel `products` di database Supabase. */
interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
  is_featured: boolean | null;
  is_draft: boolean | null;
  created_at: string;
  updated_at: string;
}

/** Bentuk baris tabel `categories` di database Supabase. */
interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/** Ubah baris database menjadi objek produk yang dipakai aplikasi. */
function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    shortDescription: row.short_description ?? "",
    price: row.price,
    stock: row.stock,
    category: row.category,
    image: row.image_url ?? "",
    isFeatured: row.is_featured ?? false,
    isDraft: row.is_draft ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ------------------------------------------------------------------ */
/* Fallback data mock (digunakan saat Supabase belum dikonfigurasi)   */
/* ------------------------------------------------------------------ */

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Alat Tulis", slug: "alat-tulis" },
  { id: "2", name: "Elektronik", slug: "elektronik" },
  { id: "3", name: "Pakaian", slug: "pakaian" },
  { id: "4", name: "Makanan & Minuman", slug: "makanan-minuman" },
  { id: "5", name: "Kesehatan", slug: "kesehatan" },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Buku Tulis Contoh A5",
    slug: "buku-tulis-contoh-a5",
    description: "Buku tulis contoh untuk keperluan kuliah, kertas berkualitas, 60 lembar.",
    shortDescription: "Buku tulis contoh A5, 60 lembar.",
    price: 15000,
    stock: 120,
    category: "alat-tulis",
    image: "https://placehold.co/400x500/orange/white?text=Buku+Tulis+Contoh+A5",
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
    image: "https://placehold.co/400x500/blue/white?text=Tinta+Bolpoin+Contoh",
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
    image: "https://placehold.co/400x500/orange/white?text=Kaos+KWU+Contoh",
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
    image: "https://placehold.co/400x500/blue/white?text=Power+Bank+10000mAh",
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
    image: "https://placehold.co/400x500/orange/white?text=Snack+Kotak+Contoh",
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
    image: "https://placehold.co/400x500/blue/white?text=Masker+Kesehatan",
  },
];

function mockProductToDbProduct(p: typeof MOCK_PRODUCTS[0]): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: p.price,
    stock: p.stock,
    category: p.category,
    image: p.image,
    isFeatured: p.isFeatured,
    isDraft: p.isDraft,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Kategori                                                           */
/* ------------------------------------------------------------------ */

/** Ambil semua kategori. */
export async function getCategories({
  cookies,
}: {
  cookies?: () => SupabaseCookieStore;
} = {}): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_CATEGORIES;
  }

  const supabase = cookies
    ? await createServerSupabaseClient(cookies())
    : createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories error:", error);
    return MOCK_CATEGORIES;
  }

  return (data ?? []).map((c: CategoryRow) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    createdAt: c.created_at,
  }));
}

/* ------------------------------------------------------------------ */
/* Produk                                                             */
/* ------------------------------------------------------------------ */

/** Ambil semua produk yang terbit (bukan draft). */
export async function getPublishedProducts({
  cookies,
}: {
  cookies?: () => SupabaseCookieStore;
} = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS.map(mockProductToDbProduct);
  }

  const supabase = cookies
    ? await createServerSupabaseClient(cookies())
    : createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_draft", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedProducts error:", error);
    return MOCK_PRODUCTS.map(mockProductToDbProduct);
  }

  return (data ?? []).map((p: ProductRow) => toProduct(p));
}

/** Ambil produk yang unggul (featured). */
export async function getFeaturedProducts({
  cookies,
}: {
  cookies?: () => SupabaseCookieStore;
} = {}): Promise<Product[]> {
  const all = await getPublishedProducts({ cookies });
  return all.filter((p) => p.isFeatured);
}

/** Ambil produk berdasarkan slug. */
export async function getProductBySlug({
  slug,
  cookies,
}: {
  slug: string;
  cookies?: () => SupabaseCookieStore;
}): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const found = MOCK_PRODUCTS.find(
      (p) => p.slug === slug && !p.isDraft
    );
    return found ? mockProductToDbProduct(found) : null;
  }

  const supabase = cookies
    ? await createServerSupabaseClient(cookies())
    : createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_draft", false)
    .single();

  if (error || !data) {
    return null;
  }

  const p = data as ProductRow;
  return toProduct(p);
}

/** Cari produk berdasarkan nama atau deskripsi. */
export async function searchProducts({
  query,
  cookies,
}: {
  query: string;
  cookies?: () => SupabaseCookieStore;
}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        !p.isDraft &&
        (p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q))
    ).map(mockProductToDbProduct);
  }

  const supabase = cookies
    ? await createServerSupabaseClient(cookies())
    : createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_draft", false)
    .or(
      `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("searchProducts error:", error);
    return [];
  }

  return (data ?? []).map((p: ProductRow) => toProduct(p));
}

/** Ambil produk berdasarkan kategori. */
export async function getProductsByCategory({
  categorySlug,
  cookies,
}: {
  categorySlug: string;
  cookies?: () => SupabaseCookieStore;
}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS.filter(
      (p) => p.category === categorySlug && !p.isDraft
    ).map(mockProductToDbProduct);
  }

  const supabase = cookies
    ? await createServerSupabaseClient(cookies())
    : createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", categorySlug)
    .eq("is_draft", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProductsByCategory error:", error);
    return [];
  }

  return (data ?? []).map((p: ProductRow) => toProduct(p));
}

/* ------------------------------------------------------------------ */
/* Admin: manajemen produk (hanya server, butuh service-role)        */
/* ------------------------------------------------------------------ */

/** Buat produk baru (admin). Butuh service-role key. */
export async function createProductAdmin(input: {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  isFeatured?: boolean;
}) {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      short_description: input.shortDescription,
      price: input.price,
      stock: input.stock,
      category: input.category,
      image_url: input.imageUrl,
      is_featured: input.isFeatured ?? false,
      is_draft: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Perbarui produk (admin). Butuh service-role key. */
export async function updateProductAdmin(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    isFeatured: boolean;
    isDraft: boolean;
  }>
) {
  const supabase = createServiceSupabaseClient();

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.shortDescription !== undefined)
    updateData.short_description = input.shortDescription;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.stock !== undefined) updateData.stock = input.stock;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
  if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured;
  if (input.isDraft !== undefined) updateData.is_draft = input.isDraft;

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Hapus produk (admin). Butuh service-role key. */
export async function deleteProductAdmin(id: string) {
  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Admin: manajemen kategori                                          */
/* ------------------------------------------------------------------ */

export async function createCategoryAdmin(input: {
  name: string;
  slug: string;
}) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: input.name, slug: input.slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategoryAdmin(id: string) {
  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
