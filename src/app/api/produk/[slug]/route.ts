/**
 * API Route: GET /api/produk/[slug]
 * Detail satu produk untuk halaman produk.
 */
import { NextResponse } from "next/server";
import { getProductBySlug } from "@/services/product.service";
import { getErrorMessage } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug produk tidak valid" },
        { status: 422 }
      );
    }

    const product = await getProductBySlug({ slug });

    if (!product.data) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product.data,
      source: product.source,
    });
  } catch (err: unknown) {
    console.error("GET /api/produk/[slug] error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal memuat produk") },
      { status: 500 }
    );
  }
}
