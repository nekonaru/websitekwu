# Peta Keamanan KWU

Dibuat mengikuti Pre-Launch Security Toolkit, check 00 (pemetaan serangan).
Dokumen ini adalah rujukan untuk check 01-27 dan review berkala (check 26).

## 1. Stack dan Hosting

| Komponen | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Gaya | Tailwind CSS v4 |
| Basis data / autentikasi | Supabase (Postgres + GoTrue) |
| Validasi input | Zod (server-side, semua route API) |
| Hosting / deploy | Vercel, domain `https://websitekwu.vercel.app` |
| Kode sumber | GitHub `nekonaru/websitekwu`, branch `master` |
| AI (chatbot) | Google Gemini (`gemini-1.5-flash`) lewat env `AI_API_KEY` |

### Dua mode operasi

- **Mode Supabase**: env `NEXT_PUBLIC_SUPABASE_URL` dan
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` terisi nilai asli. Autentikasi, RLS, dan
  seluruh jalur data aktif. Dipakai di produksi (Vercel).
- **Mode berkas**: env placeholder/kosong. Seluruh data di `data/kwu.json`,
  tidak ada sesi login, `src/lib/auth.ts` menganggap pemanggil admin.
  Hanya untuk pengembangan lokal. `src/proxy.ts` melewati pengalihan login
  dalam mode ini.

Pertukaran mode otomatis via `isSupabaseConfigured()` (mengabaikan nilai
yang mengandung `placeholder`).

## 2. Data yang Disimpan

| Data | Sensitivitas | Tempat |
| --- | --- | --- |
| Akun pengguna (email, sandi hash) | Tinggi | Supabase Auth (hash Argon2id oleh Supabase) |
| Peran admin | Tinggi | `app_metadata` (hanya bisa diubah service-role) |
| Pesanan B2C (nama, telepon, alamat, riwayat) | Sedang | tabel `orders` / `data/kwu.json` |
| RFQ B2B (organisasi, kontak, email bisnis) | Sedang | tabel `rfqs` + `rfq_items` |
| Quotation (harga khusus B2B) | Sedang-tinggi (harga) | tabel `quotations` + `quotation_items` |
| Katalog produk & kategori | Rendah (publik) | tabel `products`, `categories` |
| Keranjang & favorit | Rendah | localStorage klien (`kwu_cart_v1`, `kwu_favorit_v1`) |
| Kunci API | Kritis | env server (tidak pernah dikirim ke klien) |

## 3. Peran Pengguna

| Peran | Cara masuk | Cakupan |
| --- | --- | --- |
| Pengunjung | tanpa login | katalog, detail produk, form RFQ, chatbot |
| Pengguna | login Supabase | checkout, pesanan saya, RFQ saya, profil, favorit |
| Admin | login + `app_metadata.role = "admin"` | semua halaman dan API `/api/admin/*`, quotation, ubah status |

Pemeriksaan peran SELALU di server:
`src/lib/api-auth.ts` (`tolakBilaBukanAdmin`) membedakan 401 (belum masuk)
dan 403 (bukan admin) serta mencatat penolakan (check 08/09).

## 4. Titik Masuk (Entry Points)

### Halaman (Pages)

Publik: `/`, `/katalog`, `/produk/[slug]`, `/favorit`, `/tentang`, `/kontak`,
`/keranjang`, `/business/rfq/new`, `/business/rfq/confirmation/[rfqNumber]`,
`/kebijakan-privasi`, `/login`, `/register`, `/robots.txt`, `/sitemap.xml`.

Terproteksi sesi (dialihkan `src/proxy.ts` bila belum login):
`/checkout`, `/profil`, `/pesanan-saya`, `/admin/*`.

### API Route (18 route, semua di `src/app/api/`)

| Kelompok | Route | Auth | Rate limit (per IP + rute) |
| --- | --- | --- | --- |
| Katalog | `GET /api/products`, `GET /api/produk/[slug]` | publik | 120/menit |
| Pesanan | `POST /api/orders` | wajib login (Supabase) | 10/menit |
| Pesanan saya | `GET /api/my/orders` | wajib login | 30/menit |
| RFQ | `POST /api/rfqs` | publik (B2B) | 5/5 menit |
| RFQ | `GET /api/rfqs/[id]` | publik terbatas | 60/menit |
| RFQ | `GET /api/my/rfqs` | wajib login, filter pemilik | 30/menit |
| Admin | `GET/POST /api/admin/*`, `PATCH/DELETE /api/admin/products/[id]`, `PATCH .../status` | admin (401/403) | 20-30/menit |
| Quotation | `POST /api/quotations`, `PATCH .../status`, `POST .../convert` | admin | 20-30/menit |
| Chat AI | `POST /api/chat` | publik + rate limit + batas 1000 karakter/pesan, riwayat 10, output 500 token | 20/menit |

### Route lain

- `src/proxy.ts` (pengganti middleware): pengalihan login + penolakan CSRF
  Origin lintas-asal untuk metode `POST/PUT/PATCH/DELETE` di `/api/*`.
- Migrasi SQL `supabase/migrations/*.sql` dijalankan manual via SQL Editor
  atau `npm run migrate`.

## 5. Layanan Pihak Ketiga dan Kunci

| Kunci / Layanan | Nama env | Lokasi | Status |
| --- | --- | --- | --- |
| Supabase URL proyek | `NEXT_PUBLIC_SUPABASE_URL` | klien + server | publik oleh desain |
| Supabase anon (publishable) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | klien + server | publik oleh desain, dijaga RLS |
| Supabase service-role (secret) | `SUPABASE_SERVICE_ROLE_KEY` | HANYA server (route + service) | rahasia |
| Kunci AI Gemini | `AI_API_KEY` | HANYA server (`/api/chat`) | rahasia |

Aturan: env var `NEXT_PUBLIC_*` = publik; sisanya rahasia. Tidak ada nilai
secret yang dicetak ke log (lihat `src/lib/api-error.ts`).

## 6. Batas Kepercayaan (Trust Boundaries)

| Dipercaya dari klien | Diputuskan di server |
| --- | --- |
| Form checkout: nama, email, telepon, alamat, catatan | Harga, nama, SKU item = dari tabel `products` (check 19) |
| Form RFQ: data kontak + item (nama produk, kuantitas) | Nomor RFQ berurutan dari sequence DB |
| Body API: di-zod-strip field tak dikenal (anti mass-assignment) | Peran admin dari `app_metadata` |
| Cookie sesi Supabase | `requireAdmin`/`requireUser`/`tolakBilaBukanAdmin` |
| Header `Origin` | Dicocokkan dengan host situs di `src/proxy.ts` (check 16) |
| Harga quotation (dibuat admin) | Konversi ke pesanan mengambil harga dari quotation, bukan klien |

## 7. Batasan yang Perlu Diketahui

- Rate limiter in-memory: efektif per instansi. Di Vercel (multi-instansi)
  batas menjadi perkiraan; solusi penuh = Vercel WAF atau Upstash Redis
  (keputusan pengguna, lihat SECURITY_REPORT.md).
- Mode berkas (lokal) tidak memiliki autentikasi; jangan di-deploy.
- Migrasi Supabase (termasuk RLS) harus dijalankan sekali di produksi
  sebelum mode Supabase berfungsi penuh.

## 8. Pemeriksaan Ulang Saat Menambah Fitur

| Menambah... | Check ulang |
| --- | --- |
| Login / register | 01, 05, 12, 15, 16, 17 |
| Tabel database baru | 03, 06, 10 (tulis migrasi + RLS) |
| Route API / server action baru | 01, 03, 06, 09, 12, 16 |
| Teks buatan pengguna | 06, 07, 12 |
| Pembayaran | 06, 12, 19, 08 |
| Unggah berkas | 18, 03, 12 |
| API / kunci pihak ketiga | 02, 11, B5 |
| Fitur admin | 09, 08, 07 |
| Fitur AI | 02, 07, 12, B1, B5 |
| URL yang diambil server | B2, 06 |
| Paket baru | 21 (pastikan asli dulu) |
| Sebelum rilis | 23, 20, 26, 27 |
