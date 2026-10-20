/**
 * API Route: GET /api/admin/orders
 * Daftar semua pesanan untuk admin.
 */
import { NextResponse } from "next/server";
import { getAllOrdersAdmin } from "@/services/order.service";

export async function GET() {
  try {
    const data = await getAllOrdersAdmin();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /api/admin/orders error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal memuat pesanan" },
      { status: 500 }
    );
  }
}

/**
 * API Route: PATCH /api/admin/orders/[id]/status
 * Perbarui status pesanan (admin only).
 */
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
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
        { success: false, error: "ID pesanan tidak valid" },
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

    const supabase = createServerSupabaseClient(
      (() => {
        const { cookies } = require("next/headers");
        return cookies();
      })() as any
    );

    // Cek otorisasi admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const isAdmin = (user as any).user_metadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Hanya admin yang dapat mengubah status pesanan" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: parsedBody.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { id, status: data.status },
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/orders/[id]/status error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal memperbarui status pesanan" },
      { status: 400 }
    );
  }
}
