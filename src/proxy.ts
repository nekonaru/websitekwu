import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { catatKeamanan } from "@/lib/api-error";

/** Metode HTTP yang mengubah data sehingga butuh perlindungan CSRF. */
const METODE_MENGUBAH = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Tolak permintaan API lintas-asal (check 16: CSRF).
 *
 * Browser SELALU menyertakan header Origin pada permintaan lintas-asal,
 * sedangkan klien non-peramban (curl, server-ke-server) tidak mengirimnya.
 * Karena itu pemeriksaan hanya berlaku bila Origin hadir dan berbeda dari
 * asal situs: pengguna tetap dapat memakai API lewat curl, tetapi situs
 * asing tidak dapat memaksa peramban pengguna mengirim data.
 */
function tolakOriginAsing(req: NextRequest): NextResponse | null {
  if (!METODE_MENGUBAH.has(req.method)) return null;

  const origin = req.headers.get("origin");
  if (!origin) return null;

  const asal = `${req.nextUrl.protocol}//${req.headers.get("host") ?? ""}`;
  if (origin === asal) return null;

  catatKeamanan("csrf-origin-ditolak", {
    metode: req.method,
    path: req.nextUrl.pathname,
    origin,
  });

  return NextResponse.json(
    { success: false, error: "Asal permintaan tidak diizinkan" },
    { status: 403 }
  );
}

/**
 * Mode berkas lokal: Supabase tidak dikonfigurasi (atau memakai placeholder),
 * sehingga tidak ada cookie sesi sama sekali. Dalam mode ini seluruh route
 * terbuka karena semua data tersimpan di data/kwu.json dan pembacaan sudah
 * dibatasi oleh helper requireAdmin/requireUser.
 */
function modeBerkas(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return true;
  if (url.includes("placeholder") || key.includes("placeholder")) return true;
  return false;
}

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
    // API: cegah CSRF dengan menolak permintaan lintas-asal (check 16).
    const ditolak = tolakOriginAsing(req);
    if (ditolak) return ditolak;
    return NextResponse.next();
  }

  // Mode berkas lokal: lewati pemeriksaan sesi sepenuhnya.
  if (modeBerkas()) {
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
