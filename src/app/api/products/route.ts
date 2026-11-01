/**
 * API Route: GET /api/products
 * Daftar produk publik (dengan filter kategori, pencarian, dan rentang harga).
 * Sertakan daftar kategori agar sisi klien bisa menampilkan filter lengkap
 * tanpa melakukan permintaan tambahan.
 */
import { NextResponse } from "next/server";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import {
  getPublishedProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
} from "@/services/product.service";

export async function GET(req: Request) {
  // Endpoint publik: batasi agar tidak dipakai membanjiri server.
  const diblokir = tanggapiJikaMelebihi(req, 120, 60_000);
  if (diblokir) return diblokir;

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

    // Katalog bersifat publik dan jarang berubah: izinkan cache CDN
    // sehingga pengunjung berikutnya tidak menunggu query basis data.
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        source: result.source,
        categories: kategori.map((k) => k.slug),
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=30, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: unknown) {
    return responsGalat(err, "GET /api/products", "Gagal memuat produk");
  }
}
