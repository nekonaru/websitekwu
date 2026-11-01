/**
 * Penanganan galat API terstruktur (check 08 logging, check 20 anti-bocor).
 *
 * - GalatApi: galat domain dengan pesan publik yang AMAN dikembalikan ke klien
 *   (validasi, tidak ditemukan, autentikasi). Statusnya dihormati.
 * - responsGalat(): galat tak dikenal (error database, error pihak ketiga)
 *   dicatat LENGKAP ke log server, tetapi klien hanya menerima pesan generik
 *   beserta referensi pelacakan. Di pengembangan, detail tetap ditampilkan
 *   agar mudah didebug; di produksi tidak pernah.
 */
import { NextResponse } from "next/server";

const sedangProduksi = process.env.NODE_ENV === "production";

/** Galat domain dengan pesan yang aman ditampilkan ke pengguna. */
export class GalatApi extends Error {
  readonly status: number;

  constructor(pesan: string, status = 400) {
    super(pesan);
    this.name = "GalatApi";
    this.status = status;
  }
}

/** Identifikasi referensi singkat untuk pelacakan di log server. */
function referensi(): string {
  return crypto.randomUUID().slice(0, 8);
}

/**
 * Ubah galat menjadi respons JSON API.
 * GalatApi diteruskan apa adanya; galat lain dibuat generik di produksi
 * (pesan generik + referensi pelacakan), atau memakai `pesanGenerik` bila
 * diberikan.
 */
export function responsGalat(
  err: unknown,
  konteks: string,
  pesanGenerik = "Terjadi kesalahan di server. Coba lagi nanti."
): NextResponse {
  if (err instanceof GalatApi) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status }
    );
  }

  // Body JSON yang rusak berasal dari klien: beri 400 tanpa membocorkan
  // detail parsing.
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { success: false, error: "Format permintaan tidak valid" },
      { status: 400 }
    );
  }

  const ref = referensi();
  const pesan = err instanceof Error ? err.message : String(err);

  // Detail lengkap hanya untuk log server, tidak pernah untuk klien.
  console.error(
    JSON.stringify({
      tingkat: "error",
      kejadian: "galat-api",
      konteks,
      referensi: ref,
      pesan,
      waktu: new Date().toISOString(),
    })
  );

  return NextResponse.json(
    {
      success: false,
      error: sedangProduksi ? `${pesanGenerik} (referensi: ${ref})` : pesan,
      referensi: ref,
    },
    { status: 500 }
  );
}

/**
 * Catat peristiwa keamanan terstruktur ke log server (check 08).
 * Jangan pernah menyertakan nilai secret di `detail`.
 */
export function catatKeamanan(
  kejadian: string,
  detail: Record<string, string | number | boolean>
): void {
  console.warn(
    JSON.stringify({
      tingkat: "warn",
      kejadian,
      ...detail,
      waktu: new Date().toISOString(),
    })
  );
}
