/**
 * Helper autentikasi dan otorisasi admin KWU.
 *
 * Peran admin disimpan di app_metadata (bukan user_metadata) karena
 * app_metadata hanya dapat diubah lewat service-role key, sehingga
 * pengguna tidak bisa menaikkan perannya sendiri.
 */
import { createServerSupabaseClient } from "@/lib/supabase";
import type { SupabaseCookieStore } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  email: string | null;
}

/**
 * Verifikasi bahwa pemanggil adalah admin. Kembalikan objek admin bila
 * valid, atau null bila tidak terautentikasi atau bukan admin.
 */
export async function requireAdmin(
  cookies: SupabaseCookieStore | Promise<SupabaseCookieStore>
): Promise<AdminUser | null> {
  const supabase = await createServerSupabaseClient(cookies);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const role =
    (user.app_metadata as { role?: string } | null)?.role ??
    (user.user_metadata as { role?: string } | null)?.role;

  if (role !== "admin") return null;

  return { id: user.id, email: user.email ?? null };
}

/**
 * Verifikasi bahwa pemanggil sudah masuk (tanpa mensyaratkan admin).
 */
export async function requireUser(
  cookies: SupabaseCookieStore | Promise<SupabaseCookieStore>
): Promise<AdminUser | null> {
  const supabase = await createServerSupabaseClient(cookies);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return { id: user.id, email: user.email ?? null };
}
