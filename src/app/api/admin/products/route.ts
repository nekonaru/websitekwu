/**
 * API Route: GET /api/admin/products
 * Daftar semua produk untuk admin (termasuk draft).
 */
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.short_description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        image: p.image_url,
        isFeatured: p.is_featured,
        isDraft: p.is_draft,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/admin/products error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal memuat produk" },
      { status: 500 }
    );
  }
}

/**
 * API Route: POST /api/admin/products
 * Buat produk baru (admin).
 */
import { z } from "zod";

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
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { createProductAdmin } = require("@/services/product.service");
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
  } catch (err: any) {
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal membuat produk" },
      { status: 400 }
    );
  }
}


