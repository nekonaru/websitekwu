/**
 * API Route: POST /api/quotations/[id]/convert
 * Konversi quotation yang disetujui menjadi pesanan B2B (admin only).
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { convertQuotationToOrder } from "@/services/quotation.service";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { toSupabaseCookieStore } from "@/lib/supabase";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const diblokir = tanggapiJikaMelebihi(req, 20, 60_000);
  if (diblokir) return diblokir;

  try {
    // convertQuotationToOrder memakai service-role tanpa cek peran,
    // jadi wajib diverifikasi di sini sebelum melanjutkan.
    const admin = await requireAdmin(toSupabaseCookieStore(await cookies()));
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const parsedParams = paramsSchema.safeParse({ id });
    if (!parsedParams.success) {
      return NextResponse.json(
        { success: false, error: "ID quotation tidak valid" },
        { status: 422 }
      );
    }

    const result = await convertQuotationToOrder({ quotationId: id });

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: result.orderNumber,
        status: result.status,
      },
    });
  } catch (err: unknown) {
    console.error("POST /api/quotations/[id]/convert error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal mengonversi quotation menjadi pesanan") },
      { status: 400 }
    );
  }
}
