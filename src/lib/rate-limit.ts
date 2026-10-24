/**
 * Pembatas laju (rate limiter) sederhana berbasis memori untuk Route Handler.
 * Cocok untuk penyebaran satu instansi. Untuk multi-instansi, ganti
 * dengan penyimpanan eksternal (misalnya Redis).
 */
interface Entitas {
  jumlah: number;
  resetPada: number;
}

const entitas = new Map<string, Entitas>();

const INTERVAL_BERSIH = 60_000;
let terakhirBersih = Date.now();

function bersihkan() {
  const sekarang = Date.now();
  if (sekarang - terakhirBersih < INTERVAL_BERSIH) return;
  terakhirBersih = sekarang;
  for (const [kunci, data] of entitas.entries()) {
    if (data.resetPada <= sekarang) entitas.delete(kunci);
  }
}

/**
 * Periksa apakah kunci (misalnya IP) masih di bawah batas.
 * Mengembalikan { allowed, remaining, resetPada }.
 */
export function periksaLaju(
  kunci: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetPada: number } {
  bersihkan();
  const sekarang = Date.now();
  const data = entitas.get(kunci);

  if (!data || data.resetPada <= sekarang) {
    const resetPada = sekarang + windowMs;
    entitas.set(kunci, { jumlah: 1, resetPada });
    return { allowed: true, remaining: limit - 1, resetPada };
  }

  if (data.jumlah >= limit) {
    return { allowed: false, remaining: 0, resetPada: data.resetPada };
  }

  data.jumlah += 1;
  return { allowed: true, remaining: limit - data.jumlah, resetPada: data.resetPada };
}

/**
 * Baca alamat IP pemanggil dari header (Vercel/Node).
 */
export function ambilIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Wrapper ringkas: kembalikan Response 429 bila melebihi batas.
 */
export function tanggapiJikaMelebihi(
  req: Request,
  limit: number,
  windowMs: number
): Response | null {
  const ip = ambilIp(req);
  const hasil = periksaLaju(ip, limit, windowMs);
  if (!hasil.allowed) {
    return new Response(
      JSON.stringify({ success: false, error: "Terlalu banyak permintaan. Coba lagi nanti." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((hasil.resetPada - Date.now()) / 1000)),
        },
      }
    );
  }
  return null;
}
