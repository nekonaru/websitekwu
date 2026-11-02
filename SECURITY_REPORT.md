# Laporan Keamanan KWU (Check 27)

Laporan akhir dari penerapan Pre-Launch Security Toolkit (27 check + bonus)
di website toko kampus KWU. Peta serangan: `SECURITY_MAP.md`.
Detail review per temuan: `SECURITY_REVIEW.md`.
Skrip uji terpadu: `scripts/uji-keamanan.mjs` (19/19 lolos).

Tanggal laporan: 3 November 2026 · Basis: branch `master` ·
Live: `https://websitekwu.vercel.app`

## 1. Tabel 27 Check

Legenda: **Lolos** = sudah aman sejak awal, ada bukti ·
**Fixed & re-tested** = diperbaiki, diuji ulang, di-commit ·
**Open** = perlu tindakan (kode atau manual) · **N/A** = tidak berlaku.

| # | Check | Severity | Status | Bukti |
| --- | --- | --- | --- | --- |
| 01 | Setup proper authentication | Critical | Lolos (live penuh setelah migrasi) | Supabase Auth; cek sesi di server tiap request; `src/lib/auth.ts:27,60,70`; uji live butuh akun nyata (lihat §4) |
| 02 | Hide API keys | Critical | Lolos | Pindai 31 berkas js `.next/static` = 0 nilai secret (1 false positive `sb_secret_` = kode deteksi library); hanya `NEXT_PUBLIC_*` yang ke klien |
| 03 | Secure the database | Critical | Lolos (kode) / Open (eksekusi) | `ENABLE ROW LEVEL SECURITY` + 15 policy di `supabase/migrations/001-003`; **migrasi belum dijalankan** → §4 |
| 04 | Enforce HTTPS | High | Lolos | HSTS 2 tahun + includeSubDomains (`next.config.ts:67`), `upgrade-insecure-requests` di CSP, Vercel pakai HTTPS |
| 05 | Hash passwords | Critical | Lolos | Supabase Auth (Argon2id) — tidak ada hash sandi buatan sendiri |
| 06 | Validate forms server-side | High | Fixed & re-tested | Zod semua route API; uji: tipe salah → 422, field berlebih (`role`/`status`) di-strip (2 uji lolos) |
| 07 | Protect against XSS | High | Lolos | 0 `dangerouslySetInnerHTML`/`innerHTML=` dari 76 berkas; React escape bawaan; CSP ketat |
| 08 | Log and monitor suspicious activity | Medium | Fixed | `catatKeamanan()` di `src/lib/api-error.ts:87`; peristiwa: `csrf-origin-ditolak`, `akses-admin-ditolak`, `rate-limit-ditolak` |
| 09 | Lock down admin routes | Critical | Fixed | 401 vs 403 + log penolakan: `src/lib/api-auth.ts:22`; 13 titik route pakai pola baru |
| 10 | Parameterized queries | Critical | Lolos | Semua akses data via Supabase query builder / function DB; tanpa string SQL konkatenasi |
| 11 | Check environment variables | Critical | Lolos | `.env*` di `.gitignore`, 0 berkas env ter-git history; nama env saja di dokumentasi |
| 12 | Add rate limiting | High | Fixed & re-tested | Kunci `ip|pathname` di `src/lib/rate-limit.ts:72`, 21 titik route; uji: request ke-11+ → 429, rute lain tetap 200 (2 uji lolos). **Keterbatasan in-memory → §3** |
| 13 | Restrict CORS settings | Medium | Lolos | Tanpa header CORS kustom → browser default same-origin |
| 14 | Add security headers | Medium | Fixed & re-tested | `next.config.ts:56-67`: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS, COOP, CORP, X-Permitted-Cross-Domain-Policies, X-Powered-By hilang; uji 2 lolos |
| 15 | Secure session cookies | High | Lolos (desain) | Cookie sesi dikelola supabase-js (HttpOnly/Secure/SameSite); verifikasi live butuh akun nyata → §4 |
| 16 | CSRF protection | High | Fixed & re-tested | Tolak Origin lintas-asal di `src/proxy.ts:17,87`; uji 3 lolos: asing → 403, sendiri lolos, tanpa Origin (curl) diizinkan |
| 17 | Password-reset links expire | High | N/A | Fitur reset sandi tidak ada di aplikasi |
| 18 | Restrict file upload types/sizes | High | Fixed & re-tested | Tidak ada unggahan berkas; `imageUrl` admin wajib `http(s)://` (`api/admin/products/route.ts:68-72`); uji `javascript:`/`data:` → 422 |
| 19 | Verify prices and payments | Critical | Fixed & re-tested | `verifikasiItem()` `src/services/order.service.ts:194`; server hitung subtotal dari katalog; uji 4 lolos (subtotal, nama/harga item, produk tak dikenal, qty > stok). Tidak ada pembayaran online (tanpa webhook → tanpa risiko "unpaid unlock") |
| 20 | Disable production debug mode | High | Fixed | `responsGalat()` `src/lib/api-error.ts:37`: pesan generik + `referensi`, log lengkap hanya di server; uji 3 lolos (JSON rusak, 404, API galat — tanpa bocor) |
| 21 | Update vulnerable dependencies | High | Lolos | `npm audit --omit=dev` = **0 vuln produksi**; 16 moderate dev-only (eslint/minimatch); `audit fix --force` tidak dijalankan |
| 22 | Remove unused packages | Medium | Lolos | depcheck: 3 false positive (tailwindcss, @tailwindcss/turbopack, @types/react-dom) |
| 23 | Check for exposed files | Critical | Fixed & verified | `scripts/check-kebocoran-file.mjs`: 34 path live → 0 berbahaya; 7 path sensitif lokal tidak disajikan (uji terpadu) |
| 24 | Scan Git history for leaked secrets | Critical | Fixed & verified | Scan manual 14 pola ke seluruh riwayat = 0 commit; hook `scripts/githooks/pre-commit` aktif via `git config core.hooksPath` (teruji menolak secret uji, exit 1) |
| 25 | Revoke and replace compromised keys | Critical | Lolos / aksi preventif | Tidak ada indikasi kebocoran (23 + 24 bersih); rotasi preventif → §5 |
| 26 | Run a thorough security review | Review | Selesai | `SECURITY_REVIEW.md` — 14 temuan terdokumentasi dengan file:line + severity + status |
| 27 | Test protections and give report | Review | Selesai | Laporan ini + `scripts/uji-keamanan.mjs` (19/19 lolos) |

