/**
 * API Route: PATCH /api/quotations/[id]/status
 * Perbarui status quotation (admin only).
 */
import { NextResponse } from "next/server";
import { tolakBilaBukanAdmin } from "@/lib/api-auth";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { updateQuotationStatusAdmin } from "@/services/quotation.service";
import { z } from "zod";
import { toSupabaseCookieStore } from "@/lib/supabase";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  status: z.enum(["issued", "accepted", "rejected", "expired", "superseded"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
    // updateQuotationStatusAdmin memakai service-role tanpa cek peran,
    // jadi wajib diverifikasi di sini sebelum melanjutkan.
    const hasilAdmin = await tolakBilaBukanAdmin(
      toSupabaseCookieStore(await cookies()),
      "quotations/[id]/status"
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

    const body = await req.json();
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: parsedBody.error.flatten() },
        { status: 422 }
      );
    }

    const result = await updateQuotationStatusAdmin({
      quotationId: id,
      status: parsedBody.data.status,
    });

    return NextResponse.json({
      success: true,
      data: { id, status: result.status },
    });
  } catch (err: unknown) {
    return responsGalat(err, "PATCH /api/quotations/[id]/status", "Gagal memperbarui status quotation");
  }
}
