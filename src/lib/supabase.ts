/**
 * Klien Supabase untuk KWU.
 *
 * - createBrowserClient: untuk Client Component di browser (anon key boleh)
 * - createServerClient: untuk Server Component / Route Handler (menggunakan cookies)
 * - createServiceClient: HANYA di server, menggunakan service-role key.
 *   Service-role key HANYA di server dan tidak boleh pernah ke browser.
 */
import {
  createBrowserClient,
  createServerClient,
  isBrowser,
  type CookieMethodsServer,
} from "@supabase/ssr";

/**
 * Buat klien Supabase untuk browser (Client Component).
 * Hanya menyertakan anon key publik — aman untuk bundle browser.
 */
export function createBrowserSupabaseClient() {
  if (!isBrowser()) {
    // Dipanggil di server tapi ingin browser client — fallback ke server client
    // tanpa cookies (untuk data publik yang tidak butuh sesi).
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Buat klien Supabase di server dengan cookie store.
 * Digunakan untuk Route Handler / Server Action yang membutuhkan otorisasi
 * berdasarkan sesi pengguna (anon key + cookie).
 */
export function createServerSupabaseClient(cookies: CookieMethodsServer) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
}

/**
 * Buat klien Supabase dengan service-role key.
 * HANYA boleh dipanggil di server (Route Handler / Server Action).
 * Tidak pernah diekspor ke bundle browser.
 */
export function createServiceSupabaseClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY tidak dikonfigurasi. Variabel ini hanya boleh ada di server."
    );
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Periksa apakah Supabase sudah dikonfigurasi (env vars tersedia).
 * Digunakan untuk fallback ke mock data saat belum dikonfigurasi.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
