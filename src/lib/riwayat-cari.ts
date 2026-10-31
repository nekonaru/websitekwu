/**
 * Riwayat pencarian produk (client-side, localStorage).
 *
 * Menyimpan hingga 8 kata kunci terakhir, terbaru di depan, tanpa duplikat.
 * Semua fungsi aman dipanggil di server (mengembalikan hasil kosong).
 */

const STORAGE_KEY = "kwu_riwayat_cari_v1";
const BATAS = 8;

export function bacaRiwayatCari(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
      .slice(0, BATAS);
  } catch {
    return [];
  }
}

export function simpanKataCari(kata: string): string[] {
  const bersih = kata.trim();
  if (!bersih) return bacaRiwayatCari();

  const sebelumnya = bacaRiwayatCari().filter(
    (k) => k.toLowerCase() !== bersih.toLowerCase()
  );
  const berikutnya = [bersih, ...sebelumnya].slice(0, BATAS);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(berikutnya));
    } catch {
      // Penyimpanan penuh atau ditolak browser, abaikan saja.
    }
  }
  return berikutnya;
}

export function hapusKataCari(kata: string): string[] {
  const berikutnya = bacaRiwayatCari().filter(
    (k) => k.toLowerCase() !== kata.toLowerCase()
  );
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(berikutnya));
    } catch {
      // Abaikan bila penyimpanan tidak tersedia.
    }
  }
  return berikutnya;
}

export function bersihkanRiwayatCari(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Abaikan bila penyimpanan tidak tersedia.
  }
}
