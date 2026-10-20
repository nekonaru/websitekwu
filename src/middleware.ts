import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Route yang dilindungi (hanya dapat diakses saat login)
const PROTECTED_PREFIXES = ["/profil", "/keranjang", "/checkout", "/pesanan-saya"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Izinkan semua route publik dan API
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Jika route dilindungi dan tidak ada token sesi di cookie, alihkan ke login
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const hasSession = req.cookies.has("sb-access-token");
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
