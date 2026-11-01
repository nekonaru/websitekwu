/**
 * API Route: GET /api/my/rfqs
 * Daftar RFQ milik pengguna yang terautentikasi.
 *
 * Wajib login dan hanya mengembalikan RFQ dengan created_by = user id
 * agar data organisasi lain tidak bocor.
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { cookies } from "next/headers";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { bacaBasisData } from "@/lib/file-db";
import { responsGalat } from "@/lib/api-error";

export async function GET(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
    // Mode berkas lokal: kembalikan RFQ milik pengguna lokal.
    if (!isSupabaseConfigured()) {
      const db = await bacaBasisData();
      const milikLokal = db.rfqs.filter(
        (r) => r.created_by === "pengguna-lokal" || !r.created_by
      );
      return NextResponse.json({ success: true, data: milikLokal });
    }

    const supabase = await createServerSupabaseClient(
      toSupabaseCookieStore(await cookies())
    );

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
      .from("rfqs")
      .select("*, rfq_items(*)")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    return responsGalat(err, "GET /api/my/rfqs", "Gagal memuat RFQ");
  }
}
