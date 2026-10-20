/**
 * API Route: GET /api/my/orders
 * Daftar pesanan milik pengguna yang terautentikasi.
 */
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient(cookies());

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