### Bonus (B1-B7)

| Bonus | Status | Catatan |
| --- | --- | --- |
| B1 Prompt injection chatbot | Lolos | Batas 1000 karakter/pesan, riwayat 10, output 500 token, rate limit 20/menit (`api/chat/route.ts:10-11,153`); instruksi sistem tidak menerima input pengguna sebagai instruksi |
| B2 SSRF (server ambil URL) | Open (ditenda) | `remotePatterns` image belum dibatasi; admin-only → `SECURITY_REVIEW.md` F13 |
| B3 Mass assignment | Lolos | Zod strip field tak dikenal; uji `role`/`status` tidak tersimpan |
| B4 IDOR | Lolos | `/api/my/*` filter pemilik di server; `/api/rfqs/[id]` hanya data publik terbatas; admin dijaga 401/403 |
| B5 API key AI habis / tagihan | Open (manual) | Butuh spending cap di konsol provider → §5 |
| B6 Webhook palsu | N/A | Tidak ada pembayaran online / webhook |
| B7 Dependency confusion | Lolos | Hanya dependensi publik resmi; lockfile ter-commit |

## 2. Temuan Utama (Detail)

| Issue | file:line | Severity | Status |
| --- | --- | --- | --- |
| Harga pesanan berasal dari klien | `src/services/order.service.ts:194` | Critical | Fixed & re-tested (check 19) |
| Detail galat internal bocor ke klien | `src/lib/api-error.ts:37` | High | Fixed & re-tested (check 08+20) |
| Tanpa HSTS / CSP lemah | `next.config.ts:56,67` | High | Fixed & re-tested (check 14) |
| CSRF tanpa pemeriksaan Origin | `src/proxy.ts:17,87` | High | Fixed & re-tested (check 16) |
| Admin: 401/403 tidak dibedakan, penolakan tak dicatat | `src/lib/api-auth.ts:22` | High | Fixed (check 09) |
| Rate limit global, bukan per rute | `src/lib/rate-limit.ts:72` | Medium | Fixed & re-tested (check 12) |
| `imageUrl` tanpa validasi skema | `src/app/api/admin/products/route.ts:68` | Medium | Fixed & re-tested (check 18) |
| Git history tak dipindai secret | `scripts/githooks/pre-commit` | Critical | Fixed & verified (check 24) |
| Belum ada skrip cek berkas terekspos | `scripts/check-kebocoran-file.mjs` | Critical | Fixed & verified (check 23) |
| Migrasi Supabase + RLS belum dijalankan | `supabase/migrations/*.sql` | Critical (operasional) | **Open** — §4 |
| Rate limiter in-memory (Vercel multi-instansi) | `src/lib/rate-limit.ts` | Medium | **Open** — §3 |
| Stok tidak berkurang saat pesanan | `src/services/order.service.ts:194` | Medium | **Open** — butuh keputusan produk |
| `remotePatterns` image tidak dibatasi | `next.config.ts` | Low | **Open** — admin-only, ditunda |

