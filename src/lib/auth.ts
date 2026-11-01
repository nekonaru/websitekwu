/**
 * Helper autentikasi dan otorisasi admin KWU.
 *
 * Peran admin disimpan di app_metadata (bukan user_metadata) karena
 * app_metadata hanya dapat diubah lewat service-role key, sehingga
 * pengguna tidak bisa menaikkan perannya sendiri.
 */
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { SupabaseCookieStore } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  email: string | null;
}

/** Hasil verifikasi admin yang membedakan belum masuk vs bukan admin. */
export type HasilAdmin =
  | { status: "ok"; admin: AdminUser }
  | { status: "belum-masuk" }
  | { status: "bukan-admin" };

/**
 * Verifikasi peran admin di server (check 09).
 * Membedakan "belum masuk" (401) dan "bukan admin" (403) agar respons
 * konsisten dengan makna HTTP-nya.
 */
export async function verifikasiAdmin(
  cookies: SupabaseCookieStore | Promise<SupabaseCookieStore>
): Promise<HasilAdmin> {
  // Mode berkas lokal: tidak ada autentikasi, anggap sebagai admin.
  if (!isSupabaseConfigured()) {
    return {
      status: "ok",
      admin: { id: "admin-lokal", email: "admin@kwu.local" },
    };
  }

  const supabase = await createServerSupabaseClient(cookies);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { status: "belum-masuk" };

  const role =
    (user.app_metadata as { role?: string } | null)?.role ??
    (user.user_metadata as { role?: string } | null)?.role;

  if (role !== "admin") return { status: "bukan-admin" };

  return { status: "ok", admin: { id: user.id, email: user.email ?? null } };
}

/**
 * Verifikasi bahwa pemanggil adalah admin. Kembalikan objek admin bila
 * valid, atau null bila tidak terautentikasi atau bukan admin.
 */
export async function requireAdmin(
  cookies: SupabaseCookieStore | Promise<SupabaseCookieStore>
): Promise<AdminUser | null> {
  const hasil = await verifikasiAdmin(cookies);
  return hasil.status === "ok" ? hasil.admin : null;
}

/**
 * Verifikasi bahwa pemanggil sudah masuk (tanpa mensyaratkan admin).
 */
export async function requireUser(
  cookies: SupabaseCookieStore | Promise<SupabaseCookieStore>
): Promise<AdminUser | null> {
  // Mode berkas lokal: tidak ada autentikasi, anggap sebagai pengguna lokal.
  if (!isSupabaseConfigured()) {
    return { id: "pengguna-lokal", email: "pengguna@kwu.local" };
  }

  const supabase = await createServerSupabaseClient(cookies);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return { id: user.id, email: user.email ?? null };
}
