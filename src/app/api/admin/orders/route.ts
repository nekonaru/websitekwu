/**
 * API Route: GET /api/admin/orders
 * Daftar semua pesanan untuk admin.
 */
import { NextResponse } from "next/server";
import { tolakBilaBukanAdmin } from "@/lib/api-auth";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { getAllOrdersAdmin } from "@/services/order.service";
import { toSupabaseCookieStore } from "@/lib/supabase";
import { cookies } from "next/headers";
export async function GET(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
    const hasilAdmin = await tolakBilaBukanAdmin(
      toSupabaseCookieStore(await cookies()),
      "admin/orders"
    );
    if ("response" in hasilAdmin) return hasilAdmin.response;

    const data = await getAllOrdersAdmin();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return responsGalat(err, "GET /api/admin/orders", "Gagal memuat pesanan");
  }
}