## 3. Open Items & Langkah Pasti

### O1 — Migrasi Supabase (Critical, butuh akses user)

Belum pernah dijalankan; tanpa ini tabel + RLS belum ada di produksi.

Cara A (otomatis): siapkan `SUPABASE_ACCESS_TOKEN` dan
`SUPABASE_PROJECT_REF=nxunbpinnnswurgmbja` di env lokal, lalu:

```powershell
npm run migrate
```

Cara B (manual): buka SQL Editor Supabase → eksekusi 4 berkas
`supabase/migrations/*.sql` berurutan (001 → 003 + berkas seed bila ada).

Verifikasi: tabel `orders`, `rfqs`, `products` muncul; cek
`relrowsecurity = true` di `pg_class` untuk semua tabel tersebut.

### O2 — Rate limit lintas instansi (Medium)

In-memory = per instansi serverless. Pilih salah satu:

- **Vercel WAF**: Dashboard → Settings → Firewall → buat rule per path
  (mis. `/api/orders*` 10 req/menit per IP).
- **Upstash Redis**: ganti implementasi `src/lib/rate-limit.ts` dengan
  Upstash REST (tetap satu API, tanpa native binding).

### O3 — Pengurangan stok saat pesanan (Medium, keputusan produk)

Sekarang stok hanya divalidasi (`quantity <= stok`), tidak dikurangi.
Bila diaktifkan: kurangi stok dalam satu transaksi DB + rollback bila
gagal, dan tangani pesanan batal/stale.

### O4 — `remotePatterns` image (Low)

Bila kelak ada unggah/URL gambar eksternal: batasi `remotePatterns` di
`next.config.ts` ke host CDN yang dikenal saja.

## 4. Uji yang Butuh Akun Supabase Nyata (Manual)

Check 01, 03, 05, 09, 15, 17 tidak bisa diuji penuh secara lokal (mode
berkas = tanpa login). Setelah O1 + ada akun:

1. Register 2 akun: `admin@...` (set `app_metadata.role = "admin"` via
   service-role/dashboard) dan `user@...`.
2. `user@...` membuka `/admin/orders` → harus **dialihkan** (halaman),
   dan `GET /api/admin/orders` dengan sesi user → **403**.
3. Tanpa login ke `/admin` → **dialihkan ke /login** (401 untuk API).
4. Login `user@...`, buat pesanan → cek RLS: akun lain tidak bisa
   `GET /api/my/orders` untuk id milik orang lain (404/kosong).
