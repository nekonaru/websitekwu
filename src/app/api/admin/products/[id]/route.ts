/**
 * API Route: GET /api/admin/products/[id]
 * Detail produk untuk admin.
 */
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { updateProductAdmin } = require("@/services/product.service");
    const data = await updateProductAdmin(id, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      shortDescription: parsed.data.shortDescription,
      price: parsed.data.price,
      stock: parsed.data.stock,
      category: parsed.data.category,
      imageUrl: parsed.data.imageUrl,
      isFeatured: parsed.data.isFeatured,
      isDraft: (parsed.data as any).isDraft ?? false,
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("PATCH /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal memperbarui produk" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deleteProductAdmin } = require("@/services/product.service");
    await deleteProductAdmin(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/products/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal menghapus produk" },
      { status: 400 }
    );
  }
}
