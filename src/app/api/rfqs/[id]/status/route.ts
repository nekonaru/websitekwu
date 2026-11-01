/**
 * API Route: PATCH /api/rfqs/[id]/status
 * Perbarui status RFQ dengan transisi sah (admin only).
 */
import { NextResponse } from "next/server";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { updateRfqStatusAdmin } from "@/services/rfq.service";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { toSupabaseCookieStore } from "@/lib/supabase";
import type { SupabaseCookieStore } from "@/lib/supabase";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  status: z.enum([
    "submitted",
    "under_review",
    "needs_information",
    "quoted",
    "negotiation",
    "accepted",
    "rejected",
    "expired",
    "converted_to_order",
  ]),
  note: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
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
        { success: false, error: "ID RFQ tidak valid" },
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

    const result = await updateRfqStatusAdmin({
      rfqId: id,
      newStatus: parsedBody.data.status,
      note: parsedBody.data.note,
      cookies: cookies as unknown as () => SupabaseCookieStore,
    });

    return NextResponse.json({
      success: true,
      data: {
        id,
        oldStatus: result.oldStatus,
        newStatus: result.newStatus,
      },
    });
  } catch (err: unknown) {
    return responsGalat(err, "PATCH /api/rfqs/[id]/status", "Gagal memperbarui status RFQ");
  }
}
