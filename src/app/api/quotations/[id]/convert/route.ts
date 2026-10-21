/**
 * API Route: POST /api/quotations/[id]/convert
 * Konversi quotation yang disetujui menjadi pesanan B2B (admin only).
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { convertQuotationToOrder } from "@/services/quotation.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
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
