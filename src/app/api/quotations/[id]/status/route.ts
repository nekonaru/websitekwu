/**
 * API Route: PATCH /api/quotations/[id]/status
 * Perbarui status quotation (admin only).
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { updateQuotationStatusAdmin } from "@/services/quotation.service";
import { z } from "zod";

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
  try {
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
    console.error("PATCH /api/quotations/[id]/status error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal memperbarui status quotation") },
      { status: 400 }
    );
  }
}
