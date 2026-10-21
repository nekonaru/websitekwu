/**
 * API Route: GET /api/my/rfqs
 * Daftar RFQ milik pengguna yang terautentikasi.
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient(toSupabaseCookieStore(await cookies()));
    const { data, error } = await supabase
      .from("rfqs")
      .select("*, rfq_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat RFQ";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
