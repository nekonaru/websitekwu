/**
 * Klien Supabase.
 * Kunci anon publik boleh ada di browser; service-role key HANYA di server
 * dan tidak boleh pernah diekspor ke bundle frontend.
 */
import {
  createBrowserClient,
  createServerClient,
  isBrowser,
  type CookieMethodsServer,
} from "@supabase/ssr";

export function createClient() {
  if (isBrowser()) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  // Di server (Server Component / Route Handler) gunakan cookie-based client
  // supabase/ssr memerlukan cookies; ini dipanggil dalam konteks yang tepat.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Buat klien Supabase di server dengan cookie store (untuk Route Handler /
 * Server Action yang membutuhkan otorisasi berdasarkan sesi).
 * Tidak pernah menampilkan service-role key ke klien.
 */
export function createServerSupabaseClient(cookies: CookieMethodsServer) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
}
