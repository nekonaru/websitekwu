/**
 * API Route: GET /api/produk/[slug]
 * Detail satu produk untuk halaman produk.
 */
import { NextResponse } from "next/server";
import { responsGalat } from "@/lib/api-error";
import { getProductBySlug } from "@/services/product.service";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const diblokir = tanggapiJikaMelebihi(req, 120, 60_000);
  if (diblokir) return diblokir;

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

    return NextResponse.json(
      {
        success: true,
        data: product.data,
        source: product.source,
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=30, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: unknown) {
    return responsGalat(err, "GET /api/produk/[slug]", "Gagal memuat produk");
  }
}
