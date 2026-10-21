import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Route yang hanya dapat diakses setelah pengguna masuk.
 * Keranjang sengaja tidak dilindungi karena isinya disimpan di sisi klien
 * dan pengguna boleh melihatnya sebelum masuk.
 */
const PROTECTED_PREFIXES = [
  "/profil",
  "/checkout",
  "/pesanan-saya",
  "/admin",
];

/**
 * Cookie sesi Supabase bernama `sb-<project-ref>-auth-token` dan dapat
 * dipecah menjadi beberapa bagian dengan akhiran `.0`, `.1`, dan seterusnya.
 */
function hasSessionCookie(req: NextRequest): boolean {
  return req.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
    );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Izinkan semua route publik dan API
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Jika route dilindungi dan tidak ada cookie sesi, alihkan ke login
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
