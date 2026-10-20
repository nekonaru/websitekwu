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
