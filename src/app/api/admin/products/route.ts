/**
 * API Route: GET /api/admin/products
 * Daftar semua produk untuk admin (termasuk draft).
 */
import { NextResponse } from "next/server";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { getErrorMessage } from "@/lib/format";
import { createServiceSupabaseClient, toSupabaseCookieStore } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { createProductAdmin, toProduct, type ProductRow } from "@/services/product.service";
import { z } from "zod";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
    const admin = await requireAdmin(
      toSupabaseCookieStore(await cookies())
    );
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 401 }
      );
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
    console.error("GET /api/admin/products error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal memuat produk") },
      { status: 500 }
    );
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
  imageUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(
      toSupabaseCookieStore(await cookies())
    );
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 401 }
      );
    }

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
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal membuat produk") },
      { status: 400 }
    );
  }
}


