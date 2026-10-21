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
 * Toko cookie minimal yang dibutuhkan Supabase SSR.
 * Structur ini selaras dengan cookies() milik Next.js 15+ maupun
 * cookie store kustom yang dibuat sendiri.
 */
export interface SupabaseCookieStore {
  getAll(): Promise<{ name: string; value: string }[] | null> | { name: string; value: string }[];
  set(name: string, value: string, options?: unknown): void | Promise<void>;
  remove?(name: string, options?: unknown): void | Promise<void>;
}

const emptyCookieStore: SupabaseCookieStore = {
  getAll: () => [],
  set: () => {},
  remove: () => {},
};

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
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: emptyCookieStore as unknown as CookieMethodsServer }
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Ubah objek cookies() milik Next.js menjadi toko cookie Supabase.
 *NEXT.js memakai bentuk signature yang berbeda dari @supabase/ssr,
 * jadi adaptasi dilakukan di satu tempat saja.
 */
export function toSupabaseCookieStore(cookies: unknown): SupabaseCookieStore {
  const store = cookies as {
    getAll: () => { name: string; value: string }[];
    set: (name: string, value: string, options?: unknown) => unknown;
  };

  return {
    getAll: () => store.getAll(),
    set: (name, value, options) => {
      store.set(name, value, options);
    },
  };
}

/**
 * Buat klien Supabase di server dengan cookie store.
 * Digunakan untuk Route Handler / Server Action yang membutuhkan otorisasi
 * berdasarkan sesi pengguna (anon key + cookie).
 *
 * Next.js 15 membuat cookies() menjadi async (Promise).
 * Jika env vars belum di-set (belum dikonfigurasi), tetap mengembalikan klien
 * agar build tidak gagal; operasi data akan gagal runtime saat dipanggil.
 */
export async function createServerSupabaseClient(
  cookies: SupabaseCookieStore | Promise<SupabaseCookieStore>
) {
  const cookieStore = await cookies;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore as unknown as CookieMethodsServer }
  );
}

/**
 * Buat klien Supabase dengan service-role key.
 * HANYA boleh dipanggil di server (Route Handler / Server Action).
 * Tidak pernah diekspor ke bundle browser.
 */
export function createServiceSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: emptyCookieStore as unknown as CookieMethodsServer }
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
