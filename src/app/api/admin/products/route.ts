/**
 * API Route: GET /api/admin/products
 * Daftar semua produk untuk admin (termasuk draft).
 */
import { NextResponse } from "next/server";
import { tolakBilaBukanAdmin } from "@/lib/api-auth";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import {
  createServiceSupabaseClient,
  isSupabaseConfigured,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { createProductAdmin, toProduct, type ProductRow } from "@/services/product.service";
import { bacaBasisData } from "@/lib/file-db";
import { z } from "zod";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
    const hasilAdmin = await tolakBilaBukanAdmin(
      toSupabaseCookieStore(await cookies()),
      "admin/products"
    );
    if ("response" in hasilAdmin) return hasilAdmin.response;

    // Mode berkas lokal: ambil semua produk dari data/kwu.json.
    if (!isSupabaseConfigured()) {
      const db = await bacaBasisData();
      return NextResponse.json({ success: true, data: db.products });
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data ?? []).map((p: ProductRow) => toProduct(p)),
    });
  } catch (err: unknown) {
    return responsGalat(err, "GET /api/admin/products", "Gagal memuat produk");
  }
}

/**
 * API Route: POST /api/admin/products
 * Buat produk baru (admin).
 */
const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  description: z.string().min(10),
  shortDescription: z.string().max(500).optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1),
  // Hanya http/https: mencegah skema berbahaya (javascript:, data:) pada
  // URL gambar yang dirender atau diambil server (check 18).
  imageUrl: z
    .string()
    .url("URL gambar tidak valid")
    .refine(
      (u) => u.startsWith("https://") || u.startsWith("http://"),
      "URL gambar harus diawali http:// atau https://"
    )
    .optional()
    .nullable(),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 20, 60_000);
  if (diblokir) return diblokir;

  try {
    const hasilAdmin = await tolakBilaBukanAdmin(
      toSupabaseCookieStore(await cookies()),
      "admin/products"
    );
    if ("response" in hasilAdmin) return hasilAdmin.response;

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = await createProductAdmin({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      shortDescription: parsed.data.shortDescription ?? "",
      price: parsed.data.price,
      stock: parsed.data.stock,
      category: parsed.data.category,
      imageUrl: parsed.data.imageUrl ?? "",
      isFeatured: parsed.data.isFeatured,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: unknown) {
    return responsGalat(err, "POST /api/admin/products", "Gagal membuat produk");
  }
}


