/**
 * API Route: GET /api/admin/products/[id]
 * Detail produk untuk admin.
 */
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.short_description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        image: data.image_url,
        isFeatured: data.is_featured,
        isDraft: data.is_draft,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal memuat produk" },
      { status: 500 }
    );
  }
}