5. Ganti salah satu `products.id` di URL/detail → tidak menampilkan
   data non-publik.

## 5. Checklist Aksi Manual untuk User

- [ ] **O1**: jalankan migrasi Supabase (§4 O1) — prioritas tertinggi.
- [ ] **Rotasi key preventif (check 25)**: karena riwayat pernah
      berpindah alat, rotasi `SUPABASE_SERVICE_ROLE_KEY` (Supabase →
      Settings → API → Rotate) dan kunci `AI_API_KEY` di konsol
      provider, lalu perbarui env Vercel. Jangan pernah print nilainya.
- [ ] **Spending cap AI (B5)**: di konsol Google AI Studio → set
      batas harian/bulan `AI_API_KEY`, atau monitor pemakaian berkala.
- [ ] **Rate limit produksi (O2)**: aktifkan Vercel WAF atau Upstash.
- [ ] **GitHub**: aktifkan **Dependabot alerts** + **secret scanning**
      (repo → Settings → Code security). Pemindai lokal sudah ada via
      hook; ini lapisan kedua.
- [ ] **MFA**: aktifkan 2FA di akun GitHub + Supabase + Vercel.
- [ ] **Hook di clone lain**: `git config core.hooksPath scripts/githooks`
      (perlu sekali per clone; di repo ini sudah aktif).
- [ ] **Putuskan O3** (pengurangan stok) dan O4 (`remotePatterns`).
- [ ] (Opsional) jalankan `npm audit` berkala; jangan pakai
      `audit fix --force` tanpa membaca changelog.

## 6. Cara Verifikasi 5 Menit

```powershell
# 1. Build + server lokal
npm run build
npm run start -- -p 3100        # terminal terpisah

# 2. Uji keamanan terpadu (harus 19/19 lolos)
node scripts/uji-keamanan.mjs http://localhost:3100

# 3. Static analysis
npx tsc --noEmit
npm run lint
node "C:\Users\LOQ 15IRX9\AppData\Local\Temp\opencode\scan-asing.cjs"

# 4. Cek berkas terekspos di live
node scripts/check-kebocoran-file.mjs https://websitekwu.vercel.app

# 5. Header live (setelah deploy terbaru)
curl.exe -sI https://websitekwu.vercel.app | findstr /i "strict-transport content-security x-frame"
```

Catatan: uji **hanya** terhadap localhost/staging. Jangan arahkan
`uji-keamanan.mjs` atau pemindai apa pun ke domain pihak lain.

## 7. Files Changed (Sesi Toolkit)

Kode (6 commit terpusat per check):

- `src/services/order.service.ts` — harga server-side (19)
- `src/lib/api-error.ts` + 17 route API — galat generik + log (08, 20)
- `next.config.ts`, `src/proxy.ts` — HSTS/CSP/COOP/CORP + CSRF Origin (14, 16)
- `src/lib/api-auth.ts`, `src/lib/auth.ts` + 13 route — 401/403 + log (09)
- `src/lib/rate-limit.ts` + 21 route — scope `ip|pathname` (12)
- 2 route admin products — validasi skema `imageUrl` (18)

Dokumen & skrip:

- `SECURITY_MAP.md` (check 00)
- `SECURITY_REVIEW.md` (check 26)
- `SECURITY_REPORT.md` (check 27, berkas ini)
- `scripts/uji-keamanan.mjs` (check 27 — 19 uji otomatis)
- `scripts/check-kebocoran-file.mjs` (check 23)
- `scripts/githooks/pre-commit` (check 24)

## 8. Hasil Uji Terpadu (Terakhir)

```
19/19 lolos — 07, 11/02, 14 (x2), 16 (x3), 19 (x4), 06 (x2), 20 (x3), 23, 12 (x2)
```

Dijalankan terhadap `http://localhost:3100` (build produksi, mode berkas);
data uji di `data/kwu.json` dipulihkan otomatis setelah selesai.
