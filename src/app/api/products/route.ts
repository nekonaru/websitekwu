/**
 * API Route: GET /api/products
 * Daftar produk publik (dengan filter kategori dan pencarian).
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import {
  getPublishedProducts,
  searchProducts,
  getProductsByCategory,
} from "@/services/product.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const q = searchParams.get("q") || undefined;

    let products;
    if (q) {
      products = await searchProducts({ query: q });
    } else if (category) {
      products = await getProductsByCategory({ categorySlug: category });
    } else {
      products = await getPublishedProducts();
    }

    return NextResponse.json({ success: true, data: products });
  } catch (err: unknown) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal memuat produk") },
      { status: 500 }
    );
  }
}
