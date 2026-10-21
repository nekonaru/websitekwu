/**
 * API Route: PATCH /api/admin/orders/[id]/status
 * Perbarui status pesanan oleh admin.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOrderStatusAdmin } from "@/services/order.service";

const statusSchema = z.object({
  status: z.string().min(2).max(50),
  note: z.string().max(500).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Status pesanan tidak valid" },
        { status: 422 }
      );
    }

    const data = await updateOrderStatusAdmin({
      orderId: id,
      status: parsed.data.status,
      note: parsed.data.note,
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("PATCH /api/admin/orders/[id]/status error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal mengubah status pesanan" },
      { status: 500 }
    );
  }
}
