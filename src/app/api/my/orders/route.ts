/**
 * API Route: GET /api/my/orders
 * Daftar pesanan milik pengguna yang terautentikasi.
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { cookies } from "next/headers";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { getMyOrders } from "@/services/order.service";

export async function GET(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
    const cookieStore = toSupabaseCookieStore(await cookies());

    // Mode berkas lokal: satu pengguna lokal, tanpa sesi login.
    if (!isSupabaseConfigured()) {
      const data = await getMyOrders({ cookies: () => cookieStore });
      return NextResponse.json({ success: true, data });
    }

    const supabase = await createServerSupabaseClient(cookieStore);

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

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat pesanan";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
