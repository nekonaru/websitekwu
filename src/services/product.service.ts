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
import {
  bacaBasisData,
  tulisBasisData,
  buatId,
  type ProdukBerkas,
} from "@/lib/file-db";
import { CATEGORIES, PRODUCTS } from "@/lib/data";

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

/** Ubah baris berkas menjadi objek produk yang dipakai aplikasi. */
function toProductBerkas(row: ProdukBerkas): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    price: row.price,
    stock: row.stock,
    category: row.category,
    image: row.image_url,
    isFeatured: row.is_featured,
    isDraft: row.is_draft,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

/** Bentuk baris tabel `products` di database Supabase. */
export interface ProductRow {
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
export function toProduct(row: ProductRow): Product {
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

const MOCK_CATEGORIES: Category[] = CATEGORIES;

const MOCK_PRODUCTS: Product[] = PRODUCTS.map((p) => ({
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
}));

/* ------------------------------------------------------------------ */
/* Sumber data                                                        */
/* ------------------------------------------------------------------ */

/**
 * Menentukan dari mana daftar produk berasal.
 * "database" berarti data diambil dari Supabase.
 * "contoh" berarti memakai data contoh sebagai fallback.
 */
export type DataSource = "database" | "contoh";

export interface DataResult<T> {
  data: T;
  source: DataSource;
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
    const db = await bacaBasisData();
    return db.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      createdAt: c.created_at,
    }));
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
} = {}): Promise<DataResult<Product[]>> {
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    return {
      data: db.products
        .filter((p) => !p.is_draft)
        .map((p) => toProductBerkas(p)),
      source: "database",
    };
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
    return { data: MOCK_PRODUCTS, source: "contoh" };
  }

  return {
    data: (data ?? []).map((p: ProductRow) => toProduct(p)),
    source: "database",
  };
}

/** Ambil produk yang unggul (featured). */
export async function getFeaturedProducts({
  cookies,
}: {
  cookies?: () => SupabaseCookieStore;
} = {}): Promise<DataResult<Product[]>> {
  const all = await getPublishedProducts({ cookies });
  return {
    data: all.data.filter((p) => p.isFeatured),
    source: all.source,
  };
}

/** Ambil produk berdasarkan slug. */
export async function getProductBySlug({
  slug,
  cookies,
}: {
  slug: string;
  cookies?: () => SupabaseCookieStore;
}): Promise<DataResult<Product | null>> {
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    const found = db.products.find((p) => p.slug === slug && !p.is_draft);
    return {
      data: found ? toProductBerkas(found) : null,
      source: "database",
    };
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

  if (error) {
    console.error("getProductBySlug error:", error);
    const cadangan = MOCK_PRODUCTS.find(
      (p) => p.slug === slug && !p.isDraft
    );
    return { data: cadangan ?? null, source: "contoh" };
  }

  if (!data) {
    return { data: null, source: "database" };
  }

  const p = data as ProductRow;
  return { data: toProduct(p), source: "database" };
}

/** Cari produk berdasarkan nama atau deskripsi. */
export async function searchProducts({
  query,
  cookies,
}: {
  query: string;
  cookies?: () => SupabaseCookieStore;
}): Promise<DataResult<Product[]>> {
  if (!isSupabaseConfigured()) {
    const q = query.toLowerCase();
    const db = await bacaBasisData();
    return {
      data: db.products
        .filter(
          (p) =>
            !p.is_draft &&
            (p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q))
        )
        .map((p) => toProductBerkas(p)),
      source: "database",
    };
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
    return { data: [], source: "database" };
  }

  return {
    data: (data ?? []).map((p: ProductRow) => toProduct(p)),
    source: "database",
  };
}

/** Ambil produk berdasarkan kategori. */
export async function getProductsByCategory({
  categorySlug,
  cookies,
}: {
  categorySlug: string;
  cookies?: () => SupabaseCookieStore;
}): Promise<DataResult<Product[]>> {
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    return {
      data: db.products
        .filter((p) => p.category === categorySlug && !p.is_draft)
        .map((p) => toProductBerkas(p)),
      source: "database",
    };
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
    return { data: [], source: "database" };
  }

  return {
    data: (data ?? []).map((p: ProductRow) => toProduct(p)),
    source: "database",
  };
}

/* ------------------------------------------------------------------ */
/* Admin: manajemen produk (hanya server, butuh service-role)        */
/* ------------------------------------------------------------------ */

/** Buat produk baru (admin). Saat Supabase belum dikonfigurasi, simpan ke berkas. */
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
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    const sekarang = new Date().toISOString();
    const produk: ProdukBerkas = {
      id: buatId(),
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
      created_at: sekarang,
      updated_at: sekarang,
    };
    db.products.unshift(produk);
    await tulisBasisData(db);
    return produk;
  }

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
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    const indeks = db.products.findIndex((p) => p.id === id);
    if (indeks < 0) throw new Error("Produk tidak ditemukan");

    const produk = db.products[indeks];
    if (input.name !== undefined) produk.name = input.name;
    if (input.slug !== undefined) produk.slug = input.slug;
    if (input.description !== undefined)
      produk.description = input.description;
    if (input.shortDescription !== undefined)
      produk.short_description = input.shortDescription;
    if (input.price !== undefined) produk.price = input.price;
    if (input.stock !== undefined) produk.stock = input.stock;
    if (input.category !== undefined) produk.category = input.category;
    if (input.imageUrl !== undefined) produk.image_url = input.imageUrl;
    if (input.isFeatured !== undefined)
      produk.is_featured = input.isFeatured;
    if (input.isDraft !== undefined) produk.is_draft = input.isDraft;
    produk.updated_at = new Date().toISOString();

    db.products[indeks] = produk;
    await tulisBasisData(db);
    return produk;
  }

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

/** Hapus produk (admin). Saat Supabase belum dikonfigurasi, hapus dari berkas. */
export async function deleteProductAdmin(id: string) {
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    const awal = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length === awal) throw new Error("Produk tidak ditemukan");
    await tulisBasisData(db);
    return;
  }

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
