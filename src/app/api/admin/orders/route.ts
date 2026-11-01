/**
 * API Route: GET /api/admin/orders
 * Daftar semua pesanan untuk admin.
 */
import { NextResponse } from "next/server";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { getAllOrdersAdmin } from "@/services/order.service";
import { requireAdmin } from "@/lib/auth";
import { toSupabaseCookieStore } from "@/lib/supabase";
import { cookies } from "next/headers";
export async function GET(req: Request) {
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

    const data = await getAllOrdersAdmin();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return responsGalat(err, "GET /api/admin/orders", "Gagal memuat pesanan");
  }
}
