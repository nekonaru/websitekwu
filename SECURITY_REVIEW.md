# Review Keamanan KWU (Check 26)

Review menyeluruh terhadap seluruh basis kode website toko kampus KWU,
mengikuti Pre-Launch Security Toolkit. Peta serangan ada di
`SECURITY_MAP.md`; ringkasan 27 check ada di `SECURITY_REPORT.md`.

Tanggal review: 3 November 2026. Basis: branch `master` setelah commit
`051a3e8` (skrip pemindai) — semua temuan di bawah sudah di-fix dan
diuji ulang sebelum dokumen ini ditulis.

## 1. Ringkasan Eksekutif

KWU adalah aplikasi B2C + B2B (katalog, keranjang, checkout, RFQ,
dashboard admin, chatbot AI) di Next.js 16 + Supabase, deploy di Vercel.
Sebelum review ini, seluruh 27 check toolkit sudah dijalankan: 6 di antaranya
menghasilkan perbaikan kode yang di-commit terpisah dan diuji ulang
(19, 08+20, 14+16, 09, 12+18, 23+24), sisanya lolos dengan bukti atau
tidak berlaku (N/A) untuk aplikasi ini.

Status produksi: **live** di `https://websitekwu.vercel.app` dengan
Supabase terkonfigurasi, tetapi **migrasi database (termasuk RLS) belum
pernah dijalankan** — ini adalah temuan terbesar yang tersisa dan
sepenuhnya di luar kendali kode (butuh akses proyek Supabase milik user).

Tidak ada temuan Critical yang tersisa di kode. Semua temuan High/Medium
yang ditemukan sudah di-fix; sisanya tercatat sebagai keterbatasan yang
dipahami (rate limiter in-memory, stok tidak berkurang saat pesanan).

## 2. Temuan (Findings)

| # | Temuan | Lokasi (file:line) | Severity | Status |
| --- | --- | --- | --- | --- |
| F1 | Harga pesanan berasal dari input klien (klien bisa memalsukan subtotal) | `src/services/order.service.ts:194` (`verifikasiItem`), dipanggil `:260` dan `:331` | Critical | **Fixed & re-tested** — check 19; server ambil harga/nama/SKU dari tabel `products`, tolak produk tak dikenal dan quantity > stok; uji `scripts/uji-keamanan.mjs` (4 uji lolos) |
| F2 | Galat internal bocor detail (stack trace, pesan framework) ke klien | `src/lib/api-error.ts:37` (`responsGalat`) | High | **Fixed & re-tested** — check 08+20; pesan generik + `referensi` di produksi, log terstruktur di server; codemod 17 catch route; uji galat (4+3 uji lolos) |
| F3 | Tidak ada HSTS; CSP tanpa `upgrade-insecure-requests` | `next.config.ts:56,67` | High | **Fixed & re-tested** — check 14; HSTS 2 tahun + includeSubDomains, COOP/CORP, upgrade hanya non-dev; uji header (2 uji lolos) |
| F4 | CSRF: metode pengubah data API tidak memeriksa Origin | `src/proxy.ts:17` (`tolakOriginAsing`), dipanggil `:87` | High | **Fixed & re-tested** — check 16; Origin asing → 403 + log `csrf-origin-ditolak`; Origin absen (curl) tetap lolos; uji (3 uji lolos) |
| F5 | Gerbang admin lama tidak membedakan 401 vs 403 dan tidak mencatat penolakan | `src/lib/api-auth.ts:22` (`tolakBilaBukanAdmin`), `src/lib/auth.ts:27` (`verifikasiAdmin`) | High | **Fixed** — check 09; 401 belum login / 403 bukan admin + log `akses-admin-ditolak`; pola lama diganti di 13 titik |
| F6 | Rate limit global per IP (satu rute bisa menghabiskan jatah rute lain) | `src/lib/rate-limit.ts:72` (`tanggapiJikaMelebihi`) | Medium | **Fixed & re-tested** — check 12; kunci `ip|pathname`, 21 titik route; uji (2 uji lolos) |
| F7 | Field `imageUrl` admin tidak memeriksa skema URL (`javascript:` lolos) | `src/app/api/admin/products/route.ts:68-72`, `src/app/api/admin/products/[id]/route.ts:27-31` | Medium | **Fixed & re-tested** — check 18; hanya `http://`/`https://`; uji `javascript:`/`data:` → 422 |
| F8 | Tidak ada pemindai secret di Git history | `scripts/githooks/pre-commit` (aktif via `git config core.hooksPath`) | Critical (kalau bocor) | **Fixed & verified** — check 24; scan manual 14 pola ke seluruh riwayat = 0 commit; hook menolak secret uji (exit 1) |
| F9 | Tidak ada skrip pemeriksaan berkas terekspos | `scripts/check-kebocoran-file.mjs`, `scripts/uji-keamanan.mjs` | Critical (kalau bocor) | **Fixed & verified** — check 23; 34 path live → 0 berbahaya; 7 path lokal diuji ulang oleh skrip terpadu |
| F10 | Rate limiter in-memory — efektif per instansi, bukan global di Vercel multi-instansi | `src/lib/rate-limit.ts` (seluruh berkas) | Medium | **Open (dipahami)** — butuh Vercel WAF atau Upstash Redis; keputusan user; tercatat di SECURITY_REPORT.md |
| F11 | Stok produk tidak berkurang saat pesanan dibuat | `src/services/order.service.ts:194` (validasi stok ada, pengurangan tidak) | Medium | **Open (sengaja, butuh izin user)** — perubahan perilaku terasa; direkomendasikan sebagai tindak lanjut |
| F12 | Migrasi Supabase (termasuk RLS) belum pernah dijalankan di produksi | `supabase/migrations/*.sql` (001-003, semua sudah punya `ENABLE ROW LEVEL SECURITY` + policy) | Critical (operasional) | **Open (butuh akses user)** — jalankan `npm run migrate` atau import manual via SQL Editor; langkah lengkap di SECURITY_REPORT.md |
| F13 | `remotePatterns` next/image tidak dibatasi ke host tertentu (SSRF ringan via admin) | `next.config.ts` (konfigurasi image) | Low | **Open (admin-only, ditunda)** — admin adalah pihak tepercaya; catatan di SECURITY_REPORT.md |
| F14 | Fitur reset sandi tidak ada (check 17 N/A) | tidak ada route reset-password | Info | **N/A** — tidak ada link reset yang bisa kedaluwarsa karena fiturnya tidak ada |

