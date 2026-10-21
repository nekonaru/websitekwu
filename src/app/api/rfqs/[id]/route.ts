/**
 * API Route: GET /api/rfqs/[id]
 * Detail RFQ beserta item, riwayat status, dan daftar quotation.
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { cookies } from "next/headers";
import { getRfqById, getQuotationsByRfq } from "@/services/rfq.service";
import type { SupabaseCookieStore } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    console.error("GET /api/rfqs/[id] error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal memuat detail RFQ") },
      { status: 400 }
    );
  }
}
