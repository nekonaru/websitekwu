/**
 * API Route: GET /api/rfqs/[id]
 * Detail RFQ beserta item, riwayat status, dan daftar quotation.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { CookieMethodsServer } from "@supabase/ssr";
import { getRfqById, getQuotationsByRfq } from "@/services/rfq.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = cookies as unknown as () => CookieMethodsServer;

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
  } catch (err: any) {
    console.error("GET /api/rfqs/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal memuat detail RFQ" },
      { status: 400 }
    );
  }
}