## 3. Yang Sudah Aman (Bukti Lintas-Check)

- **Check 01/05**: autentikasi Supabase Auth (hash Argon2id), sesi cookie
  HttpOnly terkelola supabase-js; pemeriksaan peran selalu di server.
- **Check 02/11**: tidak ada nilai secret di `.next/static` (31 berkas js
  dipindai, 0 kecocokan; satu kecocokan `sb_secret_` = deteksi tipe key
  di library supabase-js, false positive). `.env*` tidak pernah ter-commit.
- **Check 03**: `ENABLE ROW LEVEL SECURITY` + policy di semua tabel
  (`001`: 7 policy, `002`: 4 policy, `003`: 4 policy).
- **Check 06**: Zod di semua route API; uji tipe salah → 422; field
  berlebih (`role`, `status`) di-strip, tidak tersimpan.
- **Check 07**: 0 `dangerouslySetInnerHTML` dari 76 berkas `.ts/.tsx`.
- **Check 10**: tidak ada SQL string konkatenasi; semua lewat Supabase
  query builder / parameterized.
- **Check 13**: tidak ada header CORS kustom → same-origin default browser.
- **Check 15**: sesi Supabase cookie dikelola library (flags aman);
  tidak ada sesi buatan sendiri.
- **Check 17**: N/A (fitur reset sandi tidak ada).
- **Check 20**: mode produksi tanpa debug error; respons galat generik.
- **Check 21**: `npm audit --omit=dev` = 0 vuln produksi (16 moderate
  dev-only eslint/minimatch; `audit fix --force` tidak dijalankan agar
  tidak merusak toolchain).
- **Check 22**: depcheck — hanya 3 false positive (tailwindcss,
  @tailwindcss/turbopack, @types/react-dom).
- **Check 25**: tidak ada indikasi key bocor (riwayat git bersih, 0
  kecocokan di live site) → rotasi tidak terpaksa; tetap disarankan
  sebagai aksi preventif.

## 4. yang Tidak Bisa Diverifikasi dari Kode

1. **RLS live** — kebijakan ada di file migrasi, tapi belum pernah
   dijalankan di proyek Supabase. Verifikasi butuh akun + migrasi (F12).
2. **Alur auth live (check 01/03/05/09/15)** — uji login 401/403 nyata
   butuh akun Supabase admin + user biasa; lokal jalan dalam mode berkas
   (tanpa login).
3. **Efektivitas rate limit di produksi** — instans serverless Vercel
   punya memori terpisah (F10).
4. **Kebocoran via dependensi runtime** — hanya bisa dibuktikan dengan
   pemindai SCA berbayar/Snyk; `npm audit` sudah dijalankan sebagai
   pengganti terbaik gratis.

## 5. Verifikasi Ulang 5 Menit

```powershell
npm run build
npm run start -- -p 3100          # terminal terpisah
node scripts/uji-keamanan.mjs http://localhost:3100   # harus 19/19 lolos
node scripts/check-kebocoran-file.mjs https://websitekwu.vercel.app
npx tsc --noEmit
npm run lint
```

## 6. Rekomendasi Tindak Lanjut (diurutkan prioritas)

1. **Jalankan migrasi Supabase** (F12) — tanpa ini produksi belum punya
   tabel/RLS sesuai desain.
2. **Putuskan rate limit lintas instansi** (F10) — Vercel WAF atau
   Upstash Redis.
3. **Aksi manual rahasia** (lihat SECURITY_REPORT.md): rotasi key
   preventif, spending cap AI, Dependabot + secret scanning, MFA.
4. **Pertimbangkan pengurangan stok saat pesanan** (F11) — butuh keputusan
   produk.
5. **Batasi `remotePatterns`** (F13) bila ada rencana unggah gambar
   eksternal.
