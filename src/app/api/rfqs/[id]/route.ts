/**
 * API Route: GET /api/rfqs/[id]
 * Detail RFQ beserta item, riwayat status, dan daftar quotation.
 */
import { NextResponse } from "next/server";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { getRfqById, getQuotationsByRfq } from "@/services/rfq.service";
import type { SupabaseCookieStore } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const diblokir = tanggapiJikaMelebihi(req, 60, 60_000);
  if (diblokir) return diblokir;

  try {
    const { id } = await params;

    const cookieStore = cookies as unknown as () => SupabaseCookieStore;

    const rfq = await getRfqById({ id, cookies: cookieStore });

    if (!rfq) {
      return NextResponse.json(
        { success: false, error: "RFQ tidak ditemukan" },
        { status: 404 }
      );
    }

    const quotations = await getQuotationsByRfq({
      rfqId: id,
      cookies: cookieStore,
    });

    return NextResponse.json({
      success: true,
      data: { ...rfq, quotations },
    });
  } catch (err: unknown) {
    return responsGalat(err, "GET /api/rfqs/[id]", "Gagal memuat detail RFQ");
  }
}
