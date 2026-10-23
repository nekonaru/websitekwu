/**
 * API Route: PATCH /api/admin/orders/[id]/status
 * Perbarui status pesanan oleh admin.
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { z } from "zod";
import { updateOrderStatusAdmin } from "@/services/order.service";
import { requireAdmin } from "@/lib/auth";
import { toSupabaseCookieStore } from "@/lib/supabase";
import { cookies } from "next/headers";
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

    const admin = await requireAdmin(toSupabaseCookieStore(await cookies()));
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 401 }
      );
    }

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
  } catch (err: unknown) {
    console.error("PATCH /api/admin/orders/[id]/status error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal mengubah status pesanan") },
      { status: 500 }
    );
  }
}
