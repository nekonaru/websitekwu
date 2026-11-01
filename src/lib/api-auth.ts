/**
 * Gerbang admin untuk route API (check 09: peran diperiksa di server pada
 * SETIAP permintaan admin, bukan lewat tombol tersembunyi).
 *
 * - Belum masuk  -> 401
 * - Masuk tetapi bukan admin -> 403 + catatan peristiwa keamanan (check 08)
 */
import { NextResponse } from "next/server";
import { verifikasiAdmin, type AdminUser } from "@/lib/auth";
import { catatKeamanan } from "@/lib/api-error";
import type { SupabaseCookieStore } from "@/lib/supabase";

export type HasilGerbangAdmin =
  | { admin: AdminUser }
  | { response: NextResponse };

/**
 * Pemeriksaan admin ringkas untuk handler route.
 * Bila ditolak, langsung kembalikan responsnya:
 * `if ("response" in hasil) return hasil.response;`
 */
export async function tolakBilaBukanAdmin(
  cookies: SupabaseCookieStore | Promise<SupabaseCookieStore>,
  konteks: string
): Promise<HasilGerbangAdmin> {
  const hasil = await verifikasiAdmin(cookies);

  if (hasil.status === "ok") {
    return { admin: hasil.admin };
  }

  if (hasil.status === "bukan-admin") {
    catatKeamanan("akses-admin-ditolak", { konteks });
    return {
      response: NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 403 }
      ),
    };
  }

  return {
    response: NextResponse.json(
      { success: false, error: "Autentikasi diperlukan" },
      { status: 401 }
    ),
  };
}
