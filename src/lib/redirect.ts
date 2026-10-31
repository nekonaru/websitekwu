/**
 * Penjaga open redirect untuk tujuan purna-login.
 *
 * `callbackUrl` datang dari parameter query sehingga bisa disusun pihak luar
 * (misalnya /login?callbackUrl=https://situs-jahat). Hanya jalur relatif di
 * situs yang sama yang diizinkan; nilai lain jatuh ke beranda.
 */
export function redirectAman(callback: string | null | undefined): string {
  if (!callback) return "/";

  // Tolak jalur absolut atau netloc ganda (//evil.com dan /\evil.com).
  if (!callback.startsWith("/")) return "/";
  if (callback.startsWith("//") || callback.startsWith("/\\")) return "/";

  // Tolak karakter kontrol dan backslash yang bisa memotong validasi.
  for (let i = 0; i < callback.length; i += 1) {
    const kode = callback.charCodeAt(i);
    if (kode < 32 || kode === 127 || callback[i] === "\\") return "/";
  }

  return callback;
}
