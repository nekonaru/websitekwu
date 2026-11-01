/**
 * API Route: POST /api/quotations/[id]/convert
 * Konversi quotation yang disetujui menjadi pesanan B2B (admin only).
 */
import { NextResponse } from "next/server";
import { tolakBilaBukanAdmin } from "@/lib/api-auth";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { convertQuotationToOrder } from "@/services/quotation.service";
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
    const hasilAdmin = await tolakBilaBukanAdmin(
      toSupabaseCookieStore(await cookies()),
      "quotations/[id]/convert"
    );
    if ("response" in hasilAdmin) return hasilAdmin.response;

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
    return responsGalat(err, "POST /api/quotations/[id]/convert", "Gagal mengonversi quotation menjadi pesanan");
  }
}
