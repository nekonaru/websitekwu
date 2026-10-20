/**
 * API Route: PATCH /api/rfqs/[id]/status
 * Perbarui status RFQ dengan transisi sah (admin only).
 */
import { NextResponse } from "next/server";
import { updateRfqStatusAdmin } from "@/services/rfq.service";
import { z } from "zod";

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
  try {
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
      cookies: (() => {
        const { cookies } = require("next/headers");
        return cookies();
      })() as any,
    });

    return NextResponse.json({
      success: true,
      data: {
        id,
        oldStatus: result.oldStatus,
        newStatus: result.newStatus,
      },
    });
  } catch (err: any) {
    console.error("PATCH /api/rfqs/[id]/status error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal memperbarui status RFQ" },
      { status: 400 }
    );
  }
}
