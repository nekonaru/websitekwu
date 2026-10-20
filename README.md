# KWU - Toko Kampus

Website toko kampus dengan dua jalur transaksi: **B2C** (katalog, pemesanan, checkout) dan **B2B** (permintaan penawaran grosir / RFQ), dilengkapi dashboard admin dan chatbot Asisten KWU.


## Stack

- [Next.js](https://nextjs.org/) 16 (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4 (design tokens)
- [Supabase](https://supabase.com/) PostgreSQL + Supabase Auth (rencana backend)
- [Zod](https://zod.dev/) untuk validasi skema
- [lucide-react] untuk ikon

## Struktur folder (ringkas)

```
src/
  app/                    # Route Next.js App Router
    page.tsx              # Beranda
    katalog/              # Katalog produk (filter + pagination)
    produk/[slug]/        # Detail produk
    keranjang/            # Keranjang (stub)
    checkout/             # Checkout (stub)
    login/                # Masuk (stub)
    register/             # Daftar (stub)
    profil/               # Profil (stub)
    business/rfq/new/     # Formulir RFQ B2B
    business/rfq/confirmation/[rfqNumber]/  # Konfirmasi RFQ
    admin/                # Dashboard admin
    admin/products/       # Kelola produk & stok
    admin/rfqs/           # Kelola RFQ
    api/rfqs/             # POST buat RFQ
    api/my/rfqs/          # RFQ milik pengguna
    api/chat/             # Endpoint chatbot Asisten KWU
  components/
    layout/               # Header, Footer
    products/             # ProductCard
    business/             # RfqForm
    chat/                 # KwuChatbot (Asisten KWU)
  lib/
    design-tokens.ts      # Token desain (orange, biru, putih)
    format.ts             # formatRupiah, formatDate, slugify
    data.ts               # Lapisan data contoh (mock) untuk pengembangan
    supabase.ts           # Klien Supabase
    validation/rfq.ts     # Skema validasi RFQ (Zod)
  types/
    rfq.ts                # Tipe data RFQ
supabase/
  migrations/
    001_create_rfq_tables.sql   # Skema tabel RFQ, quotation, riwayat status
```

## Cara menjalankan (pengembangan)

1. Salin `.env.example` menjadi `.env.local` dan isi nilai yang relevan.
   ```bash
   cp .env.example .env.local
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm run dev
   ```
4. Buka `http://localhost:3000`.

## Konfigurasi Supabase (backend)

Buat database Supabase lalu jalankan migrasi:
```bash
supabase db push
```
atau impor `supabase/migrations/001_create_rfq_tables.sql` melalui SQL Editor Supabase.

Pastikan variabel berikut diisi di `.env.local` (jangan di-commit ke repository):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Untuk AI (chatbot), isi di backend saja (tidak ke browser):
- `AI_PROVIDER`
- `AI_API_KEY`
- `AI_MODEL`

## Data contoh (mock)

`src/lib/data.ts` berisi **data contoh** (label jelas sebagai contoh) untuk pengembangan dan pengujian tanpa kredensial Supabase. Data ini bukan data operasional nyata. Ganti lapisan ini dengan panggilan Supabase saat backend dikonfigurasi.

## Perintah yang tersedia

| Perintah | Keterangan |
|----------|------------|
| `npm run dev` | Jalankan server development |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan server produksi |
| `npm run lint` | Jalankan ESLint |

## Asumsi

- Bahasa UI: Bahasa Indonesia.
- Zona waktu operasional: Asia/Jakarta.
- Warna utama: orange, biru, dan putih (kelola lewat design tokens).
- Autentikasi dan RLS Supabase akan diaktifkan dalam fase autentikasi penuh.
- Service-role key Supabase tidak pernah disertakan di bundle browser.

## Keterbatasan (item terbuka)

- Halaman keranjang, checkout, login, register, dan profil masih stub; perlu dihubungkan ke auth dan keranjang nyata.
- Dashboard admin menampilkan keadaan kosong sengaja (tidak ada data tiruan) hingga terhubung ke Supabase.
- Migrasi RLS memerlukan `raw_auth_meta_data.role` diisi admin melalui Supabase Auth.
- API chatbot menggunakan fallback aturan saat `AI_PROVIDER`/`AI_API_KEY`/`AI_MODEL` belum diisi.
- Pengujian responsivitas, aksesibilitas, dan keamanan perlu dilakukan pada perangkat nyata dan dicatat.
- Kebijakan retensi data harus ditetapkan bersama pengelola kampus (catat sebagai item terbuka).

## Keamanan

- Secret dan service-role key hanya di server / environment variables.
- Semua endpoint yang mengubah data divalidasi di backend (Zod).
- RLS aktif pada tabel yang terekspos di Supabase.
- Tidak ada secret asli disimpan di repository.
