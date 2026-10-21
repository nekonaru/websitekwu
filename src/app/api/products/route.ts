/**
 * API Route: GET /api/products
 * Daftar produk publik (dengan filter kategori, pencarian, dan rentang harga).
 * Sertakan daftar kategori agar sisi klien bisa menampilkan filter lengkap
 * tanpa melakukan permintaan tambahan.
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import {
  getPublishedProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
} from "@/services/product.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const q = searchParams.get("q") || undefined;

    let result;
    if (q) {
      result = await searchProducts({ query: q });
    } else if (category) {
      result = await getProductsByCategory({ categorySlug: category });
    } else {
      result = await getPublishedProducts();
    }

    const kategori = await getCategories();

    return NextResponse.json({
      success: true,
      data: result.data,
      source: result.source,
      categories: kategori.map((k) => k.slug),
    });
  } catch (err: unknown) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal memuat produk") },
      { status: 500 }
    );
  }
}
